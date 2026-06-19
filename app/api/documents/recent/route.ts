import { NextResponse } from "next/server";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const roomsSnap = await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const documents = roomsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() || {}),
    }));

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("GET RECENT DOCUMENTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
