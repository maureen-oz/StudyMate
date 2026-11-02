"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, FolderKanban, LayoutDashboard, LogOut, NotebookPen, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/format";
import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { useStudyData } from "./study-data";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Study Planner", short: "Planner", icon: CalendarClock },
  { href: "/notes", label: "My Notes", short: "Notes", icon: NotebookPen },
  { href: "/subjects", label: "Subjects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await createClient().auth.signOut();
    router.push("/login?loggedout=1");
    router.refresh();
  }
  return { logout, loading };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, email } = useStudyData();
  const { logout, loading } = useLogout();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-overlay"
      >
        Skip to content
      </a>

      {/* Desktop / tablet sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center px-5">
          <Logo href="/dashboard" />
        </div>
        <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                isActive(href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700" aria-hidden="true">
              {initials(profile?.full_name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{profile?.full_name || "Student"}</span>
              <span className="block truncate text-xs text-slate-500">{email}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:opacity-60"
          >
            {loading ? <Spinner className="size-5" /> : <LogOut className="size-5" aria-hidden="true" />}
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <Logo href="/dashboard" />
        <Link
          href="/settings"
          aria-label="Profile and settings"
          className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {initials(profile?.full_name)}
        </Link>
      </header>

      <main id="main" className="pb-24 md:pb-10 md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.map(({ href, label, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
              isActive(href) ? "text-brand-700" : "text-slate-500",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {short ?? label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
