"use client";

import { useState, useEffect } from "react";
import {
  useUser,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Breadcrumb from "./breadcrumb";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-6">

        {/* Left */}
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Note Workspace
          </h1>

          {isSignedIn && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Welcome, {user?.firstName}
            </p>
          )}
        </div>

        {/* Breadcrumbs */}
        <Breadcrumb/>
      
        {/* Right */}
        <div className="flex items-center gap-4">
          {mounted && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-xl border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
          )}

          <div className="flex items-center">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-10 w-10 border border-slate-300 dark:border-zinc-700",
                  },
                }}
              />
            )}
          </div>
        </div>

      </div>
    </header>
  );
}