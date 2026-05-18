"use client";

import { useState, useEffect } from "react";
import { ClockIcon, PauseIcon } from "@heroicons/react/24/outline";

interface SessionTimerProps {
  startTime: string; // ISO date string
  isCompleted: boolean;
  completedAt?: string | null;
  isPaused?: boolean;
  pausedAt?: string | null;
  totalPausedSeconds?: number;
}

export function SessionTimer({
  startTime,
  isCompleted,
  completedAt,
  isPaused = false,
  pausedAt,
  totalPausedSeconds = 0,
}: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();

    if (isCompleted && completedAt) {
      // Calculate final duration minus paused time
      const end = new Date(completedAt).getTime();
      const totalElapsed = Math.floor((end - start) / 1000);
      setElapsed(totalElapsed - totalPausedSeconds);
      return;
    }

    if (isPaused && pausedAt) {
      // Calculate elapsed time until pause, minus previously paused time
      const pauseTime = new Date(pausedAt).getTime();
      const totalElapsed = Math.floor((pauseTime - start) / 1000);
      setElapsed(totalElapsed - totalPausedSeconds);
      return;
    }

    // Calculate initial elapsed time minus paused time
    const calculateElapsed = () => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - start) / 1000);
      setElapsed(totalElapsed - totalPausedSeconds);
    };

    calculateElapsed();

    // Update every second if not paused
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted, completedAt, isPaused, pausedAt, totalPausedSeconds]);

  const formatTime = (seconds: number) => {
    const absSeconds = Math.max(0, seconds);
    const hrs = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusStyle = () => {
    if (isCompleted) return "bg-emerald-900/30 text-emerald-400";
    if (isPaused) return "bg-slate-700/50 text-slate-400";
    return "bg-amber-900/30 text-amber-400";
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${getStatusStyle()}`}>
      {isPaused ? (
        <PauseIcon className="h-5 w-5" />
      ) : (
        <ClockIcon className="h-5 w-5" />
      )}
      <span>{formatTime(elapsed)}</span>
      {!isCompleted && !isPaused && (
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      {isPaused && (
        <span className="text-xs uppercase tracking-wide">En pause</span>
      )}
    </div>
  );
}
