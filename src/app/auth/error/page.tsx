import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";

const descriptions: Record<string, string> = {
  "missing-code": "The confirmation did not include a sign-in code. If your email was confirmed, you can sign in with your email and password.",
  "browser-verification": "We could not match this link to the browser that started signup. Open it using the same browser and address (localhost and 127.0.0.1 are different). If your email is confirmed, sign in with your password.",
  "exchange-rejected": "The sign-in code was rejected. It may have expired or already been used. Your email may still be confirmed; try signing in with your password.",
  unavailable: "The sign-in service could not be reached. Try signing in with your email and password in a moment.",
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const description = (reason && Object.hasOwn(descriptions, reason) && descriptions[reason])
    || "Automatic sign-in could not be completed. If your email is confirmed, you can still sign in with your email and password.";
  return <main className="py-20"><Container><Card className="mx-auto max-w-lg">
    <h1 className="text-3xl">This link could not sign you in.</h1>
    <p className="my-6 text-muted">{description}</p>
    <div className="flex flex-wrap gap-3"><Link href="/login" className="button button--primary">Sign in</Link><Link href="/signup" className="button button--secondary">Create account</Link></div>
  </Card></Container></main>;
}
