"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { getRandomMemory, type MemoryState } from "@/features/dashboard/actions";
import { useLanguage } from "@/lib/i18n/context";

const initialState: MemoryState = {};

export function TakeMeSomewhere() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(getRandomMemory, initialState);
  const memory = state.memory;

  return (
    <section className="take-me-somewhere" aria-labelledby="take-me-heading">
      <div>
        <p className="eyebrow mb-4">{t.dashboard.takeMeEyebrow}</p>
        <h2 id="take-me-heading">{t.dashboard.takeMeHeading}</h2>
        <p className="mt-3 text-muted">{t.dashboard.takeMeSubheading}</p>
      </div>
      <form action={formAction}>
        <Button type="submit" variant="primary" loading={pending}>{t.dashboard.takeMeButton}</Button>
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
            <p className="eyebrow">{memory.date ?? t.dashboard.rememberedDay}</p>
            <h3>{memory.placeName ?? memory.cityName ?? memory.tripTitle}</h3>
            <p className="text-muted">{memory.cityName && `${memory.cityName} · `}{memory.tripTitle}</p>
            <Link className="button button--secondary" href={`/app/trips/${memory.tripId}`}>{t.dashboard.exploreTrip}</Link>
          </div>
        </div>
      )}
    </section>
  );
}

