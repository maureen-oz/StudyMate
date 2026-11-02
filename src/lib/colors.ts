// Subject colours. Class names are written out in full so Tailwind can find them.
export const SUBJECT_COLORS = {
  blue: { label: "Blue", dot: "bg-blue-500", soft: "bg-blue-50 text-blue-700 ring-blue-200", bar: "bg-blue-500" },
  violet: { label: "Violet", dot: "bg-violet-500", soft: "bg-violet-50 text-violet-700 ring-violet-200", bar: "bg-violet-500" },
  emerald: { label: "Green", dot: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" },
  amber: { label: "Amber", dot: "bg-amber-500", soft: "bg-amber-50 text-amber-800 ring-amber-200", bar: "bg-amber-500" },
  rose: { label: "Rose", dot: "bg-rose-500", soft: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500" },
  cyan: { label: "Cyan", dot: "bg-cyan-500", soft: "bg-cyan-50 text-cyan-800 ring-cyan-200", bar: "bg-cyan-500" },
  orange: { label: "Orange", dot: "bg-orange-500", soft: "bg-orange-50 text-orange-800 ring-orange-200", bar: "bg-orange-500" },
  slate: { label: "Grey", dot: "bg-slate-500", soft: "bg-slate-100 text-slate-700 ring-slate-200", bar: "bg-slate-500" },
} as const;

export type SubjectColor = keyof typeof SUBJECT_COLORS;

export function subjectColor(color: string | null | undefined) {
  return SUBJECT_COLORS[(color as SubjectColor) in SUBJECT_COLORS ? (color as SubjectColor) : "slate"];
}
