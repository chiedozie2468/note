"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ListVideo, User, Users, PlusCircle } from "lucide-react";

const geist = Inter({
  subsets: ["latin"],
});

type Doc = {
  id: string;
  title?: string;
  updatedAt?: unknown;
  createdAt?: unknown;
  role?: string;
};

type TabKey = "today" | "week" | "month";

const tabs: { key: TabKey; label: string }[] = [
  { key: "today", label: "Todays" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

function parseDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const asAny = raw as any;
  if (asAny.seconds != null) {
    const seconds = Number(asAny.seconds);
    const nanos = Number(asAny.nanos ?? asAny.nanoseconds ?? 0);
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6));
  }
  if (asAny._seconds != null) {
    const seconds = Number(asAny._seconds);
    const nanos = Number(asAny._nanoseconds ?? 0);
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6));
  }

  return null;
}

function isInRange(date: Date, tab: TabKey) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (tab === "today") {
    return date >= startOfToday;
  }

  if (tab === "week") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return date >= sevenDaysAgo;
  }

  if (tab === "month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  return false;
}

function formatDate(raw: Date | null) {
  if (!raw) return "No date";
  return raw.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecentFolders() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/documents/recent", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (!data?.success) {
          setError(data?.error ?? "Unable to load documents.");
          setDocs([]);
        }
        else {
          setDocs(data.documents ?? []);
          setError(null);
        }
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

  const visibleDocs = useMemo(() => {
    return docs
      .map((doc) => ({
        ...doc,
        date: parseDate(doc.updatedAt ?? doc.createdAt),
      }))
      .filter((doc) => doc.date !== null)
      .filter((doc) => isInRange(doc.date!, activeTab));
  }, [activeTab, docs]);

  const sortedDocs = useMemo(
    () =>
      [...visibleDocs].sort((a, b) => b.date!.getTime() - a.date!.getTime()),
    [visibleDocs],
  );

  const actionTiles = [
    {
      href: "/tasks",
      title: "Tasks",
      desc: "View and manage tasks",
      bg: "bg-pink-100",
      icon: <ListVideo className="h-5 w-5 text-pink-600" />,
    },
    {
      href: "/profile",
      title: "Manage account",
      desc: "Manage profile and account",
      bg: "bg-yellow-100",
      icon: <User className="h-5 w-5 text-amber-600" />,
    },
    {
      href: "/create?team=true",
      title: "Create with team",
      desc: "Create a document for a team",
      bg: "bg-blue-100",
      icon: <Users className="h-5 w-5 text-blue-600" />,
    },
    {
      href: "/create",
      title: "Create new",
      desc: "Create a new document",
      bg: "bg-blue-100",
      icon: <PlusCircle className="h-5 w-5 text-blue-600" />,
    },
  ];

  return (
    <div
      className={`${geist.className} space-y-4 dark:border-zinc-800 dark:bg-zinc-900/30`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white text-font-sans">
            Recent Folders
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500 dark:bg-zinc-950/40 dark:text-slate-400">
          Loading recent documents...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      ) : sortedDocs.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500 dark:bg-zinc-950/40 dark:text-slate-400">
          No recent documents found for this time frame.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actionTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`group rounded-2xl border border-slate-200 ${tile.bg} p-5 transition hover:border-slate-300 hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl p-2">{tile.icon}</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0f172a]">
                  Action
                </div>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-[#0f172a]">
                {tile.title}
              </h3>
              <p className="mt-2 text-xs text-[#0f172a]/80">{tile.desc}</p>
            </Link>
          ))}

          {sortedDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/doc/${doc.id}`}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-200 p-2 text-slate-700">
                  📄
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0f172a]">
                  {formatDate(doc.date)}
                </span>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-[#0f172a]">
                {doc.title ?? "Untitled document"}
              </h3>
              {doc.role && doc.role !== "owner" ? (
                <span className="mt-3 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  Shared
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
