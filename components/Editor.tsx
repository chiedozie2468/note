"use client";

import LiveCursorProvider from "./LiveCursorProvider";
import React, { useEffect, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";

interface BlockNoteProps {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
  userInfo: { name?: string; email?: string } | null;
}

function BlockNote({ doc, provider, darkMode, userInfo }: BlockNoteProps) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  useEffect(() => {
    if (!provider || !doc || !userInfo) return;

    const createdEditor = BlockNoteEditor.create({
      collaboration: {
        provider: provider as never,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userInfo?.name ?? "Anonymous",
          color: stringToColor(userInfo?.email ?? "anonymous@example.com"),
        },
      },
    });

    setEditor(createdEditor);

    return () => {
      createdEditor._tiptapEditor.destroy();
    };
  }, [provider, doc, userInfo?.email, userInfo?.name]);

  if (!editor) {
    return (
      <div className="h-full w-full flex items-center justify-center py-20">
        <div className="text-zinc-400 font-medium animate-pulse text-sm">
          Loading editor engine...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-8 sm:px-12 sm:py-10 md:px-16 md:py-12">
      <div className="max-w-4xl mx-auto min-h-full">
        <BlockNoteView
          editor={editor}
          theme={darkMode ? "dark" : "light"}
          className="min-h-full"
        />
      </div>
    </div>
  );
}

export default function Editor({ darkMode }: { darkMode: boolean }) {
  const room = useRoom();
  const userInfo = useSelf((me) => me.info);

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc as any);
    setProvider(yProvider as any);

    return () => {
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!doc || !provider || !mounted) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500 dark:border-zinc-700 dark:border-t-cyan-400" />

        <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-zinc-400">
          Synchronizing live components...
        </p>
      </div>
    );
  }

  return (
    <LiveCursorProvider>
      <div className="h-full w-full flex flex-col bg-amber-200">
        {/* TRANSLATION & UTILITY PANEL FLOATED TOP-RIGHT INSIDE CONTAINER RIG */}
        <div className="flex items-center gap-2 justify-end  border-b border-zinc-100  bg-zinc-50/50 dark:bg-zinc-900/10">
          <TranslateDocument doc={doc} />
        </div>

        <div className="flex-1 min-h-0">
          <BlockNote
            doc={doc}
            provider={provider}
            darkMode={darkMode}
            userInfo={userInfo}
          />
        </div>
      </div>
    </LiveCursorProvider>
  );
}
