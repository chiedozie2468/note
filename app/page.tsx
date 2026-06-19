import Link from "next/link";
import NewDocumentButton from "@/components/NewDocumentButton";
import RecentDocuments from "@/components/RecentDocuments";
import { FileText, LayoutDashboard, ListVideo } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  // If not signed in, show the public landing/home page
  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/30 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                  Workspace dashboard
                </p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
                  Your notes, tasks, and shared workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Create a new document, manage assigned tasks, and keep your
                  workspace organized from one clean landing page.
                </p>
              </div>

              <NewDocumentButton
                size="lg"
                className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500"
              >
                Create New Document
              </NewDocumentButton>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Link
              href="/create"
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-6 w-6 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Start a new document
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tasks"
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3">
                <ListVideo className="h-6 w-6 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tasks
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Go to task board
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile"
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Profile
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Manage settings
                  </p>
                </div>
              </div>
            </Link>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent documents
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Quick access to your latest notes.
                  </p>
                </div>
                <Link
                  href="/create"
                  className="text-sm font-semibold text-cyan-600 hover:text-cyan-500"
                >
                  New document
                </Link>
              </div>
              <div className="mt-6">
                <RecentDocuments />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Workspace summary
              </h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Documents
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    Quick access
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tasks
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    Manage from Tasks page
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Signed-in users: show activities / personal dashboard (Recent docs + quick links)
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your activity
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Recent updates from your documents and tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/tasks"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                View Tasks
              </Link>
              <NewDocumentButton />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent documents
            </h2>
            <div className="mt-4">
              <RecentDocuments />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/create" className="text-sm text-cyan-600">
                New document
              </Link>
              <Link href="/tasks" className="text-sm text-cyan-600">
                Open tasks
              </Link>
              <Link href="/profile" className="text-sm text-cyan-600">
                Profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
