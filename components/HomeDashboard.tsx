"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard, Plus } from "lucide-react";

interface DocItem {
  id: string;
  title?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  role?: string;
}

function parseDate(raw: unknown) {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const anyRaw = raw as any;
  if (anyRaw.seconds != null) {
    const seconds = Number(anyRaw.seconds);
    const nanos = Number(anyRaw.nanos ?? anyRaw.nanoseconds ?? 0);
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6));
  }

  if (anyRaw._seconds != null) {
    const seconds = Number(anyRaw._seconds);
    const nanos = Number(anyRaw._nanoseconds ?? 0);
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6));
  }

  return null;
}

function formatDate(raw: Date | null) {
  if (!raw) return "--";
  return raw.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "long",
  });
}

function formatTime(raw: Date | null) {
  if (!raw) return "--";
  return raw.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HomeDashboard() {
  const { user } = useUser();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    fetch("/api/documents/recent", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (!data?.success) {
          setError(data?.error ?? "Unable to load documents.");
          setDocs([]);
          return;
        }
        setDocs(data.documents ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setDocs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recentFiles = useMemo(
    () =>
      docs
        .map((doc) => ({
          ...doc,
          updatedAt: parseDate(doc.updatedAt ?? doc.createdAt),
        }))
        .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
        .slice(0, 6),
    [docs],
  );

  const palette = [
    "from-sky-100 via-sky-50 to-white",
    "from-rose-100 via-rose-50 to-white",
    "from-amber-100 via-amber-50 to-white",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-500">
                Note Workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Welcome, {user?.firstName ?? "Creator"}
              </h1>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/tasks"
              className="group rounded-[1.75rem] border border-slate-200 bg-slate-100 p-5 transition hover:border-slate-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
                  Shortcut
                </span>
              </div>
              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Task Matrix
                </p>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Open the central view for managing workflow and tasks.
                </p>
              </div>
            </Link>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-100 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Good Morning, {user?.firstName ?? "Chiedozie"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Your workspace is synced and ready.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  • Synced
                </span>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-100 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Link
                href="/create"
                className="inline-flex items-center justify-between rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
              >
                Create Document
              </Link>
              <Link
                href="/create?team=true"
                className="inline-flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
              >
                Create with Team
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                My Notes
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Your documents shelf
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              Review your most recent notes in a polished, pastel card layout.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-[2rem] bg-slate-100 p-6 shadow-sm ring-1 ring-slate-200/80 animate-pulse dark:bg-zinc-900 dark:ring-zinc-700"
                  />
                ))
              : recentFiles.map((doc, index) => {
                  const cardStyle = palette[index % palette.length];
                  return (
                    <Link
                      key={doc.id}
                      href={`/doc/${doc.id}`}
                      className={`group rounded-[2rem] border border-slate-200 bg-linear-to-br ${cardStyle} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800`}
                    >
                      <div className="space-y-5">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">
                            Document
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                            {doc.title ?? "Untitled note"}
                          </h3>
                        </div>

                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                          <li className="rounded-3xl bg-white/80 px-4 py-3 shadow-sm shadow-slate-200/50 dark:bg-zinc-950 dark:text-slate-100">
                            {doc.updatedAt ? `Updated ${formatDate(doc.updatedAt)}` : "New draft"}
                          </li>
                          <li className="rounded-3xl bg-white/80 px-4 py-3 shadow-sm shadow-slate-200/50 dark:bg-zinc-950 dark:text-slate-100">
                            {doc.role === "owner" ? "Owner access" : "Shared note"}
                          </li>
                        </ul>

                        <div className="mt-4 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-100">
                          {doc.updatedAt ? `${formatTime(doc.updatedAt)}, ${formatDate(doc.updatedAt)}` : "No date"}
                        </div>
                      </div>
                    </Link>
                  );
                })}

            <Link
              href="/create"
              className="flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-6 text-center text-slate-900 transition hover:border-slate-400 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 text-slate-900 dark:border-zinc-700 dark:text-white">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold">New Note</p>
              <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Start a fresh note with a single click.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
