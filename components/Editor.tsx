"use client";

import LiveCursorProvider from "./LiveCursorProvider";
import React, { useEffect, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import stringToColor from "@/lib/stringToColor";

function BlockNote({ doc, provider, darkMode }: any) {
  const userInfo = useSelf((me) => me.info);

  const editor = useCreateBlockNote({
    collaboration: {
      provider: provider as never,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name ?? "Anonymous",
        color: stringToColor(userInfo?.email ?? "anonymous@example.com"),
      },
    },
  });

  return (
    <div className="h-full w-full">
      <BlockNoteView
        editor={editor}
        theme={darkMode ? "dark" : "light"}
        className="h-full w-full"
      />
    </div>
  );
}

export default function Editor({ darkMode }: any) {
  const room = useRoom();

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return <div className="h-full w-full" />;
  }

  return (
    <LiveCursorProvider>
      <div className="h-full w-full">
        <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
      </div>
    </LiveCursorProvider>
  );
}