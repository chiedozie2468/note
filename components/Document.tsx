"use client";

 import {ClientSideSuspense} from "@liveblocks/react";
import React, { useEffect, useState, useTransition, Suspense } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import Editor from "./Editor";
import useUserOwn from "@/lib/userOwn";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import { useTheme } from "next-themes";
import { Pencil } from "lucide-react";

function Document({ id }: { id: string }) {
  const documentRef = doc(db, "documents", id);

  const [data, loading, error] = useDocumentData(documentRef);

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const isOwner = useUserOwn();

  console.log("========== DOCUMENT DEBUG ==========");
  console.log("DOCUMENT ID:", id);
  console.log("DOCUMENT PATH:", documentRef.path);
  console.log("LOADING:", loading);
  console.log("DATA:", data);
  console.log("ERROR:", error);
  console.log("IS OWNER:", isOwner);
  console.log("====================================");

  useEffect(() => {
    if (data?.title) {
      setInput(data.title as string);
    }
  }, [data]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    startTransition(async () => {
      await updateDoc(documentRef, {
        title: input,
      });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading Firestore document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Firestore Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-yellow-500">
        Document not found.
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
          />

          <Button
            disabled={isPending}
            type="submit"
            className="rounded-xl flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Update</span>
          </Button>



          {isOwner && (
            <div className="flex items-center gap-2">
              <InviteUser />
              <DeleteDocument />
            </div>
          )}
        </form>
      </div>

      {/* EDITOR */}
      <div className="flex-1 w-full flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl h-full rounded-2xl overflow-hidden border bg-white dark:bg-[#0f0f12] shadow-2xl">
         
          <ClientSideSuspense fallback={<div>Loading collaboration...</div>}>
            <Editor darkMode={isDarkMode} />
          </ClientSideSuspense>
        </div>
      </div>
    </div>
  );
}

export default Document;
