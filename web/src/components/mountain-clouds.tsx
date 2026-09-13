import type { CSSProperties } from "react";

type Cloud = {
  top: number; // %
  width: number; // px
  height: number; // px
  duration: number; // s
  delay: number; // s
  opacity: number;
};

// Fixed, hand-picked values (not Math.random) so server/client markup match exactly.
const CLOUDS: Cloud[] = [
  { top: 6, width: 160, height: 80, duration: 70, delay: -10, opacity: 0.2 },
  { top: 16, width: 210, height: 100, duration: 95, delay: -45, opacity: 0.15 },
  { top: 4, width: 130, height: 65, duration: 58, delay: -25, opacity: 0.22 },
  { top: 24, width: 185, height: 90, duration: 85, delay: -60, opacity: 0.17 },
];

const CLOUD_PATH =
  "M20 45c-9 0-16-7-16-16 0-8 6-15 14-16 3-9 12-15 22-15 11 0 20 8 22 18 8 1 14 8 14 16 0 9-7 16-16 16H20z";

export function MountainClouds() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {CLOUDS.map((cloud, index) => (
        <svg
          key={index}
          viewBox="0 0 120 60"
          className="drifting-cloud absolute text-ink"
          style={
            {
              top: `${cloud.top}%`,
              left: 0,
              width: cloud.width,
              height: cloud.height,
              opacity: cloud.opacity,
              "--duration": `${cloud.duration}s`,
              "--delay": `${cloud.delay}s`,
            } as CSSProperties
          }
        >
          <path d={CLOUD_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
