"use client";

import { useEffect, useState } from "react";
import { cn, toLocalInput } from "@/lib/format";
import { SUBJECT_COLORS, type SubjectColor } from "@/lib/colors";
import type { Note, StudySession, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useStudyData } from "./study-data";

const SAVE_ERROR = "We couldn't save your changes. Check your connection and try again.";

/* ------------------------------------------------------------------ Subject */

export function SubjectDialog({ open, onClose, subject }: { open: boolean; onClose: () => void; subject?: Subject }) {
  const { createSubject, updateSubject, subjects } = useStudyData();
  const toast = useToast();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState<SubjectColor>("blue");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(subject?.name ?? "");
    setCode(subject?.code ?? "");
    // Suggest the next unused colour for new subjects.
    const used = new Set(subjects.map((s) => s.color));
    const next = (Object.keys(SUBJECT_COLORS) as SubjectColor[]).find((c) => !used.has(c)) ?? "blue";
    setColor((subject?.color as SubjectColor) ?? next);
    setError(undefined);
    setFormError(undefined);
  }, [open, subject, subjects]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter a subject name, like Mathematics.");
    setSaving(true);
    setFormError(undefined);
    try {
      const input = { name: name.trim(), code: code.trim().toUpperCase() || null, color };
      if (subject) await updateSubject(subject.id, input);
      else await createSubject(input);
      toast.success(subject ? `${input.name} updated.` : `${input.name} added to your subjects.`);
      onClose();
    } catch {
      setFormError(SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={subject ? "Edit subject" : "Add a subject"}
      description="Subjects group your study sessions and notes."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" loading={saving}>
            {subject ? "Save changes" : "Add subject"}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Subject name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error && e.target.value.trim()) setError(undefined);
          }}
          error={error}
          placeholder="e.g. Computer Science"
          maxLength={80}
          data-autofocus
        />
        <InputField
          label="Course code"
          optional
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. CSC 201"
          maxLength={20}
        />
        <fieldset>
          <legend className="text-sm font-medium text-slate-800">Colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SUBJECT_COLORS) as SubjectColor[]).map((c) => (
              <label key={c} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  checked={color === c}
                  onChange={() => setColor(c)}
                  className="peer sr-only"
                />
                <span className="sr-only">{SUBJECT_COLORS[c].label}</span>
                <span
                  aria-hidden="true"
                  title={SUBJECT_COLORS[c].label}
                  className={cn(
                    "block size-8 rounded-full ring-2 ring-transparent ring-offset-2 transition-shadow",
                    "peer-checked:ring-slate-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand-600",
                    SUBJECT_COLORS[c].dot,
                  )}
                />
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

/* ------------------------------------------------------------ Study session */

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

function defaultStart() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toLocalInput(d.toISOString());
}

export function SessionDialog({
  open,
  onClose,
  session,
  onNeedSubject,
}: {
  open: boolean;
  onClose: () => void;
  session?: StudySession;
  onNeedSubject?: () => void;
}) {
  const { subjects, createSession, updateSession } = useStudyData();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<StudySession["priority"]>("medium");
  const [status, setStatus] = useState<StudySession["status"]>("pending");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; startsAt?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(session?.title ?? "");
    setSubjectId(session?.subject_id ?? subjects[0]?.id ?? "");
    setStartsAt(session ? toLocalInput(session.starts_at) : defaultStart());
    setDuration(session?.duration_minutes ?? 60);
    setPriority(session?.priority ?? "medium");
    setStatus(session?.status ?? "pending");
    setDescription(session?.description ?? "");
    setErrors({});
    setFormError(undefined);
  }, [open, session, subjects]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      title: title.trim() ? undefined : "Give this session a title, like “Chapter 4 revision”.",
      startsAt: startsAt ? undefined : "Choose a date and start time.",
    };
    setErrors(next);
    if (next.title || next.startsAt) return;

    setSaving(true);
    setFormError(undefined);
    try {
      const input = {
        title: title.trim(),
        subject_id: subjectId || null,
        description: description.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        duration_minutes: duration,
        priority,
        status,
      };
      if (session) await updateSession(session.id, input);
      else await createSession(input);
      toast.success(session ? "Study session updated." : "Study session scheduled.");
      onClose();
    } catch {
      setFormError(SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  }

  const durationOptions = DURATIONS.includes(duration) ? DURATIONS : [...DURATIONS, duration].sort((a, b) => a - b);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={session ? "Edit study session" : "Schedule a study session"}
      description={session ? undefined : "Block out focused time for one subject."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="session-form" loading={saving}>
            {session ? "Save changes" : "Schedule session"}
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Session title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title && e.target.value.trim()) setErrors((x) => ({ ...x, title: undefined }));
          }}
          error={errors.title}
          placeholder="e.g. Integration practice questions"
          maxLength={120}
          data-autofocus
        />
        <div>
          <SelectField label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} · ${s.name}` : s.name}
              </option>
            ))}
          </SelectField>
          {subjects.length === 0 && onNeedSubject && (
            <p className="mt-1.5 text-sm text-slate-500">
              No subjects yet.{" "}
              <button type="button" onClick={onNeedSubject} className="font-medium text-brand-700 hover:underline">
                Add a subject
              </button>
            </p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Date and start time"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => {
              setStartsAt(e.target.value);
              if (errors.startsAt && e.target.value) setErrors((x) => ({ ...x, startsAt: undefined }));
            }}
            error={errors.startsAt}
          />
          <SelectField label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {durationOptions.map((m) => (
              <option key={m} value={m}>
                {m < 60 ? `${m} minutes` : `${m / 60} hour${m === 60 ? "" : "s"}`}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as StudySession["priority"])}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </SelectField>
          <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as StudySession["status"])}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </SelectField>
        </div>
        <TextareaField
          label="What will you cover?"
          optional
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Past paper Q1–Q5, then review mistakes"
        />
      </form>
    </Dialog>
  );
}

/* --------------------------------------------------------------------- Note */

export function NoteDialog({
  open,
  onClose,
  note,
  defaultSubjectId,
}: {
  open: boolean;
  onClose: () => void;
  note?: Note;
  defaultSubjectId?: string;
}) {
  const { subjects, createNote, updateNote } = useStudyData();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setSubjectId(note?.subject_id ?? defaultSubjectId ?? subjects[0]?.id ?? "");
    setContent(note?.content ?? "");
    setError(undefined);
    setFormError(undefined);
  }, [open, note, defaultSubjectId, subjects]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Give your note a title, like “Week 3: Recursion”.");
    setSaving(true);
    setFormError(undefined);
    try {
      const input = { title: title.trim(), subject_id: subjectId || null, content };
      if (note) await updateNote(note.id, input);
      else await createNote(input);
      toast.success(note ? "Note saved." : "Note created.");
      onClose();
    } catch {
      setFormError(SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={note ? "Edit note" : "New note"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="note-form" loading={saving}>
            {note ? "Save note" : "Create note"}
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
          <InputField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error && e.target.value.trim()) setError(undefined);
            }}
            error={error}
            placeholder="e.g. Lecture 5: Newton's laws"
            maxLength={160}
            data-autofocus
          />
          <SelectField label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} · ${s.name}` : s.name}
              </option>
            ))}
          </SelectField>
        </div>
        <TextareaField
          label="Note"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Key ideas, definitions, worked examples, questions to ask in the tutorial…"
          className="min-h-64 font-[inherit]"
        />
      </form>
    </Dialog>
  );
}
