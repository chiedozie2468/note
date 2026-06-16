"use client";

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function SidebarOption({ href, id }: { href: string; id: string }) {
  const [data] = useDocument(doc(db, "documents", id));

  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";

  if (!data) return null;

  return (
    <Link
      href={href}
      className={`
        block
        px-4 py-3
        mb-2
        rounded-md
        border
        transition
        hover:bg-gray-300
        dark:hover:bg-zinc-800
        hover:shadow-sm
        ${isActive ? "bg-gray-300 dark:bg-zinc-700 font-bold border-black dark:border-zinc-400" : "border-gray-400 dark:border-zinc-700"}
      `}
    >
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 truncate">
        {data.data()?.title}
      </p>
    </Link>
  );
}

export default SidebarOption;
