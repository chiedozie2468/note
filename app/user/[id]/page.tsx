"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
  createdAt: string;
  email: string | null;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${userId}`);

        if (!response.ok) {
          throw new Error("User not found");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0a0a] dark:via-[#0f0f12] dark:to-black p-4 sm:p-6 md:p-8">
      {/* Back button */}
      <div className="max-w-2xl w-full mx-auto mb-6">
        <Link href="/">
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
        <div className="w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#0f0f12] overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : error ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="text-red-500 dark:text-red-400 mb-4">
                <p className="text-lg font-semibold">Profile Not Found</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
              <Link href="/">
                <Button>Return to Workspace</Button>
              </Link>
            </div>
          ) : user ? (
            <div className="p-8 sm:p-12">
              {/* Avatar */}
              <div className="flex justify-center mb-8">
                <Avatar className="h-32 w-32 border-4 border-zinc-200 dark:border-zinc-700">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.firstName || "User"}
                  />
                  <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                {user.username && (
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-1">
                    @{user.username}
                  </p>
                )}
                {user.email && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Joined Date */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Joined
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
