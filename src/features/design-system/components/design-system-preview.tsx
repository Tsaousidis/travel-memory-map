import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState, Skeleton } from "@/components/ui/loading-state";
import { ComponentPreview } from "./component-preview";

const colors = [
  { name: "Paper", hex: "#F7F7F2", color: "var(--background)" },
  { name: "Forest", hex: "#245B45", color: "var(--accent)" },
  { name: "Ink", hex: "#243D35", color: "var(--foreground)" },
  { name: "Sage", hex: "#EAF0E5", color: "var(--soft)" },
];

export function DesignSystemPreview() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="border-b border-black/10 py-6">
        <Container className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-xl">◎ Travel Memory Map</span>
          <Link href="/login" className="button button--secondary">Sign in</Link>
        </Container>
      </header>
      <main id="main" tabIndex={-1}>
        <Container className="py-12 sm:py-20">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-5">A personal atlas of moments</p>
            <h1>Some places<br />stay with you.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">A quiet home for the places you have been, the things you noticed, and the memories you want to keep.</p>
            <p className="mt-5 text-xs text-muted">Component preview / Step 4 — sample UI, no travel data</p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <p className="eyebrow mb-4">01 / Palette</p>
                <h2>Grounded in nature.</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {colors.map((color) => <div key={color.name}><div className="swatch" style={{ background: color.color }} /><p className="mt-3 text-sm font-semibold">{color.name}</p><p className="mt-1 font-mono text-xs text-muted">{color.hex}</p></div>)}
                </div>
              </Card>
              <Card>
                <p className="eyebrow mb-4">02 / Typography</p>
                <h2>Stories, with room to breathe.</h2>
                <p className="mt-5 text-muted">Expressive serif headings meet familiar, readable body text. A simple rhythm of 4, 8, 16, 24, and 32 pixels keeps every detail connected.</p>
                <p className="mt-6 font-mono text-xs text-muted">Georgia / Arial · System fonts, locally available</p>
              </Card>
            </div>
            <ComponentPreview />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <p className="eyebrow mb-4">05 / Empty state</p>
                <EmptyState title="Your story starts somewhere." description="When you add your first trip, its places and memories will appear here." />
              </Card>
              <Card>
                <p className="eyebrow mb-6">06 / Loading state</p>
                <LoadingState />
                <div className="mt-6 grid gap-4"><Skeleton className="h-20" /><Skeleton className="w-3/4" /><Skeleton className="w-1/2" /></div>
              </Card>
            </div>
          </div>
          <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-black/10 pt-6 text-xs text-muted"><span>Made for memories. Built to feel familiar.</span><span>Travel Memory Map / UI foundations</span></footer>
        </Container>
      </main>
    </>
  );
}
