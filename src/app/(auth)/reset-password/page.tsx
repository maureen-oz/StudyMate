"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      password: validatePassword(password),
      confirm: confirm === password ? undefined : "Passwords don't match yet.",
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      return setFormError(
        error.message.toLowerCase().includes("session")
          ? "Your reset link has expired. Request a new one from the Forgot password page."
          : authErrorMessage(error.message),
      );
    }
    await supabase.auth.signOut();
    router.push("/login?reset=1");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Choose a new password</h1>
      <p className="mt-1.5 text-sm text-slate-600">Make it something you haven&apos;t used here before.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password && !validatePassword(e.target.value)) setErrors((x) => ({ ...x, password: undefined }));
          }}
          onBlur={() => password && setErrors((x) => ({ ...x, password: validatePassword(password) }))}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm && e.target.value === password) setErrors((x) => ({ ...x, confirm: undefined }));
          }}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </>
  );
}
