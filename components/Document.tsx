"use client";

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
import { Pencil, MoonIcon, SunIcon } from "lucide-react";

function Document({ id }: { id: string }) {
  const documentRef = doc(db, "documents", id);

  const [data, loading] = useDocumentData(documentRef);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const [darkMode, setDarkMode] = useState(false);

  const isOwner = useUserOwn();

  useEffect(() => {
    if (data?.title) setInput(data.title as string);
  }, [data]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    startTransition(async () => {
      await updateDoc(documentRef, { title: input });
    });
  };

  if (loading) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0a0a] dark:via-[#0f0f12] dark:to-black">

      {/* TOP BAR */}
      <div className="w-full px-6 py-4 flex justify-center border-b border-black/5 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-black/30">

        <form
          onSubmit={updateTitle}
          className="flex items-center gap-3 w-full max-w-5xl"
        >

          {/* INPUT */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-10 rounded-xl"
          />

          {/* UPDATE */}
          <Button
            disabled={isPending}
            type="submit"
            className="rounded-xl flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Update</span>
          </Button>

          {/* THEME TOGGLE (NOW CORRECT PLACE) */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl"
          >
            {darkMode ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>

          {/* OWNER ACTIONS */}
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

          <Suspense fallback={<div />}>

            <Editor darkMode={darkMode} />

          </Suspense>

        </div>
      </div>

    </div>
  );
}

export default Document;