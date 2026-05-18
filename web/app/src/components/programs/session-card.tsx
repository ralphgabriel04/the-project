"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { useToast } from "@/components/ui";
import { deleteSession } from "@/lib/actions/programs";
import { AddExerciseButton } from "./add-exercise";
import { ExerciseRow } from "./exercise-row";
import { EditSessionButton } from "./edit-session";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Exercise {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  is_deleted: boolean;
}

interface Session {
  id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  estimated_duration_minutes: number | null;
  exercises: Exercise[];
}

interface SessionCardProps {
  session: Session;
  index: number;
  programId?: string;
}

const dayNames = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function SessionCard({ session, index }: SessionCardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const exercises = session.exercises.filter((e) => !e.is_deleted);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette séance et tous ses exercices ?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteSession(session.id);
      if (result.success) {
        addToast({ type: "success", title: "Séance supprimée" });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{session.name}</h3>
                {session.day_of_week && (
                  <Badge variant="default" size="sm">
                    {dayNames[session.day_of_week]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                <span>{exercises.length} exercice(s)</span>
                {session.estimated_duration_minutes && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {session.estimated_duration_minutes} min
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EditSessionButton session={session} />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {session.description && (
            <p className="text-sm text-slate-400 mb-4 pl-12">
              {session.description}
            </p>
          )}

          {/* Exercises */}
          <div className="space-y-2 mb-4">
            {exercises.length === 0 ? (
              <p className="text-sm text-slate-500 pl-12">
                Aucun exercice. Ajoutez-en un pour commencer.
              </p>
            ) : (
              exercises.map((exercise, idx) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  index={idx}
                />
              ))
            )}
          </div>

          {/* Add exercise button */}
          <div className="pl-12">
            <AddExerciseButton sessionId={session.id} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

