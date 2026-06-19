"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskItem {
  id: string;
  title: string;
  dueAt: string | null;
  description: string | null;
  completed: boolean;
  assigneeEmail: string | null;
}

interface TaskManagerProps {
  roomId: string;
}

function formatDueDate(dueAt: string | null) {
  if (!dueAt) return "No deadline";
  const date = new Date(dueAt);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaskManager({ roomId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const loadTasks = async () => {
    const response = await fetch(`/api/room-tasks?roomId=${roomId}`);
    if (!response.ok) {
      setMessage("Unable to load tasks.");
      return;
    }
    const data = await response.json();
    setTasks(data.tasks ?? []);
  };

  useEffect(() => {
    loadTasks();
  }, [roomId]);

  const refresh = () => {
    startTransition(async () => {
      await loadTasks();
    });
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!title.trim()) {
      setMessage("Please add a task title.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/room-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          title: title.trim(),
          dueAt: dueAt || null,
          assigneeEmail,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.error || "Unable to create task.");
        return;
      }

      setTitle("");
      setDueAt("");
      setDescription("");
      setAssigneeEmail("");
      setMessage("Task added and notifications sent.");
      await loadTasks();
    });
  };

  const toggleComplete = async (taskId: string, completed: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/room-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, taskId, completed: !completed }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.error || "Unable to update task.");
        return;
      }
      await loadTasks();
    });
  };

  const handleDelete = async (taskId: string) => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/room-tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, taskId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.error || "Unable to delete task.");
        return;
      }
      await loadTasks();
    });
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            Team tasks
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            To-dos for this shared doc
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Assign tasks, set deadlines, and notify your collaborators by email.
          </p>
        </div>
        <Button
          type="button"
          onClick={refresh}
          className="rounded-3xl bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Refresh tasks
        </Button>
      </div>

      <form
        className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]"
        onSubmit={handleCreate}
      >
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium text-slate-900 dark:text-white">
            Task title
          </label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write a task name"
            className="w-full"
          />

          <label className="block text-sm font-medium text-slate-900 dark:text-white">
            Due date & time
          </label>
          <Input
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            className="w-full"
          />

          <label className="block text-sm font-medium text-slate-900 dark:text-white">
            Assigned person
          </label>
          <Input
            value={assigneeEmail}
            onChange={(event) => setAssigneeEmail(event.target.value)}
            placeholder="team@company.com"
            className="w-full"
          />

          <label className="block text-sm font-medium text-slate-900 dark:text-white">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add an optional description"
            className="w-full resize-none rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            rows={3}
          />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the assignee email. Leave blank if this is a general task.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Add a task for this document
          </p>
          <div className="mt-4 grid gap-3">
            <Button
              type="submit"
              className="w-full rounded-3xl bg-cyan-600 text-white hover:bg-cyan-500"
            >
              {isPending ? "Saving..." : "Create task"}
            </Button>
            {message ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-slate-400">
            No tasks yet. Add a task to keep the team aligned.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className={`text-base font-semibold ${
                      task.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-950 dark:text-white"
                    }`}
                  >
                    {task.title}
                    {task.description ? (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {task.description}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Due {formatDueDate(task.dueAt)}
                    </p>
                  </p>
                  {task.assigneeEmail ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Assigned to {task.assigneeEmail}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleComplete(task.id, task.completed)}
                  >
                    {task.completed ? "Mark open" : "Complete"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
