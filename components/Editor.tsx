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
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-8 py-10 md:px-16 md:py-12">
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

  // Track client mount to avoid render-phase editor creation during hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Yjs doc and provider
  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDoc(yDoc as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setProvider(yProvider as any);

    return () => {
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!doc || !provider || !mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <LiveCursorProvider>
      <div className="h-full w-full">
        <div className="flex items-center gap-2 justify-end mb-10">
          <TranslateDocument doc={doc} />
          {/* TranslateDocument */}

          {/* ChatToDocument */}
        </div>
        <BlockNote
          doc={doc}
          provider={provider}
          darkMode={darkMode}
          userInfo={userInfo}
        />
      </div>
    </LiveCursorProvider>
  );
}
