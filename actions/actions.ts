"use server";

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";

export async function createNewDocument() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const docRef = await adminDb.collection("documents").add({
      title: "New Document",
      content: "",
      createdAt: new Date(),
      createdBy: userId,
    });

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(docRef.id)
      .set({
        userId,
        role: "owner",
        roomId: docRef.id,
        title: "New Document",
        createdAt: new Date(),
      });

    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("CREATE DOCUMENT ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateDocumentTitle(roomId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Update the main document title
    await adminDb.collection("documents").doc(roomId).update({ title });

    // Sync title to ALL room documents (owner + all editors) so sidebar shows correct title
    const roomsSnapshot = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();
    roomsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { title });
    });
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("UPDATE TITLE ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteDocument(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await adminDb.collection("documents").doc(roomId).delete();

    const roomsSnapshot = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();
    roomsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.error("DELETE DOCUMENT ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  await auth.protect();

  console.log("=================================");
  console.log("INVITING USER");
  console.log("ROOM:", roomId);
  console.log("EMAIL:", email);
  console.log("=================================");

  try {
    // Find the invited user by email
    const usersSnapshot = await adminDb
      .collection("users")
      .where("email", "==", email.trim())
      .limit(1)
      .get();

    console.log("MATCHING USERS:", usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    if (usersSnapshot.empty) {
      console.log("USER NOT FOUND");
      return { success: false, error: "User not found. They must sign in to the app first before being invited." };
    }

    const invitedUser = usersSnapshot.docs[0];
    console.log("FOUND USER:", invitedUser.id, invitedUser.data());

    // Fetch document title so it shows correctly in the invited user's sidebar
    const docSnap = await adminDb.collection("documents").doc(roomId).get();
    const title = (docSnap.data()?.title as string) ?? "Untitled";

    await adminDb
      .collection("users")
      .doc(invitedUser.id)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: invitedUser.id,
        role: "editor",
        roomId,
        title,
        createdAt: new Date(),
      });

    console.log("USER INVITED SUCCESSFULLY");
    return { success: true };
  } catch (error) {
    console.error("INVITE USER ERROR:", error);
    return { success: false, error: String(error) };
  }
}
