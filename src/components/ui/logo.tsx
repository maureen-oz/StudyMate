import Link from "next/link";
import { cn } from "@/lib/format";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-brand-600" />
      <path d="M9 10.5c2.6-1 5-1 7 .6v11.4c-2-1.6-4.4-1.6-7-.6V10.5Z" fill="#fff" />
      <path d="M23 10.5c-2.6-1-5-1-7 .6v11.4c2-1.6 4.4-1.6 7-.6V10.5Z" fill="#fff" fillOpacity=".7" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-slate-900">StudyMate</span>
    </Link>
  );
}
