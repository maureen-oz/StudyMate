"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, validateEmail, validatePassword, validateRequired } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { InputField, PasswordField } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";

type Values = { fullName: string; email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

const validators: Record<keyof Values, (v: string) => string | undefined> = {
  fullName: (v) => validateRequired(v, "your full name"),
  email: validateEmail,
  password: validatePassword,
};

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  function update(field: keyof Values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear an error the moment the field becomes valid.
    if (errors[field] && !validators[field](value)) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function blur(field: keyof Values) {
    if (values[field]) setErrors((e) => ({ ...e, [field]: validators[field](values[field]) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {
      fullName: validators.fullName(values.fullName),
      email: validators.email(values.email),
      password: validators.password(values.password),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    setFormError(undefined);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: { full_name: values.fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);

    if (error) return setFormError(authErrorMessage(error.message));
    // Supabase returns a user with no identities when the email is already registered.
    if (data.user && data.user.identities?.length === 0) return setFormError(authErrorMessage("already registered"));
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSentTo(values.email.trim());
    }
  }

  if (sentTo) {
    return (
      <div className="text-center" role="status">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Check your inbox</h1>
        <p className="mt-2 text-sm text-slate-600">
          We sent a confirmation link to <span className="font-medium text-slate-900">{sentTo}</span>. Open it to activate
          your account and go straight to your dashboard.
        </p>
        <p className="mt-6 text-sm text-slate-600">
          Already confirmed?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-600">Free for students. Takes less than a minute.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Full name"
          name="name"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          onBlur={() => blur("fullName")}
          error={errors.fullName}
          placeholder="e.g. Ada Okafor"
        />
        <InputField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => blur("email")}
          error={errors.email}
          placeholder="name@university.edu"
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => blur("password")}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
