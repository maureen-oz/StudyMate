"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate, formatTime, startOfDay, startOfWeek } from "@/lib/format";
import { subjectColor } from "@/lib/colors";
import type { StudySession } from "@/lib/types";
import { Button, IconButton } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { useStudyData } from "@/components/app/study-data";

/** Week view: seven day columns on desktop, stacked days on mobile. */
export function WeekCalendar({ sessions, onSelect }: { sessions: StudySession[]; onSelect: (s: StudySession) => void }) {
  const { subjectById } = useStudyData();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const today = startOfDay(new Date()).getTime();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function shift(weeks: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + weeks * 7);
    setWeekStart(d);
  }

  const end = days[6];
  const label = `${formatDate(weekStart.toISOString(), { day: "numeric", month: "short" })} – ${formatDate(end.toISOString(), { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <Card>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900" aria-live="polite">
          {label}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This week
          </Button>
          <IconButton label="Previous week" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Next week" onClick={() => shift(1)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <div className="grid divide-y divide-slate-100 md:grid-cols-7 md:divide-x md:divide-y-0">
        {days.map((d) => {
          const key = d.getTime();
          const items = sessions.filter((s) => startOfDay(new Date(s.starts_at)).getTime() === key);
          const isToday = key === today;
          return (
            <div key={key} className="min-h-24 p-2 md:min-h-72">
              <p className={cn("mb-2 flex items-center gap-2 px-1 text-xs font-medium md:flex-col md:gap-0.5", isToday ? "text-brand-700" : "text-slate-500")}>
                <span>{formatDate(d.toISOString(), { weekday: "short" })}</span>
                <span className={cn("inline-flex size-7 items-center justify-center rounded-full text-sm", isToday && "bg-brand-600 text-white")}>
                  {d.getDate()}
                </span>
              </p>
              <ul className="space-y-1.5">
                {items.map((s) => {
                  const c = subjectColor(subjectById(s.subject_id)?.color);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(s)}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-xs ring-1 ring-inset transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-brand-600",
                          c.soft,
                          s.status === "completed" && "opacity-60",
                        )}
                      >
                        <span className="block font-semibold">{formatTime(s.starts_at)}</span>
                        <span className={cn("line-clamp-2", s.status === "completed" && "line-through")}>{s.title}</span>
                      </button>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="px-1 text-xs text-slate-400 md:hidden">Nothing planned</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
