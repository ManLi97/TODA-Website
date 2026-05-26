"use client";

// Firefly backdrop for the hero section.
// Particles originate from the center (behind the headline), drift outward
// slowly, and expire before spreading too far. A circular clear zone around
// the viewport center ensures no particle ever renders over the text.
// Each particle uses a radial gradient for a soft organic glow.
// Respects prefers-reduced-motion — renders nothing if true.
import { useEffect, useRef } from "react";

const N = 10;
type RGB = [number, number, number];

// Gold palette only — warm, focused. No white or purple.
const GOLDS: RGB[] = [
  [200, 148, 26],  // gold-500 #c8941a
  [232, 183, 61],  // gold-400 #e8b73d
  [245, 210, 100], // lighter warm gold
];

interface Particle {
  x: number;      // normalized world x (small, defines spawn angle/radius)
  y: number;      // normalized world y
  z: number;      // depth: 1=far/center, 0=close/edge
  spd: number;    // z decrement per frame
  sz: number;     // base size
  rgb: RGB;
  life: number;   // 0–1; opacity follows sin(life * π) bell curve
  lifeRate: number;
}

function spawn(p: Particle) {
  const a = Math.random() * Math.PI * 2;
  // Spawn ring: wide enough that particles are near but not on the text
  const r = 0.03 + Math.random() * 0.025;
  p.x = Math.cos(a) * r;
  p.y = Math.sin(a) * r;
  p.z = 0.45 + Math.random() * 0.45; // start at mid-to-far depth
  p.spd = 0.0004 + Math.random() * 0.001; // very slow
  p.sz = 2 + Math.random() * 2.5;
  p.life = 0;
  p.lifeRate = 0.003 + Math.random() * 0.003; // 2–5 s lifespan at 60 fps
  p.rgb = GOLDS[Math.floor(Math.random() * GOLDS.length)];
}

export function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = window.devicePixelRatio || 1;

    const particles: Particle[] = Array.from({ length: N }, () => {
      const p = {} as Particle;
      spawn(p);
      // Stagger so particles aren't all born at the same moment
      p.z = Math.random();
      p.life = Math.random();
      return p;
    });

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let id = 0;

    const tick = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      // Clear zone radius — no particle drawn inside this circle around the text
      const safeR = Math.min(w, h) * 0.16;

      for (const p of particles) {
        p.z -= p.spd;
        p.life += p.lifeRate;

        if (p.z <= 0 || p.life >= 1) { spawn(p); continue; }

        // Perspective projection: particles radiate outward as z shrinks
        const inv = 1 / p.z;
        const px = cx + p.x * inv * w;
        const py = cy + p.y * inv * h;

        // Cull out-of-bounds
        if (px < 0 || px > w || py < 0 || py > h) { spawn(p); continue; }

        // Cull inside text safe zone
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy < safeR * safeR) continue;

        // Bell-curve opacity over lifetime: fades in, peaks, fades out
        const lifeCurve = Math.sin(p.life * Math.PI);
        const opacity = lifeCurve * 0.28;

        // Soft glow via radial gradient (firefly look)
        const glowR = Math.max(1, p.sz * inv * 0.5) * 4;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        const [r, g, b] = p.rgb;
        grd.addColorStop(0, `rgba(${r},${g},${b},${opacity.toFixed(3)})`);
        grd.addColorStop(0.35, `rgba(${r},${g},${b},${(opacity * 0.25).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
