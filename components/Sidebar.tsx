"use client";

import React, { useMemo, useState } from "react";

import { useCollection } from "react-firebase-hooks/firestore";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  collectionGroup,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase";
import SidebarOption from "./SidebarOption";
import NewDocumentButton from "./NewDocumentButton";
import CreateTeamDocumentButton from "./CreateTeamDocumentButton";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  CheckSquare,
  Home,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [data, loading, error] = useCollection(
    user?.id
      ? query(collectionGroup(db, "rooms"), where("userId", "==", user.id))
      : null,
  );

  const groupData = useMemo(() => {
    if (!data)
      return { owner: [] as RoomDocument[], editor: [] as RoomDocument[] };
    return data.docs.reduce<{ owner: RoomDocument[]; editor: RoomDocument[] }>(
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

  // Shared inner navigation panel layout
  const renderNavContent = (
    collapsedState: boolean,
    closeMobileFn?: () => void,
  ) => (
    <div className="flex h-full flex-col bg-white py-5 dark:bg-zinc-950">
      {/* Navigation Trees */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        {/* Navigation Segment */}
        <div>
          {!collapsedState && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 animate-fadeIn">
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            <SidebarOption
              href="/tasks"
              title="Tasks"
              icon={<CheckSquare className="h-4 w-4" />}
              isCollapsed={collapsedState}
              onNavigate={closeMobileFn}
            />
            <SidebarOption
              href="/"
              title="Home"
              icon={<Home className="h-4 w-4" />}
              isCollapsed={collapsedState}
              onNavigate={closeMobileFn}
            />
          </div>
        </div>

        {/* Content Segment */}
        <div>
          {!collapsedState && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 animate-fadeIn">
              Content
            </p>
          )}
          <div className="space-y-0.5">
            <SidebarOption
              href="/"
              title="Documents"
              icon={<FileText className="h-4 w-4" />}
              isCollapsed={collapsedState}
              onNavigate={closeMobileFn}
            />
          </div>
        </div>

        {/* Action Blocks */}
        {!collapsedState && (
          <div className="space-y-2 pt-1 px-1 animate-fadeIn">
            <NewDocumentButton className="w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition dark:bg-zinc-100 dark:text-zinc-950" />
            <CreateTeamDocumentButton className="w-full" />
          </div>
        )}

        {/* Dynamic Firestore Lists */}
        <div>
          {!collapsedState && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 animate-fadeIn">
              My Documents
            </p>
          )}
          <div className="space-y-0.5">
            {error
              ? !collapsedState && (
                  <p className="px-3 text-xs text-red-500">{error.message}</p>
                )
              : loading
              ? !collapsedState && (
                  <p className="px-3 text-xs text-slate-400 animate-pulse">
                    Loading...
                  </p>
                )
              : groupData.owner.length === 0
              ? !collapsedState && (
                  <p className="px-3 text-xs text-slate-400 italic">Empty</p>
                )
              : groupData.owner.map((doc) => (
                  <SidebarOption
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    title={doc.title}
                    icon={<FileText className="h-4 w-4" />}
                    isCollapsed={collapsedState}
                    onNavigate={closeMobileFn}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Component */}
      <div className="mt-auto border-t border-slate-100 p-3 dark:border-zinc-900">
        <div
          className={`flex items-center gap-3 ${
            collapsedState ? "justify-center" : "px-1"
          }`}
        >
          <div className="shrink-0">
            <UserButton
              userProfileUrl="/profile"
              userProfileMode="navigation"
              appearance={{
                elements: { userButtonAvatarBox: "h-9 w-9 shadow-sm" },
              }}
            />
          </div>
          {!collapsedState && (
            <div className="min-w-0 animate-fadeIn">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                {user?.fullName || "User Profile"}
              </p>
              <p className="truncate text-[10px] text-slate-400 dark:text-zinc-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Screen Node - Toggle Button sitting right under your layout header */}
      <div className="md:hidden fixed top-16 left-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open Navigation Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <SheetTitle className="sr-only">Navigation Panel</SheetTitle>
            {renderNavContent(false, () => setMobileOpen(false))}
          </SheetContent>
        </Sheet>
      </div>

      {/* 2. Big Desktop Screen Node - Supports expanding and collapsing */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 left-0 border-r border-slate-100 bg-white transition-all duration-300 dark:border-zinc-900 dark:bg-zinc-950 group/sidebar ${
          isCollapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
        {/* Hover Expand/Collapse Trigger Pin */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {renderNavContent(isCollapsed)}
      </aside>
    </>
  );
}
