"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0a0a] dark:via-[#0f0f12] dark:to-black p-4 sm:p-6 md:p-8">
      {/* Back button and title */}
      <div className="max-w-5xl w-full mx-auto mb-6">
        <Link href="/" className="inline-flex">
          <Button
            variant="ghost"
            className="gap-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
        </Link>
      </div>

      {/* Profile Container */}
      <div className="flex-1 flex justify-center items-start w-full">
        <div className="w-full max-w-5xl rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#0f0f12] overflow-hidden p-2 sm:p-6 flex justify-center">
          <UserProfile
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: "#0f0f12",
              },
              elements: {
                cardBox:
                  "shadow-none border-none max-w-full w-full bg-transparent dark:bg-transparent",
                navbar:
                  "bg-transparent border-r border-zinc-100 dark:border-zinc-800",
                pageScrollable: "bg-transparent scrollbar-thin",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
