"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// `title` is passed from the room document — no Firestore read needed here.
// This means editors can see shared documents even if security rules restrict
// reading the /documents/{id} collection directly.
function SidebarOption({
  href,
  id,
  title,
  onNavigate,
}: {
  href: string;
  id: string;
  title?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";

  return (
    <Link
      href={href}
      onClick={onNavigate}
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
        ${
          isActive
            ? "bg-gray-300 dark:bg-zinc-700 font-bold border-black dark:border-zinc-400"
            : "border-gray-400 dark:border-zinc-700"
        }
      `}
    >
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 truncate">
        {title ?? "Untitled"}
      </p>
    </Link>
  );
}

export default SidebarOption;
