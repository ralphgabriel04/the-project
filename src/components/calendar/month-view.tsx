"use client";

import { WorkoutIndicators } from "./workout-indicator";
import type { CalendarDay } from "./use-calendar";
import type { ExerciseType } from "@/types/database";

interface Session {
  id: string;
  name: string;
  day_of_week: number | null;
  session_type?: ExerciseType;
}

interface MonthViewProps {
  days: CalendarDay[];
  sessionsByDay: Record<number, Session[]>;
  completedByDay: Map<number, Set<string>>;
  onDayClick?: (date: Date) => void;
}

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function MonthView({ days, sessionsByDay, completedByDay, onDayClick }: MonthViewProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-700">
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-slate-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayOfWeek = day.dayOfWeek;
          const sessionsForDay = sessionsByDay[dayOfWeek] || [];
          const completedForDay = completedByDay.get(dayOfWeek) || new Set();

          const sessions = sessionsForDay.map((s) => ({
            id: s.id,
            isCompleted: completedForDay.has(s.id),
            type: (s.session_type || "strength") as ExerciseType,
          }));

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(day.date)}
              className={`
                min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-slate-700/50
                transition-colors text-left
                ${day.isCurrentMonth ? "" : "opacity-40"}
                ${day.isToday
                  ? "bg-emerald-500/10"
                  : "hover:bg-slate-700/50"}
                ${index % 7 === 6 ? "border-r-0" : ""}
                ${index >= days.length - 7 ? "border-b-0" : ""}
              `}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`
                    text-sm font-medium mb-1
                    ${day.isToday
                      ? "w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500 text-white"
                      : day.isCurrentMonth
                        ? "text-white"
                        : "text-slate-500"}
                  `}
                >
                  {day.date.getDate()}
                </span>

                {/* Session indicators */}
                {sessions.length > 0 && (
                  <div className="mt-auto">
                    <WorkoutIndicators sessions={sessions} max={4} />
                    <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                      {sessions.length} seance{sessions.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
