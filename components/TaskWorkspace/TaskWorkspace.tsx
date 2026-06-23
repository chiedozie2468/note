"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

// --- TYPE DEFINITIONS ---

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Completed";

export interface TeamGroup {
  id: string;
  name: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignees: string[];
  teams: string[];
  subTasks: SubTask[];
  comments: Comment[];
  activityLog: ActivityLog[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
}

// --- INITIAL DATA SEEDING ---

const initialTeams: TeamGroup[] = [
  { id: "team-1", name: "Frontend Team", color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" },
  { id: "team-2", name: "Backend Team", color: "border-purple-500/30 text-purple-400 bg-purple-500/5" },
  { id: "team-3", name: "Design Operations", color: "border-amber-500/30 text-amber-400 bg-amber-500/5" },
];

const initialTasks: TaskItem[] = [
  {
    id: "task-101",
    title: "Enforce dynamic validation matrix on core engine API",
    description: "Build adaptive logic layers to parse client parameters across telemetry middleware. Ensure type contracts stay perfectly uniform during production loads.",
    status: "In Progress",
    priority: "Critical",
    assignees: ["Chiedozie Onyekwelu", "Daniel 70"],
    teams: ["Frontend Team", "Backend Team"],
    subTasks: [
      { id: "sub-1", title: "Map out full security configuration parameters", isCompleted: true },
      { id: "sub-2", title: "Inject middleware logging handlers across routers", isCompleted: false },
      { id: "sub-3", title: "Execute comprehensive mutation suite locally", isCompleted: false },
    ],
    comments: [
      { id: "c-1", author: "Daniel 70", text: "The security configurations are fully aligned. Pushing updates.", timestamp: "2026-06-23T09:12:00.000Z" },
      { id: "c-2", author: "Chiedozie Onyekwelu", text: "Excellent work. Let's aim to have the mutation test suite wrapped up before review.", timestamp: "2026-06-23T10:05:00.000Z" },
    ],
    activityLog: [
      { id: "a-1", timestamp: "2026-06-22T08:00:00.000Z", actor: "System Core", action: "Task instantiated automatically via sprint scheduler." },
      { id: "a-2", timestamp: "2026-06-23T09:00:00.000Z", actor: "Daniel 70", action: "Updated state configuration parameters." },
    ],
    dueDate: "2026-06-26",
    createdAt: "2026-06-22T08:00:00.000Z",
    updatedAt: "2026-06-23T10:05:00.000Z",
    createdBy: "System Initialization",
  },
  {
    id: "task-102",
    title: "Polish real-estate neighborhood data layer engine",
    description: "Refactor spatial indices and electricity reliability matrix aggregates for high-speed map responses.",
    status: "Todo",
    priority: "High",
    assignees: ["Chiedozie Onyekwelu", "Vision-Driven"],
    teams: ["Frontend Team"],
    subTasks: [
      { id: "sub-4", title: "Refactor nested hooks optimized for high-density spatial arrays", isCompleted: true },
    ],
    comments: [],
    activityLog: [{ id: "a-3", timestamp: "2026-06-23T06:00:00.000Z", actor: "Chiedozie Onyekwelu", action: "Created task workspace target." }],
    dueDate: "2026-06-29",
    createdAt: "2026-06-23T06:00:00.000Z",
    updatedAt: "2026-06-23T06:00:00.000Z",
    createdBy: "Chiedozie Onyekwelu",
  },
];

// --- COLOR AND STYLING MAPS ---

const priorityConfig: Record<Priority, { label: string; text: string; bg: string; dot: string }> = {
  Critical: { label: "Critical", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", dot: "bg-rose-400" },
  High: { label: "High Priority", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  Medium: { label: "Medium", text: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", dot: "bg-cyan-400" },
  Low: { label: "Low", text: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" },
};

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string }> = {
  Backlog: { label: "Backlog", bg: "bg-slate-500/5", text: "text-slate-400", border: "border-slate-500/20" },
  Todo: { label: "To Do", bg: "bg-blue-500/5", text: "text-blue-400", border: "border-blue-500/20" },
  "In Progress": { label: "In Progress", bg: "bg-cyan-500/5", text: "text-cyan-400", border: "border-cyan-500/20" },
  "In Review": { label: "In Review", bg: "bg-purple-500/5", text: "text-purple-400", border: "border-purple-500/20" },
  Completed: { label: "Completed", bg: "bg-emerald-500/5", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export default function PremiumWorkspace() {
  // --- STATE SYSTEM ---
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "My Tasks" | "Critical" | "Completed">("All");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTasks[0].id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // --- FORM STATES ---
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("Medium");
  const [formStatus, setFormStatus] = useState<TaskStatus>("Todo");
  const [formDueDate, setFormDueDate] = useState("");
  const [formAssignees, setFormAssignees] = useState<string[]>([]);
  const [formTeams, setFormTeams] = useState<string[]>([]);

  // Temporary item inputs within active views
  const [newCommentText, setNewCommentText] = useState("");
  const [newSubTaskText, setNewSubTaskText] = useState("");

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // --- MUTATION ACTIONS ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      status: formStatus,
      priority: formPriority,
      assignees: formAssignees.length ? formAssignees : ["Chiedozie Onyekwelu"],
      teams: formTeams.length ? formTeams : ["Frontend Team"],
      subTasks: [],
      comments: [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "Chiedozie Onyekwelu",
          action: `Initialized project item in state [${formStatus}].`,
        },
      ],
      dueDate: formDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Chiedozie Onyekwelu",
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setIsCreateOpen(false);

    // Reset Form fields
    setFormTitle("");
    setFormDescription("");
    setFormPriority("Medium");
    setFormStatus("Todo");
    setFormDueDate("");
    setFormAssignees([]);
    setFormTeams([]);
  };

  const handleUpdateStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) => {
        if (t.id !== taskId) return t;
        const completeLog =
          nextStatus === "Completed"
            ? { completedAt: new Date().toISOString() }
            : { completedAt: undefined };
        return {
          ...t,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          ...completeLog,
          activityLog: [
            ...t.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: "Chiedozie Onyekwelu",
              action: `Transitioned task queue routing state to: ${nextStatus}.`,
            },
          ],
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const remaining = tasks.filter((t) => t.id !== taskId);
    setTasks(remaining);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(remaining.length ? remaining[0].id : null);
    }
  };

  const handleAddComment = (taskId: string) => {
    if (!newCommentText.trim()) return;
    setTasks((currentTasks) =>
      currentTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          comments: [
            ...t.comments,
            {
              id: `com-${Date.now()}`,
              author: "Chiedozie Onyekwelu",
              text: newCommentText.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
          activityLog: [
            ...t.activityLog,
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: "Chiedozie Onyekwelu",
              action: "Appended dynamic operational context comment.",
            },
          ],
        };
      })
    );
    setNewCommentText("");
  };

  const handleAddSubTask = (taskId: string) => {
    if (!newSubTaskText.trim()) return;
    setTasks((currentTasks) =>
      currentTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subTasks: [
            ...t.subTasks,
            { id: `sub-${Date.now()}`, title: newSubTaskText.trim(), isCompleted: false },
          ],
        };
      })
    );
    setNewSubTaskText("");
  };

  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subTasks: t.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
          ),
        };
      })
    );
  };

  // --- QUERY AND FILTER OPERATIONS ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignees.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (activeFilter === "My Tasks") return t.assignees.includes("Chiedozie Onyekwelu");
      if (activeFilter === "Critical") return t.priority === "Critical";
      if (activeFilter === "Completed") return t.status === "Completed";
      return true;
    });
  }, [tasks, searchQuery, activeFilter]);

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      critical: tasks.filter((t) => t.priority === "Critical" && t.status !== "Completed").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
    };
  }, [tasks]);

  const toggleFormSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="min-h-screen bg-[#0F1B2D] font-sans antialiased text-slate-200 selection:bg-cyan-500/30 selection:text-white">
      
      {/* GLOBAL TOP CONTROL ARCHITECTURE */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0F1B2D]/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md shadow-cyan-500/10">
              <Layers className="h-4 w-4 text-[#0F1B2D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-white">WeBrandOva Hub</h1>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cyan-400 border border-cyan-500/20">
                  SaaS Core
                </span>
              </div>
              <p className="text-xs text-slate-400">Welcome back, Chiedozie</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search telemetry identifiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-white/10 bg-[#0B1423] py-1.5 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-[#0F1B2D] transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              New Objective
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        
        {/* OPERATIONAL METRIC METADATA GRID */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {[
            { label: "Active Queue", count: metrics.total, description: "Total tracked epics", color: "text-white" },
            { label: "In Production", count: metrics.completed, description: "Completed pipelines", color: "text-emerald-400" },
            { label: "Velocity Load", count: metrics.inProgress, description: "Currently active loops", color: "text-cyan-400" },
            { label: "Critical Halts", count: metrics.critical, description: "Requires action immediately", color: "text-rose-400" },
          ].map((card, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 shadow-sm transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold tracking-tight ${card.color}`}>{card.count}</span>
                <span className="text-[10px] text-slate-500">units</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              <div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-white/[0.01]" />
            </div>
          ))}
        </section>

        {/* WORKSPACE OPERATIONS LAYOUT STRUCTURE */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* QUEUE CONTROLLERS & DATA STREAM (LEFT TO MIDDLE) */}
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            
            {/* COMPONENT FILTERS BLOCK */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-1.5 rounded-xl bg-[#0B1423] p-1 border border-white/5">
                {(["All", "My Tasks", "Critical", "Completed"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setActiveFilter(opt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                      activeFilter === opt
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 shadow-sm border border-cyan-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-400">
                Found <strong className="text-white">{filteredTasks.length}</strong> parameters
              </span>
            </div>

            {/* LIVE DATA INTERFACING CARDS LISTING */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
                  <Sparkles className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="mt-3 text-sm font-medium text-slate-400">No core metrics match execution criteria.</p>
                  <p className="text-xs text-slate-500">Adjust the filtering parameters or instantiate an objective.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const doneSub = task.subTasks.filter((s) => s.isCompleted).length;
                  const totalSub = task.subTasks.length;
                  const percentage = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                        selectedTaskId === task.id
                          ? "border-cyan-500/40 bg-gradient-to-br from-[#12223a] to-[#0A1322] shadow-xl shadow-black/40"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-cyan-500/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text}`}>
                              <span className={`h-1 w-1 rounded-full ${priorityConfig[task.priority].dot}`} />
                              {task.priority}
                            </span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusConfig[task.status].bg} ${statusConfig[task.status].text} ${statusConfig[task.status].border}`}>
                              {task.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold tracking-tight text-white group-hover:text-cyan-400 transition pt-1">
                            {task.title}
                          </h3>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/5 transition"
                          title="Purge Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {task.description}
                      </p>

                      {/* TEAM OR CONTEXT CHIPS */}
                      {task.teams.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {task.teams.map((tName, i) => {
                            const config = initialTeams.find((it) => it.name === tName);
                            return (
                              <span key={i} className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${config?.color || "border-white/5 text-slate-400 bg-white/5"}`}>
                                {tName}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* BOTTOM METADATA BAR */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04] pt-3 text-[11px] font-medium text-slate-400">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-cyan-400" />
                            <span>Due {task.dueDate}</span>
                          </div>
                          {totalSub > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>{doneSub}/{totalSub} Frameworks</span>
                            </div>
                          )}
                          {task.comments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-purple-400" />
                              <span>{task.comments.length} Syncs</span>
                            </div>
                          )}
                        </div>

                        {/* STACKED AVATARS */}
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {task.assignees.map((assignee, idx) => (
                            <div
                              key={idx}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[9px] font-bold text-[#0F1B2D] ring-2 ring-[#0F1B2D]"
                              title={assignee}
                            >
                              {assignee.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RUNTIME PROGRESS LINE MATRIX */}
                      {totalSub > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-white/5 rounded-b-2xl">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GRANULAR DETAIL CONTROLLER SIDE PANEL (RIGHT PANEL) */}
          <div className="lg:col-span-5 xl:col-span-4">
            {activeTask ? (
              <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 shadow-xl shadow-black/10 backdrop-blur-md space-y-6">
                
                {/* HEAD DETAILS TITLE */}
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-slate-500">{activeTask.id}</span>
                    <span className="text-slate-400">Created by {activeTask.createdBy}</span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold tracking-tight text-white">
                    {activeTask.title}
                  </h2>
                </div>

                {/* PIPELINE STATE MUTATOR BAR */}
                <div className="space-y-2 rounded-xl bg-[#0B1423] p-3 border border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-cyan-400" /> Lifecycle Matrix Route
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {(["Todo", "In Progress", "In Review", "Completed"] as TaskStatus[]).map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleUpdateStatus(activeTask.id, statusOption)}
                        className={`rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                          activeTask.status === statusOption
                            ? "bg-cyan-500 text-[#0F1B2D]"
                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DESCRIPTION BLOCKS */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operational Directives</h4>
                  <p className="text-xs leading-relaxed text-slate-300 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    {activeTask.description || "No operational instructions provided."}
                  </p>
                </div>

                {/* SYSTEM SUB-TASK FRAMEWORKS ENGINE */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sub-Task Checkpoints</h4>
                  
                  <div className="space-y-1.5">
                    {activeTask.subTasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubTask(activeTask.id, st.id)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/5 bg-[#0B1423]/50 px-3 py-2 text-xs transition hover:bg-[#0B1423]"
                      >
                        <input
                          type="checkbox"
                          checked={st.isCompleted}
                          readOnly
                          className="h-3.5 w-3.5 rounded border-white/10 bg-[#0B1423] text-cyan-500 focus:ring-0 focus:ring-offset-0 accent-cyan-500"
                        />
                        <span className={`transition ${st.isCompleted ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add system sub-checkpoint..."
                      value={newSubTaskText}
                      onChange={(e) => setNewSubTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubTask(activeTask.id)}
                      className="flex-1 rounded-xl border border-white/10 bg-[#0B1423] px-3 py-1.5 text-xs text-white outline-none transition focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => handleAddSubTask(activeTask.id)}
                      className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* AUDIT SYNCS AND SYSTEM COMMENT COMMUNICATOR */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Context Comments Thread</h4>
                  
                  <div className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
                    {activeTask.comments.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No sync metrics found on thread.</p>
                    ) : (
                      activeTask.comments.map((c) => (
                        <div key={c.id} className="rounded-xl bg-[#0B1423]/60 p-2.5 border border-white/[0.04]">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-cyan-400">
                            <span>{c.author}</span>
                            <span className="text-[9px] text-slate-500">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-300 leading-normal">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type comment matrix..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(activeTask.id)}
                      className="flex-1 rounded-xl border border-white/10 bg-[#0B1423] px-3 py-1.5 text-xs text-white outline-none transition focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => handleAddComment(activeTask.id)}
                      className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-[#0F1B2D] hover:bg-cyan-400"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* LOG DATA SYSTEM HISTORY TIMELINE */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Telemetry Log</h4>
                  <div className="space-y-1.5 font-mono text-[9px] text-slate-500">
                    {activeTask.activityLog.map((log) => (
                      <div key={log.id} className="flex items-start gap-1">
                        <ChevronRight className="h-2.5 w-2.5 mt-0.5 shrink-0 text-slate-600" />
                        <span>
                          <strong className="text-slate-400">{log.actor}</strong>: {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
                Select an active objective queue block to display runtime parameters.
              </div>
            )}
          </div>

        </div>
      </main>

      {/* INSTANTIATE DIALOG MATRIX (MODAL LAYER) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0F1B2D] p-6 shadow-2xl shadow-black/80 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Create Operational Directive</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objective Identifier Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Integrate real-time notification engine hooks"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1423] p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Context Directive Scope</label>
                <textarea
                  placeholder="Detail the target scope, middleware parameters, and architectural definitions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1423] p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lifecycle State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1423] p-2.5 text-xs text-white outline-none focus:border-cyan-400/50"
                  >
                    <option value="Backlog">Backlog Framework</option>
                    <option value="Todo">To Do Queue</option>
                    <option value="In Progress">In Progress Loop</option>
                    <option value="In Review">In Review Matrix</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Severity Metric</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1423] p-2.5 text-xs text-white outline-none focus:border-cyan-400/50"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity</option>
                    <option value="Critical">Critical State</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Line Delivery Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1423] p-2.5 text-xs text-white outline-none focus:border-cyan-400/50"
                />
              </div>

              {/* MULTI-SELECT TEAM CLUSTERING ASSIGNMENTS */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Team Unit Routing Allocation
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Frontend Team", "Backend Team", "Design Operations"].map((t) => {
                    const selected = formTeams.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleFormSelection(t, formTeams, setFormTeams)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition border ${
                          selected
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                            : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MULTI-SELECT ENGINEER ASSIGNMENTS */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Assign Engineers
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Chiedozie Onyekwelu", "Vision-Driven", "Daniel 70", "paradox."].map((member) => {
                    const selected = formAssignees.includes(member);
                    return (
                      <button
                        type="button"
                        key={member}
                        onClick={() => toggleFormSelection(member, formAssignees, setFormAssignees)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition border ${
                          selected
                            ? "border-cyan-400 bg-cyan-400 text-[#0F1B2D]"
                            : "border-white/5 bg-white/[0.02] text-slate-300 hover:text-white"
                        }`}
                      >
                        {member}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-[#0F1B2D] hover:bg-cyan-400 shadow-md shadow-cyan-500/10"
                >
                  Instantiate Directive
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}