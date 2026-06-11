"use client";

// Click-to-play YouTube facade. Until the visitor clicks, only an on-brand
// anthracite poster renders — no YouTube JS, no third-party cookies (GDPR),
// no clickbait thumbnail breaking the gallery. On click the real player loads
// from the privacy-enhanced youtube-nocookie.com domain with autoplay.
import { useState } from "react";
import { Play } from "lucide-react";

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
}

export function YouTubeFacade({ videoId, title }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={title}
      className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center"
      style={{ background: "var(--glass-gradient-fill, var(--color-surface-alt))" }}
    >
      {/* Faint gold wash — light bleeding through the lens, not a thumbnail. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--grad-ambient)" }}
      />

      {/* Play affordance — line icon in a hairline ring, gold like the one action. */}
      <span className="border-gold-500/40 text-gold-400 group-hover:border-gold-500/70 group-hover:text-gold-200 flex h-16 w-16 items-center justify-center rounded-full border transition-colors duration-150 ease-[var(--ease-entry)]">
        <Play strokeWidth={1.5} className="ml-0.5 h-6 w-6" aria-hidden />
      </span>

      <span className="text-text-secondary mt-4 px-6 text-center text-[13px] leading-snug font-normal">
        {title}
      </span>
    </button>
  );
}
