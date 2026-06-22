"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { leaveDocument } from "@/actions/actions";
import { toast } from "sonner";

export default function LeaveDocument({
  triggerAsChild,
}: {
  triggerAsChild?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const roomId = segments.length ? segments[segments.length - 1] : null;
  const router = useRouter();

  const handleLeave = () => {
    if (!roomId) {
      toast.error("Room ID not found from URL");
      return;
    }

    startTransition(async () => {
      try {
        const res = await leaveDocument(roomId);

        if (res.success) {
          toast.success("Left the document successfully");
          setIsOpen(false);
          router.replace("/");
        }
        else {
          toast.error(res.error || "Failed to leave document");
        }
      } catch (error) {
        console.error("LEAVE ERROR:", error);
        toast.error("Unexpected error");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerAsChild ? (
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Leave Room
          </DropdownMenuItem>
        ) : (
          <Button
            variant="outline"
            className="border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 dark:text-orange-400 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Room</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Leave document</DialogTitle>
          <DialogDescription>
            You will lose access to the document and must be re-invited to
            return.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center text-center p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
              <LogOut className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <h3 className="text-zinc-900 dark:text-zinc-50 font-medium tracking-tight text-lg sm:text-xl">
            Leave this document?
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            You will lose access to this document and it will be removed from
            your sidebar. You will need to be re-invited to access it again.
          </p>

          <div className="flex items-center justify-center gap-3 w-full mt-6">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="rounded-xl px-5 h-11 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={isPending}
              className="rounded-xl px-5 h-11 font-medium shadow-sm"
            >
              {isPending ? "Leaving..." : "Leave"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
