"use client";

import { useState, useEffect } from "react";

export function LiveDateTime() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date on client
    setDateTime(new Date());

    // Update every second
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!dateTime) {
    // Server-side or initial render
    return (
      <div className="text-slate-400">
        <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  const formattedDate = dateTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Capitalize first letter
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="text-white">
      <p className="text-lg sm:text-xl font-semibold">{capitalizedDate}</p>
      <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
        {formattedTime}
      </p>
    </div>
  );
}
