"use client";

import { RoomProvider as LiveblocksRoomProvider } from "@liveblocks/react";

export default function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  return (
    <LiveblocksRoomProvider id={roomId} initialPresence={{ cursor: null }}>
      {children}
    </LiveblocksRoomProvider>
  );
}
