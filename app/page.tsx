import Link from "next/link";
import MyNotes from "@/components/MyNotes";
import NewDocumentButton from "@/components/NewDocumentButton";
import RecentFolders from "@/components/RecentFolders";
import RecentDocuments from "@/components/RecentDocuments";
import {
  FileText,
  LayoutDashboard,
  ListVideo,
  MoreHorizontal,
  FolderPlus,
  Plus,
  Clock,
  Edit3,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  // 1. PUBLIC LANDING / NOT SIGNED IN VIEW
  if (!userId) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] text-[#0f172a] px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Main Public Hero Section */}
          <section className="rounded-[2rem] bg-gradient-to-r from-cyan-500 to-blue-600 p-8 shadow-xl shadow-cyan-500/30">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100">
                  Workspace dashboard
                </p>
                <h1 className="mt-3 text-4xl font-semibold text-white">
                  Your notes, tasks, and shared workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-100/90">
                  Create a new document, manage assigned tasks, and keep your
                  workspace organized from one clean landing page.
                </p>
              </div>

              <NewDocumentButton
                size="lg"
                className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-cyan-700 shadow-lg shadow-cyan-500/20 hover:bg-slate-100 transition-all active:scale-95"
              >
                Create New Document
              </NewDocumentButton>
            </div>
          </section>

          {/* Public Features Quick Nav */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/create"
              className="group rounded-[1.75rem] border border-slate-200 bg-blue-100 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-200 p-3 text-blue-600 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0f172a] uppercase tracking-wider">
                    Create
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0f172a]">
                    Start a new document
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tasks"
              className="group rounded-[1.75rem] border border-slate-200 bg-pink-100 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-pink-200 p-3 text-pink-600 group-hover:scale-105 transition-transform">
                  <ListVideo className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0f172a] uppercase tracking-wider">
                    Tasks
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0f172a]">
                    Go to task board
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile"
              className="group rounded-[1.75rem] border border-slate-200 bg-yellow-100 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-yellow-200 p-3 text-amber-600 group-hover:scale-105 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0f172a] uppercase tracking-wider">
                    Profile
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0f172a]">
                    Manage settings
                  </p>
                </div>
              </div>
            </Link>
          </section>

          {/* Public Data Summary Split Layout */}
          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
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
                  className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
                >
                  New document
                </Link>
              </div>
              <div className="mt-6">
                <RecentDocuments />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Workspace summary
              </h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-zinc-900/60">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Documents
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                    Quick access
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-zinc-900/60">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Tasks
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
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

  // 2. SIGNED-IN HOMEPAGE VIEW
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#0f172a] px-4 py-8 sm:px-8 lg:px-12 space-y-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-10">
        <RecentFolders />

        {/* SECTION: MY NOTES */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                My Notes
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                <button className="border-b-2 border-slate-900 pb-0.5 text-slate-900 dark:border-white dark:text-white">
                  Todays
                </button>
                <button className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                  This Week
                </button>
                <button className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                  This Month
                </button>
              </div>
            </div>

            {/* Note Interface Carousel / Pagination Metrics */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <button className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                ◀
              </button>
              <span className="text-slate-800 text-[11px] font-semibold dark:text-zinc-300">
                December 2021
              </span>
              <button className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                ▶
              </button>
            </div>
          </div>

          {/* Notes Workspace Masonry/Grid Matrix */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "XgLp33CJdDZFjOI0HR0D", title: "New Document", date: new Date("2026-06-20"), snippet: "Start writing your first paragraph...", bg: "bg-blue-100", sharedBy: null },
              { id: "lsXegTnmLwfbEGuSMuz8", title: "New Document", date: new Date("2026-06-20"), snippet: "Outline ideas for chapter one.", bg: "bg-pink-100", sharedBy: null },
              { id: "Ehz4dLKQjDhTHAGoNUfH", title: "New Document", date: new Date("2026-06-20"), snippet: "Meeting notes and action items.", bg: "bg-yellow-100", sharedBy: null },
              { id: "yJoPmdrGvAW1rMvBHtls", title: "Shared Document", date: new Date("2026-06-18"), snippet: "Please review the changes I made.", bg: "bg-blue-100", sharedBy: "Marie" },
              { id: "PqaThnZXCF41IpAKd4CT", title: "Shared Document for testing", date: new Date("2026-06-18"), snippet: "Test notes for QA.", bg: "bg-pink-100", sharedBy: "Sam" },
              { id: "xegczhJBApHAho1HczJU", title: "Chiedozie file for updating", date: new Date("2026-06-17"), snippet: "Update the report with latest figures.", bg: "bg-yellow-100", sharedBy: "Chiedozie" },
            ].map((d) => (
              <Link
                key={d.id}
                href={`/doc/${d.id}`}
                className={`group flex flex-col justify-between rounded-2xl border border-slate-200 ${d.bg} p-5 text-[#0f172a] shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold opacity-80">
                    <span>{d.date.toLocaleDateString()}</span>
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold tracking-tight">{d.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed opacity-90 line-clamp-4">{d.snippet}</p>
                  {d.sharedBy ? (
                    <p className="mt-2 text-[11px] text-[#0f172a]/80">Shared by {d.sharedBy}</p>
                  ) : null}
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                  <Clock className="h-3 w-3" />
                  <span>{d.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}, {d.date.toLocaleDateString(undefined, { weekday: 'long' })}</span>
                </div>
              </Link>
            ))}

            {/* Active Wrapper Container for Custom New Document Form Trigger */}
            <div className="flex items-center justify-center">
              <NewDocumentButton className="w-full h-full block">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 py-12 px-5 text-center transition-all hover:border-slate-300 group">
                  <div className="rounded-xl bg-slate-900 p-2.5 text-white transition-transform group-hover:scale-110">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="mt-3 text-xs font-bold text-[#0f172a]">New Note</span>
                </div>
              </NewDocumentButton>
            </div>
          </div>
        </section>

        {/* SECTION: WORKSPACE RECENT COMPONENT PIPELINE */}
        <section className="pt-6 border-t border-slate-200 dark:border-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Document Stream
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Live document data streams matching your verified workspace
                components.
              </p>
            </div>

            {/* Quick Actions Links mapping */}
            <div className="flex items-center gap-4 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              <Link href="/create" className="hover:underline">
                New document
              </Link>
              <Link href="/tasks" className="hover:underline">
                Open tasks
              </Link>
              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm dark:bg-zinc-900/20 dark:border-zinc-900">
            <RecentDocuments />
          </div>
        </section>
      </div>
    </main>
  );
}
