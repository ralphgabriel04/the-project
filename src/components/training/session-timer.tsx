"use client";

import { useState, useEffect } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface SessionTimerProps {
  startTime: string; // ISO date string
  isCompleted: boolean;
  completedAt?: string | null;
}

export function SessionTimer({ startTime, isCompleted, completedAt }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isCompleted && completedAt) {
      // Calculate final duration
      const start = new Date(startTime).getTime();
      const end = new Date(completedAt).getTime();
      setElapsed(Math.floor((end - start) / 1000));
      return;
    }

    // Calculate initial elapsed time
    const start = new Date(startTime).getTime();
    const now = Date.now();
    setElapsed(Math.floor((now - start) / 1000));

    // Update every second
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted, completedAt]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg
      ${isCompleted 
        ? "bg-emerald-900/30 text-emerald-400" 
        : "bg-amber-900/30 text-amber-400 animate-pulse"
      }
    `}>
      <ClockIcon className="h-5 w-5" />
      <span>{formatTime(elapsed)}</span>
      {!isCompleted && (
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}

