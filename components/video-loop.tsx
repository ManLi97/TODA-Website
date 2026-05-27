"use client";

// VideoLoop — lazy-plays a muted video via IntersectionObserver.
// Default: loops indefinitely, pauses on exit.
// playOnce: plays exactly once on first viewport entry, never replays.
// When src is empty, renders a styled placeholder div.
import { useEffect, useRef } from "react";

interface VideoLoopProps {
  src: string;
  poster?: string;
  className?: string;
  playOnce?: boolean;
}

export function VideoLoop({ src, poster, className, playOnce = false }: VideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (playOnce) {
            if (entry.isIntersecting && !hasPlayed.current) {
              hasPlayed.current = true;
              video.play().catch(() => {});
              // disconnect so scroll-back never re-triggers
              observer.disconnect();
            }
          } else {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src, playOnce]);

  if (!src) {
    return (
      <div
        role="img"
        aria-label="Video placeholder"
        className={[
          "bg-surface-elevated flex items-center justify-center",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="text-text-tertiary text-[12px] font-normal select-none">
          Video
        </span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      loop={!playOnce}
      muted
      playsInline
      className={["w-full h-full object-cover block", className].filter(Boolean).join(" ")}
    />
  );
}
