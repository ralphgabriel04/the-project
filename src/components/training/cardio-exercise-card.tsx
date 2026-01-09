"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, Button, Input, Badge, useToast } from "@/components/ui";
import { logCardioExercise } from "@/lib/actions/training";
import { CheckIcon, HeartIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { IntensityLevel } from "@/types/database";

interface ExerciseLog {
  id: string;
  distance_km: number | null;
  duration_minutes: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  pace_per_km_seconds: number | null;
}

interface LastPerformance {
  distance_km?: number | null;
  duration_minutes?: number | null;
  heart_rate_avg?: number | null;
  pace_per_km_seconds?: number | null;
}

interface CardioExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    description: string | null;
    target_distance_km: number | null;
    target_duration_minutes: number | null;
    target_heart_rate: number | null;
    intensity: IntensityLevel | null;
    notes: string | null;
  };
  index: number;
  sessionLogId: string;
  exerciseLog: ExerciseLog | null;
  lastPerformance: LastPerformance | null;
  isCompleted: boolean;
}

const intensityLabels: Record<IntensityLevel, { label: string; color: string }> = {
  easy: { label: "Facile", color: "text-emerald-400" },
  moderate: { label: "Modere", color: "text-yellow-400" },
  hard: { label: "Difficile", color: "text-orange-400" },
  very_hard: { label: "Tres difficile", color: "text-red-400" },
};

function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}/km`;
}

export function CardioExerciseCard({
  exercise,
  index,
  sessionLogId,
  exerciseLog,
  lastPerformance,
  isCompleted: sessionCompleted,
}: CardioExerciseCardProps) {
  const { addToast } = useToast();
  const [currentLog, setCurrentLog] = useState<ExerciseLog | null>(exerciseLog);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    distance: exerciseLog?.distance_km?.toString() || "",
    duration: exerciseLog?.duration_minutes?.toString() || "",
    heartRateAvg: exerciseLog?.heart_rate_avg?.toString() || "",
    heartRateMax: exerciseLog?.heart_rate_max?.toString() || "",
    notes: "",
  });

  const isLogged = currentLog !== null;
  const intensity = exercise.intensity ? intensityLabels[exercise.intensity] : null;

  const handleSubmit = async () => {
    if (!sessionLogId) {
      setError("Session non trouvee");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const form = new FormData();
    form.set("distance_km", formData.distance);
    form.set("duration_minutes", formData.duration);
    form.set("heart_rate_avg", formData.heartRateAvg);
    form.set("heart_rate_max", formData.heartRateMax);
    form.set("notes", formData.notes);

    const result = await logCardioExercise(sessionLogId, exercise.id, form);

    if (result.success && result.data) {
      setCurrentLog({
        id: result.data.id,
        distance_km: formData.distance ? parseFloat(formData.distance) : null,
        duration_minutes: formData.duration ? parseInt(formData.duration) : null,
        heart_rate_avg: formData.heartRateAvg ? parseInt(formData.heartRateAvg) : null,
        heart_rate_max: formData.heartRateMax ? parseInt(formData.heartRateMax) : null,
        pace_per_km_seconds: formData.distance && formData.duration
          ? Math.round((parseInt(formData.duration) * 60) / parseFloat(formData.distance))
          : null,
      });
      addToast({ type: "success", title: "Exercice enregistre" });
    } else {
      setError(result.error || "Erreur lors de l'enregistrement");
      addToast({ type: "error", title: "Erreur", message: result.error });
    }

    setIsSubmitting(false);
  };

  return (
    <Card className={isLogged ? "border-emerald-500/30" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded flex-shrink-0">
                {index + 1}
              </span>
              <h3 className="font-semibold text-white text-sm sm:text-base">{exercise.name}</h3>
              <Badge variant="warning" size="sm">Cardio</Badge>
              {isLogged && <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-400 flex-wrap">
              {exercise.target_duration_minutes && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {exercise.target_duration_minutes} min
                </span>
              )}
              {intensity && (
                <span className={intensity.color}>
                  Intensite : {intensity.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {exercise.description && (
          <p className="text-sm text-slate-500 italic mb-4">
            {exercise.description}
          </p>
        )}

        {/* Target Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {exercise.target_distance_km && (
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Distance cible</p>
              <p className="text-lg font-bold text-white">{exercise.target_distance_km} km</p>
            </div>
          )}
          {exercise.target_heart_rate && (
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">FC cible</p>
              <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
                <HeartIcon className="h-4 w-4 text-red-400" />
                {exercise.target_heart_rate}
              </p>
            </div>
          )}
          {lastPerformance?.distance_km && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-400 mb-1">Derniere</p>
              <p className="text-lg font-bold text-emerald-400">{lastPerformance.distance_km} km</p>
              {lastPerformance.pace_per_km_seconds && (
                <p className="text-xs text-slate-400">{formatPace(lastPerformance.pace_per_km_seconds)}</p>
              )}
            </div>
          )}
        </div>

        {exercise.notes && (
          <p className="text-sm text-slate-500 italic mb-4">
            {exercise.notes}
          </p>
        )}

        {/* Logged Performance */}
        {isLogged && currentLog && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-xs text-emerald-400 uppercase tracking-wide mb-2">Performance enregistree</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {currentLog.distance_km && (
                <div>
                  <span className="text-slate-400">Distance:</span>
                  <span className="ml-1 text-white font-medium">{currentLog.distance_km} km</span>
                </div>
              )}
              {currentLog.duration_minutes && (
                <div>
                  <span className="text-slate-400">Duree:</span>
                  <span className="ml-1 text-white font-medium">{currentLog.duration_minutes} min</span>
                </div>
              )}
              {currentLog.heart_rate_avg && (
                <div>
                  <span className="text-slate-400">FC moy:</span>
                  <span className="ml-1 text-white font-medium">{currentLog.heart_rate_avg} bpm</span>
                </div>
              )}
              {currentLog.pace_per_km_seconds && (
                <div>
                  <span className="text-slate-400">Allure:</span>
                  <span className="ml-1 text-white font-medium">{formatPace(currentLog.pace_per_km_seconds)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Log Form */}
        {!sessionCompleted && !isLogged && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Enregistrer votre performance
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Distance (km)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder={exercise.target_distance_km?.toString() || "0"}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Duree (min)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={exercise.target_duration_minutes?.toString() || "0"}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">FC moyenne</label>
                <Input
                  type="number"
                  value={formData.heartRateAvg}
                  onChange={(e) => setFormData({ ...formData, heartRateAvg: e.target.value })}
                  placeholder={exercise.target_heart_rate?.toString() || "bpm"}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">FC max</label>
                <Input
                  type="number"
                  value={formData.heartRateMax}
                  onChange={(e) => setFormData({ ...formData, heartRateMax: e.target.value })}
                  placeholder="bpm"
                  className="mt-1"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!formData.distance && !formData.duration)}
              className="w-full"
            >
              {isSubmitting ? "..." : "Enregistrer"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
