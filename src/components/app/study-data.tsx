"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note, Profile, StudySession, Subject } from "@/lib/types";

/**
 * Loads the signed-in student's data from Supabase once per visit and keeps it
 * in memory, so every page (dashboard, planner, notes, subjects) shows the same
 * numbers. Every write goes to Supabase first, then updates local state.
 */

type Status = "loading" | "ready" | "error";

export type SubjectInput = { name: string; code: string | null; color: string };
export type SessionInput = {
  title: string;
  subject_id: string | null;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  priority: StudySession["priority"];
  status: StudySession["status"];
};
export type NoteInput = { title: string; subject_id: string | null; content: string };
export type ProfileInput = Pick<Profile, "full_name" | "university" | "course_of_study" | "year_of_study" | "weekly_goal_hours">;

type StudyData = {
  status: Status;
  email: string;
  profile: Profile | null;
  subjects: Subject[];
  sessions: StudySession[];
  notes: Note[];
  reload: () => void;
  subjectById: (id: string | null) => Subject | undefined;
  createSubject: (input: SubjectInput) => Promise<Subject>;
  updateSubject: (id: string, input: SubjectInput) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  createSession: (input: SessionInput) => Promise<StudySession>;
  updateSession: (id: string, input: Partial<SessionInput>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  createNote: (input: NoteInput) => Promise<Note>;
  updateNote: (id: string, input: NoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
};

const Ctx = createContext<StudyData | null>(null);

const SESSION_COLS = "id, subject_id, title, description, starts_at, duration_minutes, priority, status, completed_at, created_at";

export function StudyDataProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      setEmail(auth.user.email ?? "");

      const [p, s, ss, n] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
        supabase.from("subjects").select("id, name, code, color, created_at").order("name"),
        supabase.from("study_sessions").select(SESSION_COLS).order("starts_at"),
        supabase.from("notes").select("id, subject_id, title, content, created_at, updated_at").order("updated_at", { ascending: false }),
      ]);
      const err = p.error ?? s.error ?? ss.error ?? n.error;
      if (err) throw err;

      setProfile(
        (p.data as Profile | null) ?? {
          id: auth.user.id,
          full_name: (auth.user.user_metadata?.full_name as string) ?? "",
          university: null,
          course_of_study: null,
          year_of_study: null,
          weekly_goal_hours: 10,
          created_at: auth.user.created_at,
        },
      );
      setSubjects((s.data ?? []) as Subject[]);
      setSessions((ss.data ?? []) as StudySession[]);
      setNotes((n.data ?? []) as Note[]);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const subjectById = useCallback((id: string | null) => (id ? subjects.find((s) => s.id === id) : undefined), [subjects]);

  const value = useMemo<StudyData>(() => {
    const sortSessions = (list: StudySession[]) => [...list].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const sortSubjects = (list: Subject[]) => [...list].sort((a, b) => a.name.localeCompare(b.name));

    return {
      status,
      email,
      profile,
      subjects,
      sessions,
      notes,
      reload: load,
      subjectById,

      async createSubject(input) {
        const { data, error } = await supabase.from("subjects").insert(input).select("id, name, code, color, created_at").single();
        if (error) throw error;
        setSubjects((list) => sortSubjects([...list, data as Subject]));
        return data as Subject;
      },
      async updateSubject(id, input) {
        const { error } = await supabase.from("subjects").update(input).eq("id", id);
        if (error) throw error;
        setSubjects((list) => sortSubjects(list.map((s) => (s.id === id ? { ...s, ...input } : s))));
      },
      async deleteSubject(id) {
        const { error } = await supabase.from("subjects").delete().eq("id", id);
        if (error) throw error;
        setSubjects((list) => list.filter((s) => s.id !== id));
        // Database sets subject_id to null on related rows; mirror that locally.
        setSessions((list) => list.map((s) => (s.subject_id === id ? { ...s, subject_id: null } : s)));
        setNotes((list) => list.map((n) => (n.subject_id === id ? { ...n, subject_id: null } : n)));
      },

      async createSession(input) {
        const row = { ...input, completed_at: input.status === "completed" ? new Date().toISOString() : null };
        const { data, error } = await supabase.from("study_sessions").insert(row).select(SESSION_COLS).single();
        if (error) throw error;
        setSessions((list) => sortSessions([...list, data as StudySession]));
        return data as StudySession;
      },
      async updateSession(id, input) {
        const patch: Record<string, unknown> = { ...input };
        const current = sessions.find((s) => s.id === id);
        if (input.status && input.status !== current?.status) {
          patch.completed_at = input.status === "completed" ? new Date().toISOString() : null;
        }
        const { data, error } = await supabase.from("study_sessions").update(patch).eq("id", id).select(SESSION_COLS).single();
        if (error) throw error;
        setSessions((list) => sortSessions(list.map((s) => (s.id === id ? (data as StudySession) : s))));
      },
      async deleteSession(id) {
        const { error } = await supabase.from("study_sessions").delete().eq("id", id);
        if (error) throw error;
        setSessions((list) => list.filter((s) => s.id !== id));
      },

      async createNote(input) {
        const { data, error } = await supabase.from("notes").insert(input).select("id, subject_id, title, content, created_at, updated_at").single();
        if (error) throw error;
        setNotes((list) => [data as Note, ...list]);
        return data as Note;
      },
      async updateNote(id, input) {
        const { data, error } = await supabase
          .from("notes")
          .update(input)
          .eq("id", id)
          .select("id, subject_id, title, content, created_at, updated_at")
          .single();
        if (error) throw error;
        setNotes((list) => [data as Note, ...list.filter((n) => n.id !== id)]);
      },
      async deleteNote(id) {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) throw error;
        setNotes((list) => list.filter((n) => n.id !== id));
      },

      async updateProfile(input) {
        if (!profile) return;
        const { error } = await supabase.from("profiles").update(input).eq("id", profile.id);
        if (error) throw error;
        await supabase.auth.updateUser({ data: { full_name: input.full_name } });
        setProfile({ ...profile, ...input });
      },
    };
  }, [status, email, profile, subjects, sessions, notes, load, subjectById, supabase]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudyData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudyData must be used inside <StudyDataProvider>");
  return ctx;
}
