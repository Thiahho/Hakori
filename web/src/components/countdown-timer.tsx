"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(
    null,
  );

  useEffect(() => {
    const target = new Date(targetDate);
    const tick = () => setTimeLeft(getTimeLeft(target));
    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "días", value: timeLeft?.days },
    { label: "horas", value: timeLeft?.hours },
    { label: "min", value: timeLeft?.minutes },
    { label: "seg", value: timeLeft?.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:gap-x-10">
      {units.map((unit) => (
        <div key={unit.label} className="flex items-baseline gap-2">
          <span className="font-display text-4xl sm:text-5xl tabular-nums text-cream">
            {unit.value !== undefined ? String(unit.value).padStart(2, "0") : "--"}
          </span>
          <span className="text-xs uppercase tracking-widest text-cream/70">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
