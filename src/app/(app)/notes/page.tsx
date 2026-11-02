"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { NotebookPen, Pencil, Plus, Search, SearchX, Trash2 } from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/format";
import { subjectColor } from "@/lib/colors";
import type { Note } from "@/lib/types";
import { Button, IconButton } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Card, EmptyState, PageHeader, SubjectTag } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { DataGate } from "@/components/app/data-gate";
import { NoteDialog } from "@/components/app/forms";
import { useStudyData } from "@/components/app/study-data";

export default function NotesPage() {
  return (
    <DataGate>
      <Suspense>
        <Notes />
      </Suspense>
    </DataGate>
  );
}

function Notes() {
  const { notes, subjects, subjectById, deleteNote } = useStudyData();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [editing, setEditing] = useState<Note | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Note | undefined>();
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Open a note directly from a dashboard link (?open=<id>).
  const openId = params.get("open");
  useEffect(() => {
    if (!openId) return;
    const note = notes.find((n) => n.id === openId);
    if (note) {
      setEditing(note);
      setFormOpen(true);
    }
    router.replace("/notes", { scroll: false });
  }, [openId, notes, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (subject !== "all" && (subject === "none" ? n.subject_id !== null : n.subject_id !== subject)) return false;
      if (q && !`${n.title} ${n.content}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notes, query, subject]);

  const countFor = (id: string | null) => notes.filter((n) => n.subject_id === id).length;

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteNote(deleting.id);
      toast.success(`“${deleting.title}” deleted.`);
      setDeleting(undefined);
    } catch {
      toast.error("We couldn't delete that note. Try again.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="My Notes"
        description={`${notes.length} note${notes.length === 1 ? "" : "s"} across ${subjects.length} subject${subjects.length === 1 ? "" : "s"}`}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Create note
          </Button>
        }
      />

      {notes.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="Your notebook is empty"
            description="Write up today's lecture, a list of formulas, or questions for your tutor. Tag each note with a subject to find it later."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Create your first note
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 space-y-3">
            <div className="relative">
              <label htmlFor="note-search" className="sr-only">
                Search notes
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="note-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles and content"
                className="h-10 w-full rounded-lg bg-white pl-9 pr-3 text-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div role="group" aria-label="Filter by subject" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip active={subject === "all"} onClick={() => setSubject("all")}>
                All <span className="text-slate-400">{notes.length}</span>
              </Chip>
              {subjects.map((s) => (
                <Chip key={s.id} active={subject === s.id} onClick={() => setSubject(s.id)}>
                  <span className={cn("size-2 rounded-full", subjectColor(s.color).dot)} aria-hidden="true" />
                  {s.name} <span className="text-slate-400">{countFor(s.id)}</span>
                </Chip>
              ))}
              {countFor(null) > 0 && (
                <Chip active={subject === "none"} onClick={() => setSubject("none")}>
                  No subject <span className="text-slate-400">{countFor(null)}</span>
                </Chip>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No notes match"
                description={query ? `Nothing found for “${query.trim()}”. Check the spelling or try another subject.` : "There are no notes for this subject yet."}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setSubject("all");
                    }}
                  >
                    Show all notes
                  </Button>
                }
              />
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((n) => {
                const s = subjectById(n.subject_id);
                return (
                  <li key={n.id}>
                    <Card className="group relative flex h-full flex-col p-5 transition-shadow hover:shadow-overlay">
                      <div className="flex items-start justify-between gap-2">
                        <SubjectTag name={s?.name} color={s?.color} code={s?.code} />
                        <div className="-mr-2 -mt-2 flex shrink-0">
                          <IconButton label={`Edit “${n.title}”`} onClick={() => { setEditing(n); setFormOpen(true); }} className="relative z-10">
                            <Pencil className="size-4" aria-hidden="true" />
                          </IconButton>
                          <IconButton label={`Delete “${n.title}”`} onClick={() => setDeleting(n)} className="relative z-10 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="size-4" aria-hidden="true" />
                          </IconButton>
                        </div>
                      </div>
                      <h2 className="mt-3 line-clamp-2 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => { setEditing(n); setFormOpen(true); }}
                          className="text-left after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-600"
                        >
                          {n.title}
                        </button>
                      </h2>
                      <p className="mt-1.5 line-clamp-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {n.content || <span className="italic text-slate-400">No content yet</span>}
                      </p>
                      <p className="mt-4 text-xs text-slate-500" title={formatDate(n.updated_at, { dateStyle: "full", timeStyle: "short" } as Intl.DateTimeFormatOptions)}>
                        Last updated {timeAgo(n.updated_at)}
                      </p>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <NoteDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        note={editing}
        defaultSubjectId={subject !== "all" && subject !== "none" ? subject : undefined}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
        title="Delete note?"
        confirmLabel="Delete note"
        body={
          <>
            <span className="font-medium text-slate-900">“{deleting?.title}”</span> and everything in it will be permanently
            deleted. This can&apos;t be undone.
          </>
        }
      />
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium ring-1 ring-inset transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        active ? "bg-slate-900 text-white ring-slate-900 [&>span]:text-slate-300" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}
