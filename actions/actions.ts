"use server";

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";

export async function createNewDocument(title = "New Document") {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const docRef = await adminDb.collection("documents").add({
      title,
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
        title,
        createdAt: new Date(),
      });

    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("CREATE DOCUMENT ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function createDocumentWithCollaborator(
  title = "Shared Document",
  collaboratorEmails?: string[],
) {
  const result = await createNewDocument(title);
  if (!result.success || !result.docId) {
    return result;
  }

  const warnings: string[] = [];
  if (collaboratorEmails?.length) {
    for (const email of collaboratorEmails
      .map((value) => value.trim())
      .filter(Boolean)) {
      const inviteResult = await inviteUserToDocument(result.docId, email);
      if (!inviteResult.success) {
        warnings.push(`${email}: ${inviteResult.error}`);
      }
    }
  }

  return {
    success: true,
    docId: result.docId,
    warning: warnings.length ? warnings.join("; ") : undefined,
  };
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
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

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

    console.log(
      "MATCHING USERS:",
      usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );

    if (usersSnapshot.empty) {
      console.log("USER NOT FOUND");
      return {
        success: false,
        error:
          "User not found. They must sign in to the app first before being invited.",
      };
    }

    const invitedUser = usersSnapshot.docs[0];
    console.log("FOUND USER:", invitedUser.id, invitedUser.data());

    if (invitedUser.id === userId) {
      return { success: false, error: "You cannot invite yourself!" };
    }

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

    // Asynchronously send the email notification so the client response is not delayed
    sendInvitationEmail(email.trim(), title, roomId).catch((err) => {
      console.error("Async sendInvitationEmail failed:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("INVITE USER ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function getDocumentCollaborators(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const roomsSnapshot = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const collaborators = [];

    for (const roomDoc of roomsSnapshot.docs) {
      const roomData = roomDoc.data();
      const cUserId = roomData.userId;

      const userDoc = await adminDb.collection("users").doc(cUserId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        collaborators.push({
          userId: cUserId,
          email: userData?.email ?? "Unknown Email",
          name: userData?.name ?? "Collaborator",
          avatar: userData?.avatar ?? "",
          role: roomData.role,
        });
      } else {
        collaborators.push({
          userId: cUserId,
          email: "Unknown Email",
          name: "Collaborator",
          avatar: "",
          role: roomData.role,
        });
      }
    }

    return { success: true, collaborators };
  } catch (error) {
    console.error("GET COLLABORATORS ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function getRoomTasks(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!roomId) {
    return { success: false, error: "Missing roomId" };
  }

  try {
    const roomDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!roomDoc.exists) {
      return { success: false, error: "You do not have access to this room." };
    }

    const tasksSnapshot = await adminDb
      .collection("documents")
      .doc(roomId)
      .collection("tasks")
      .orderBy("dueAt", "asc")
      .get();

    const tasks = tasksSnapshot.docs.map((taskDoc) => {
      const taskData = taskDoc.data();
      return {
        id: taskDoc.id,
        title: taskData.title,
        description: taskData.description ?? null,
        completed: taskData.completed,
        dueAt: taskData.dueAt?.toDate?.()?.toISOString?.() ?? null,
        assigneeEmail: taskData.assigneeEmail ?? null,
        roomTitle: taskData.roomTitle ?? null,
        createdAt: taskData.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return { success: true, tasks };
  } catch (error) {
    console.error("GET ROOM TASKS ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function getUserTasks() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const roomsSnapshot = await adminDb
      .collectionGroup("rooms")
      .where("userId", "==", userId)
      .get();

    const roomIds = roomsSnapshot.docs
      .map((roomDoc) => roomDoc.data()?.roomId)
      .filter(Boolean) as string[];

    if (roomIds.length === 0) {
      return { success: true, tasks: [] };
    }

    const batches = [] as Promise<
      FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
    >[];
    for (let i = 0; i < roomIds.length; i += 10) {
      batches.push(
        adminDb
          .collectionGroup("tasks")
          .where("roomId", "in", roomIds.slice(i, i + 10))
          .orderBy("dueAt", "asc")
          .get(),
      );
    }

    const snapshots = await Promise.all(batches);
    const tasks = snapshots.flatMap((snapshot) =>
      snapshot.docs.map((taskDoc) => {
        const taskData = taskDoc.data();
        return {
          id: taskDoc.id,
          title: taskData.title,
          description: taskData.description ?? null,
          completed: taskData.completed,
          dueAt: taskData.dueAt?.toDate?.()?.toISOString?.() ?? null,
          assigneeEmail: taskData.assigneeEmail ?? null,
          roomTitle: taskData.roomTitle ?? null,
          documentId: taskData.roomId,
          createdAt: taskData.createdAt?.toDate?.()?.toISOString?.() ?? null,
        };
      }),
    );

    return { success: true, tasks };
  } catch (error) {
    console.error("GET USER TASKS ERROR:", error);
    return { success: false, error: String(error) };
  }
}

async function getCollaboratorEmails(roomId: string) {
  const roomsSnapshot = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", roomId)
    .get();

  const emails: string[] = [];

  for (const roomDoc of roomsSnapshot.docs) {
    const roomData = roomDoc.data();
    const collaboratorId = roomData.userId;
    const userDoc = await adminDb.collection("users").doc(collaboratorId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const email = userData?.email;
      if (typeof email === "string" && !emails.includes(email)) {
        emails.push(email);
      }
    }
  }

  return emails;
}

async function sendTaskNotificationEmail(
  toEmail: string,
  taskTitle: string,
  dueAt: string,
  roomId: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedDue = dueAt ? new Date(dueAt).toLocaleString() : "No deadline";

  if (!apiKey) {
    console.warn(
      "Skipping task notification email, RESEND_API_KEY is not configured.",
    );
    console.warn("To:", toEmail);
    console.warn("Task:", taskTitle);
    console.warn("Due:", formattedDue);
    console.warn(`Link: ${appUrl}/doc/${roomId}`);
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Note Workspace <onboarding@resend.dev>",
        to: toEmail,
        subject: `New task assigned: ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 14px; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 12px; color: #0f172a;">New team task</h2>
            <p style="margin: 0 0 12px; color: #475569;">A new task was added for your team:</p>
            <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">${taskTitle}</p>
            <p style="margin: 0 0 12px; color: #475569;">Due: <strong>${formattedDue}</strong></p>
            <a href="${appUrl}/doc/${roomId}" style="display: inline-block; margin-top: 16px; padding: 12px 20px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px;">View task in workspace</a>
            <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">If you want a text reminder, open this email on your phone and use the built-in message action.</p>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error("Failed to send task notification email:", error);
  }
}

async function sendTaskNotificationSms(
  phoneNumber: string,
  taskTitle: string,
  dueAt: string,
  roomId: string,
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedDue = new Date(dueAt).toLocaleString();

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(
      "Skipping SMS notification because Twilio credentials are not configured.",
    );
    console.warn("To:", phoneNumber);
    console.warn("Task:", taskTitle);
    console.warn("Due:", formattedDue);
    console.warn(`Link: ${appUrl}/doc/${roomId}`);
    return;
  }

  try {
    const body = new URLSearchParams();
    body.append("To", phoneNumber);
    body.append("From", fromNumber);
    body.append(
      "Body",
      `New task: ${taskTitle} due ${formattedDue}. Open: ${appUrl}/doc/${roomId}`,
    );

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Twilio SMS failed:", text);
    }
  } catch (error) {
    console.error("Failed to send task notification SMS:", error);
  }
}

export async function createRoomTask(
  roomId: string,
  title: string,
  dueAt: string | null,
  assigneeEmail?: string,
  description?: string | null,
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!title.trim()) {
    return { success: false, error: "Title is required." };
  }

  try {
    const docSnap = await adminDb.collection("documents").doc(roomId).get();
    if (!docSnap.exists) {
      return { success: false, error: "Document not found." };
    }

    const documentTitle = (docSnap.data()?.title as string) ?? "Untitled";
    const taskData: any = {
      title: title.trim(),
      dueAt: dueAt ? new Date(dueAt) : null,
      description: description?.trim() || null,
      assigneeEmail: assigneeEmail?.trim() || null,
      completed: false,
      createdBy: userId,
      createdAt: new Date(),
      roomId,
      roomTitle: documentTitle,
    };

    await adminDb
      .collection("documents")
      .doc(roomId)
      .collection("tasks")
      .add(taskData);

    const collaboratorEmails = await getCollaboratorEmails(roomId);
    const notificationPromises = collaboratorEmails.map((email) =>
      sendTaskNotificationEmail(email, title.trim(), dueAt ?? "", roomId),
    );
    await Promise.all(notificationPromises);

    return { success: true };
  } catch (error) {
    console.error("CREATE ROOM TASK ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateRoomTaskCompletion(
  roomId: string,
  taskId: string,
  completed: boolean,
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const roomDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!roomDoc.exists) {
      return { success: false, error: "You do not have access to this room." };
    }

    await adminDb
      .collection("documents")
      .doc(roomId)
      .collection("tasks")
      .doc(taskId)
      .update({ completed });

    return { success: true };
  } catch (error) {
    console.error("UPDATE ROOM TASK ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteRoomTask(roomId: string, taskId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const roomDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!roomDoc.exists) {
      return { success: false, error: "You do not have access to this room." };
    }

    await adminDb
      .collection("documents")
      .doc(roomId)
      .collection("tasks")
      .doc(taskId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error("DELETE ROOM TASK ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeCollaboratorFromDocument(
  roomId: string,
  targetUserId: string,
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if the current user is the owner of the document
    const userRoomDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!userRoomDoc.exists || userRoomDoc.data()?.role !== "owner") {
      return {
        success: false,
        error: "Only the owner can remove collaborators.",
      };
    }

    if (targetUserId === userId) {
      return {
        success: false,
        error: "You cannot remove yourself. Use 'Delete Document' instead.",
      };
    }

    await adminDb
      .collection("users")
      .doc(targetUserId)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error("REMOVE COLLABORATOR ERROR:", error);
    return { success: false, error: String(error) };
  }
}

export async function leaveDocument(roomId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error("LEAVE DOCUMENT ERROR:", error);
    return { success: false, error: String(error) };
  }
}

async function sendInvitationEmail(
  toEmail: string,
  docTitle: string,
  roomId: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log("=================================");
  console.log("SENDING INVITATION EMAIL TO:", toEmail);
  console.log("DOCUMENT TITLE:", docTitle);
  console.log("ROOM ID:", roomId);
  console.log("=================================");

  if (!apiKey) {
    console.warn(
      "=========================================================================",
    );
    console.warn(
      "WARNING: RESEND_API_KEY is not set in environment variables.",
    );
    console.warn(
      "Skipping real email send. Below is the content that would have been sent:",
    );
    console.warn("To:", toEmail);
    console.warn(
      "Subject: You've been invited to collaborate on a Note Document!",
    );
    console.warn(
      `Body: You have been invited to collaborate on "${docTitle}".`,
    );
    console.warn(`Link: ${appUrl}/doc/${roomId}`);
    console.warn(
      "=========================================================================",
    );
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Note Workspace <onboarding@resend.dev>",
        to: toEmail,
        subject: `You've been invited to collaborate on "${docTitle}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0f0f12; margin-top: 0;">Collaborate on a Note Document</h2>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">
              Hello,
            </p>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">
              You have been invited to collaborate as an editor on the document <strong>"${docTitle}"</strong>.
            </p>
            <div style="margin: 24px 0;">
              <a href="${appUrl}/doc/${roomId}" 
                 style="background-color: #0f0f12; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
                Open Document
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
            <p style="color: #71717a; font-size: 12px;">
              If you did not expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API response error:", errorText);
    } else {
      const resData = await response.json();
      console.log("Email sent successfully via Resend. ID:", resData.id);
    }
  } catch (error) {
    console.error("Failed to send invitation email:", error);
  }
}
