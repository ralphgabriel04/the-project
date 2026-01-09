"use client";

import { Card, CardContent, CardHeader } from "@/components/ui";
import { TrainingTypeCard } from "./training-type-card";
import type { ExerciseType } from "@/types/database";

interface SessionTypeCount {
  type: ExerciseType;
  total: number;
  completed: number;
}

interface TrainingTypeSelectorProps {
  sessionCounts: SessionTypeCount[];
  title?: string;
}

export function TrainingTypeSelector({
  sessionCounts,
  title = "Entrainements du jour",
}: TrainingTypeSelectorProps) {
  // Order types consistently: flexibility, cardio, strength
  const orderedTypes: ExerciseType[] = ["flexibility", "cardio", "strength"];

  // Filter to only show types with sessions
  const typesWithSessions = orderedTypes
    .map((type) => {
      const count = sessionCounts.find((c) => c.type === type);
      return {
        type,
        total: count?.total || 0,
        completed: count?.completed || 0,
      };
    })
    .filter((c) => c.total > 0);

  if (typesWithSessions.length === 0) {
    return null;
  }

  const totalSessions = typesWithSessions.reduce((sum, c) => sum + c.total, 0);
  const completedSessions = typesWithSessions.reduce((sum, c) => sum + c.completed, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {totalSessions > 0 && (
            <span className="text-sm text-slate-400">
              {completedSessions}/{totalSessions} termine
              {completedSessions !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {typesWithSessions.map(({ type, total, completed }) => (
            <TrainingTypeCard
              key={type}
              type={type}
              sessionCount={total}
              completedCount={completed}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
