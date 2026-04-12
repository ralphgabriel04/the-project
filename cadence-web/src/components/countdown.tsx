"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2027-01-01T05:00:00Z"); // Midnight EST

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isExpired && mounted) {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-[var(--accent)]">
          C&apos;est le moment!
        </p>
      </div>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: "jours" },
    { value: timeLeft.hours, label: "heures" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="text-center">
      <div className="mb-3 flex justify-center gap-3">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="flex min-w-[4rem] flex-col items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 sm:min-w-[5rem]"
          >
            <span className="text-2xl font-extrabold tabular-nums text-[var(--accent)] sm:text-4xl">
              {mounted ? String(block.value).padStart(2, "0") : "--"}
            </span>
            <span className="mt-1 text-xs uppercase text-[var(--text-muted)]">
              {block.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        avant l&apos;accès early-access
      </p>
    </div>
  );
}
