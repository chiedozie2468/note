"use client";

import React, { FormEvent, useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSearchParams, useRouter } from "next/navigation";
import {
  inviteUserToDocument,
  getDocumentCollaborators,
  removeCollaboratorFromDocument,
} from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface Collaborator {
  userId: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
}

export default function InviteUser({
  triggerAsChild,
}: {
  triggerAsChild?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  const pathname = usePathname();
  // robustly extract last non-empty segment for roomId
  const roomSegments = pathname?.split("/").filter(Boolean) ?? [];
  const roomId = roomSegments.length
    ? roomSegments[roomSegments.length - 1]
    : null;
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchCollaborators = async () => {
    if (!roomId) return;
    setLoadingCollaborators(true);
    try {
      const res = await getDocumentCollaborators(roomId);
      if (res.success && res.collaborators) {
        setCollaborators(res.collaborators);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }

    // auto-open when ?invite=1 is present in the URL
    if (!isOpen && searchParams?.get("invite") === "1") {
      setIsOpen(true);

      // remove the invite param without navigating away
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        router.replace(url.pathname + url.search);
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    if (!roomId) return;

    startTransition(async () => {
      try {
        const res = await inviteUserToDocument(roomId, email.trim());

        console.log("INVITE RESPONSE:", res);

        if (res.success) {
          toast.success("User added successfully!");
          setEmail("");
          fetchCollaborators();
        }
        else {
          toast.error(res.error || "Failed to invite user");
        }
      } catch (error) {
        console.error(error);
        toast.error("Unexpected error");
      }
    });
  };

  const handleRemoveCollaborator = async (targetUserId: string) => {
    if (!roomId) return;

    try {
      const res = await removeCollaboratorFromDocument(roomId, targetUserId);
      if (res.success) {
        toast.success("Collaborator removed successfully");
        fetchCollaborators();
      }
      else {
        toast.error(res.error || "Failed to remove collaborator");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerAsChild ? (
          <DropdownMenuItem>Invite User</DropdownMenuItem>
        ) : (
          <Button type="button" variant="outline" size="sm">
            Invite User
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-sky-100 dark:bg-sky-900/20 p-3">
              <UserPlus className="h-6 w-6 text-sky-600 dark:text-sky-300" />
            </div>
          </div>

          <h3 className="text-zinc-900 dark:text-zinc-50 font-medium tracking-tight text-lg sm:text-xl">
            Invite a user to collaborate
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Enter the user's email address.
          </p>

          <form onSubmit={handleInvite} className="flex gap-2 mt-4 w-full">
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />

            <Button
              type="submit"
              disabled={!email || isPending}
              className="rounded-xl px-5 h-11 font-medium shadow-sm"
            >
              {isPending ? "Inviting..." : "Invite"}
            </Button>
          </form>

          <div className="mt-4 w-full">
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Collaborators
              </h3>

              {loadingCollaborators ? (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Loading collaborators...
                  </span>
                </div>
              ) : collaborators.length === 0 ? (
                <div className="py-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    No other collaborators yet.
                  </span>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {collaborators.map((c) => (
                    <div
                      key={c.userId}
                      className="flex items-center justify-between gap-3 text-sm p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {c.name}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {c.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                          {c.role}
                        </span>
                        {c.role === "editor" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCollaborator(c.userId)}
                            className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full mt-6">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="rounded-xl px-5 h-11 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
