"use client";

import { useState, useEffect } from "react";
import { SunIcon, CloudIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Request geolocation
        if (!navigator.geolocation) {
          setError("Geolocalisation non supportee");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `/api/weather?lat=${latitude}&lon=${longitude}`
              );

              if (!response.ok) {
                throw new Error("Erreur API meteo");
              }

              const data = await response.json();
              setWeather(data);
            } catch (err) {
              setError("Impossible de charger la meteo");
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setError("Localisation refusee");
            } else {
              setError("Erreur de localisation");
            }
            setLoading(false);
          },
          { timeout: 10000 }
        );
      } catch (err) {
        setError("Erreur");
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="h-8 w-8 bg-slate-700 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <ExclamationCircleIcon className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3">
      <WeatherIcon icon={weather.icon} />
      <div className="text-right">
        <p className="text-2xl font-bold text-white">{Math.round(weather.temp)}°C</p>
        <p className="text-sm text-slate-400 capitalize">{weather.description}</p>
      </div>
    </div>
  );
}

function WeatherIcon({ icon }: { icon: string }) {
  const iconClass = "h-10 w-10";

  // Map Open-Meteo weather codes to icons
  switch (icon) {
    case "sun":
      return <SunIcon className={`${iconClass} text-yellow-400`} />;
    case "sun-cloud":
    case "cloud-sun":
      return (
        <div className="relative">
          <SunIcon className={`${iconClass} text-yellow-400`} />
          <CloudIcon className="h-6 w-6 text-slate-300 absolute -bottom-1 -right-1" />
        </div>
      );
    case "cloud":
      return <CloudIcon className={`${iconClass} text-slate-400`} />;
    case "fog":
      return (
        <svg className={`${iconClass} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15h18M3 12h18M3 9h18" />
        </svg>
      );
    case "drizzle":
    case "rain-light":
      return (
        <svg className={`${iconClass} text-blue-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l2 18M9 3l2 18M15 3l2 18M21 3l2 18" />
        </svg>
      );
    case "rain":
    case "rain-shower":
      return (
        <svg className={`${iconClass} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l2 18M9 3l2 18M15 3l2 18M21 3l2 18" />
        </svg>
      );
    case "snow":
    case "snow-shower":
      return (
        <svg className={`${iconClass} text-blue-100`} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="2" />
          <circle cx="12" cy="4" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="20" cy="12" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="12" cy="20" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );
    case "thunderstorm":
      return (
        <svg className={`${iconClass} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return <CloudIcon className={`${iconClass} text-slate-300`} />;
  }
}
