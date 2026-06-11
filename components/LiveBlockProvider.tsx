"use client";

import { LiveblocksProvider } from "@liveblocks/react";

export default function LiveBlockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiveblocksProvider authEndpoint="/auth-endpoint">
      {children}
    </LiveblocksProvider>
  );
}