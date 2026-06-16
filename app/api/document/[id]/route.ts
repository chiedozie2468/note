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

  if (!roomDoc.exists) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const docSnap = await adminDb.collection("documents").doc(id).get();
  if (!docSnap.exists) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json({
    id: docSnap.id,
    role: roomDoc.data()?.role,
    ...docSnap.data(),
  });
}
