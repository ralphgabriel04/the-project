"use client";

import { CalendarHeader } from "./calendar-header";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { YearView } from "./year-view";
import { useCalendar, type CalendarView as CalendarViewType } from "./use-calendar";
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

interface CalendarViewProps {
  sessions: Session[];
  completedSessionIds: Set<string>;
  completedByDay: Map<number, Set<string>>;
  initialView?: CalendarViewType;
  workoutCountsByMonth?: Record<number, number>;
}

export function CalendarView({
  sessions,
  completedSessionIds,
  completedByDay,
  initialView = "week",
  workoutCountsByMonth = {},
}: CalendarViewProps) {
  const calendar = useCalendar();

  // Group sessions by day of week
  const sessionsByDay: Record<number, Session[]> = {};
  for (let i = 1; i <= 7; i++) {
    sessionsByDay[i] = sessions.filter((s) => s.day_of_week === i);
  }

  // Get sessions for current day (for day view)
  const currentDayOfWeek = calendar.currentDate.getDay() === 0 ? 7 : calendar.currentDate.getDay();
  const sessionsForCurrentDay = sessionsByDay[currentDayOfWeek] || [];

  const handleDayClick = (date: Date) => {
    calendar.goToDate(date);
    calendar.setView("day");
  };

  const handleMonthClick = (month: number) => {
    const newDate = new Date(calendar.currentDate);
    newDate.setMonth(month);
    calendar.goToDate(newDate);
    calendar.setView("month");
  };

  return (
    <div className="space-y-4">
      <CalendarHeader
        title={calendar.getTitle()}
        view={calendar.view}
        onViewChange={calendar.setView}
        onPrevious={calendar.goToPrevious}
        onNext={calendar.goToNext}
        onToday={calendar.goToToday}
      />

      {calendar.view === "day" && (
        <DayView
          date={calendar.currentDate}
          sessions={sessionsForCurrentDay}
          completedSessionIds={completedSessionIds}
        />
      )}

      {calendar.view === "week" && (
        <WeekView
          days={calendar.getWeekDays()}
          sessionsByDay={sessionsByDay}
          completedByDay={completedByDay}
        />
      )}

      {calendar.view === "month" && (
        <MonthView
          days={calendar.getDaysForMonth()}
          sessionsByDay={sessionsByDay}
          completedByDay={completedByDay}
          onDayClick={handleDayClick}
        />
      )}

      {calendar.view === "year" && (
        <YearView
          year={calendar.currentDate.getFullYear()}
          workoutCountsByMonth={workoutCountsByMonth}
          onMonthClick={handleMonthClick}
        />
      )}
    </div>
  );
}
