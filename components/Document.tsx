"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useTheme } from "@/components/ThemeProvider";
import { Pencil, ListVideo } from "lucide-react";
import { updateDocumentTitle } from "@/actions/actions";
import ShareDocument from "./ShareDocument";
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
    // Include credentials so server-side auth (Clerk) receives the cookies
    fetch(`/api/document/${id}`, { credentials: "include" })
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
  const [editOpen, setEditOpen] = useState(false);
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
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500 dark:border-zinc-700 dark:border-t-cyan-400" />

        <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-zinc-400">
          Loading document...
        </p>
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
    <div className="h-screen w-full flex flex-col bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0a0a] dark:via-[#0f0f12] dark:to-black">
      {/* TOP BAR - transparent on mobile, subtle background on desktop */}
      <div className="w-full px-4 sm:px-6 py-2 sm:py-4 flex justify-center sm:border-b sm:border-black/5 sm:backdrop-blur-md sm:bg-white/60 sm:dark:bg-black/30">
        <form
          onSubmit={updateTitle}
          className="flex items-center w-full max-w-5xl gap-3"
        >
          {/* Left: title / input and update button (desktop) */}
          <div className="flex items-center gap-3 flex-1">
            {isOwner ? (
              <>
                {/* Desktop inline input */}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="hidden sm:block flex-1 h-10 rounded-xl"
                  disabled={!isOwner}
                  title={
                    !isOwner
                      ? "Only the owner can rename this document"
                      : undefined
                  }
                />

                {/* Mobile title trigger - opens modal for editing */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="sm:hidden text-lg font-semibold truncate text-left"
                    >
                      {title ?? "Untitled Document"}
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                      <DialogTitle>Edit document name</DialogTitle>
                      <DialogDescription>
                        Update the document name and save.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!input.trim()) return;
                        startTransition(async () => {
                          await updateDocumentTitle(id, input);
                          setEditOpen(false);
                        });
                      }}
                      className="flex flex-col gap-3 mt-4"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full"
                      />

                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Update button - desktop only */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="hidden sm:inline-flex rounded-xl"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="ml-2">Update</span>
                </Button>
              </>
            ) : (
              <span className="text-lg font-semibold truncate">
                {title ?? "Untitled Document"}
              </span>
            )}
          </div>

          {/* Right: three-dots dropdown aligned far right */}
          <div className="ml-auto">
            {isOwner ? (
              <ShareDocument title={title} compact>
                <>
                  <InviteUser triggerAsChild />
                  <DeleteDocument triggerAsChild />
                </>
              </ShareDocument>
            ) : (
              <ShareDocument title={title} compact>
                <>
                  <LeaveDocument triggerAsChild />
                </>
              </ShareDocument>
            )}
          </div>
        </form>
      </div>

      <div className="flex max-w-6xl mx-auto justify-between items-center mb-5  w-full px-6">
        <Avatar />
      </div>
      {/* 
      <hr className="pb-10" /> */}

      {/* EDITOR */}
      <div className="flex-1 w-full flex justify-center  sm:p-6">
        <div className="w-full max-w-6xl h-full   overflow-hidden bg-white dark:bg-[#0f0f1211] border">
          <ClientSideSuspense
            fallback={
              <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500 dark:border-zinc-700 dark:border-t-cyan-400" />

                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                  Loading collaboration...
                </p>
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
