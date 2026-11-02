"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CalendarPlus, Check, CheckCircle2, Clock, FolderKanban, NotebookPen, Plus } from "lucide-react";
import { cn, firstName, formatHours, greeting, startOfWeek, timeAgo } from "@/lib/format";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, SubjectTag } from "@/components/ui/misc";
import { DataGate } from "@/components/app/data-gate";
import { NoteDialog, SessionDialog, SubjectDialog } from "@/components/app/forms";
import { SessionItem } from "@/components/app/session-item";
import { useStudyData } from "@/components/app/study-data";

export default function DashboardPage() {
  return (
    <DataGate>
      <Dashboard />
    </DataGate>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dashboard() {
  const { profile, subjects, sessions, notes, subjectById } = useStudyData();
  const [dialog, setDialog] = useState<"session" | "subject" | "note" | null>(null);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "completed");
    const weekStart = startOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const perDay = Array<number>(7).fill(0);
    let weekMinutes = 0;
    for (const s of completed) {
      const d = new Date(s.starts_at);
      if (d >= weekStart && d < weekEnd) {
        perDay[(d.getDay() + 6) % 7] += s.duration_minutes;
        weekMinutes += s.duration_minutes;
      }
    }
    const upcoming = sessions
      .filter((s) => s.status === "pending" && new Date(s.starts_at).getTime() + s.duration_minutes * 60_000 >= Date.now())
      .slice(0, 5);

    return {
      total: sessions.length,
      completed: completed.length,
      totalMinutes: completed.reduce((sum, s) => sum + s.duration_minutes, 0),
      weekMinutes,
      perDay,
      upcoming,
    };
  }, [sessions]);

  const goalMinutes = (profile?.weekly_goal_hours ?? 10) * 60;
  const goalPct = Math.min(100, Math.round((stats.weekMinutes / goalMinutes) * 100));
  const isNew = subjects.length === 0 || sessions.length === 0 || notes.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greeting()}, {firstName(profile?.full_name)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {stats.upcoming.length
              ? `You have ${stats.upcoming.length} upcoming study session${stats.upcoming.length === 1 ? "" : "s"}. Keep the momentum going.`
              : "Here's where your studies stand today."}
          </p>
        </div>
        <Button size="lg" onClick={() => setDialog("session")}>
          <CalendarPlus className="size-5" aria-hidden="true" />
          Schedule study session
        </Button>
      </div>

      {isNew && <GettingStarted onSubject={() => setDialog("subject")} onSession={() => setDialog("session")} onNote={() => setDialog("note")} />}

      {/* Summary cards */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Study sessions" value={stats.total} tone="brand" />
        <StatCard
          icon={CheckCircle2}
          label="Completed sessions"
          value={stats.completed}
          tone="emerald"
          sub={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}% completion` : undefined}
        />
        <StatCard icon={NotebookPen} label="Notes" value={notes.length} tone="violet" />
        <StatCard icon={Clock} label="Study hours" value={formatHours(stats.totalMinutes)} tone="amber" sub={`${formatHours(stats.weekMinutes)} h this week`} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming sessions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming study sessions"
            action={
              <Link href="/planner" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                View planner <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          {stats.upcoming.length ? (
            <ul className="px-2 py-3">
              {stats.upcoming.map((s) => (
                <SessionItem key={s.id} session={s} compact />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled yet"
              description="Plan your next study block so it's ready when you are."
              action={
                <Button variant="secondary" onClick={() => setDialog("session")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Schedule a session
                </Button>
              }
            />
          )}
        </Card>

        {/* Weekly activity */}
        <Card>
          <CardHeader title="This week's activity" description="Hours from completed sessions" />
          <div className="px-5 pb-5 pt-4">
            <WeeklyChart perDay={stats.perDay} />
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-800">Weekly goal</span>
                <span className="text-slate-600">
                  {formatHours(stats.weekMinutes)} / {profile?.weekly_goal_hours ?? 10} h
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Weekly study goal"
                aria-valuenow={goalPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${goalPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {goalPct >= 100 ? "Goal reached. Great consistency this week!" : `${goalPct}% of your goal. Change it in Settings.`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent notes */}
      <Card className="mt-6">
        <CardHeader
          title="Recent notes"
          action={
            <Link href="/notes" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              All notes <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        {notes.length ? (
          <ul className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {notes.slice(0, 4).map((n) => {
              const subject = subjectById(n.subject_id);
              return (
                <li key={n.id}>
                  <Link
                    href={`/notes?open=${n.id}`}
                    className="flex h-full flex-col rounded-xl p-4 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <SubjectTag name={subject?.name} color={subject?.color} />
                    <span className="mt-3 line-clamp-1 font-medium text-slate-900">{n.title}</span>
                    <span className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{n.content || "No content yet."}</span>
                    <span className="mt-3 text-xs text-slate-400">Updated {timeAgo(n.updated_at)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={NotebookPen}
            title="No notes yet"
            description="Capture lecture notes, definitions and questions, all organised by subject."
            action={
              <Button variant="secondary" onClick={() => setDialog("note")}>
                <Plus className="size-4" aria-hidden="true" />
                Create a note
              </Button>
            }
          />
        )}
      </Card>

      <SessionDialog open={dialog === "session"} onClose={() => setDialog(null)} onNeedSubject={() => setDialog("subject")} />
      <SubjectDialog open={dialog === "subject"} onClose={() => setDialog(null)} />
      <NoteDialog open={dialog === "note"} onClose={() => setDialog(null)} />
    </>
  );
}

const tones = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  tone: keyof typeof tones;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <span className={cn("flex size-9 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
}

function WeeklyChart({ perDay }: { perDay: number[] }) {
  const max = Math.max(60, ...perDay);
  const today = (new Date().getDay() + 6) % 7;
  return (
    <figure>
      <div className="flex h-40 items-end gap-2" aria-hidden="true">
        {perDay.map((m, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            {m > 0 && <span className="text-[11px] font-medium tabular-nums text-slate-600">{formatHours(m)}</span>}
            <div
              className={cn("w-full max-w-9 rounded-md", m ? (i === today ? "bg-brand-600" : "bg-brand-400") : "bg-slate-100")}
              style={{ height: m ? `${Math.max(6, (m / max) * 100)}%` : "6px" }}
            />
            <span className={cn("text-xs", i === today ? "font-semibold text-slate-900" : "text-slate-500")}>{DAY_LABELS[i][0]}</span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">
        Study hours this week:{" "}
        {perDay.map((m, i) => `${DAY_LABELS[i]} ${formatHours(m)} hours`).join(", ")}.
      </figcaption>
    </figure>
  );
}

function GettingStarted({ onSubject, onSession, onNote }: { onSubject: () => void; onSession: () => void; onNote: () => void }) {
  const { subjects, sessions, notes } = useStudyData();
  const steps = [
    { done: subjects.length > 0, title: "Add your first subject", text: "e.g. Mathematics or Computer Science", action: onSubject, icon: FolderKanban, cta: "Add subject" },
    { done: sessions.length > 0, title: "Schedule a study session", text: "Pick a time, duration and priority", action: onSession, icon: CalendarPlus, cta: "Schedule" },
    { done: notes.length > 0, title: "Write your first note", text: "Capture today's lecture while it's fresh", action: onNote, icon: NotebookPen, cta: "Create note" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="border-b border-slate-200 bg-brand-50/60 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Set up StudyMate in three steps</h2>
        <p className="mt-0.5 text-sm text-slate-600">
          {doneCount} of 3 done. Everything you add is saved to your account.
        </p>
      </div>
      <ol className="divide-y divide-slate-100">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-4 px-5 py-4">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                s.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600",
              )}
            >
              {s.done ? <Check className="size-4" aria-label="Done" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", s.done ? "text-slate-500 line-through" : "text-slate-900")}>{s.title}</p>
              <p className="text-sm text-slate-500">{s.text}</p>
            </div>
            {!s.done && (
              <button type="button" onClick={s.action} className={buttonClasses({ variant: i === doneCount ? "primary" : "secondary", size: "sm" })}>
                <s.icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{s.cta}</span>
                <span className="sm:hidden">Start</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
