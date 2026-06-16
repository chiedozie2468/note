import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

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

  const { room } = await request.json();
  console.log("room:", room);

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: `${user.firstName ?? "Anonymous"} ${user.lastName ?? ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress,
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