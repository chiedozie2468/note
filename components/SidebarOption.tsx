"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarOptionProps {
  href: string;
  id: string;
  title?: string;
  icon: React.ReactNode;
  count?: number;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarOption({
  href,
  id,
  title = "Untitled",
  icon,
  count,
  isCollapsed,
  onNavigate,
}: SidebarOptionProps) {
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
        isCollapsed ? "justify-center" : "justify-between"
      } ${
        isActive
          ? "bg-slate-100 font-semibold text-slate-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      {/* Icon and Text Wrapper */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-slate-900 dark:text-zinc-50" : ""}`}>
          {icon}
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm font-medium animate-fadeIn">
            {title}
          </span>
        )}
      </div>

      {/* Counter Notification Badges */}
      {!isCollapsed && count !== undefined && count > 0 && (
        <span className="h-5 min-w-5 inline-flex items-center justify-center rounded-full bg-slate-200/60 px-1.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
          {count}
        </span>
      )}

      {/* Tooltip text: Show only if the desktop sidebar is collapsed into an icon strip */}
      {isCollapsed && (
        <div className="pointer-events-none absolute left-14 z-50 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-slate-900 group-hover:opacity-100 dark:bg-zinc-50 dark:text-zinc-950 dark:before:border-r-zinc-50 whitespace-nowrap">
          {title} {count ? `(${count})` : ""}
        </div>
      )}
    </Link>
  );
}