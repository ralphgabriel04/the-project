"use client";

import { useEffect, useState } from "react";

interface MessageTimeProps {
  timestamp: string;
  className?: string;
}

export function MessageTime({ timestamp, className = "" }: MessageTimeProps) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Format time in user's local timezone on client side
    const date = new Date(timestamp);
    const formatted = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(formatted);
  }, [timestamp]);

  // Show nothing during SSR to avoid hydration mismatch
  if (!time) {
    return <span className={className}>--:--</span>;
  }

  return <span className={className}>{time}</span>;
}

interface MessageDateProps {
  timestamp: string;
}

export function MessageDate({ timestamp }: MessageDateProps) {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const date = new Date(timestamp);
    const now = new Date();

    // Check if same day
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      setDateStr("Aujourd'hui");
    } else if (isYesterday) {
      setDateStr("Hier");
    } else {
      setDateStr(date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }));
    }
  }, [timestamp]);

  if (!dateStr) {
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <span className="text-xs text-slate-500 bg-slate-700/50 px-3 py-1 rounded-full">
        {dateStr}
      </span>
    </div>
  );
}
