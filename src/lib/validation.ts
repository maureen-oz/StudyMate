export function validateEmail(value: string) {
  if (!value.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter an email like name@university.edu.";
  return undefined;
}

export function validatePassword(value: string) {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
  return undefined;
}

export function validateRequired(value: string, label: string) {
  if (!value.trim()) return `Enter ${label}.`;
  return undefined;
}

/** Turns Supabase auth errors into friendly, non-blaming copy. */
export function authErrorMessage(message: string | undefined) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account. Check them and try again.";
  if (m.includes("already registered") || m.includes("already exists")) return "An account with this email already exists. Log in instead.";
  if (m.includes("email not confirmed")) return "Confirm your email first. We sent you a link when you signed up.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute, then try again.";
  if (m.includes("fetch") || m.includes("network")) return "We couldn't reach StudyMate. Check your connection and try again.";
  return "Something went wrong on our side. Try again in a moment.";
}
