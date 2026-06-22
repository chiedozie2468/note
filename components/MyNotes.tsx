"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function formatDate(date: Date | null) {
  if (!date) return "No date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date | null) {
  if (!date) return "--";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatWeekday(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

export default function MyNotes() {
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
          return;
        }
        setDocs(data.documents ?? []);
        setError(null);
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

  const filteredDocs = useMemo(() => {
    return docs
      .map((doc) => ({
        ...doc,
        date: parseDate(doc.updatedAt ?? doc.createdAt),
      }))
      .filter((doc) => doc.date !== null)
      .filter((doc) => isInRange(doc.date!, activeTab))
      .sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }, [activeTab, docs]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-zinc-400">
            <span>My Notes</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document activity
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
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

      <div className="flex items-center justify-between rounded-3xl bg-white/80 p-4 text-sm text-slate-500 shadow-sm dark:bg-zinc-900/70 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            disabled
          >
            ◀
          </button>
          <span className="font-semibold text-slate-900 dark:text-white">
            {new Date().toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            disabled
          >
            ▶
          </button>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
          Actual document data
        </span>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-center text-slate-500 shadow-sm dark:bg-zinc-950/40 dark:text-slate-400">
          Loading your notes...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-rose-50 p-6 text-center text-rose-700 shadow-sm dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      ) : filteredDocs.length === 0 ? (
        // Render provided sample documents when there are no real docs
        <>
          <style jsx>{`
            .hide-scroll::-webkit-scrollbar{ display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          <div className="overflow-x-auto hide-scroll -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="flex gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "XgLp33CJdDZFjOI0HR0D", title: "New Document", date: new Date("2026-06-20"), bg: "bg-blue-100", sharedBy: null },
                { id: "lsXegTnmLwfbEGuSMuz8", title: "New Document", date: new Date("2026-06-20"), bg: "bg-pink-100", sharedBy: null },
                { id: "Ehz4dLKQjDhTHAGoNUfH", title: "New Document", date: new Date("2026-06-20"), bg: "bg-yellow-100", sharedBy: null },
                { id: "yJoPmdrGvAW1rMvBHtls", title: "Shared Document", date: new Date("2026-06-18"), bg: "bg-blue-100", sharedBy: "Marie" },
                { id: "PqaThnZXCF41IpAKd4CT", title: "Shared Document for testing", date: new Date("2026-06-18"), bg: "bg-pink-100", sharedBy: "Sam" },
                { id: "xegczhJBApHAho1HczJU", title: "Chiedozie file for updating", date: new Date("2026-06-17"), bg: "bg-yellow-100", sharedBy: "Chiedozie" },
              ].map((d) => (
                <a
                  key={d.id}
                  href={`http://localhost:3000/doc/${d.id}`}
                  className={`${d.bg} min-w-[260px] sm:min-w-0 group flex flex-col justify-between rounded-[2rem] border border-slate-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f172a]">
                      {d.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">{d.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#0f172a] line-clamp-4">
                      {d.sharedBy ? `Shared by ${d.sharedBy}` : "Open your document to continue editing."}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f172a]">
                    <span>{d.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                    <span>{d.date.toLocaleDateString(undefined, { weekday: "long" })}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredDocs.slice(0, 3).map((doc) => (
            <Link
              key={doc.id}
              href={`/doc/${doc.id}`}
              className="group flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-zinc-500">
                  {formatDate(doc.date)}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {doc.title ?? "Untitled document"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-4">
                  {doc.title
                    ? `Open your document to continue editing.`
                    : "Open this document to see its contents."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                <span>{formatTime(doc.date)}</span>
                <span>{formatWeekday(doc.date)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
