"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { formatDate, initials } from "@/lib/format";
import { validateRequired } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/field";
import { Alert, Card, PageHeader } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useLogout } from "@/components/app/app-shell";
import { DataGate } from "@/components/app/data-gate";
import { useStudyData } from "@/components/app/study-data";

export default function SettingsPage() {
  return (
    <DataGate skeleton="list">
      <Settings />
    </DataGate>
  );
}

const YEARS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Postgraduate"];

function Settings() {
  const { profile, email, updateProfile } = useStudyData();
  const toast = useToast();
  const { logout, loading: loggingOut } = useLogout();
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [goal, setGoal] = useState("10");
  const [errors, setErrors] = useState<{ fullName?: string; goal?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setUniversity(profile.university ?? "");
    setCourse(profile.course_of_study ?? "");
    setYear(profile.year_of_study ?? "");
    setGoal(String(profile.weekly_goal_hours));
  }, [profile]);

  const goalNum = Number(goal);
  const dirty =
    !!profile &&
    (fullName !== profile.full_name ||
      university !== (profile.university ?? "") ||
      course !== (profile.course_of_study ?? "") ||
      year !== (profile.year_of_study ?? "") ||
      goalNum !== profile.weekly_goal_hours);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      fullName: validateRequired(fullName, "your full name"),
      goal: Number.isInteger(goalNum) && goalNum >= 1 && goalNum <= 100 ? undefined : "Choose a whole number of hours from 1 to 100.",
    };
    setErrors(next);
    if (next.fullName || next.goal) return;

    setSaving(true);
    setFormError(undefined);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        university: university.trim() || null,
        course_of_study: course.trim() || null,
        year_of_study: year || null,
        weekly_goal_hours: goalNum,
      });
      toast.success("Profile saved.");
    } catch {
      setFormError("We couldn't save your profile. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile & settings" description="Manage your account and study preferences." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5">
          <div className="flex items-center gap-4 lg:flex-col lg:text-center">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700" aria-hidden="true">
              {initials(profile?.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{profile?.full_name || "Student"}</p>
              <p className="truncate text-sm text-slate-500">{email}</p>
              {profile?.created_at && <p className="mt-1 text-xs text-slate-400">Member since {formatDate(profile.created_at, { month: "long", year: "numeric" })}</p>}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <form onSubmit={onSubmit} noValidate>
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Profile</h2>
                <p className="text-sm text-slate-500">This information personalises your dashboard.</p>
              </div>
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                {formError && (
                  <div className="sm:col-span-2">
                    <Alert>{formError}</Alert>
                  </div>
                )}
                <InputField
                  label="Full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName && e.target.value.trim()) setErrors((x) => ({ ...x, fullName: undefined }));
                  }}
                  error={errors.fullName}
                />
                <InputField label="Email" type="email" value={email} disabled hint="Your sign-in email can't be changed here." />
                <InputField label="University" optional value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. University of Lagos" />
                <InputField label="Course of study" optional value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. BSc Computer Science" />
                <SelectField label="Year of study" optional value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Not set</option>
                  {YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </SelectField>
                <InputField
                  label="Weekly study goal (hours)"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    if (errors.goal) setErrors((x) => ({ ...x, goal: undefined }));
                  }}
                  error={errors.goal}
                  hint="Shown as a progress bar on your dashboard."
                />
              </div>
              <div className="flex justify-end border-t border-slate-200 px-5 py-4">
                <Button type="submit" loading={saving} disabled={!dirty}>
                  Save profile
                </Button>
              </div>
            </form>
          </Card>

          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Log out</h2>
              <p className="text-sm text-slate-500">Sign out of StudyMate on this device. Your data stays saved.</p>
            </div>
            <Button variant="secondary" onClick={logout} loading={loggingOut}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
