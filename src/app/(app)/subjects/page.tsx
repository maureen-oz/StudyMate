"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { cn, formatHours } from "@/lib/format";
import { subjectColor } from "@/lib/colors";
import type { Subject } from "@/lib/types";
import { Button, IconButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { DataGate } from "@/components/app/data-gate";
import { SubjectDialog } from "@/components/app/forms";
import { useStudyData } from "@/components/app/study-data";

export default function SubjectsPage() {
  return (
    <DataGate>
      <Subjects />
    </DataGate>
  );
}

function Subjects() {
  const { subjects, sessions, notes, deleteSubject } = useStudyData();
  const toast = useToast();
  const [editing, setEditing] = useState<Subject | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Subject | undefined>();
  const [deleteBusy, setDeleteBusy] = useState(false);

  function statsFor(id: string) {
    const own = sessions.filter((s) => s.subject_id === id);
    const done = own.filter((s) => s.status === "completed");
    return {
      sessions: own.length,
      completed: done.length,
      minutes: done.reduce((sum, s) => sum + s.duration_minutes, 0),
      notes: notes.filter((n) => n.subject_id === id).length,
    };
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteSubject(deleting.id);
      toast.success(`${deleting.name} deleted. Its sessions and notes are kept without a subject.`);
      setDeleting(undefined);
    } catch {
      toast.error("We couldn't delete that subject. Try again.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const deletingStats = deleting ? statsFor(deleting.id) : undefined;

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Organise your courses. Every session and note can belong to a subject."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Add subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="Add the courses you're taking"
            description="Start with something like Mathematics, Computer Science, Physics or English. Give each a code and a colour."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Add your first subject
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => {
            const st = statsFor(s.id);
            const c = subjectColor(s.color);
            const pct = st.sessions ? Math.round((st.completed / st.sessions) * 100) : 0;
            return (
              <li key={s.id}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className={cn("h-1.5", c.bar)} aria-hidden="true" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {s.code && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.code}</p>}
                        <h2 className="mt-0.5 truncate text-lg font-semibold text-slate-900">{s.name}</h2>
                      </div>
                      <div className="-mr-2 -mt-1 flex shrink-0">
                        <IconButton label={`Edit ${s.name}`} onClick={() => { setEditing(s); setFormOpen(true); }}>
                          <Pencil className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton label={`Delete ${s.name}`} onClick={() => setDeleting(s)} className="hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </div>

                    <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["Sessions", st.sessions],
                        ["Notes", st.notes],
                        ["Hours", formatHours(st.minutes)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-slate-50 px-2 py-2.5">
                          <dt className="text-xs text-slate-500">{label}</dt>
                          <dd className="text-lg font-semibold tabular-nums text-slate-900">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Sessions completed</span>
                        <span className="tabular-nums">
                          {st.completed}/{st.sessions}
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${s.name} sessions completed`}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="mt-5 flex gap-4 border-t border-slate-100 pt-4 text-sm">
                      <Link href="/planner" className="font-medium text-brand-700 hover:underline">
                        Plan session
                      </Link>
                      <Link href="/notes" className="font-medium text-brand-700 hover:underline">
                        View notes
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <SubjectDialog open={formOpen} onClose={() => setFormOpen(false)} subject={editing} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
        title={`Delete ${deleting?.name ?? "subject"}?`}
        confirmLabel="Delete subject"
        body={
          <>
            <span className="font-medium text-slate-900">{deleting?.name}</span> will be deleted.
            {deletingStats && (deletingStats.sessions > 0 || deletingStats.notes > 0) ? (
              <>
                {" "}
                Its {deletingStats.sessions} session{deletingStats.sessions === 1 ? "" : "s"} and {deletingStats.notes} note
                {deletingStats.notes === 1 ? "" : "s"} will be kept but will no longer have a subject.
              </>
            ) : null}{" "}
            This can&apos;t be undone.
          </>
        }
      />
    </>
  );
}
