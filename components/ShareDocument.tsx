"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Share2, MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareDocumentProps {
  title?: string;
  children?: React.ReactNode;
  compact?: boolean; // when true, always render three-dots dropdown
}

export default function ShareDocument({
  title,
  children,
  compact = false,
}: ShareDocumentProps) {
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

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleEmailShare = () => {
    if (!documentUrl) return;

    const subject = `Join my shared note: ${title ?? "Shared Document"}`;

    const body = `Hi there!

Open this shared document:
${documentUrl}

See you there!`;

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
    <>
      {compact ? (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-xl">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleEmailShare}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleWhatsAppShare}>
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>

              {children}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied" : "Copy Link"}
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

          {/* Mobile */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="rounded-xl">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleEmailShare}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleWhatsAppShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  WhatsApp
                </DropdownMenuItem>

                {children}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </>
  );
}
