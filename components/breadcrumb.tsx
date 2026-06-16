'use client'

import { usePathname } from "next/navigation";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

// Sub-component that fetches and renders the document title
function DocTitle({ id }: { id: string }) {
  const [snapshot] = useDocument(doc(db, "documents", id));
  const title = snapshot?.data()?.title as string | undefined;
  return <>{title ?? id}</>;
}

function Breadcrumb() {
  const pathname = usePathname();
  // e.g. /doc/xegczhJBApHAho1HczJU  →  ["", "doc", "xegczhJBApHAho1HczJU"]
  const segments = pathname.split("/").filter(Boolean); // ["doc", "xegczhJBApHAho1HczJU"]

  // Detect if we are on a document page and grab the id
  const isDocPage = segments[0] === "doc" && segments.length >= 2;
  const docId = isDocPage ? segments[1] : null;

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="dark:text-zinc-400 dark:hover:text-zinc-100">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* If we are on a doc page just show the title as the active page */}
        {isDocPage && docId && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="dark:text-zinc-100 max-w-[200px] truncate">
                <DocTitle id={docId} />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {/* For any other non-doc routes render segments normally */}
        {!isDocPage &&
          segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;

            return (
              <div key={href} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="dark:text-zinc-100">{segment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} className="dark:text-zinc-400 dark:hover:text-zinc-100">
                      {segment}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}

export default Breadcrumb;