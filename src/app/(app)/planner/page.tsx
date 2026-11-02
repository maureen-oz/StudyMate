"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CalendarDays, List, Plus, Search, SearchX } from "lucide-react";
import { cn, formatDate, startOfDay } from "@/lib/format";
import type { StudySession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FilterSelect } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { DataGate } from "@/components/app/data-gate";
import { SessionDialog, SubjectDialog } from "@/components/app/forms";
import { SessionItem, isOverdue } from "@/components/app/session-item";
import { useStudyData } from "@/components/app/study-data";
import { WeekCalendar } from "./week-calendar";

export default function PlannerPage() {
  return (
    <DataGate skeleton="list">
      <Planner />
    </DataGate>
  );
}

type StatusFilter = "all" | "pending" | "completed" | "overdue";

function Planner() {
  const { sessions, subjects, deleteSession } = useStudyData();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState<"list" | "week">("list");
  const [editing, setEditing] = useState<StudySession | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [deleting, setDeleting] = useState<StudySession | undefined>();
  const [deleteBusy, setDeleteBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (q && !`${s.title} ${s.description ?? ""}`.toLowerCase().includes(q)) return false;
      if (subject !== "all" && (subject === "none" ? s.subject_id !== null : s.subject_id !== subject)) return false;
      if (priority !== "all" && s.priority !== priority) return false;
      if (status === "overdue") return isOverdue(s);
      if (status !== "all" && s.status !== status) return false;
      return true;
    });
  }, [sessions, query, subject, status, priority]);

  const groups = useMemo(() => {
    const map = new Map<string, StudySession[]>();
    for (const s of filtered) {
      const key = startOfDay(new Date(s.starts_at)).toISOString();
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [filtered]);

  const filtersActive = query || subject !== "all" || status !== "all" || priority !== "all";
  const pendingCount = sessions.filter((s) => s.status === "pending").length;

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteSession(deleting.id);
      toast.success(`“${deleting.title}” deleted.`);
      setDeleting(undefined);
    } catch {
      toast.error("We couldn't delete that session. Try again.");
    } finally {
      setDeleteBusy(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setSubject("all");
    setStatus("all");
    setPriority("all");
  }

  return (
    <>
      <PageHeader
        title="Study Planner"
        description={`${sessions.length} session${sessions.length === 1 ? "" : "s"} · ${pendingCount} pending`}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Add session
          </Button>
        }
      />

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="Plan your first study session"
            description="Pick a subject, a time and how long you'll study. StudyMate keeps track of what's done and what's next."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Add session
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <label htmlFor="session-search" className="sr-only">
                Search sessions
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="session-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sessions"
                className="h-10 w-full rounded-lg bg-white pl-9 pr-3 text-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 lg:flex">
              <FilterSelect label="Filter by subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="lg:w-44">
                <option value="all">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="none">No subject</option>
              </FilterSelect>
              <FilterSelect label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="lg:w-36">
                <option value="all">Any status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </FilterSelect>
              <FilterSelect label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="lg:w-36">
                <option value="all">Any priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </FilterSelect>
            </div>
            <div role="group" aria-label="View" className="inline-flex self-start rounded-lg bg-slate-100 p-1 lg:self-auto">
              {(
                [
                  ["list", "List", List],
                  ["week", "Week", CalendarDays],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-600",
                    view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {view === "week" ? (
            <WeekCalendar sessions={filtered} onSelect={(s) => { setEditing(s); setFormOpen(true); }} />
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No sessions match"
                description="Try a different search or clear your filters to see every session."
                action={
                  filtersActive ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-5">
              {groups.map(([day, list]) => (
                <section key={day} aria-labelledby={`day-${day}`}>
                  <h2 id={`day-${day}`} className="mb-2 px-1 text-sm font-semibold text-slate-700">
                    {formatDate(day, { weekday: "long", day: "numeric", month: "long" })}
                  </h2>
                  <Card>
                    <ul className="divide-y divide-slate-100 px-1 py-1">
                      {list.map((s) => (
                        <SessionItem
                          key={s.id}
                          session={s}
                          onEdit={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                          onDelete={() => setDeleting(s)}
                        />
                      ))}
                    </ul>
                  </Card>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <SessionDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        session={editing}
        onNeedSubject={() => {
          setFormOpen(false);
          setSubjectOpen(true);
        }}
      />
      <SubjectDialog open={subjectOpen} onClose={() => setSubjectOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
        title="Delete study session?"
        confirmLabel="Delete session"
        body={
          <>
            <span className="font-medium text-slate-900">“{deleting?.title}”</span> will be removed from your planner and
            your study hours. This can&apos;t be undone.
          </>
        }
      />
    </>
  );
}
