"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, Button, Input } from "@/components/ui";
import { logExerciseSet } from "@/lib/actions/training";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";

interface ExerciseLog {
  id: string;
  set_number: number;
  weight_kg: number | null;
  reps_completed: number | null;
  rpe: number | null;
}

interface TrainingExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    sets: number | null;
    reps: string | null;
    rest_seconds: number | null;
    tempo: string | null;
    notes: string | null;
  };
  index: number;
  sessionLogId: string;
  exerciseLogs: ExerciseLog[];
  isCompleted: boolean;
}

export function TrainingExerciseCard({
  exercise,
  index,
  sessionLogId,
  exerciseLogs,
  isCompleted,
}: TrainingExerciseCardProps) {
  const [sets, setSets] = useState<ExerciseLog[]>(exerciseLogs);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [newSet, setNewSet] = useState({
    weight: "",
    reps: "",
    rpe: "",
  });

  const targetSets = exercise.sets || 3;
  const completedSets = sets.length;

  const handleAddSet = async () => {
    if (!sessionLogId) return;
    
    setIsAddingSet(true);
    
    const formData = new FormData();
    formData.set("set_number", (completedSets + 1).toString());
    formData.set("weight_kg", newSet.weight);
    formData.set("reps_completed", newSet.reps);
    formData.set("rpe", newSet.rpe);
    
    const result = await logExerciseSet(sessionLogId, exercise.id, formData);
    
    if (result.success && result.data) {
      setSets([
        ...sets,
        {
          id: result.data.id,
          set_number: completedSets + 1,
          weight_kg: newSet.weight ? parseFloat(newSet.weight) : null,
          reps_completed: newSet.reps ? parseInt(newSet.reps) : null,
          rpe: newSet.rpe ? parseInt(newSet.rpe) : null,
        },
      ]);
      setNewSet({ weight: "", reps: "", rpe: "" });
    }
    
    setIsAddingSet(false);
  };

  return (
    <Card className={completedSets >= targetSets ? "border-emerald-500/30" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                {index + 1}
              </span>
              <h3 className="font-semibold text-white">{exercise.name}</h3>
              {completedSets >= targetSets && (
                <CheckIcon className="h-5 w-5 text-emerald-400" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              {exercise.sets && <span>{exercise.sets} séries</span>}
              {exercise.reps && <span>× {exercise.reps} reps</span>}
              {exercise.rest_seconds && <span>⏱️ {exercise.rest_seconds}s repos</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-400">
              {completedSets}/{targetSets}
            </span>
            <p className="text-xs text-slate-500">séries</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {exercise.notes && (
          <p className="text-sm text-slate-500 italic mb-4">
            💡 {exercise.notes}
          </p>
        )}

        {/* Completed sets */}
        {sets.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Séries effectuées
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 px-2">
              <span>Série</span>
              <span>Poids</span>
              <span>Reps</span>
              <span>RPE</span>
            </div>
            {sets.map((set) => (
              <div
                key={set.id}
                className="grid grid-cols-4 gap-2 p-2 bg-slate-700/50 rounded-lg text-sm"
              >
                <span className="text-slate-400">#{set.set_number}</span>
                <span className="text-white font-medium">
                  {set.weight_kg ? `${set.weight_kg}kg` : "-"}
                </span>
                <span className="text-white font-medium">
                  {set.reps_completed ?? "-"}
                </span>
                <span className="text-amber-400">
                  {set.rpe ? `@${set.rpe}` : "-"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add new set */}
        {!isCompleted && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Ajouter une série
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">Poids (kg)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={newSet.weight}
                  onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Reps</label>
                <Input
                  type="number"
                  value={newSet.reps}
                  onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">RPE (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newSet.rpe}
                  onChange={(e) => setNewSet({ ...newSet, rpe: e.target.value })}
                  placeholder="7"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleAddSet}
              disabled={isAddingSet || (!newSet.weight && !newSet.reps)}
              className="w-full"
              variant={completedSets >= targetSets ? "secondary" : "default"}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {isAddingSet ? "Enregistrement..." : `Ajouter série ${completedSets + 1}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

