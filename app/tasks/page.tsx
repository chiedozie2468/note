import Link from "next/link";
import CalendarWidget from "@/components/CalendarWidget";
import DocumentSwitcher from "@/components/DocumentSwitcher";
import { getUserTasks } from "@/actions/actions";

function formatDueText(dueAt: string | null) {
  if (!dueAt) return "No deadline";
  return new Date(dueAt).toLocaleString();
}

export default async function TasksPage() {
  const result = await getUserTasks();
  const tasks = result.success ? result.tasks ?? [] : [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const openTasks = totalTasks - completedTasks;
  const upcomingTasks = tasks.filter(
    (task) =>
      task.dueAt &&
      !task.completed &&
      new Date(task.dueAt) <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/30 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                Task center
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                Everything you need to manage work across documents
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Use the document selector to switch workspaces, review task
                status, and keep your calendar in sync.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[auto_auto]">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
                  Total tasks
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  {totalTasks}
                </p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
                  Open items
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  {openTasks}
                </p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
                  Completed
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  {completedTasks}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                    Document tools
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Pick a document or shared workspace to focus your tasks.
                  </p>
                </div>
                <div className="max-w-md">
                  <DocumentSwitcher />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Upcoming due
                </span>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                  {upcomingTasks} tasks in 72 hours
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Avoid missing deadlines
                  </p>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Use the calendar to plan and keep task deadlines visible
                    across the workspace.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    No due date tasks
                  </p>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Tasks without due dates appear as flexible work and will not
                    block your schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CalendarWidget />
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                  Tasks overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  Latest work across your documents
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                {result.success
                  ? `${totalTasks} total tasks`
                  : "Unable to load tasks"}
              </div>
            </div>
          </div>

          {result.success && tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-400">
              No tasks found yet. Create a shared document and assign your first
              task.
            </div>
          ) : result.success ? (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        aria-label={`Mark ${task.title} completed`}
                        checked={task.completed}
                        readOnly
                        className="mt-1 h-5 w-5 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            task.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-950 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {task.roomTitle ?? "Shared document"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-zinc-900">
                        <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />
                        {task.completed ? "Completed" : "Open"}
                      </span>
                      <span className="text-sm">
                        {task.dueAt ? formatDueText(task.dueAt) : "No due date"}
                      </span>
                      {task.assigneeEmail ? (
                        <span>{task.assigneeEmail}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {result.error ?? "Unable to load tasks."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
