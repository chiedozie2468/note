"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import React, { useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import Editor from "./Editor";
import useUserOwn from "@/lib/userOwn";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import LeaveDocument from "./LeaveDocument";
import { useTheme } from "next-themes";
import { Pencil } from "lucide-react";
import { updateDocumentTitle } from "@/actions/actions";
import ManageUser from "./ManageUser";
import Avatar from "./Avatar";

function Document({ id }: { id: string }) {
  const documentRef = doc(db, "documents", id);

  // Real-time Firestore listener — works for owners; may silently fail for editors.
  const [firestoreData] = useDocumentData(documentRef);

  // API fallback — always works (uses adminDb server-side, bypasses security rules).
  const [apiData, setApiData] = useState<{
    title?: string;
    createdBy?: string;
    role?: string;
  } | null>(null);
  const [docLoaded, setDocLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/document/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setApiData(data);
      })
      .catch(() => null)
      .finally(() => setDocLoaded(true));
  }, [id]);

  // Prefer real-time Firestore data (owner) over API snapshot (editor).
  const title = (firestoreData?.title as string | undefined) ?? apiData?.title;
  const createdBy =
    (firestoreData?.createdBy as string | undefined) ?? apiData?.createdBy;

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const isOwner = useUserOwn(createdBy);

  // Sync input field whenever title resolves (from either source).
  useEffect(() => {
    if (title) setInput(title);
  }, [title]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    startTransition(async () => {
      await updateDocumentTitle(id, input);
    });
  };

  // Show loading until at least the API fetch completes.
  if (!docLoaded && !firestoreData) {
    return (
      <div className="flex items-center justify-center h-screen text-xl dark:text-zinc-300">
        Loading document...
      </div>
    );
  }

  // If both sources returned nothing, the document doesn't exist or access is denied.
  if (docLoaded && !firestoreData && !apiData) {
    return (
      <div className="flex items-center justify-center h-screen text-yellow-500">
        Document not found or you do not have access.
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0a0a] dark:via-[#0f0f12] dark:to-black">
      {/* TOP BAR */}
      <div className="w-full px-6 py-4 flex justify-center border-b border-black/5 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-black/30">
        <form
          onSubmit={updateTitle}
          className="flex items-center gap-3 w-full max-w-5xl"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-10 rounded-xl"
            disabled={!isOwner}
            title={
              !isOwner ? "Only the owner can rename this document" : undefined
            }
          />

          {/* Update + owner actions only visible to the owner */}
          {isOwner ? (
            <>
              <Button
                disabled={isPending}
                type="submit"
                className="rounded-xl flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Update</span>
              </Button>

              <div className="flex items-center gap-2">
                <InviteUser />
                <DeleteDocument />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <LeaveDocument />
            </div>
          )}
        </form>
      </div>

      <div className="flex max-w-6xl mx-auto justify-between items-center mb-5">
        {/* <ManageUser/> */}
        {/* ManageUser */}

        <Avatar/>
        {/* Avatar */}
      </div>

      <hr className="pb-10" />

      {/* EDITOR */}
      <div className="flex-1 w-full flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl h-full rounded-2xl overflow-hidden border bg-white dark:bg-[#0f0f12] shadow-2xl">
          <ClientSideSuspense
            fallback={
              <div className="p-6 dark:text-zinc-400">
                Loading collaboration...
              </div>
            }
          >
            <Editor darkMode={isDarkMode} />
          </ClientSideSuspense>
        </div>
      </div>
    </div>
  );
}

export default Document;
