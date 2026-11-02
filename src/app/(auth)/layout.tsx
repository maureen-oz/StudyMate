import { CalendarCheck, NotebookPen, TrendingUp } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo />
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <p className="text-center text-xs text-slate-500">© {new Date().getFullYear()} StudyMate. Built for students.</p>
      </div>

      <aside className="hidden bg-brand-700 p-10 text-white lg:flex lg:flex-col lg:justify-center" aria-label="Why StudyMate">
        <div className="max-w-md">
          <p className="text-sm font-medium text-brand-200">For university students</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            One calm place for your study plan and course notes.
          </h2>
          <ul className="mt-10 space-y-6">
            {[
              { icon: CalendarCheck, title: "Plan sessions", text: "Schedule study blocks by subject, priority and duration." },
              { icon: NotebookPen, title: "Keep notes together", text: "Write and find notes for every course in seconds." },
              { icon: TrendingUp, title: "See your progress", text: "Track hours and completed sessions week by week." },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-brand-100">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
