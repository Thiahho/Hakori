"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; time: number };

const TRAIL_MS = 220;

export function KatanaSlashEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    function draw() {
      const dpr = dprRef.current;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const now = performance.now();
      const points = pointsRef.current.filter((p) => now - p.time < TRAIL_MS);
      pointsRef.current = points;

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const age = (now - p1.time) / TRAIL_MS; // 0 (fresh) -> 1 (expired)
        const alpha = 1 - age;

        ctx!.beginPath();
        ctx!.moveTo(p0.x, p0.y);
        ctx!.lineTo(p1.x, p1.y);
        ctx!.lineCap = "round";
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.lineWidth = Math.max(1, 4 * alpha);
        ctx!.shadowColor = "rgba(255, 255, 255, 0.85)";
        ctx!.shadowBlur = 10 * alpha;
        ctx!.stroke();
      }

      rafRef.current = points.length > 0 ? requestAnimationFrame(draw) : null;
    }

    function ensureLoop() {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointsRef.current.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        time: performance.now(),
      });
      ensureLoop();
    }

    container.addEventListener("pointermove", handlePointerMove);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden className="absolute inset-0">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
