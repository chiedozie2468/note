"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DocumentRecord = {
  id: string;
  title: string;
};

export default function DocumentSwitcher({
  currentDocumentId,
}: {
  currentDocumentId?: string;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selected, setSelected] = useState(currentDocumentId ?? "");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    fetch("/api/documents/recent")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setDocuments(data?.documents ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setDocuments([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSelected(currentDocumentId ?? "");
  }, [currentDocumentId]);

  return (
    <div className="grid gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-zinc-500">
        Document selector
      </label>
      <Select
        value={selected}
        onValueChange={(value) => {
          if (!value || value === "__no_docs") return;
          setSelected(value);
          router.push(`/doc/${value}/tasks`);
        }}
      >
        <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700">
          <SelectValue
            placeholder={loading ? "Loading documents..." : "Choose a document"}
          />
        </SelectTrigger>
        <SelectContent className="w-full bg-white dark:bg-zinc-950">
          {documents.length === 0 ? (
            <SelectItem
              value="__no_docs"
              disabled
              className="text-sm text-slate-500 dark:text-zinc-400"
            >
              No documents found
            </SelectItem>
          ) : (
            documents.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                {doc.title ?? "Untitled document"}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
