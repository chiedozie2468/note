import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch user from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user profile data
    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      email: user.emailAddresses[0]?.emailAddress || null,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
