"use client";

import { useState } from "react";
import { AiTripChat } from "./ai-trip-chat";
import { CreateTripForm, type InitialTripValues } from "./create-trip-form";
import type { ExtractedTrip } from "../ai";

type Country = { code: string; name: string };
type RecordMode = "ai" | "manual";

export function TripRecordingCard({ countries }: { countries: Country[] }) {
  const [mode, setMode] = useState<RecordMode>("ai");
  const [manualInitialValues, setManualInitialValues] = useState<InitialTripValues | undefined>(undefined);

  const handleApplyToManual = (trip: ExtractedTrip) => {
    setManualInitialValues({
      title: trip.title,
      countryCode: trip.countryCode,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description,
      cities: trip.cities,
    });
    setMode("manual");
  };

  return (
    <div className="trip-recording-container">
      {/* 2 buttons at the top of the box */}
      <div className="trip-recording-mode-selector" role="tablist" aria-label="Select recording method">
        <button
          type="button"
          role="tab"
          id="tab-ai-mode"
          aria-selected={mode === "ai"}
          aria-controls="panel-ai-mode"
          className={`trip-mode-btn ${mode === "ai" ? "trip-mode-btn--active" : ""}`}
          onClick={() => setMode("ai")}
        >
          <span className="trip-mode-btn__icon" aria-hidden="true">✨</span>
          <span className="trip-mode-btn__label">Chat with AI</span>
          <span className="trip-mode-btn__badge">Chatbot</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-manual-mode"
          aria-selected={mode === "manual"}
          aria-controls="panel-manual-mode"
          className={`trip-mode-btn ${mode === "manual" ? "trip-mode-btn--active" : ""}`}
          onClick={() => setMode("manual")}
        >
          <span className="trip-mode-btn__icon" aria-hidden="true">📝</span>
          <span className="trip-mode-btn__label">Manual form</span>
        </button>
      </div>

      {/* Mode content */}
      <div className="trip-recording-content">
        {mode === "ai" ? (
          <div id="panel-ai-mode" role="tabpanel" aria-labelledby="tab-ai-mode">
            <AiTripChat countries={countries} onApplyToManual={handleApplyToManual} />
          </div>
        ) : (
          <div id="panel-manual-mode" role="tabpanel" aria-labelledby="tab-manual-mode">
            <CreateTripForm
              key={manualInitialValues ? `${manualInitialValues.title}-${manualInitialValues.countryCode}-${manualInitialValues.startDate}` : "default-empty-form"}
              countries={countries}
              initialValues={manualInitialValues}
            />
          </div>
        )}
      </div>
    </div>
  );
}
