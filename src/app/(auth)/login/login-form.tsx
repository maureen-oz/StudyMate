"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { InputField, PasswordField } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const notice =
    params.get("reset") === "1"
      ? "Your password has been updated. Log in with your new password."
      : params.get("loggedout") === "1"
        ? "You've been logged out. See you next study session."
        : undefined;
  const callbackError = params.get("error") ? "That link has expired or was already used. Request a new one." : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = { email: validateEmail(email), password: password ? undefined : "Enter your password." };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    setFormError(undefined);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      return setFormError(authErrorMessage(error.message));
    }
    const target = params.get("next");
    router.push(target?.startsWith("/") && !target.startsWith("//") ? target : "/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-600">Log in to pick up where you left off.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {notice && <Alert tone="success">{notice}</Alert>}
        {(formError ?? callbackError) && <Alert>{formError ?? callbackError}</Alert>}
        <InputField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email && !validateEmail(e.target.value)) setErrors((x) => ({ ...x, email: undefined }));
          }}
          onBlur={() => email && setErrors((x) => ({ ...x, email: validateEmail(email) }))}
          error={errors.email}
          placeholder="name@university.edu"
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password && e.target.value) setErrors((x) => ({ ...x, password: undefined }));
          }}
          error={errors.password}
          labelAction={
            <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
              Forgot password?
            </Link>
          }
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to StudyMate?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
