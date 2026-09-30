"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function ComponentPreview() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <p className="eyebrow mb-4">03 / Actions</p>
        <h2>Small gestures, clear intent.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>Open a memory ↗</Button>
          <Button variant="secondary" onClick={() => setMessage("Secondary action selected.")}>Secondary</Button>
          <Button variant="ghost" onClick={() => setMessage("Ghost action selected.")}>Ghost</Button>
          <Button variant="danger" onClick={() => setMessage("Destructive button preview — nothing was deleted.")}>Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Saving…</Button>
        </div>
        <p role="status" className="mt-5 min-h-6 text-sm text-muted">{message}</p>
      </Card>
      <Card>
        <p className="eyebrow mb-4">04 / Form fields</p>
        <form className="grid gap-5" noValidate onSubmit={(event) => {
          event.preventDefault();
          const title = String(new FormData(event.currentTarget).get("title") ?? "").trim();
          setError(title ? "" : "Give this memory a name.");
          setMessage(title ? "Preview validated. No data was saved." : "Please check the highlighted field.");
        }}>
          <Input label="Memory title" name="title" placeholder="A morning in Kyoto" hint="A few words to bring you back." error={error} required />
          <Input label="Location" placeholder="Available in a later step" disabled />
          <div><Button variant="secondary" type="submit">Validate preview</Button></div>
        </form>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="A little space for a memory" description="A preview of the shared dialog. Your travels will find their home here.">
        <p className="text-sm text-muted">Use Tab to move between controls, or Escape to close and return to the opening button.</p>
        <div className="mt-8 flex justify-end"><Button onClick={() => setOpen(false)}>Back to the collection</Button></div>
      </Modal>
    </div>
  );
}
