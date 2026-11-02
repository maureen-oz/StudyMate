import { ArrowRight, BookOpen, CalendarClock, CheckCircle2, Clock, FolderKanban, NotebookPen, Search, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const features = [
  {
    icon: CalendarClock,
    title: "Study planner",
    text: "Schedule sessions with a subject, date, duration and priority. Tick them off as you go.",
  },
  {
    icon: NotebookPen,
    title: "Course notes",
    text: "Write notes for every lecture, filter by subject, and find anything with instant search.",
  },
  {
    icon: FolderKanban,
    title: "Subjects in one place",
    text: "Give each course a code and colour so your week is readable at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    text: "See study hours and completed sessions this week, and keep a steady rhythm.",
  },
];

const steps = [
  { title: "Add your subjects", text: "Mathematics, Computer Science, Physics: whatever you're taking this semester." },
  { title: "Plan study sessions", text: "Block time before deadlines and exams, and set what matters most." },
  { title: "Take notes and track progress", text: "Keep notes beside your plan and watch your weekly hours grow." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="flex items-center gap-2">
            <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 md:block">
              Features
            </a>
            <a href="#how" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 md:block">
              How it works
            </a>
            <ButtonLink href="/login" variant="ghost" size="md">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="md" className="hidden sm:inline-flex">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50 to-white" aria-hidden="true" />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
              <BookOpen className="size-3.5" aria-hidden="true" />
              Built for university students
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Plan your studies. Keep your notes. Stay on track.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              StudyMate brings your study schedule, course notes and subjects into one simple, distraction‑free space, so
              you spend less time organising and more time learning.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/signup" size="lg">
                Get started for free
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">
                Log in
              </ButtonLink>
            </div>

            <ProductPreview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-slate-100 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Everything you need for the semester</h2>
              <p className="mt-3 text-slate-600">Four focused tools that work together. No clutter, no learning curve.</p>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-card bg-white p-6 shadow-card ring-1 ring-slate-200/80">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Get organised in three steps</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-2xl bg-brand-700 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">Start this semester organised</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">Create a free account and plan your first study session in under two minutes.</p>
            <ButtonLink href="/signup" size="lg" variant="secondary" className="mt-8">
              Create your free account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} StudyMate. A study planner for university students.</p>
        </div>
      </footer>
    </div>
  );
}

/** Static, decorative preview of the dashboard. */
function ProductPreview() {
  const bars = [2, 3.5, 1.5, 4, 3, 1, 2.5];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="relative mx-auto mt-16 max-w-5xl text-left" aria-label="Preview of the StudyMate dashboard" role="img">
      <div className="overflow-hidden rounded-2xl bg-white shadow-overlay ring-1 ring-slate-200">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-3" aria-hidden="true">
          <div className="grid grid-cols-2 gap-3 md:col-span-3 md:grid-cols-4">
            {[
              ["Study sessions", "24", CalendarClock],
              ["Completed", "18", CheckCircle2],
              ["Notes", "37", NotebookPen],
              ["Hours this week", "12.5", Clock],
            ].map(([label, value, Icon]) => {
              const I = Icon as typeof Clock;
              return (
                <div key={label as string} className="rounded-xl p-3 ring-1 ring-slate-200 sm:p-4">
                  <I className="size-4 text-brand-600" />
                  <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{value as string}</p>
                  <p className="text-xs text-slate-500">{label as string}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl p-4 ring-1 ring-slate-200 md:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Upcoming sessions</p>
            <ul className="mt-3 space-y-2.5">
              {[
                ["Linear algebra revision", "MTH 201", "bg-blue-500", "Today · 14:00"],
                ["Data structures lab prep", "CSC 205", "bg-violet-500", "Tomorrow · 10:00"],
                ["Thermodynamics problem set", "PHY 211", "bg-emerald-500", "Thu · 16:30"],
              ].map(([t, c, dot, when]) => (
                <li key={t} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                  <span className={`size-2 rounded-full ${dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{t}</span>
                    <span className="block text-xs text-slate-500">{c}</span>
                  </span>
                  <span className="hidden text-xs text-slate-500 sm:block">{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-4 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">This week</p>
            <div className="mt-4 flex h-28 items-end justify-between gap-2">
              {bars.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="w-full rounded-md bg-brand-500" style={{ height: `${(h / 4) * 100}%` }} />
                  <span className="text-[10px] text-slate-500">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-2 hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm shadow-overlay ring-1 ring-slate-200 sm:flex" aria-hidden="true">
        <Search className="size-4 text-slate-400" />
        <span className="text-slate-600">Search notes…</span>
      </div>
    </div>
  );
}
