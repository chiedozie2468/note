"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { createNewDocument } from "@/actions/actions";

export default function NewDocumentButton() {
  const [isPending, startTransition] = React.useTransition();
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const result = await createNewDocument();

      if (!result?.docId) {
        return;
      }

      router.push(`/doc/${result.docId}`);
    });
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button>Create Document</Button>
      </SignInButton>
    );
  }

  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}>
      {isPending ? "Creating..." : "New Document"}
    </Button>
  );
}
