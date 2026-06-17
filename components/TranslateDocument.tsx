"use client";

import * as Y from "yjs";
import React, { FormEvent, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BotIcon, LanguagesIcon, AlertTriangle } from "lucide-react";
import Markdown from "react-markdown";

type Language =
  | "english"
  | "spanish"
  | "portuguese"
  | "french"
  | "german"
  | "chinese"
  | "arabic"
  | "hindi"
  | "russian"
  | "japanese"
  | "igbo"
  | "yoruba"
  | "hausa";

const languages: Language[] = [
  "english",
  "spanish",
  "portuguese",
  "french",
  "german",
  "chinese",
  "arabic",
  "hindi",
  "russian",
  "japanese",
  "igbo",
  "yoruba",
  "hausa",
];

function extractText(doc: Y.Doc): string {
  try {
    const ytext = doc.get("document-store");
    if (!ytext) return "";

    if (typeof ytext.toString === "function") {
      const text = ytext.toString();
      if (text?.trim()) return text;
    }

    if (typeof ytext.toJSON === "function") {
      return JSON.stringify(ytext.toJSON());
    }

    return "";
  } catch (err) {
    console.error("extractText error:", err);
    return "";
  }
}

export default function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<Language | "">("");
  const [summary, setSummary] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleTranslate = (e: FormEvent) => {
    e.preventDefault();
    setErrorCode(null);

    if (!language) {
      toast.error("Please select a language");
      return;
    }

    startTransition(async () => {
      try {
        const text = extractText(doc);

        if (!text) {
          toast.error("Document is empty");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentData: text,
              targetLang: language,
            }),
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Backend error:", data);

          const code = data?.code;

          setErrorCode(code);

          // 🔥 CLEAN ERROR HANDLING
          if (code === "QUOTA_EXCEEDED") {
            throw new Error(
              "AI limit reached. Please upgrade your plan to continue."
            );
          }

          if (code === "AUTH_ERROR") {
            throw new Error("AI configuration error. Contact admin.");
          }

          throw new Error(data?.error || "Translation failed");
        }

        if (!data?.translated_text) {
          throw new Error("Invalid response from server");
        }

        setSummary(data.translated_text);
        toast.success("Translation completed!");
      } catch (err: any) {
        console.error("Translate error:", err);
        toast.error(err.message || "Failed to translate document");
      }
    });
  };

  return (
    <div className="p-10">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <LanguagesIcon className="mr-2 h-4 w-4" />
            Translate
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white dark:bg-zinc-900 border max-w-md">
          <DialogHeader>
            <DialogTitle>Translate Document</DialogTitle>

            <DialogDescription>
              AI will summarize + translate your document
            </DialogDescription>

            {/* RESULT */}
            {summary && (
              <div className="mt-4 p-3 rounded bg-zinc-100 dark:bg-zinc-800">
                <div className="flex gap-2 items-center mb-2">
                  <BotIcon className="w-4" />
                  <p>Result</p>
                </div>

                <Markdown>{summary}</Markdown>
              </div>
            )}

            {/* UPGRADE MESSAGE */}
            {errorCode === "QUOTA_EXCEEDED" && (
              <div className="mt-4 p-3 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="font-medium">AI Limit Reached</p>
                </div>

                <p className="text-sm mt-1">
                  You’ve used all your AI quota. Please add a payment method to
                  continue using translation features.
                </p>

                <Button
                  className="mt-3 w-full"
                  onClick={() =>
                    window.open(
                      "https://platform.openai.com/account/billing",
                      "_blank"
                    )
                  }
                >
                  Upgrade Plan
                </Button>
              </div>
            )}

            {/* AUTH ERROR */}
            {errorCode === "AUTH_ERROR" && (
              <div className="mt-4 p-3 rounded bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                <p className="font-medium">Configuration Error</p>
                <p className="text-sm mt-1">
                  API key is invalid or missing. Contact system admin.
                </p>
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleTranslate} className="flex gap-2 mt-4">
            <Select value={language} onValueChange={setLanguage as any}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang} className="capitalize">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={!language || isPending}>
              {isPending ? "Running..." : "Run"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}