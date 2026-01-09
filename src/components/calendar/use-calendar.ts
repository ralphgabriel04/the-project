"use client";

import { useState, useCallback, useMemo } from "react";

export type CalendarView = "day" | "week" | "month" | "year";

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
}

export interface UseCalendarReturn {
  currentDate: Date;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  getTitle: () => string;
  getDaysForMonth: () => CalendarDay[];
  getWeekDays: () => CalendarDay[];
}

export function useCalendar(initialDate?: Date): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [view, setView] = useState<CalendarView>("week");

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (view) {
        case "day":
          newDate.setDate(newDate.getDate() + 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() + 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case "year":
          newDate.setFullYear(newDate.getFullYear() + 1);
          break;
      }
      return newDate;
    });
  }, [view]);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (view) {
        case "day":
          newDate.setDate(newDate.getDate() - 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() - 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case "year":
          newDate.setFullYear(newDate.getFullYear() - 1);
          break;
      }
      return newDate;
    });
  }, [view]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const getTitle = useCallback(() => {
    const months = [
      "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
    ];
    const weekdays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

    switch (view) {
      case "day":
        return `${weekdays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case "week": {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.getDate()} - ${weekEnd.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
        }
        return `${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
      }
      case "month":
        return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case "year":
        return `${currentDate.getFullYear()}`;
    }
  }, [currentDate, view]);

  const getDaysForMonth = useMemo(() => {
    return () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const today = new Date();

      // First day of month
      const firstDay = new Date(year, month, 1);
      // Last day of month
      const lastDay = new Date(year, month + 1, 0);

      // Day of week of first day (0-6, Sunday-Saturday)
      let startDayOfWeek = firstDay.getDay();
      // Convert to Monday-based (1-7)
      startDayOfWeek = startDayOfWeek === 0 ? 7 : startDayOfWeek;

      const days: CalendarDay[] = [];

      // Add days from previous month
      const prevMonthLastDay = new Date(year, month, 0);
      for (let i = startDayOfWeek - 1; i > 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i + 1);
        days.push({
          date,
          isToday: isSameDay(date, today),
          isCurrentMonth: false,
          dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
        });
      }

      // Add days from current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        days.push({
          date,
          isToday: isSameDay(date, today),
          isCurrentMonth: true,
          dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
        });
      }

      // Add days from next month to complete the grid (6 rows x 7 days = 42)
      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
          date,
          isToday: isSameDay(date, today),
          isCurrentMonth: false,
          dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
        });
      }

      return days;
    };
  }, [currentDate]);

  const getWeekDays = useMemo(() => {
    return () => {
      const weekStart = getWeekStart(currentDate);
      const today = new Date();
      const days: CalendarDay[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        days.push({
          date,
          isToday: isSameDay(date, today),
          isCurrentMonth: date.getMonth() === currentDate.getMonth(),
          dayOfWeek: i + 1, // 1-7 (Monday-Sunday)
        });
      }

      return days;
    };
  }, [currentDate]);

  return {
    currentDate,
    view,
    setView,
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
    getTitle,
    getDaysForMonth,
    getWeekDays,
  };
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export { getWeekStart, isSameDay };
