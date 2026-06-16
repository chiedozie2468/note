import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Verify the user has a room entry for this document (owner OR editor)
  const roomDoc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("rooms")
    .doc(id)
    .get();

  const docSnap = await adminDb.collection("documents").doc(id).get();
  if (!docSnap.exists) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const isCreator = docSnap.data()?.createdBy === userId;

  if (!roomDoc.exists && !isCreator) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let role = roomDoc.data()?.role;
  if (isCreator) {
    role = "owner";
    // Heal/upsert the room record to owner if it's missing or incorrect
    if (!roomDoc.exists || roomDoc.data()?.role !== "owner") {
      await adminDb
        .collection("users")
        .doc(userId)
        .collection("rooms")
        .doc(id)
        .set({
          userId,
          role: "owner",
          roomId: id,
          title: docSnap.data()?.title ?? "Untitled Document",
          createdAt: roomDoc.exists ? roomDoc.data()?.createdAt : new Date(),
        }, { merge: true });
    }
  }

  return NextResponse.json({
    id: docSnap.id,
    role,
    ...docSnap.data(),
  });
}
