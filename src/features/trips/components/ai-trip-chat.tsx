"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { chatWithTripAssistant, saveAiTrip } from "@/features/trips/actions";
import type { ExtractedTrip } from "@/features/trips/ai";
import { useLanguage } from "@/lib/i18n/context";

type Country = { code: string; name: string };

type UiChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  isComplete?: boolean;
  missingInfo?: string[];
  trip?: ExtractedTrip;
};

export function AiTripChat({
  countries,
  onApplyToManual,
}: {
  countries: Country[];
  onApplyToManual: (trip: ExtractedTrip) => void;
}) {
  const { locale, t } = useLanguage();

  const [messages, setMessages] = useState<UiChatMessage[]>([
    {
      id: "welcome-message",
      role: "model",
      content: t.aiChat.welcomeMessage,
    },
  ]);
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
    setInputValue(t.aiChat.examplePhrase);
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

      // Call server action with user's selected locale
      const result = await chatWithTripAssistant(chatPayload, locale);

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
    setMessages([
      {
        id: "welcome-message",
        role: "model",
        content: t.aiChat.welcomeMessage,
      },
    ]);
    setInputValue("");
    setEditingMessageId(null);
    setSaveError(null);
  };

  // Find the last complete trip if any
  const latestCompleteTrip = [...messages].reverse().find((m) => m.trip)?.trip;

  return (
    <div className="ai-trip-chat" aria-label={t.aiChat.title}>
      <div className="ai-trip-chat__header">
        <div className="ai-trip-chat__header-info">
          <div className="ai-avatar" aria-hidden="true">✨</div>
          <div>
            <h3 className="ai-trip-chat__title">{t.aiChat.title}</h3>
            <p className="ai-trip-chat__subtitle">{t.aiChat.subtitle}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" onClick={handleResetChat} className="ai-trip-chat__reset-btn">
          {t.aiChat.newConversation}
        </Button>
      </div>

      <div className="ai-trip-chat__log" ref={chatScrollRef} role="log" aria-live="polite">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const displayContent = message.id === "welcome-message" ? t.aiChat.welcomeMessage : message.content;

          return (
            <div
              key={message.id}
              className={`ai-chat-bubble-row ${isUser ? "ai-chat-bubble-row--user" : "ai-chat-bubble-row--bot"}`}
            >
              <div className="ai-chat-bubble-avatar" aria-hidden="true">
                {isUser ? "👤" : "✨"}
              </div>
              <div className={`ai-chat-bubble ${isUser ? "ai-chat-bubble--user" : "ai-chat-bubble--bot"}`}>
                <div className="ai-chat-bubble__text">{displayContent}</div>

                {/* If user message: show Edit button */}
                {isUser && (
                  <div className="ai-chat-bubble__actions">
                    <button
                      type="button"
                      className="ai-chat-edit-btn"
                      onClick={() => handleStartEdit(message)}
                      title={t.aiChat.editMessage}
                    >
                      {t.aiChat.editMessage}
                    </button>
                  </div>
                )}

                {/* If bot message and incomplete: show missing info badge and edit encouragement */}
                {!isUser && message.isComplete === false && message.missingInfo && message.missingInfo.length > 0 && (
                  <div className="ai-missing-info-box">
                    <p className="ai-missing-info-title">{t.aiChat.missingInfoTitle}</p>
                    <ul className="ai-missing-info-list">
                      {message.missingInfo.map((info, idx) => (
                        <li key={idx} className="ai-missing-info-badge">{info}</li>
                      ))}
                    </ul>
                    <p className="ai-missing-info-hint">
                      💡 {t.aiChat.missingInfoHint}
                    </p>
                  </div>
                )}

                {/* If bot message and trip complete: show structured Trip Preview Card */}
                {!isUser && message.isComplete && message.trip && (() => {
                  const countryInDb = countries.find((c) => c.code === message.trip?.countryCode);
                  return (
                    <div className="ai-trip-preview-card">
                      <div className="ai-trip-preview-header">
                        <span className="eyebrow">{t.aiChat.readyToRecord}</span>
                        <h4>{message.trip.title}</h4>
                        <p className="ai-trip-preview-country">
                          📍 <strong>{countryInDb ? countryInDb.name : message.trip.countryName}</strong> ({message.trip.countryCode})
                        </p>
                      </div>

                      <div className="ai-trip-preview-details">
                        <div className="ai-trip-preview-row">
                          <span className="ai-trip-preview-label">{t.aiChat.dates}</span>
                          <span>
                            {message.trip.startDate} {t.aiChat.to} {message.trip.endDate}
                          </span>
                        </div>

                        <div className="ai-trip-preview-row">
                          <span className="ai-trip-preview-label">{t.aiChat.citiesCount} ({message.trip.cities.length}):</span>
                          <div className="ai-trip-preview-cities">
                            {message.trip.cities.map((city, idx) => (
                              <span key={idx} className="ai-city-tag" title={`${t.aiChat.coordinates}: ${city.latitude}, ${city.longitude}`}>
                                {city.name} <small>({city.latitude.toFixed(2)}, {city.longitude.toFixed(2)})</small>
                              </span>
                            ))}
                          </div>
                        </div>

                        {message.trip.description && (
                          <div className="ai-trip-preview-row">
                            <span className="ai-trip-preview-label">{t.aiChat.notesDescription}</span>
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
                          {t.aiChat.saveTrip}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => message.trip && onApplyToManual(message.trip)}
                        >
                          {t.aiChat.editInManual}
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
              <span>{t.aiChat.analyzing}</span>
            </div>
          </div>
        )}
      </div>

      {/* Save error banner if saving failed */}
      {saveError && (
        <div className="ai-chat-error-banner" role="alert">
          <div>
            <strong>{t.aiChat.saveError}</strong> {saveError}
          </div>
          {latestCompleteTrip && (
            <button
              type="button"
              className="ai-chat-error-link"
              onClick={() => onApplyToManual(latestCompleteTrip)}
            >
              {t.aiChat.openManualReview}
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="ai-trip-chat__input-area">
        {/* If editing a message, show edit banner */}
        {editingMessageId && (
          <div className="ai-chat-edit-indicator">
            <span>✏️ <strong>{t.aiChat.editingBannerTitle}</strong> {t.aiChat.editingBannerDesc}</span>
            <button type="button" onClick={handleCancelEdit} className="ai-chat-cancel-edit-btn">
              {t.aiChat.cancelEdit}
            </button>
          </div>
        )}

        {/* Suggestion chip if chat is at the start */}
        {messages.length <= 1 && !editingMessageId && !inputValue && (
          <div className="ai-chat-example-bar">
            <button type="button" onClick={handleUseExample} className="ai-chat-example-chip">
              💡 <span>{t.aiChat.exampleLabel}</span> &quot;{t.aiChat.examplePhrase.slice(0, 48)}...&quot;
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
                ? t.aiChat.placeholderEditing
                : t.aiChat.placeholderNormal
            }
            disabled={isPending || isSaving}
            aria-label={t.aiChat.title}
          />
          <div className="ai-trip-chat__form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={!inputValue.trim() || isPending || isSaving}
              loading={isPending}
            >
              {editingMessageId ? t.aiChat.updateAndCheck : t.aiChat.send}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

