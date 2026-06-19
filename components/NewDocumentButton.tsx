"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { createNewDocument } from "@/actions/actions";

export default function NewDocumentButton({
  className,
  size,
  children,
}: {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = React.useTransition();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
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
      <Button
        size={size || "default"}
        className={className}
        onClick={() => openSignIn()}
      >
        {children || "Create Document"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCreateNewDocument}
      disabled={isPending}
      size={size || "default"}
      className={className}
    >
      {isPending ? "Creating..." : (children || "New Document")}
    </Button>
  );
}
