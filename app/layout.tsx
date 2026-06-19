import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Notes",
  description: "Personal workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />

            <div className="flex min-h-screen">
              <Sidebar />

              <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-zinc-950 p-4">
                {children}
              </main>
            </div>

            <Toaster position="top-center" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
