import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase-admin";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  console.log("========== AUTH ENDPOINT ==========");

  const { userId } = await auth();
  console.log("userId:", userId);

  const user = await currentUser();
  console.log("user exists:", !!user);

  if (!userId || !user) {
    console.log("AUTH FAILED");
    return new NextResponse("Unauthorized User Session", {
      status: 401,
    });
  }

  console.log("AUTH PASSED");

  // Upsert user into Firestore so invite-by-email can find them
  const email = user.emailAddresses[0]?.emailAddress;
  if (email) {
    await adminDb.collection("users").doc(userId).set(
      {
        userId,
        email,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        avatar: user.imageUrl,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    console.log("User upserted to Firestore:", email);
  }

  const { room } = await request.json();
  console.log("room:", room);

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: `${user.firstName ?? "Anonymous"} ${user.lastName ?? ""}`.trim(),
      email,
      avatar: user.imageUrl,
    },
  });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  console.log("AUTHORIZING SESSION");

  const { body, status } = await session.authorize();

  console.log("SESSION AUTHORIZED:", status);

  return new NextResponse(body, { status });
}