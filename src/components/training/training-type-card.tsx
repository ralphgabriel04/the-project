"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ExerciseType } from "@/types/database";

interface TrainingTypeCardProps {
  type: ExerciseType;
  sessionCount: number;
  completedCount?: number;
}

const typeConfig: Record<
  ExerciseType,
  { label: string; icon: string; gradient: string; iconBg: string }
> = {
  flexibility: {
    label: "Mobilite",
    icon: "yoga",
    gradient: "from-purple-500/20 to-purple-600/20",
    iconBg: "bg-purple-500/30",
  },
  cardio: {
    label: "Course a pied",
    icon: "running",
    gradient: "from-orange-500/20 to-orange-600/20",
    iconBg: "bg-orange-500/30",
  },
  strength: {
    label: "Musculation",
    icon: "dumbbell",
    gradient: "from-emerald-500/20 to-emerald-600/20",
    iconBg: "bg-emerald-500/30",
  },
};

function TypeIcon({ type }: { type: ExerciseType }) {
  const iconClass = "w-8 h-8";

  switch (type) {
    case "flexibility":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-3.5 0-6 2-6 4.5s2.5 4 6 4c3.5 0 6-1.5 6-4s-2.5-4.5-6-4.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9v6c0 2.5 2.5 4.5 6 4.5s6-2 6-4.5V9" />
          <circle cx="12" cy="3" r="1.5" fill="currentColor" />
        </svg>
      );
    case "cardio":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="5" r="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v3l-2 4-3 1M12 10l2 4 3 1M12 10v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-2 5M17 16l2 5" />
        </svg>
      );
    case "strength":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="2" y="9" width="3" height="6" rx="1" />
          <rect x="19" y="9" width="3" height="6" rx="1" />
          <rect x="5" y="7" width="3" height="10" rx="1" />
          <rect x="16" y="7" width="3" height="10" rx="1" />
          <line x1="8" y1="12" x2="16" y2="12" strokeWidth={2} />
        </svg>
      );
  }
}

export function TrainingTypeCard({
  type,
  sessionCount,
  completedCount = 0,
}: TrainingTypeCardProps) {
  const config = typeConfig[type];
  const hasRemaining = sessionCount > completedCount;

  if (sessionCount === 0) {
    return null;
  }

  return (
    <Link href={`/dashboard/workout?type=${type}`}>
      <div
        className={`
          relative p-4 rounded-xl border border-slate-700
          bg-gradient-to-br ${config.gradient}
          hover:border-slate-500 transition-all cursor-pointer
          group
        `}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div
            className={`
              w-14 h-14 rounded-full ${config.iconBg}
              flex items-center justify-center mb-3
              text-white
            `}
          >
            <TypeIcon type={type} />
          </div>

          {/* Label */}
          <h3 className="font-semibold text-white text-sm mb-1">
            {config.label}
          </h3>

          {/* Count */}
          <p className="text-xs text-slate-400">
            {completedCount > 0 ? (
              <>
                {completedCount}/{sessionCount} termine
                {completedCount > 1 ? "s" : ""}
              </>
            ) : (
              <>
                {sessionCount} seance{sessionCount > 1 ? "s" : ""}
              </>
            )}
          </p>

          {/* Arrow indicator */}
          {hasRemaining && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Completion indicator */}
          {completedCount === sessionCount && sessionCount > 0 && (
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
