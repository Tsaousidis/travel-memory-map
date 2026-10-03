export type AuthState = {
  error?: string;
  message?: string;
  fields?: Partial<Record<"email" | "password" | "displayName", string>>;
};

export function validateCredentials(form: FormData, signup: boolean) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const displayName = String(form.get("displayName") ?? "").trim();
  const fields: NonNullable<AuthState["fields"]> = {};
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Enter a valid email address.";
  }
  if (!password || password.length > 128 || (signup && password.length < 8)) {
    fields.password = signup ? "Use between 8 and 128 characters." : "Enter your password (up to 128 characters).";
  }
  if (signup && (!displayName || displayName.length > 100)) {
    fields.displayName = "Use between 1 and 100 characters.";
  }
  return { email, password, displayName, fields, valid: Object.keys(fields).length === 0 };
}
