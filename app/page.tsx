import Link from "next/link";
import HomeDashboard from "@/components/HomeDashboard";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-cyan-500/10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Note Workspace
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome to a cleaner note experience
          </h1>
          <p className="mt-4 max-w-2xl text-center text-sm leading-7 text-slate-300">
            Sign in to access your documents, collaborate with your team, and
            manage tasks in a minimalist dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <HomeDashboard />;
}
