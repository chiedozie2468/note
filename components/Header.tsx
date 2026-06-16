"use client";

import { useState } from "react";
import {
  useUser,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Breadcrumb from "./breadcrumb";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

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

          <div className="relative">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  className="overflow-hidden rounded-full border border-slate-300 dark:border-zinc-700"
                  title="User menu"
                  aria-label="User menu"
                >
                  <Image
                    src={user?.imageUrl || ""}
                    alt={user?.firstName || "User"}
                    width={42}
                    height={42}
                    className="h-10 w-10 object-cover"
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
                    <div className="border-b border-slate-200 dark:border-zinc-800 px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>

                    <SignOutButton>
                      <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-zinc-800">
                        Logout
                      </button>
                    </SignOutButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}