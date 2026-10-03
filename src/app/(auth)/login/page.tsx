import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = { title: "Sign in | Travel Memory Map" };

export default function LoginPage() {
  return <><h2>Welcome back.</h2><p className="mb-8 mt-3 text-muted">Your memories are right where you left them.</p><AuthForm mode="login" /></>;
}
