"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Share2 } from "lucide-react";

interface ShareDocumentProps {
  title?: string;
}

export default function ShareDocument({ title }: ShareDocumentProps) {
  const [copied, setCopied] = useState(false);

  const documentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const shareText = useMemo(
    () =>
      `Join me on this note: "${title ?? "Shared Document"}"\n${documentUrl}`,
    [documentUrl, title],
  );

  const handleCopyLink = async () => {
    if (!documentUrl) return;
    await navigator.clipboard.writeText(documentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    if (!documentUrl) return;
    const subject = `Join my shared note: ${title ?? "Shared Document"}`;
    const body = `Hi there!\n\nOpen this shared document:\n${documentUrl}\n\nSee you there!`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body,
      )}`,
      "_blank",
    );
  };

  const handleWhatsAppShare = () => {
    if (!documentUrl) return;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
      >
        <Copy className="mr-2 h-4 w-4" />
        {copied ? "Copied" : "Copy link"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleEmailShare}
      >
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  );
}
