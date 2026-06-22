"use client";

import { ClientSideSuspense, useOthers, useSelf } from "@liveblocks/react";
import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500 dark:border-zinc-700 dark:border-t-cyan-400" />
      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
        Loading editor...
      </p>
    </div>
  ),
});
import useUserOwn from "@/lib/userOwn";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import LeaveDocument from "./LeaveDocument";
import { useTheme } from "@/components/ThemeProvider";
import { Pencil, ArrowLeft } from "lucide-react";
import { updateDocumentTitle } from "@/actions/actions";
import ShareDocument from "./ShareDocument";
import AvatarPanel from "./Avatar";
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

function Document({ id }: { id: string }) {
  const documentRef = doc(db, "documents", id);

  // Real-time Firestore listener — works for owners; may silently fail for editors.
  // useDocumentData returns [data, loading, error]
  const [firestoreData, loadingFirestore, errorFirestore] = useDocumentData(
    documentRef as any,
  );

  // API fallback — always works (uses adminDb server-side, bypasses security rules).
  const [apiData, setApiData] = useState<{
    title?: string;
    createdBy?: string;
    role?: string;
  } | null>(null);
  const [apiRequested, setApiRequested] = useState(false);
  const [docLoaded, setDocLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function requestApi() {
      setApiRequested(true);
      try {
        const r = await fetch(`/api/document/${id}`, {
          credentials: "include",
        });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled && data) setApiData(data);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setDocLoaded(true);
      }
    }

    // Wait until Firestore finishes its initial load. If Firestore succeeded
    // with data, skip the API fallback. Only hit the API when Firestore errors
    // or returns no document (permission issue or missing doc).
    if (!loadingFirestore) {
      if (firestoreData) {
        setDocLoaded(true);
      }
      else if ((errorFirestore || !firestoreData) && !apiRequested) {
        requestApi();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [id, loadingFirestore, firestoreData, errorFirestore, apiRequested]);

  // Prefer real-time Firestore data (owner) over API snapshot (editor).
  const title = (firestoreData?.title as string | undefined) ?? apiData?.title;
  const createdBy =
    (firestoreData?.createdBy as string | undefined) ?? apiData?.createdBy;

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const isOwner = useUserOwn(createdBy);
  const self = useSelf();
  const others = useOthers();
  const audience = [self, ...others]
    .filter((user): user is NonNullable<typeof user> => Boolean(user))
    .slice(0, 3);
  const extraAudience = Math.max(
    0,
    (self ? 1 : 0) + others.length - audience.length,
  );
  const isRootWorkspace = pathname === "/";
  const isDocumentPage = pathname?.startsWith("/doc/");

  // Sync input field whenever title resolves (from either source). Use
  // requestAnimationFrame to avoid blocking initial paint with synchronous
  // state updates from the presence/live connection.
  useEffect(() => {
    if (!title) return;
    if (title === input) return;

    let raf = 0;
    raf = requestAnimationFrame(() => setInput(title));
    return () => cancelAnimationFrame(raf);
  }, [title, input]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    startTransition(async () => {
      await updateDocumentTitle(id, input);
    });
  };

  // Show loading until at least the Firestore initial attempt completes and
  // API fallback (if triggered) finishes.
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
      <div className="flex items-center justify-center h-screen text-center px-4 text-zinc-500 dark:text-zinc-400">
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
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isDocumentPage ? (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer flex-shrink-0" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 px-2 py-2 text-zinc-700 dark:text-zinc-300 shadow-sm sm:hidden"
                  aria-label="Open navigation"
                >
                  ☰
                </button>
              )}

              <div className="min-w-0 flex-1">
                {isOwner ? (
                  <>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-lg font-semibold truncate text-left text-zinc-900 dark:text-zinc-100"
                        >
                          {title ?? "Untitled Document"}
                        </button>
                      </DialogTrigger>
                    </Dialog>

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
                  </>
                ) : (
                  <span className="text-lg font-semibold truncate text-zinc-900 dark:text-zinc-100">
                    {title ?? "Untitled Document"}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {isOwner && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex rounded-xl"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="ml-2">Update</span>
                </Button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <AvatarPanel />
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              {audience.length > 0 ? (
                <div className="flex -space-x-2">
                  {audience.map((user, idx) => (
                    <UiAvatar
                      key={idx}
                      className="h-8 w-8 rounded-full border-2 border-white bg-zinc-100 text-xs text-zinc-700 dark:border-zinc-950 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <AvatarImage src={user.info?.avatar} />
                      <AvatarFallback>
                        {user.info?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </UiAvatar>
                  ))}
                  {extraAudience > 0 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white ring-2 ring-white dark:ring-zinc-950">
                      +{extraAudience}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center">
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
          </div>
        </form>
      </div>

      <div className="hidden sm:flex max-w-6xl mx-auto justify-between items-center w-full px-4 sm:px-8 mt-4">
        <AvatarPanel />
      </div>
      {/* 
      <hr className="pb-10" /> */}

      {/* EDITOR */}
      <div className="flex-1 w-full flex justify-center p-0 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl h-full overflow-hidden bg-white dark:bg-[#0f0f1211] rounded-none border-x-0 border-t sm:rounded-3xl sm:border">
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
