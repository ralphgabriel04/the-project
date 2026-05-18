"use client";

interface YearViewProps {
  year: number;
  workoutCountsByMonth: Record<number, number>; // Month (0-11) -> count
  onMonthClick?: (month: number) => void;
}

const monthNames = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
];

export function YearView({ year, workoutCountsByMonth, onMonthClick }: YearViewProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
      {monthNames.map((monthName, monthIndex) => {
        const count = workoutCountsByMonth[monthIndex] || 0;
        const isCurrentMonth = year === currentYear && monthIndex === currentMonth;
        const isPast = year < currentYear || (year === currentYear && monthIndex < currentMonth);

        return (
          <button
            key={monthIndex}
            onClick={() => onMonthClick?.(monthIndex)}
            className={`
              p-4 rounded-xl border transition-all text-left
              ${isCurrentMonth
                ? "bg-emerald-500/10 border-emerald-500/50"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"}
            `}
          >
            <div className="flex flex-col">
              <span className={`
                text-sm font-medium mb-2
                ${isCurrentMonth ? "text-emerald-400" : "text-white"}
              `}>
                {monthName}
              </span>

              {/* Mini calendar grid representation */}
              <MiniMonthGrid
                year={year}
                month={monthIndex}
                workoutCount={count}
              />

              {/* Stats */}
              <div className="mt-2 pt-2 border-t border-slate-700/50">
                <span className={`
                  text-lg font-bold
                  ${count > 0 ? "text-emerald-400" : isPast ? "text-slate-500" : "text-slate-400"}
                `}>
                  {count}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  seance{count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface MiniMonthGridProps {
  year: number;
  month: number;
  workoutCount: number;
}

function MiniMonthGrid({ year, month, workoutCount }: MiniMonthGridProps) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  // Day of week of first day (0-6, Sunday-Saturday)
  let startDayOfWeek = firstDay.getDay();
  // Convert to Monday-based (0-6)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const totalDays = lastDay.getDate();
  const weeks = Math.ceil((startDayOfWeek + totalDays) / 7);

  // Generate intensity based on workout count (more workouts = more intense display)
  const intensity = Math.min(workoutCount / 20, 1); // Cap at 20 workouts

  return (
    <div className="grid grid-cols-7 gap-px">
      {Array.from({ length: weeks * 7 }, (_, i) => {
        const dayNum = i - startDayOfWeek + 1;
        const isValidDay = dayNum >= 1 && dayNum <= totalDays;
        const isToday = isValidDay &&
          year === today.getFullYear() &&
          month === today.getMonth() &&
          dayNum === today.getDate();

        // Simulate workout days (spread evenly based on count)
        const hasWorkout = isValidDay && workoutCount > 0 &&
          Math.random() < (workoutCount / totalDays);

        return (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-sm
              ${!isValidDay
                ? "bg-transparent"
                : isToday
                  ? "bg-emerald-500"
                  : hasWorkout
                    ? `bg-emerald-500/50`
                    : "bg-slate-700/50"}
            `}
          />
        );
      })}
    </div>
  );
}
