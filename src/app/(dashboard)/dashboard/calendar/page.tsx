import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, EmptyState, Badge } from "@/components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Calendrier",
};

interface SessionData {
  id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  estimated_duration_minutes: number | null;
  program: {
    id: string;
    name: string;
  };
}

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the current date
  const today = new Date();
  const weekDays = getWeekDays(today);

  // Get all sessions from assigned programs
  const { data: assignedSessions } = await supabase
    .from("sessions")
    .select(`
      id,
      name,
      description,
      day_of_week,
      estimated_duration_minutes,
      program:programs!inner(id, name)
    `)
    .eq("is_deleted", false)
    .in("program_id",
      supabase
        .from("program_assignments")
        .select("program_id")
        .eq("athlete_id", user.id)
        .eq("is_deleted", false)
    );

  // Try to get sessions from own programs (athlete created) - requires migration 007
  let ownSessions: typeof assignedSessions = [];
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        day_of_week,
        estimated_duration_minutes,
        program:programs!inner(id, name)
      `)
      .eq("is_deleted", false)
      .eq("programs.created_by", user.id)
      .is("programs.coach_id", null);

    if (!error) {
      ownSessions = data;
    }
  } catch {
    // created_by column doesn't exist yet - migration not run
    ownSessions = [];
  }

  const allSessions: SessionData[] = [
    ...(ownSessions || []),
    ...(assignedSessions || []),
  ] as SessionData[];

  // Get completed sessions for this week
  const weekStart = new Date(weekDays[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekDays[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: completedLogs } = await supabase
    .from("session_logs")
    .select("session_id, completed_at, created_at")
    .eq("athlete_id", user.id)
    .not("completed_at", "is", null)
    .gte("created_at", weekStart.toISOString())
    .lte("created_at", weekEnd.toISOString());

  // Map completed sessions by day
  const completedByDay = new Map<number, Set<string>>();
  completedLogs?.forEach((log) => {
    const date = new Date(log.completed_at!);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    if (!completedByDay.has(dayOfWeek)) {
      completedByDay.set(dayOfWeek, new Set());
    }
    completedByDay.get(dayOfWeek)!.add(log.session_id);
  });

  // Group sessions by day of week
  const sessionsByDay: Record<number, SessionData[]> = {};
  for (let i = 1; i <= 7; i++) {
    sessionsByDay[i] = allSessions.filter((s) => s.day_of_week === i);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Calendrier</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Visualisez votre planning d&apos;entraînement de la semaine
        </p>
      </div>

      {/* Week navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <h2 className="text-lg font-semibold text-white">
              {formatWeekRange(weekDays[0], weekDays[6])}
            </h2>
          </div>
        </CardContent>
      </Card>

      {/* Week view - Desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayOfWeek = index + 1; // 1 = Monday
          const isToday = isSameDay(day, today);
          const sessionsForDay = sessionsByDay[dayOfWeek] || [];
          const completedForDay = completedByDay.get(dayOfWeek) || new Set();

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

              {/* Sessions for this day */}
              {sessionsForDay.length > 0 ? (
                <div className="space-y-2">
                  {sessionsForDay.map((session) => {
                    const isCompleted = completedForDay.has(session.id);
                    return (
                      <Link
                        key={session.id}
                        href={`/dashboard/training/${session.id}`}
                        className={`
                          block p-2 rounded-lg text-xs transition-colors
                          ${isCompleted
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : "bg-slate-700/50 hover:bg-slate-700"}
                        `}
                      >
                        <div className="flex items-start gap-1">
                          {isCompleted && (
                            <CheckCircleIcon className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-white font-medium line-clamp-2">
                            {session.name}
                          </span>
                        </div>
                        {session.estimated_duration_minutes && (
                          <p className="text-slate-400 mt-1">
                            {session.estimated_duration_minutes} min
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs mt-8">
                  Repos
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week view - Mobile (list format) */}
      <div className="md:hidden space-y-3">
        {weekDays.map((day, index) => {
          const dayOfWeek = index + 1;
          const isToday = isSameDay(day, today);
          const sessionsForDay = sessionsByDay[dayOfWeek] || [];
          const completedForDay = completedByDay.get(dayOfWeek) || new Set();

          return (
            <Card
              key={index}
              className={isToday ? "border-emerald-500/50" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isToday ? "text-emerald-400" : "text-white"}`}>
                      {formatDayName(day)} {day.getDate()}
                    </span>
                    {isToday && (
                      <Badge variant="success">Aujourd&apos;hui</Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {sessionsForDay.length} séance{sessionsForDay.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {sessionsForDay.length > 0 ? (
                  <div className="space-y-2">
                    {sessionsForDay.map((session) => {
                      const isCompleted = completedForDay.has(session.id);
                      return (
                        <Link
                          key={session.id}
                          href={`/dashboard/training/${session.id}`}
                          className={`
                            flex items-center justify-between p-3 rounded-lg
                            ${isCompleted
                              ? "bg-emerald-500/20 border border-emerald-500/30"
                              : "bg-slate-700/50"}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                            )}
                            <div>
                              <p className="text-white font-medium">{session.name}</p>
                              <p className="text-xs text-slate-400">{session.program.name}</p>
                            </div>
                          </div>
                          {session.estimated_duration_minutes && (
                            <span className="text-xs text-slate-400">
                              {session.estimated_duration_minutes} min
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">
                    Jour de repos
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state if no sessions at all */}
      {allSessions.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon="📅"
              title="Aucune séance planifiée"
              description="Créez un programme avec des séances assignées à des jours de la semaine pour les voir apparaître ici."
              action={{
                label: "Créer un programme",
                href: "/dashboard/programs/new",
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(d);
  monday.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + i);
    return newDate;
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
