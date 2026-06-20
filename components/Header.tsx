"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left Side */}
        <Link href="/" className="min-w-0 flex-1">
          <div className="flex flex-col">
            <h1 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Note Workspace
            </h1>

            {isSignedIn && (
              <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                Welcome, {user?.firstName}
              </p>
            )}
          </div>
        </Link>

        {/* Right Side */}
        <div className="ml-3 flex items-center gap-2">
          {mounted && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="h-9 w-9 shrink-0 rounded-lg"
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
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9",
                },
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}