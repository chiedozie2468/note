import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes except Next internals and static files
    "/((?!_next|.*\\..*).*)",

    // Always run for API routes
    "/api/(.*)",
  ],
};
