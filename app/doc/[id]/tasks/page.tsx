import Link from "next/link";
import CalendarWidget from "@/components/CalendarWidget";
import DocumentSwitcher from "@/components/DocumentSwitcher";
import TaskManager from "@/components/TaskManager";
import { getRoomTasks } from "@/actions/actions";

function formatDueText(dueAt: string | null) {
  if (!dueAt) return "No deadline";
  return new Date(dueAt).toLocaleString();
}

export default async function DocumentTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // guard against invalid or missing id (sometimes the route can receive 'undefined')
  if (!id || id === "undefined") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Invalid document
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              No document ID was provided. Use the document selector or go back
              to the home page.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const result = await getRoomTasks(id);
  const tasks = result.success ? result.tasks ?? [] : [];
  const completedTasks = tasks.filter((task) => task.completed).length;
  const openTasks = tasks.length - completedTasks;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/30 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                Document tasks
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                Tasks for this document
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Manage work for this document, switch to related docs, and keep
                deadlines front and center.
              </p>
            </div>
            <Link
              href={`/doc/${id}`}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Back to editor
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
                  Open tasks
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  {openTasks}
                </p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
                  Completed tasks
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  {completedTasks}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                    Document switcher
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Choose another document or shared workspace to jump to.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  <DocumentSwitcher currentDocumentId={id} />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                Add a task
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Create a task for this document (title required; due date
                optional).
              </p>
              <div className="mt-4">
                <TaskManager roomId={id} />
              </div>
            </div>
          </div>

          <CalendarWidget />
        </div>

        <div className="grid gap-4">
          {result.success && tasks.length > 0 ? (
            tasks.map((task) => (
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
                        {task.assigneeEmail
                          ? `Assigned to ${task.assigneeEmail}`
                          : "No assignee"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-zinc-900">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />
                      {task.completed ? "Completed" : "Open"}
                    </span>
                    <span>{formatDueText(task.dueAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : result.success ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              No tasks have been created for this document yet.
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {result.error ?? "Unable to load document tasks."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
