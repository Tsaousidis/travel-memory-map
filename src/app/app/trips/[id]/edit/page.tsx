import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EditTripForm } from "@/features/trips/components/edit-trip-form";
import { getCountries, getTripForEdit } from "@/features/trips/server";

export const metadata = { title: "Edit trip | Travel Memory Map" };

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, countries] = await Promise.all([getTripForEdit(id), getCountries()]);
  if (!trip) notFound();

  return (
    <section className="edit-trip-page">
      <p className="eyebrow mb-4">Shape the memory</p>
      <h1 className="text-4xl sm:text-5xl">Edit trip</h1>
      <p className="mb-10 mt-5 max-w-xl text-muted">Update the story without losing the places attached to it.</p>
      <Card>
        <EditTripForm trip={trip} countries={countries} />
      </Card>
    </section>
  );
}
