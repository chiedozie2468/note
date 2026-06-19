"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function monthName(date: Date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(
    formatDateKey(new Date()),
  );
  const [eventTitle, setEventTitle] = useState("");
  const [events, setEvents] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("note-calendar-events");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        setEvents({});
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("note-calendar-events", JSON.stringify(events));
  }, [events]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({
        date: new Date(year, month, i - firstDay + 1),
        inMonth: false,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      cells.push({ date: new Date(year, month, day), inMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const extraDay = new Date(
        year,
        month,
        totalDays + (cells.length % 7) + 1,
      );
      cells.push({ date: extraDay, inMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const selectedEvents = events[selectedDay] ?? [];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = eventTitle.trim();
    if (!trimmed) return;
    setEvents((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] ?? []), trimmed],
    }));
    setEventTitle("");
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            Calendar
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            Plan meetings, deadlines, and notes.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Select a date, add an event, and keep your schedule in sync across
            the workspace.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() =>
              setCurrentMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-slate-900 dark:text-white">
            {monthName(currentMonth)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() =>
              setCurrentMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
            {dayNames.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
            {days.map(({ date, inMonth }) => {
              const key = formatDateKey(date);
              const isSelected = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={`rounded-2xl p-2 text-left transition ${
                    inMonth
                      ? "bg-white hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                      : "bg-transparent text-slate-400 dark:text-zinc-600"
                  } ${
                    isSelected
                      ? "border border-cyan-500 bg-cyan-500/10 dark:border-cyan-400 dark:bg-cyan-400/10"
                      : ""
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {date.getDate()}
                  </span>
                  {events[key]?.length ? (
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/10">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Events for {selectedDay}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add notes for the selected day.
            </p>
          </div>

          <div className="space-y-3">
            {selectedEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-zinc-700 dark:text-slate-400">
                No events yet for this day.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event, index) => (
                  <div
                    key={`${event}-${index}`}
                    className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-200"
                  >
                    {event}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddEvent} className="grid gap-3">
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
              <Input
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                placeholder="Add an event"
                className="w-full bg-transparent px-0 text-sm text-slate-900 dark:text-white"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-cyan-600 text-white hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
