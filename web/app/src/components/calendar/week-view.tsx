"use client";

import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import type { CalendarDay } from "./use-calendar";
import type { ExerciseType } from "@/types/database";

interface Session {
  id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  estimated_duration_minutes: number | null;
  session_type?: ExerciseType;
  program: {
    id: string;
    name: string;
  };
}

interface WeekViewProps {
  days: CalendarDay[];
  sessionsByDay: Record<number, Session[]>;
  completedByDay: Map<number, Set<string>>;
}

const typeColors: Record<ExerciseType, string> = {
  strength: "border-l-emerald-500",
  cardio: "border-l-orange-500",
  flexibility: "border-l-purple-500",
};

export function WeekView({ days, sessionsByDay, completedByDay }: WeekViewProps) {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayOfWeek = day.dayOfWeek;
          const sessionsForDay = sessionsByDay[dayOfWeek] || [];
          const completedForDay = completedByDay.get(dayOfWeek) || new Set();

          return (
            <div
              key={index}
              className={`
                min-h-[200px] rounded-xl border p-3
                ${day.isToday
                  ? "bg-emerald-500/10 border-emerald-500/50"
                  : "bg-slate-800/50 border-slate-700"}
              `}
            >
              <div className="text-center mb-3">
                <p className="text-xs text-slate-400 uppercase">
                  {day.date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-bold ${
                    day.isToday ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {day.date.getDate()}
                </p>
              </div>

              {sessionsForDay.length > 0 ? (
                <div className="space-y-2">
                  {sessionsForDay.map((session) => {
                    const isCompleted = completedForDay.has(session.id);
                    const sessionType = (session.session_type || "strength") as ExerciseType;
                    const borderColor = typeColors[sessionType];

                    return (
                      <Link
                        key={session.id}
                        href={`/dashboard/training/${session.id}`}
                        className={`
                          block p-2 rounded-lg text-xs transition-colors border-l-2
                          ${borderColor}
                          ${isCompleted
                            ? "bg-emerald-500/20"
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

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {days.map((day, index) => {
          const dayOfWeek = day.dayOfWeek;
          const sessionsForDay = sessionsByDay[dayOfWeek] || [];
          const completedForDay = completedByDay.get(dayOfWeek) || new Set();

          return (
            <Card
              key={index}
              className={day.isToday ? "border-emerald-500/50" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${day.isToday ? "text-emerald-400" : "text-white"}`}>
                      {day.date.toLocaleDateString("fr-FR", { weekday: "short" })} {day.date.getDate()}
                    </span>
                    {day.isToday && (
                      <Badge variant="success">Aujourd&apos;hui</Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {sessionsForDay.length} seance{sessionsForDay.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {sessionsForDay.length > 0 ? (
                  <div className="space-y-2">
                    {sessionsForDay.map((session) => {
                      const isCompleted = completedForDay.has(session.id);
                      const sessionType = (session.session_type || "strength") as ExerciseType;
                      const borderColor = typeColors[sessionType];

                      return (
                        <Link
                          key={session.id}
                          href={`/dashboard/training/${session.id}`}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border-l-2
                            ${borderColor}
                            ${isCompleted
                              ? "bg-emerald-500/20"
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
    </>
  );
}
