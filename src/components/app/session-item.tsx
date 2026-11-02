"use client";

import { useState } from "react";
import { Check, Clock, Pencil, Trash2 } from "lucide-react";
import { cn, formatDuration, formatTime, relativeDay } from "@/lib/format";
import { subjectColor } from "@/lib/colors";
import type { StudySession } from "@/lib/types";
import { IconButton } from "@/components/ui/button";
import { Badge, PriorityBadge, SubjectTag } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useStudyData } from "./study-data";

export function isOverdue(s: StudySession) {
  return s.status === "pending" && new Date(s.starts_at).getTime() + s.duration_minutes * 60_000 < Date.now();
}

/** One study session row with a completion toggle. Used on the dashboard and planner. */
export function SessionItem({
  session,
  onEdit,
  onDelete,
  compact,
}: {
  session: StudySession;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const { subjectById, updateSession } = useStudyData();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const subject = subjectById(session.subject_id);
  const done = session.status === "completed";
  const overdue = isOverdue(session);

  async function toggle() {
    setBusy(true);
    try {
      await updateSession(session.id, { status: done ? "pending" : "completed" });
      toast.success(done ? `“${session.title}” moved back to pending.` : `Nice work! “${session.title}” is complete.`);
    } catch {
      toast.error("We couldn't update that session. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50 sm:px-4">
      <span className={cn("mt-0.5 hidden h-10 w-1 shrink-0 rounded-full sm:block", subjectColor(subject?.color).bar)} aria-hidden="true" />
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        role="checkbox"
        aria-checked={done}
        aria-label={`Completed: ${session.title}`}
        title={done ? "Mark as pending" : "Mark as completed"}
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-2 ring-inset transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60",
          done ? "bg-emerald-600 text-white ring-emerald-600" : "text-transparent ring-slate-300 hover:text-emerald-500 hover:ring-emerald-500",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium text-slate-900", done && "text-slate-500 line-through decoration-slate-400")}>{session.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {relativeDay(session.starts_at)} · {formatTime(session.starts_at)} · {formatDuration(session.duration_minutes)}
          </span>
          <SubjectTag name={subject?.name} color={subject?.color} code={compact ? null : subject?.code} />
          {!compact && <PriorityBadge priority={session.priority} />}
          {done ? <Badge tone="success">Completed</Badge> : overdue ? <Badge tone="danger">Overdue</Badge> : !compact && <Badge>Pending</Badge>}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-0.5">
          {onEdit && (
            <IconButton label={`Edit “${session.title}”`} onClick={onEdit}>
              <Pencil className="size-4" aria-hidden="true" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton label={`Delete “${session.title}”`} onClick={onDelete} className="hover:bg-red-50 hover:text-red-600">
              <Trash2 className="size-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      )}
    </li>
  );
}
