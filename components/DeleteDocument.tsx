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
import { Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { deleteDocument } from "@/actions/actions";
import { toast } from "sonner";

export default function DeleteDocument({
  triggerAsChild,
}: {
  triggerAsChild?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const router = useRouter();

  const handleDelete = () => {
    // Get the last non-empty segment of the pathname (robust to trailing slashes)
    const segments = pathname.split("/").filter(Boolean);
    const roomId = segments.length ? segments[segments.length - 1] : null;

    console.log("PATHNAME:", pathname);
    console.log("ROOM ID:", roomId);

    if (!roomId) {
      toast.error("Room ID not found from URL");
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteDocument(roomId);

        console.log("DELETE RESPONSE:", res);

        if (res.success) {
          toast.success("Room Deleted Successfully!");

          setIsOpen(false);

          router.replace("/");
        }
        else {
          console.error("DELETE FAILED:", res);

          toast.error(res.error || "Failed to delete room");
        }
      } catch (error) {
        console.error("CLIENT ERROR:", error);

        toast.error("Unexpected error");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerAsChild ? (
          <DropdownMenuItem data-variant="destructive">Delete</DropdownMenuItem>
        ) : (
          <Button variant="destructive">Delete</Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h3 className="text-zinc-900 dark:text-zinc-50 font-medium tracking-tight text-lg sm:text-xl">
            Are you sure you want to delete this item?
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            This will permanently delete the document and remove all users.
          </p>

          <div className="flex items-center justify-center gap-3 w-full mt-6">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="rounded-xl px-5 h-11 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              >
                No, cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl px-5 h-11 font-medium shadow-sm"
            >
              {isPending ? "Deleting..." : "Yes, I'm sure"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
