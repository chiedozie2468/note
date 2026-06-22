"use client";

import LiveCursorProvider from "./LiveCursorProvider";
import React, { useEffect, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

// Defer importing heavy BlockNote modules and CSS until the editor actually
// mounts. This reduces initial bundle work and allows the dynamic `Editor`
// chunk to load faster.

import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";

interface BlockNoteProps {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
  userInfo: { name?: string; email?: string } | null;
}

function BlockNote({ doc, provider, darkMode, userInfo }: BlockNoteProps) {
  const [editor, setEditor] = useState<any | null>(null);
  const [BlockNoteViewComp, setBlockNoteViewComp] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    let createdEditor: any | null = null;

    async function init() {
      if (!provider || !doc || !userInfo) return;

      // Dynamically import BlockNote modules and styles.
      const [{ BlockNoteEditor }, { BlockNoteView }] = await Promise.all([
        import("@blocknote/core"),
        import("@blocknote/shadcn"),
        // load CSS in parallel
        import("@blocknote/core/fonts/inter.css").catch(() => {}),
        import("@blocknote/shadcn/style.css").catch(() => {}),
      ] as any);

      if (!mounted) return;

      // create editor instance
      createdEditor = (BlockNoteEditor as any).create({
        collaboration: {
          provider: provider as any,
          fragment: doc.getXmlFragment("document-store"),
          user: {
            name: userInfo?.name ?? "Anonymous",
            color: stringToColor(userInfo?.email ?? "anonymous@example.com"),
          },
        },
      });

      setBlockNoteViewComp(() => BlockNoteView);
      // small non-critical update scheduled via rAF
      requestAnimationFrame(() => setEditor(createdEditor));
    }

    init();

    return () => {
      mounted = false;
      try {
        createdEditor?._tiptapEditor?.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [provider, doc, userInfo?.email, userInfo?.name]);

  if (!editor || !BlockNoteViewComp) {
    return (
      <div className="h-full w-full flex items-center justify-center py-20">
        <div className="text-zinc-400 font-medium animate-pulse text-sm">
          Loading editor engine...
        </div>
      </div>
    );
  }

  const BlockNoteView = BlockNoteViewComp;

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-8 md:p-12">
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
      <div className="h-full w-full flex flex-col ">
        {/* TRANSLATION & UTILITY PANEL FLOATED TOP-RIGHT INSIDE CONTAINER RIG */}
        {/* <div className="flex items-center gap-2 justify-end  border-b border-zinc-100  bg-zinc-50/50 dark:bg-zinc-900/10">
          <TranslateDocument doc={doc} />
        </div> */}

        <div className="flex-1 min-h-0 ">
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
