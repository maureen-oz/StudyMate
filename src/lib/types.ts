export type Priority = "low" | "medium" | "high";
export type SessionStatus = "pending" | "completed";

export type Profile = {
  id: string;
  full_name: string;
  university: string | null;
  course_of_study: string | null;
  year_of_study: string | null;
  weekly_goal_hours: number;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string | null;
  color: string;
  created_at: string;
};

export type StudySession = {
  id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  priority: Priority;
  status: SessionStatus;
  completed_at: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  subject_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};
