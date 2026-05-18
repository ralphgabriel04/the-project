"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, Badge, Button } from "@/components/ui";
import { PlayIcon, CheckIcon } from "@heroicons/react/24/outline";

interface SessionLog {
  id: string;
  completed_at: string | null;
  overall_rpe: number | null;
  created_at: string;
}

interface AthleteSessionCardProps {
  session: {
    id: string;
    name: string;
    description: string | null;
    estimated_duration_minutes: number | null;
    exercises: Array<{
      id: string;
      name: string;
    }>;
  };
  index: number;
  recentLogs: SessionLog[];
}

export function AthleteSessionCard({
  session,
  index,
  recentLogs,
}: AthleteSessionCardProps) {
  // Check if session was completed today
  const today = new Date().toISOString().split("T")[0];
  const todayLog = recentLogs.find((log) => {
    const logDate = log.created_at.split("T")[0];
    return logDate === today && log.completed_at !== null;
  });

  const isCompletedToday = !!todayLog;
  const exerciseCount = session.exercises?.length || 0;

  // Count completed this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const completedThisWeek = recentLogs.filter((log) => {
    const logDate = new Date(log.created_at);
    return logDate >= weekStart && log.completed_at !== null;
  }).length;

  return (
    <Card className={isCompletedToday ? "border-emerald-500/30 bg-emerald-900/10" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-sm font-medium">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-white">{session.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                <span>{exerciseCount} exercice{exerciseCount > 1 ? "s" : ""}</span>
                {session.estimated_duration_minutes && (
                  <span>~{session.estimated_duration_minutes} min</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompletedToday && (
              <Badge variant="success">
                <CheckIcon className="h-3 w-3 mr-1" />
                Fait
              </Badge>
            )}
            {completedThisWeek > 0 && !isCompletedToday && (
              <Badge variant="default">
                {completedThisWeek}× cette semaine
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {session.description && (
          <p className="text-sm text-slate-500 mb-4">{session.description}</p>
        )}

        {/* Preview of exercises */}
        {exerciseCount > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              Exercices
            </p>
            <div className="flex flex-wrap gap-2">
              {session.exercises.slice(0, 4).map((exercise) => (
                <span
                  key={exercise.id}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                >
                  {exercise.name}
                </span>
              ))}
              {exerciseCount > 4 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{exerciseCount - 4} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <Link href={`/dashboard/training/${session.id}`}>
          <Button
            className="w-full"
            variant={isCompletedToday ? "secondary" : "default"}
          >
            {isCompletedToday ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Voir la séance
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Commencer
              </>
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}








