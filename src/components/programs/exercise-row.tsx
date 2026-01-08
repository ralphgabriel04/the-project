"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui";
import { deleteExercise } from "@/lib/actions/programs";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Exercise {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
}

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
}

export function ExerciseRow({ exercise, index }: ExerciseRowProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteExercise(exercise.id);
      if (result.success) {
        addToast({ type: "success", title: "Exercice supprimé" });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-2 px-3 bg-slate-700/30 rounded-lg ml-12 group">
      <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {exercise.name}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        {exercise.sets && (
          <span>
            <span className="text-white">{exercise.sets}</span> séries
          </span>
        )}
        {exercise.reps && (
          <span>
            <span className="text-white">{exercise.reps}</span> reps
          </span>
        )}
        {exercise.rest_seconds && (
          <span>
            <span className="text-white">{exercise.rest_seconds}</span>s repos
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}








