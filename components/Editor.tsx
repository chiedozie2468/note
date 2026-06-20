"use client";

import LiveCursorProvider from "./LiveCursorProvider";
import React, { useEffect, useMemo, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";

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
  const editor = useCreateBlockNote(
    useMemo(
      () => ({
        collaboration: {
          provider: provider as never,
          fragment: doc.getXmlFragment("document-store"),
          user: {
            name: userInfo?.name ?? "Anonymous",
            color: stringToColor(userInfo?.email ?? "anonymous@example.com"),
          },
        },
      }),
      [provider, doc, userInfo?.email, userInfo?.name],
    ),
  );

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
  const [renderBlockNote, setRenderBlockNote] = useState(false);

  // Initialize Yjs doc and provider
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Delay BlockNote rendering to avoid render-phase state updates
  useEffect(() => {
    if (doc && provider && userInfo && !renderBlockNote) {
      // Defer to next animation frame to ensure DOM paint and avoid
      // render-phase state updates in sibling components (e.g. Avatars)
      const raf = requestAnimationFrame(() => setRenderBlockNote(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [doc, provider, userInfo, renderBlockNote]);

  if (!doc || !provider) {
    return <div className="h-full w-full" />;
  }

  return (
    <LiveCursorProvider>
      <div className="h-full w-full">
        <div className="flex items-center gap-2 justify-end mb-10">
          <TranslateDocument doc={doc} />
          {/* TranslateDocument */}

          {/* ChatToDocument */}
        </div>
        {renderBlockNote ? (
          <BlockNote
            doc={doc}
            provider={provider}
            darkMode={darkMode}
            userInfo={userInfo}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-slate-400">Loading editor...</div>
          </div>
        )}
      </div>
    </LiveCursorProvider>
  );
}
