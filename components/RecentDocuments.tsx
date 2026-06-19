"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: string;
  title: string;
  updatedAt?: string;
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
        <li key={d.id} className="flex items-center justify-between">
          <Link
            href={`/doc/${d.id}`}
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            {d.title}
          </Link>
          <span className="text-xs text-slate-400">{d.updatedAt ?? "-"}</span>
        </li>
      ))}
    </ul>
  );
}
