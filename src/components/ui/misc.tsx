import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/format";
import { subjectColor } from "@/lib/colors";
import { Button } from "./button";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-white shadow-card ring-1 ring-slate-200/80", className)} {...props} />;
}

export function CardHeader({ title, action, description }: { title: string; action?: React.ReactNode; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
};

export function Badge({ tone = "neutral", className, children }: { tone?: keyof typeof badgeTones; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const tone = priority === "high" ? "danger" : priority === "medium" ? "warning" : "neutral";
  return <Badge tone={tone}>{priority[0].toUpperCase() + priority.slice(1)} priority</Badge>;
}

export function SubjectTag({ name, color, code }: { name?: string | null; color?: string | null; code?: string | null }) {
  if (!name) return <Badge>No subject</Badge>;
  const c = subjectColor(color);
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", c.soft)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", c.dot)} aria-hidden="true" />
      <span className="truncate">{code ? `${code} · ${name}` : name}</span>
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">We couldn&apos;t load this</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        {message ?? "Something went wrong while fetching your data. Your work is safe. Try again."}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-red-50 text-red-800 ring-red-200",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    info: "bg-brand-50 text-brand-800 ring-brand-200",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg px-3.5 py-3 text-sm ring-1 ring-inset", styles[tone])}>
      {children}
    </div>
  );
}
