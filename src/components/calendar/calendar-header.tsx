"use client";

import { Button } from "@/components/ui";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { CalendarView } from "./use-calendar";

interface CalendarHeaderProps {
  title: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const viewLabels: Record<CalendarView, string> = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
  year: "Annee",
};

export function CalendarHeader({
  title,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToday}
          className="text-xs"
        >
          Aujourd&apos;hui
        </Button>
        <div className="flex items-center">
          <button
            onClick={onPrevious}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-white ml-2">{title}</h2>
      </div>

      {/* View selector */}
      <div className="flex items-center bg-slate-800 rounded-lg p-1">
        {(["day", "week", "month", "year"] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${view === v
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:text-white"}
            `}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
