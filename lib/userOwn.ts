"use client";

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import {
  collectionGroup,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

export default function useUserOwn() {
  const { user } = useUser();
  const room = useRoom();

  const [isOwner, setIsOwner] = useState(false);

  console.log("USER:", user);
  console.log("ROOM:", room);

  const [usersInRoom] = useCollection(
    user && room
      ? query(
          collectionGroup(db, "rooms"),
          where("roomId", "==", room.id)
        )
      : null
  );

  useEffect(() => {
    if (!usersInRoom || !user) return;

    console.log(
      "FIRESTORE DATA:",
      usersInRoom.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    const owners = usersInRoom.docs.filter(
      (doc) => doc.data().role === "owner"
    );

    console.log("OWNERS:", owners);

    console.log("CURRENT USER ID:", user.id);

    console.log(
      "CURRENT USER EMAIL:",
      user.primaryEmailAddress?.emailAddress
    );

    owners.forEach((owner) => {
      console.log("OWNER DATA:", owner.data());
    });

    const ownerFound = owners.some((owner) => {
      const data = owner.data();

      return (
        data.userId === user.id ||
        data.userId === user.primaryEmailAddress?.emailAddress
      );
    });

    console.log("OWNER FOUND:", ownerFound);

    setIsOwner(ownerFound);
  }, [usersInRoom, user]);

  console.log("IS OWNER:", isOwner);

  return isOwner;
}