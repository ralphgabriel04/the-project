"use client";

import Link from "next/link";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { CheckCircleIcon, PlayIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { ExerciseType } from "@/types/database";

interface Session {
  id: string;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  session_type?: ExerciseType;
  program: {
    id: string;
    name: string;
  };
}

interface DayViewProps {
  date: Date;
  sessions: Session[];
  completedSessionIds: Set<string>;
}

const typeStyles: Record<ExerciseType, { bg: string; text: string; label: string }> = {
  strength: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Musculation" },
  cardio: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Cardio" },
  flexibility: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Mobilite" },
};

export function DayView({ date, sessions, completedSessionIds }: DayViewProps) {
  const isToday = isSameDay(date, new Date());

  const completedCount = sessions.filter((s) => completedSessionIds.has(s.id)).length;
  const totalCount = sessions.length;

  return (
    <div className="space-y-4">
      {/* Day Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              {isToday && (
                <Badge variant="success" className="mt-1">Aujourd&apos;hui</Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">
                {completedCount}/{totalCount}
              </p>
              <p className="text-xs text-slate-400">seances terminees</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isCompleted = completedSessionIds.has(session.id);
            const sessionType = (session.session_type || "strength") as ExerciseType;
            const typeStyle = typeStyles[sessionType];

            return (
              <Link key={session.id} href={`/dashboard/training/${session.id}`}>
                <Card className={`
                  transition-colors cursor-pointer
                  ${isCompleted
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "hover:border-slate-600"}
                `}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white truncate">
                            {session.name}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${typeStyle.bg} ${typeStyle.text}`}>
                            {typeStyle.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {session.program.name}
                        </p>
                        {session.description && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                          {session.estimated_duration_minutes && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {session.estimated_duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <PlayIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon="relaxed"
              title="Jour de repos"
              description="Aucune seance prevue pour ce jour."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
