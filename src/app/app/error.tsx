"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { LogoutButton } from "@/features/auth/components/logout-button";

export default function AppError({ reset }: { reset: () => void }) {
  return <Container className="py-20"><Card className="mx-auto max-w-lg">
    <h2>Your space could not be opened.</h2>
    <p role="alert" className="my-6 text-muted">Please try again in a moment. Your existing memories have not been changed.</p>
    <div className="flex flex-wrap gap-3"><Button onClick={reset}>Try again</Button><LogoutButton /></div>
  </Card></Container>;
}
