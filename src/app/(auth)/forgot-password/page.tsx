"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateEmail(email);
    setError(problem);
    if (problem) return;

    setLoading(true);
    setFormError(undefined);
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (err) return setFormError(authErrorMessage(err.message));
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          If an account exists for <span className="font-medium text-slate-900">{email.trim()}</span>, a reset link is on
          its way. It expires in 1 hour. Check your spam folder if it doesn&apos;t arrive in a few minutes.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="secondary" onClick={() => setSent(false)}>
            Use a different email
          </Button>
          <Link href="/login" className="py-2 text-sm font-medium text-brand-700 hover:underline">
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to log in
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Reset your password</h1>
      <p className="mt-1.5 text-sm text-slate-600">Enter the email you signed up with and we&apos;ll send you a reset link.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error && !validateEmail(e.target.value)) setError(undefined);
          }}
          onBlur={() => email && setError(validateEmail(email))}
          error={error}
          placeholder="name@university.edu"
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </>
  );
}
