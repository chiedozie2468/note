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
import { usePathname, useRouter } from "next/navigation";
import { leaveDocument } from "@/actions/actions";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function LeaveDocument({
  triggerAsChild,
}: {
  triggerAsChild?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const router = useRouter();

  const handleLeave = () => {
    const roomId = pathname.split("/").pop();

    if (!roomId) {
      toast.error("Room ID not found");
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

      <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            Leave this document?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            You will lose access to this document and it will be removed from
            your sidebar. You will need to be re-invited to access it again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isPending}
          >
            {isPending ? "Leaving..." : "Leave"}
          </Button>

          <DialogClose asChild>
            <Button
              variant="secondary"
              className="dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
