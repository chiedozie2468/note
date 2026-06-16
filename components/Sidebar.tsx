"use client";

import React, { useMemo } from "react";
import NewDocumentButton from "./NewDocumentButton";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
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
}

export default function Sidebar() {
  const { user } = useUser();

  const [data, loading, error] = useCollection(
    user?.id
      ? query(collectionGroup(db, "rooms"), where("userId", "==", user.id))
      : null,
  );

  console.log("user:", user?.id);
  console.log("loading:", loading);
  console.log("error:", error);
  console.log("data:", data?.docs.length);

  const groupData = useMemo(() => {
    if (!data) {
      return {
        owner: [] as RoomDocument[],
        editor: [] as RoomDocument[],
      };
    }

    return data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomDoc = curr.data() as RoomDocument;

        if (roomDoc.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomDoc,
          });
        }
        else {
          acc.editor.push({
            id: curr.id,
            ...roomDoc,
          });
        }

        return acc;
      },
      {
        owner: [],
        editor: [],
      },
    );
  }, [data]);

  const getMenuOptions = (isMobile = false) => {
    const wrapWithSheetClose = (component: React.ReactNode, key?: string) => {
      if (isMobile) {
        return (
          <SheetClose asChild key={key}>
            {component}
          </SheetClose>
        );
      }
      return component;
    };

    return (
      <>
        {wrapWithSheetClose(<NewDocumentButton />)}

        <div className="mt-4 text-left">
          {error ? (
            <h2 className="text-sm text-red-500 dark:text-red-400">{error.message}</h2>
          ) : loading ? (
            <h2 className="text-sm text-gray-500 dark:text-zinc-400">Loading...</h2>
          ) : groupData.owner.length === 0 ? (
            <h2 className="text-sm font-bold text-gray-500 dark:text-zinc-400">No Document</h2>
          ) : (
            <>
              <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                My Documents
              </h2>

              {groupData.owner.map((doc) =>
                wrapWithSheetClose(
                  <SidebarOption
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    id={doc.id!}
                  />,
                  doc.id
                )
              )}
            </>
          )}
        </div>

        {/* shared with me */}
        {groupData.editor.length > 0 && (
          <div className="mt-4 text-left">
            <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
              Shared with Me
            </h2>

            {groupData.editor.map((doc) =>
              wrapWithSheetClose(
                <SidebarOption key={doc.id} href={`/doc/${doc.id}`} id={doc.id!} />,
                doc.id
              )
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative bg-gray-200 dark:bg-zinc-900 border-r border-gray-300 dark:border-zinc-800 p-2 md:p-5">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon size={40} className="rounded-lg p-2 hover:opacity-30 dark:text-zinc-100" />
          </SheetTrigger>

          <SheetContent side="left" className="bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
            <SheetHeader>
              <SheetTitle className="text-center dark:text-zinc-100">Menu</SheetTitle>

              <div className="mt-4">{getMenuOptions(true)}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block">{getMenuOptions(false)}</div>
    </div>
  );
}
