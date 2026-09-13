import type { CSSProperties } from "react";

export type FallingVariant = "sakura" | "momiji" | "snow";

type Particle = {
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s (negative to stagger starting position)
  drift: number; // px of horizontal sway
  opacity: number;
};

type VariantConfig = {
  shape: "path" | "circle";
  path?: string;
  colorClassName: string;
  particles: Particle[];
};

// Fixed, hand-picked values (not Math.random) so server/client markup match exactly.
const SAKURA_PARTICLES: Particle[] = [
  { left: 4, size: 14, duration: 11, delay: -1, drift: 30, opacity: 0.75 },
  { left: 16, size: 10, duration: 9, delay: -4, drift: -22, opacity: 0.6 },
  { left: 28, size: 18, duration: 13, delay: -7, drift: 26, opacity: 0.7 },
  { left: 42, size: 12, duration: 10, delay: -2, drift: -34, opacity: 0.55 },
  { left: 58, size: 16, duration: 14, delay: -9, drift: 20, opacity: 0.8 },
  { left: 71, size: 11, duration: 8, delay: -3, drift: -18, opacity: 0.65 },
  { left: 85, size: 15, duration: 12, delay: -6, drift: 32, opacity: 0.7 },
  { left: 95, size: 13, duration: 10, delay: -5, drift: -26, opacity: 0.6 },
  // Extra particles, hidden below the `sm` breakpoint to keep mobile lighter.
  { left: 10, size: 20, duration: 15, delay: -8, drift: -28, opacity: 0.5 },
  { left: 22, size: 9, duration: 9, delay: -1, drift: 24, opacity: 0.7 },
  { left: 35, size: 17, duration: 13, delay: -10, drift: -20, opacity: 0.6 },
  { left: 50, size: 12, duration: 11, delay: -4, drift: 30, opacity: 0.75 },
  { left: 64, size: 19, duration: 16, delay: -12, drift: -32, opacity: 0.55 },
  { left: 78, size: 10, duration: 9, delay: -2, drift: 22, opacity: 0.65 },
  { left: 90, size: 14, duration: 12, delay: -7, drift: -24, opacity: 0.7 },
  { left: 99, size: 11, duration: 10, delay: -5, drift: 18, opacity: 0.6 },
];

const MOMIJI_PARTICLES: Particle[] = [
  { left: 6, size: 20, duration: 11, delay: -2, drift: 40, opacity: 0.75 },
  { left: 18, size: 14, duration: 9, delay: -5, drift: -35, opacity: 0.6 },
  { left: 30, size: 22, duration: 13, delay: -8, drift: 38, opacity: 0.7 },
  { left: 45, size: 16, duration: 10, delay: -3, drift: -42, opacity: 0.55 },
  { left: 60, size: 18, duration: 14, delay: -10, drift: 30, opacity: 0.8 },
  { left: 74, size: 13, duration: 9, delay: -4, drift: -28, opacity: 0.65 },
  { left: 87, size: 19, duration: 12, delay: -7, drift: 44, opacity: 0.7 },
  { left: 96, size: 15, duration: 10, delay: -6, drift: -32, opacity: 0.6 },
  // Extra leaves, hidden below the `sm` breakpoint.
  { left: 12, size: 24, duration: 15, delay: -9, drift: -38, opacity: 0.5 },
  { left: 38, size: 12, duration: 9, delay: -1, drift: 34, opacity: 0.7 },
  { left: 68, size: 21, duration: 13, delay: -11, drift: -40, opacity: 0.55 },
  { left: 91, size: 14, duration: 11, delay: -5, drift: 26, opacity: 0.65 },
];

const SNOW_PARTICLES: Particle[] = [
  { left: 3, size: 6, duration: 16, delay: -2, drift: 12, opacity: 0.5 },
  { left: 15, size: 5, duration: 14, delay: -5, drift: -10, opacity: 0.4 },
  { left: 27, size: 8, duration: 19, delay: -8, drift: 14, opacity: 0.55 },
  { left: 40, size: 4, duration: 15, delay: -3, drift: -8, opacity: 0.35 },
  { left: 55, size: 7, duration: 20, delay: -10, drift: 16, opacity: 0.5 },
  { left: 68, size: 5, duration: 14, delay: -4, drift: -12, opacity: 0.4 },
  { left: 80, size: 9, duration: 22, delay: -7, drift: 10, opacity: 0.55 },
  { left: 92, size: 6, duration: 16, delay: -6, drift: -14, opacity: 0.45 },
  // Extra flakes, hidden below the `sm` breakpoint.
  { left: 8, size: 5, duration: 18, delay: -9, drift: -10, opacity: 0.4 },
  { left: 22, size: 7, duration: 15, delay: -1, drift: 12, opacity: 0.5 },
  { left: 48, size: 4, duration: 21, delay: -11, drift: -8, opacity: 0.35 },
  { left: 62, size: 8, duration: 17, delay: -5, drift: 14, opacity: 0.5 },
  { left: 75, size: 6, duration: 19, delay: -2, drift: -10, opacity: 0.4 },
  { left: 99, size: 5, duration: 14, delay: -6, drift: 10, opacity: 0.45 },
];

const VARIANTS: Record<FallingVariant, VariantConfig> = {
  sakura: {
    shape: "path",
    path: "M16 3C11 3 3 11 3 18c0 6 6 11 13 11s13-5 13-11c0-7-8-15-13-15z",
    colorClassName: "text-accent",
    particles: SAKURA_PARTICLES,
  },
  momiji: {
    shape: "path",
    path: "M16 2 L19 10 L27 8 L21 14 L29 18 L20 18 L22 27 L16 20 L10 27 L12 18 L3 18 L11 14 L5 8 L13 10 Z",
    colorClassName: "text-accent",
    particles: MOMIJI_PARTICLES,
  },
  snow: {
    shape: "circle",
    colorClassName: "text-ink/40",
    particles: SNOW_PARTICLES,
  },
};

export function FallingParticles({ variant }: { variant: FallingVariant }) {
  const config = VARIANTS[variant];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {config.particles.map((particle, index) => (
        <svg
          key={index}
          viewBox="0 0 32 32"
          className={`falling-particle absolute ${config.colorClassName} ${
            index >= 8 ? "hidden sm:block" : ""
          }`}
          style={
            {
              top: 0,
              left: `${particle.left}vw`,
              width: particle.size,
              height: particle.size,
              "--duration": `${particle.duration}s`,
              "--delay": `${particle.delay}s`,
              "--drift": `${particle.drift}px`,
              "--opacity": particle.opacity,
            } as CSSProperties
          }
        >
          {config.shape === "circle" ? (
            <circle cx={16} cy={16} r={9} fill="currentColor" />
          ) : (
            <path d={config.path} fill="currentColor" />
          )}
        </svg>
      ))}
    </div>
  );
}
