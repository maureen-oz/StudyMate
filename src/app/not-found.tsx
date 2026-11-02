import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 text-center">
      <Logo />
      <div className="mt-12 flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">We can&apos;t find that page</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">The link may be old or mistyped. Head back to your dashboard to keep studying.</p>
      <ButtonLink href="/dashboard" className="mt-6">
        Go to dashboard
      </ButtonLink>
    </div>
  );
}
