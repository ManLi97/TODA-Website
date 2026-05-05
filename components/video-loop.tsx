"use client";

// VideoLoop — lazy-plays a looping muted video via IntersectionObserver.
// The video is paused until it enters the viewport (threshold: 25%) and paused again on exit.
// autoPlay is present per spec but IntersectionObserver is the primary play controller.
// When src is empty, renders a styled placeholder div — structurally correct for Phase 4.
import { useEffect, useRef } from "react";

interface VideoLoopProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoLoop({ src, poster, className }: VideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // catch() swallows autoplay-policy rejections — video stays paused gracefully
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

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
      autoPlay
      loop
      muted
      playsInline
      className={["w-full h-full object-cover block", className].filter(Boolean).join(" ")}
    />
  );
}
