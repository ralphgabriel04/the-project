"use client";

import type { ExerciseType } from "@/types/database";

export type IndicatorStatus = "completed" | "planned" | "scheduled" | "none";

interface WorkoutIndicatorProps {
  status: IndicatorStatus;
  type?: ExerciseType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const typeColors: Record<ExerciseType, string> = {
  strength: "bg-emerald-500",
  cardio: "bg-orange-500",
  flexibility: "bg-purple-500",
};

const statusStyles: Record<IndicatorStatus, string> = {
  completed: "bg-emerald-500",
  planned: "border-2 border-slate-400",
  scheduled: "border-2 border-dashed border-slate-500",
  none: "",
};

export function WorkoutIndicator({
  status,
  type,
  size = "sm",
  showLabel = false,
}: WorkoutIndicatorProps) {
  if (status === "none") return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const color = status === "completed" && type ? typeColors[type] : statusStyles[status];

  return (
    <div className="flex items-center gap-1">
      <span
        className={`
          rounded-full inline-block
          ${sizeClasses[size]}
          ${color}
          ${status === "completed" ? "" : "bg-transparent"}
        `}
      />
      {showLabel && (
        <span className="text-xs text-slate-400">
          {status === "completed" ? "Fait" : status === "planned" ? "Prevu" : "Planifie"}
        </span>
      )}
    </div>
  );
}

interface WorkoutIndicatorsProps {
  sessions: Array<{
    id: string;
    isCompleted: boolean;
    type?: ExerciseType;
  }>;
  max?: number;
}

export function WorkoutIndicators({ sessions, max = 3 }: WorkoutIndicatorsProps) {
  const displayed = sessions.slice(0, max);
  const remaining = sessions.length - max;

  return (
    <div className="flex items-center gap-1">
      {displayed.map((session) => (
        <WorkoutIndicator
          key={session.id}
          status={session.isCompleted ? "completed" : "planned"}
          type={session.type}
          size="sm"
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-slate-500">+{remaining}</span>
      )}
    </div>
  );
}
