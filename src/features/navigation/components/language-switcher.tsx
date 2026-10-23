"use client";

import { useLanguage } from "@/lib/i18n/context";

function GreekFlagIcon() {
  return (
    <svg
      className="lang-flag-svg"
      viewBox="0 0 27 18"
      width="22"
      height="15"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="27" height="18" fill="#0d5eaf" />
      {/* 4 white stripes: stripe 2, 4, 6, 8 (each 2 units high) */}
      <rect y="2" width="27" height="2" fill="#ffffff" />
      <rect y="6" width="27" height="2" fill="#ffffff" />
      <rect y="10" width="27" height="2" fill="#ffffff" />
      <rect y="14" width="27" height="2" fill="#ffffff" />
      {/* Blue canton: 10 wide, 10 high */}
      <rect width="10" height="10" fill="#0d5eaf" />
      {/* White cross in canton */}
      <rect x="4" width="2" height="10" fill="#ffffff" />
      <rect y="4" width="10" height="2" fill="#ffffff" />
    </svg>
  );
}

function UkFlagIcon() {
  return (
    <svg
      className="lang-flag-svg"
      viewBox="0 0 60 30"
      width="22"
      height="15"
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id="uk-flag-clip">
        <rect width="60" height="30" rx="1.5" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        {/* Blue background */}
        <rect width="60" height="30" fill="#012169" />
        {/* White saltire diagonals */}
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" strokeWidth="6" />
        {/* Red saltire diagonals */}
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#c8102e" strokeWidth="2.5" />
        {/* White St George cross */}
        <path d="M30 0 v30 M0 15 h60" stroke="#ffffff" strokeWidth="10" />
        {/* Red St George cross */}
        <path d="M30 0 v30 M0 15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={t.nav.switchLanguage}
    >
      <button
        type="button"
        className={`lang-flag-btn ${locale === "el" ? "lang-flag-btn--active" : ""}`}
        onClick={() => setLocale("el")}
        aria-pressed={locale === "el"}
        title="Ελληνικά (Greek)"
        aria-label="Ελληνικά (Greek)"
      >
        <span className="lang-flag-wrapper">
          <GreekFlagIcon />
        </span>
        <span className="lang-code">EL</span>
      </button>

      <button
        type="button"
        className={`lang-flag-btn ${locale === "en" ? "lang-flag-btn--active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        title="English (UK)"
        aria-label="English (UK)"
      >
        <span className="lang-flag-wrapper">
          <UkFlagIcon />
        </span>
        <span className="lang-code">EN</span>
      </button>
    </div>
  );
}
