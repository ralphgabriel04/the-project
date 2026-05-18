import { NextRequest, NextResponse } from "next/server";

// WMO Weather interpretation codes mapping to French descriptions and icons
function getWeatherInfo(code: number): { description: string; icon: string } {
  // Clear sky
  if (code === 0) {
    return { description: "Ciel dégagé", icon: "sun" };
  }
  // Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) {
    if (code === 1) return { description: "Peu nuageux", icon: "sun-cloud" };
    if (code === 2) return { description: "Partiellement couvert", icon: "cloud-sun" };
    return { description: "Couvert", icon: "cloud" };
  }
  // Fog
  if (code === 45 || code === 48) {
    return { description: "Brouillard", icon: "fog" };
  }
  // Drizzle
  if (code >= 51 && code <= 57) {
    return { description: "Bruine", icon: "drizzle" };
  }
  // Rain
  if (code >= 61 && code <= 67) {
    if (code <= 63) return { description: "Pluie légère", icon: "rain-light" };
    return { description: "Pluie", icon: "rain" };
  }
  // Snow
  if (code >= 71 && code <= 77) {
    return { description: "Neige", icon: "snow" };
  }
  // Rain showers
  if (code >= 80 && code <= 82) {
    return { description: "Averses", icon: "rain-shower" };
  }
  // Snow showers
  if (code >= 85 && code <= 86) {
    return { description: "Averses de neige", icon: "snow-shower" };
  }
  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return { description: "Orage", icon: "thunderstorm" };
  }
  // Default
  return { description: "Variable", icon: "cloud" };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude required" },
      { status: 400 }
    );
  }

  try {
    // Open-Meteo API - 100% free, no API key required
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
      { next: { revalidate: 900 } } // Cache for 15 minutes
    );

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const data = await response.json();

    const temp = data.current?.temperature_2m;
    const weatherCode = data.current?.weather_code ?? 0;
    const weatherInfo = getWeatherInfo(weatherCode);

    return NextResponse.json({
      temp: temp ?? 0,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
