"use client";

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

// Simply check if the current user's OWN room doc for this room has role === "owner".
// We only read /users/{currentUserId}/rooms/{roomId} — always accessible to the user.
export default function useUserOwn(createdBy?: string) {
  const { user } = useUser();
  const room = useRoom();

  const [roomDoc] = useDocument(
    user && room ? doc(db, "users", user.id, "rooms", room.id) : null
  );

  const isOwnerByRoom = roomDoc?.data()?.role === "owner";
  const isOwnerByCreator = createdBy && user ? createdBy === user.id : false;

  return isOwnerByRoom || isOwnerByCreator;
}