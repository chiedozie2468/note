import NewDocumentButton from "@/components/NewDocumentButton";
import { ArrowUpRight, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
          <FileText className="h-10 w-10 text-gray-700 dark:text-zinc-300" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
          Welcome to Note Workspace
        </h1>

        <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400">
          Create documents, collaborate with your team, and keep all your ideas
          organized in one place.
        </p>

        <div className="mt-8 flex justify-center">
          <NewDocumentButton size="lg" className="gap-2">
            Create New Document
            <ArrowUpRight className="h-4 w-4" />
          </NewDocumentButton>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Write</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Create notes, reports, and documentation.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Collaborate</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Share documents and work together in real time.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Organize</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Keep your projects and ideas structured.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}