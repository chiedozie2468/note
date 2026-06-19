"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocumentWithCollaborator } from "@/actions/actions";
import { ArrowRight, FilePlus, UserPlus } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState("Shared Document");
  const [emailList, setEmailList] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const emails = emailList
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await createDocumentWithCollaborator(
        title.trim() || "Shared Document",
        emails.length ? emails : undefined,
      );

      if (!result.success || !result.docId) {
        const err =
          "error" in result && typeof result.error === "string"
            ? result.error
            : undefined;
        setErrorMessage(err ?? "Unable to create document.");
        return;
      }

      if ("warning" in result && typeof result.warning === "string") {
        setWarningMessage(result.warning);
      }

      router.push(`/doc/${result.docId}`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50 px-4 py-10 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-900/5 dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
              Share a document
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Create one shared document with team access.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              The creator is set as the admin automatically. Add an optional
              collaborator email to invite someone to edit the document with
              you.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/10">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                <FilePlus className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">
                  Fast shared document setup
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Create a document and invite a collaborator in one step.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-zinc-950 dark:shadow-black/10">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Document title
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This title will appear for everyone who joins.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-zinc-950 dark:shadow-black/10">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Collaborator email
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Optional: invite one teammate to edit with you.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
            {!isSignedIn ? (
              <div className="space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Please sign in to create a shared document.
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full rounded-3xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign in to continue
                  </Button>
                </SignInButton>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-900 dark:text-white"
                    htmlFor="title"
                  >
                    Document title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-3xl border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    placeholder="Team meeting notes"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-900 dark:text-white"
                    htmlFor="collaborator"
                  >
                    Collaborator emails
                  </label>
                  <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <UserPlus className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="collaborator"
                      value={emailList}
                      onChange={(event) => setEmailList(event.target.value)}
                      className="w-full bg-transparent px-0 text-sm text-slate-900 dark:text-white"
                      placeholder="team@company.com, friend@example.com"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Separate multiple invite emails with commas.
                  </p>
                </div>

                {errorMessage ? (
                  <p className="rounded-3xl bg-rose-100 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/60 dark:text-rose-200">
                    {errorMessage}
                  </p>
                ) : null}

                {warningMessage ? (
                  <p className="rounded-3xl bg-amber-100 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    {warningMessage}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-3xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Creating…" : "Create shared document"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
