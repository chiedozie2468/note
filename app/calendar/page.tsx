import CalendarWidget from "@/components/CalendarWidget";

export default function CalendarPage() {
  return (
    <main className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Team scheduling
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Your working calendar for shared projects
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400">
            Keep your notes, meetings, and deadlines aligned. Add events to any
            date and return anytime to see what’s next.
          </p>
        </div>

        <CalendarWidget />
      </div>
    </main>
  );
}
