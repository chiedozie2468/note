import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

// Initialize Liveblocks backend client with your secret key
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // 1. Authenticate the user session via Clerk
  const { userId } = await auth();
  const user = await currentUser();

  // 2. Guard Clause: If no logged-in user is detected, return an explicit 401
  if (!userId || !user) {
    return new NextResponse("Unauthorized User Session", { status: 401 });
  }

  // 3. Prepare Liveblocks Session configuration
  const email = user.emailAddresses[0]?.emailAddress;
  
  const session = liveblocks.prepareSession(email, {
    userInfo: {
      name: `${user.firstName ?? "Anonymous"} ${user.lastName ?? ""}`.trim(),
      email: email,
      avatar: user.imageUrl,
    },
  });

  // 4. Read the target room from the request body
  const { room } = await request.json();

  // 5. Grant full access permissions to this specific room workspace
  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // 6. Authorize and return the signed token stream
  const { body, status } = await session.authorize();
  return new NextResponse(body, { status });
}