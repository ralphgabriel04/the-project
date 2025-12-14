import { Card, CardContent, EmptyState } from "@/components/ui";

export const metadata = {
  title: "Calendrier",
};

export default function CalendarPage() {
  // Get current week days
  const today = new Date();
  const weekDays = getWeekDays(today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Calendrier</h1>
        <p className="text-slate-400 mt-1">
          Visualisez votre planning d&apos;entraînement
        </p>
      </div>

      {/* Week navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              ← Semaine précédente
            </button>
            <h2 className="text-lg font-semibold text-white">
              {formatWeekRange(weekDays[0], weekDays[6])}
            </h2>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              Semaine suivante →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Week view */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={index}
              className={`
                min-h-[200px] rounded-xl border p-3
                ${
                  isToday
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-slate-800/50 border-slate-700"
                }
              `}
            >
              <div className="text-center mb-3">
                <p className="text-xs text-slate-400 uppercase">
                  {formatDayName(day)}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>
              {/* Placeholder for sessions */}
              <div className="text-center text-slate-500 text-xs mt-8">
                Aucune séance
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon notice */}
      <Card>
        <CardContent>
          <EmptyState
            icon="🚧"
            title="Fonctionnalité en cours de développement"
            description="Le calendrier interactif avec drag & drop et synchronisation sera bientôt disponible."
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(date.setDate(diff));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "short" });
}

function formatWeekRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const endStr = end.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

