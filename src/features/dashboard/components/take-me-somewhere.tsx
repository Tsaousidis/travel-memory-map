"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { getRandomMemory, type MemoryState } from "@/features/dashboard/actions";

const initialState: MemoryState = {};

export function TakeMeSomewhere() {
  const [state, formAction, pending] = useActionState(getRandomMemory, initialState);
  const memory = state.memory;

  return (
    <section className="take-me-somewhere" aria-labelledby="take-me-heading">
      <div>
        <p className="eyebrow mb-4">A little serendipity</p>
        <h2 id="take-me-heading">Take me somewhere</h2>
        <p className="mt-3 text-muted">Rediscover a random trip, place, or photo from your travel history.</p>
      </div>
      <form action={formAction}>
        <Button type="submit" variant="primary" loading={pending}>✦ Take me somewhere</Button>
      </form>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {memory && (
        <div className="memory-result">
          {memory.photoUrl && (
            // Signed Storage URLs are dynamic and may come from a project-specific host.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memory.photoUrl} alt={memory.placeName ?? memory.tripTitle} />
          )}
          <div className="memory-result__content">
            <p className="eyebrow">{memory.date ?? "A remembered day"}</p>
            <h3>{memory.placeName ?? memory.cityName ?? memory.tripTitle}</h3>
            <p className="text-muted">{memory.cityName && `${memory.cityName} · `}{memory.tripTitle}</p>
            <Link className="button button--secondary" href={`/app/trips/${memory.tripId}`}>Explore trip</Link>
          </div>
        </div>
      )}
    </section>
  );
}
