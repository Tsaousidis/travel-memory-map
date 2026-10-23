"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { chatWithTripAssistant, saveAiTrip } from "@/features/trips/actions";
import type { ExtractedTrip } from "@/features/trips/ai";

type Country = { code: string; name: string };

type UiChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  isComplete?: boolean;
  missingInfo?: string[];
  trip?: ExtractedTrip;
};

const DEFAULT_WELCOME: UiChatMessage = {
  id: "welcome-message",
  role: "model",
  content:
    "Hello! Describe your journey in your own words (e.g., where you went, travel dates, cities visited, and any memorable notes). Gemini AI will analyze the details, verify that everything is complete, and help you save it automatically!",
};

const EXAMPLE_PHRASE =
  "I went on vacation to Crete from 05/07/2026 to 15/07/2026, and visited Chania, Heraklion, and Rethymno. Keep a note that the Venetian harbor of Chania was wonderful.";

export function AiTripChat({
  countries,
  onApplyToManual,
}: {
  countries: Country[];
  onApplyToManual: (trip: ExtractedTrip) => void;
}) {
  const [messages, setMessages] = useState<UiChatMessage[]>([DEFAULT_WELCOME]);
  const [inputValue, setInputValue] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleStartEdit = (message: UiChatMessage) => {
    setEditingMessageId(message.id);
    setInputValue(message.content);
    setSaveError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputValue("");
  };

  const handleUseExample = () => {
    setInputValue(EXAMPLE_PHRASE);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    const trimmed = inputValue.trim();
    if (!trimmed || isPending || isSaving) {
      return;
    }

    setSaveError(null);
    const editingId = editingMessageId;
    setInputValue("");
    setEditingMessageId(null);

    let nextMessages: UiChatMessage[];

    if (editingId) {
      // Find the message being edited and replace it, trimming subsequent bot replies
      const editIndex = messages.findIndex((m) => m.id === editingId);
      if (editIndex !== -1) {
        const updatedMessage: UiChatMessage = {
          ...messages[editIndex],
          content: trimmed,
        };
        nextMessages = [...messages.slice(0, editIndex), updatedMessage];
      } else {
        nextMessages = [...messages, { id: `user-${Date.now()}`, role: "user", content: trimmed }];
      }
    } else {
      nextMessages = [...messages, { id: `user-${Date.now()}`, role: "user", content: trimmed }];
    }

    setMessages(nextMessages);

    startTransition(async () => {
      // Build conversation history for the AI
      const chatPayload = nextMessages
        .filter((m) => m.id !== "welcome-message")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Call server action
      const result = await chatWithTripAssistant(chatPayload);

      const botMessage: UiChatMessage = {
        id: `bot-${Date.now()}`,
        role: "model",
        content: result.aiReply,
        isComplete: result.isComplete,
        missingInfo: result.missingInfo,
        trip: result.trip,
      };

      setMessages((prev) => [...prev, botMessage]);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSaveTrip = (trip: ExtractedTrip) => {
    setSaveError(null);
    startSaving(async () => {
      const res = await saveAiTrip(trip);
      if (res?.error) {
        setSaveError(res.error);
      }
    });
  };

  const handleResetChat = () => {
    setMessages([DEFAULT_WELCOME]);
    setInputValue("");
    setEditingMessageId(null);
    setSaveError(null);
  };

  // Find the last complete trip if any
  const latestCompleteTrip = [...messages].reverse().find((m) => m.trip)?.trip;

  return (
    <div className="ai-trip-chat" aria-label="AI Travel Assistant">
      <div className="ai-trip-chat__header">
        <div className="ai-trip-chat__header-info">
          <div className="ai-avatar" aria-hidden="true">✨</div>
          <div>
            <h3 className="ai-trip-chat__title">Gemini Travel Assistant</h3>
            <p className="ai-trip-chat__subtitle">Record your journey with natural language</p>
          </div>
        </div>
        <Button type="button" variant="ghost" onClick={handleResetChat} className="ai-trip-chat__reset-btn">
          🔄 New conversation
        </Button>
      </div>

      <div className="ai-trip-chat__log" ref={chatScrollRef} role="log" aria-live="polite">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`ai-chat-bubble-row ${isUser ? "ai-chat-bubble-row--user" : "ai-chat-bubble-row--bot"}`}
            >
              <div className="ai-chat-bubble-avatar" aria-hidden="true">
                {isUser ? "👤" : "✨"}
              </div>
              <div className={`ai-chat-bubble ${isUser ? "ai-chat-bubble--user" : "ai-chat-bubble--bot"}`}>
                <div className="ai-chat-bubble__text">{message.content}</div>

                {/* If user message: show Edit button */}
                {isUser && (
                  <div className="ai-chat-bubble__actions">
                    <button
                      type="button"
                      className="ai-chat-edit-btn"
                      onClick={() => handleStartEdit(message)}
                      title="Edit message"
                    >
                      ✏️ Edit message
                    </button>
                  </div>
                )}

                {/* If bot message and incomplete: show missing info badge and edit encouragement */}
                {!isUser && message.isComplete === false && message.missingInfo && message.missingInfo.length > 0 && (
                  <div className="ai-missing-info-box">
                    <p className="ai-missing-info-title">⚠️ Missing required information:</p>
                    <ul className="ai-missing-info-list">
                      {message.missingInfo.map((info, idx) => (
                        <li key={idx} className="ai-missing-info-badge">{info}</li>
                      ))}
                    </ul>
                    <p className="ai-missing-info-hint">
                      💡 Click <strong>«✏️ Edit message»</strong> on your previous message to add the details, or continue the conversation below!
                    </p>
                  </div>
                )}

                {/* If bot message and trip complete: show structured Trip Preview Card */}
                {!isUser && message.isComplete && message.trip && (() => {
                  const countryInDb = countries.find((c) => c.code === message.trip?.countryCode);
                  return (
                    <div className="ai-trip-preview-card">
                      <div className="ai-trip-preview-header">
                        <span className="eyebrow">Ready to record</span>
                        <h4>{message.trip.title}</h4>
                        <p className="ai-trip-preview-country">
                          📍 <strong>{countryInDb ? countryInDb.name : message.trip.countryName}</strong> ({message.trip.countryCode})
                        </p>
                      </div>

                      <div className="ai-trip-preview-details">
                        <div className="ai-trip-preview-row">
                          <span className="ai-trip-preview-label">📅 Dates:</span>
                          <span>
                            {message.trip.startDate} to {message.trip.endDate}
                          </span>
                        </div>

                        <div className="ai-trip-preview-row">
                          <span className="ai-trip-preview-label">🏙️ Cities ({message.trip.cities.length}):</span>
                          <div className="ai-trip-preview-cities">
                            {message.trip.cities.map((city, idx) => (
                              <span key={idx} className="ai-city-tag" title={`Coordinates: ${city.latitude}, ${city.longitude}`}>
                                {city.name} <small>({city.latitude.toFixed(2)}, {city.longitude.toFixed(2)})</small>
                              </span>
                            ))}
                          </div>
                        </div>

                        {message.trip.description && (
                          <div className="ai-trip-preview-row">
                            <span className="ai-trip-preview-label">📝 Notes / Description:</span>
                            <p className="ai-trip-preview-desc">{message.trip.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="ai-trip-preview-actions">
                        <Button
                          type="button"
                          variant="primary"
                          loading={isSaving}
                          onClick={() => message.trip && handleSaveTrip(message.trip)}
                        >
                          🚀 Save trip
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => message.trip && onApplyToManual(message.trip)}
                        >
                          📝 Edit in manual form
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {/* Thinking / Analyzing indicator */}
        {isPending && (
          <div className="ai-chat-bubble-row ai-chat-bubble-row--bot">
            <div className="ai-chat-bubble-avatar" aria-hidden="true">✨</div>
            <div className="ai-chat-bubble ai-chat-bubble--bot ai-chat-bubble--thinking">
              <span className="spinner" aria-hidden="true" />
              <span>Gemini is analyzing your journey...</span>
            </div>
          </div>
        )}
      </div>

      {/* Save error banner if saving failed */}
      {saveError && (
        <div className="ai-chat-error-banner" role="alert">
          <div>
            <strong>Save error:</strong> {saveError}
          </div>
          {latestCompleteTrip && (
            <button
              type="button"
              className="ai-chat-error-link"
              onClick={() => onApplyToManual(latestCompleteTrip)}
            >
              Open in manual form to review details.
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="ai-trip-chat__input-area">
        {/* If editing a message, show edit banner */}
        {editingMessageId && (
          <div className="ai-chat-edit-indicator">
            <span>✏️ <strong>Editing message:</strong> Add or modify your trip details</span>
            <button type="button" onClick={handleCancelEdit} className="ai-chat-cancel-edit-btn">
              Cancel
            </button>
          </div>
        )}

        {/* Suggestion chip if chat is at the start */}
        {messages.length <= 1 && !editingMessageId && !inputValue && (
          <div className="ai-chat-example-bar">
            <button type="button" onClick={handleUseExample} className="ai-chat-example-chip">
              💡 <span>Try an example:</span> &quot;I went on vacation to Crete from 05/07/2026 to 15/07/2026...&quot;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ai-trip-chat__form">
          <textarea
            ref={textareaRef}
            className="input ai-trip-chat__textarea"
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessageId
                ? "Edit your message (e.g. add dates or cities)..."
                : "Describe your trip in your own words (Enter to send, Shift+Enter for new line)..."
            }
            disabled={isPending || isSaving}
            aria-label="Message to AI assistant"
          />
          <div className="ai-trip-chat__form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={!inputValue.trim() || isPending || isSaving}
              loading={isPending}
            >
              {editingMessageId ? "Update & Check" : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
