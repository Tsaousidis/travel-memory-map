import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = { title: "Create account | Travel Memory Map" };

export default function SignupPage() {
  return <><h2>Start your collection.</h2><p className="mb-8 mt-3 text-muted">Make a little room for your travel memories.</p><AuthForm mode="signup" /></>;
}
