'use client';

import React from "react";
import { useMyPresence, useOthers } from "@liveblocks/react";
import FollowPointer from "./FollowPointer";

export default function LiveCursorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    updateMyPresence({
      cursor: {
        x: Math.floor(e.pageX),
        y: Math.floor(e.pageY),
      },
    });
  }

  function handlePointerLeave() {
    updateMyPresence({ cursor: null, clicking: false });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    updateMyPresence({
      cursor: {
        x: Math.floor(e.pageX),
        y: Math.floor(e.pageY),
      },
      clicking: true,
    });
  }

  function handlePointerUp() {
    updateMyPresence({ clicking: false });
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="w-full h-full"
    >
      {others
        .filter((other) => other.presence?.cursor)
        .map(({ connectionId, presence, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence!.cursor!.x}
            y={presence!.cursor!.y}
            clicking={presence!.clicking}
          />
        ))}

      {children}
    </div>
  );
}