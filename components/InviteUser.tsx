"use client";

import React, { FormEvent, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { inviteUserToDocument } from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "./ui/input";

export default function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  const pathname = usePathname();

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    const roomId = pathname.split("/").pop();

    if (!roomId) return;

    startTransition(async () => {
      try {
        const res = await inviteUserToDocument(
          roomId,
          email.trim()
        );

        console.log("INVITE RESPONSE:", res);

        if (res.success) {
          toast.success("User added successfully!");

          setEmail("");
          setIsOpen(false);
        } else {
          toast.error(
            res.error || "Failed to invite user"
          );
        }
      } catch (error) {
        console.error(error);

        toast.error("Unexpected error");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Invite User
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Invite a user to collaborate
          </DialogTitle>

          <DialogDescription>
            Enter the `user's` email address.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleInvite}
          className="flex gap-2"
        >
          <Input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Button
            type="submit"
            disabled={!email || isPending}
          >
            {isPending
              ? "Inviting..."
              : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}