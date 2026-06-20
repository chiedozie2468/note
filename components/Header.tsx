"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Breadcrumb from "./breadcrumb";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="relative mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Branding & Optional Navigation Links */}
        <div className="z-10 flex items-center gap-4 min-w-0">
          <Link href="/" className="flex flex-col min-w-0 group">
            <h1 className="truncate text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-slate-700 dark:text-zinc-100 dark:group-hover:text-zinc-300 sm:text-lg">
              Note Workspace
            </h1>
            {isSignedIn && (
              <p className="truncate text-[10px] text-slate-500 dark:text-zinc-400 sm:text-xs">
                Welcome, {user?.firstName}
              </p>
            )}
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {/* Nav links can go here if needed later */}
          </nav>
        </div>

        {/* Center: Breadcrumbs (Perfectly Centered & Only visible on Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[40%] truncate transition-all duration-200 hover:opacity-80">
          <Breadcrumb />
        </div>

        {/* Right: Theme Toggle & Authentication */}
        <div className="z-10 flex shrink-0 items-center gap-2 sm:gap-3">
          {mounted && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="h-9 w-9 rounded-lg border-slate-200 bg-white text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100 dark:hover:bg-zinc-800"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
          )}

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <Avatar className="h-9 w-9 border border-slate-300 dark:border-zinc-700">
              <AvatarImage
                src={user?.imageUrl}
                alt={user?.firstName || "User"}
              />
              <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
}
