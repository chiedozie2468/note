"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import NewDocumentButton from "./NewDocumentButton";
import CreateTeamDocumentButton from "./CreateTeamDocumentButton";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FileText,
  Settings,
  CheckSquare,
  MenuIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import SidebarOption from "./SidebarOption";

interface RoomDocument extends DocumentData {
  id?: string;
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
  title?: string;
}

export default function Sidebar() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const [data, loading, error] = useCollection(
    user?.id
      ? query(collectionGroup(db, "rooms"), where("userId", "==", user.id))
      : null,
  );

  const groupData = useMemo(() => {
    if (!data)
      return { owner: [] as RoomDocument[], editor: [] as RoomDocument[] };

    return data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomDoc = curr.data() as RoomDocument;
        if (roomDoc.role === "owner")
          acc.owner.push({ id: curr.id, ...roomDoc });
        else acc.editor.push({ id: curr.id, ...roomDoc });
        return acc;
      },
      { owner: [], editor: [] },
    );
  }, [data]);

  const closeSidebar = () => setOpen(false);

  const sidebarInner = (
    <div className="flex h-full min-h-screen w-72 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Notes Workspace
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-zinc-500">
            v 1.0
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
        <nav className="space-y-2">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </Link>
          <Link
            href="/tasks"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Tasks</span>
          </Link>
          <Link
            href="/profile"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      <div>
        <NewDocumentButton className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white" />
      </div>

      <div>
        <CreateTeamDocumentButton className="w-full mt-2" />
      </div>

      <div className="flex-1 overflow-hidden">
        <h3 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
          My documents
        </h3>
        <div className="space-y-2 overflow-y-auto pr-1">
          {error ? (
            <p className="text-sm text-red-500 dark:text-red-400">
              {error.message}
            </p>
          ) : loading ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Loading...
            </p>
          ) : groupData.owner.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              No documents yet.
            </p>
          ) : (
            groupData.owner.map((doc) => (
              <SidebarOption
                key={doc.id}
                href={`/doc/${doc.id}`}
                id={doc.id!}
                title={doc.title}
                onNavigate={closeSidebar}
              />
            ))
          )}
        </div>
      </div>

      {groupData.editor.length > 0 && (
        <div className="mt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
            Shared with me
          </h3>
          <div className="space-y-2 overflow-y-auto pr-1">
            {groupData.editor.map((doc) => (
              <SidebarOption
                key={doc.id}
                href={`/doc/${doc.id}`}
                id={doc.id!}
                title={doc.title}
                onNavigate={closeSidebar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-20 left-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-80">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {sidebarInner}
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex">{sidebarInner}</aside>
    </>
  );
}
