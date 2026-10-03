import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 items-center py-12 sm:py-20">
    <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div>
        <Link href="/" className="font-display text-xl">◎ Travel Memory Map</Link>
        <p className="eyebrow mb-5 mt-12">Your world, remembered</p>
        <h1>Keep the places.<br />Keep the feeling.</h1>
        <p className="mt-6 max-w-md text-lg text-muted">A personal space for your travels, your photographs, and the moments that stay with you.</p>
      </div>
      <Card className="w-full max-w-lg justify-self-center">{children}</Card>
    </Container>
  </main>;
}
