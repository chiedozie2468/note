"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { createNewDocument } from "@/actions/actions";

export default function CreateTeamDocumentButton({
  className,
}: {
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const handleCreateAndInvite = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    startTransition(async () => {
      const result = await createNewDocument();
      if (!result?.docId) return;

      // navigate to the new doc and include invite flag so InviteUser opens
      router.push(`/doc/${result.docId}?invite=1`);
    });
  };

  return (
    <Button
      onClick={handleCreateAndInvite}
      disabled={isPending}
      className={className}
      variant="outline"
    >
      {isPending ? "Creating..." : "Create with team"}
    </Button>
  );
}
