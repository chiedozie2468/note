"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: string;
  title: string;
  updatedAt?: string;
  role?: string;
};

export default function RecentDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/documents/recent")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setDocs(data?.documents ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setDocs([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!docs.length)
    return <p className="text-sm text-slate-500">No recent documents.</p>;

  return (
    <ul className="space-y-3">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/doc/${d.id}`}
              className="text-sm font-medium text-slate-900 hover:underline"
            >
              {d.title}
            </Link>
            {d.role && d.role !== "owner" ? (
              <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Shared
              </span>
            ) : null}
          </div>
          <span className="text-xs text-slate-400">{d.updatedAt ?? "-"}</span>
        </li>
      ))}
    </ul>
  );
}
