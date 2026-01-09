"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { logReadiness, type ReadinessFormData } from "@/lib/actions/readiness";
import type { ReadinessLog } from "@/types/database";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ReadinessFormProps {
  existingLog?: ReadinessLog;
}

export function ReadinessCard({ existingLog }: ReadinessFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (existingLog) {
    // Show existing readiness score
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Readiness</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ReadinessGauge score={existingLog.overall_score || 0} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
              <MetricItem label="Sommeil" value={existingLog.sleep_quality} icon="moon" />
              <MetricItem label="Énergie" value={existingLog.energy_level} icon="bolt" />
              <MetricItem label="Courbatures" value={existingLog.muscle_soreness} icon="muscle" inverted />
              <MetricItem label="Stress" value={existingLog.stress_level} icon="brain" inverted />
            </div>
          </div>
          {existingLog.notes && (
            <p className="mt-3 text-sm text-slate-400 italic">{existingLog.notes}</p>
          )}
        </CardContent>

        {isModalOpen && (
          <ReadinessModal
            existingLog={existingLog}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Card>
    );
  }

  // No log yet - show prompt
  return (
    <Card className="border-dashed border-slate-600">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-400 mb-4">
          Comment te sens-tu aujourd&apos;hui ?
        </p>
        <Button onClick={() => setIsModalOpen(true)}>
          Faire mon check-in
        </Button>

        {isModalOpen && (
          <ReadinessModal onClose={() => setIsModalOpen(false)} />
        )}
      </CardContent>
    </Card>
  );
}

function ReadinessGauge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const getBgColor = (score: number) => {
    if (score >= 8) return "from-emerald-500/20 to-emerald-600/20";
    if (score >= 6) return "from-yellow-500/20 to-yellow-600/20";
    if (score >= 4) return "from-orange-500/20 to-orange-600/20";
    return "from-red-500/20 to-red-600/20";
  };

  return (
    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getBgColor(score)} flex items-center justify-center`}>
      <span className={`text-2xl font-bold ${getColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function MetricItem({ label, value, icon, inverted = false }: { label: string; value: number | null; icon: string; inverted?: boolean }) {
  const displayValue = value || 0;
  const getColor = (v: number, inv: boolean) => {
    const effectiveValue = inv ? 11 - v : v;
    if (effectiveValue >= 8) return "text-emerald-400";
    if (effectiveValue >= 6) return "text-yellow-400";
    if (effectiveValue >= 4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-400 flex items-center gap-1">
        <MetricIcon name={icon} />
        {label}
      </span>
      <span className={`font-medium ${getColor(displayValue, inverted)}`}>{displayValue}/10</span>
    </div>
  );
}

function MetricIcon({ name }: { name: string }) {
  const iconClass = "w-4 h-4";

  switch (name) {
    case "moon":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "muscle":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "brain":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    default:
      return null;
  }
}

interface ReadinessModalProps {
  existingLog?: ReadinessLog;
  onClose: () => void;
}

function ReadinessModal({ existingLog, onClose }: ReadinessModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ReadinessFormData>({
    sleep_quality: existingLog?.sleep_quality || 7,
    energy_level: existingLog?.energy_level || 7,
    muscle_soreness: existingLog?.muscle_soreness || 3,
    stress_level: existingLog?.stress_level || 3,
    notes: existingLog?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await logReadiness(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1000);
    }

    setIsSubmitting(false);
  };

  // Calculate preview score
  const previewScore = calculatePreviewScore(formData);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Check-in Readiness</h2>
              <p className="text-sm text-slate-400">Comment te sens-tu aujourd&apos;hui ?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-lg">Enregistré !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">
            {/* Score Preview */}
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(previewScore)} flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-3xl font-bold ${getScoreColor(previewScore)}`}>
                    {previewScore.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Score prévu</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4">
              <MetricSlider
                icon="moon"
                label="Qualité du sommeil"
                description="Comment as-tu dormi ?"
                value={formData.sleep_quality}
                onChange={(v) => setFormData((f) => ({ ...f, sleep_quality: v }))}
                lowLabel="Très mauvais"
                highLabel="Excellent"
              />

              <MetricSlider
                icon="bolt"
                label="Niveau d'énergie"
                description="Comment te sens-tu physiquement ?"
                value={formData.energy_level}
                onChange={(v) => setFormData((f) => ({ ...f, energy_level: v }))}
                lowLabel="Épuisé"
                highLabel="Plein d'énergie"
              />

              <MetricSlider
                icon="muscle"
                label="Courbatures musculaires"
                description="As-tu des douleurs musculaires ?"
                value={formData.muscle_soreness}
                onChange={(v) => setFormData((f) => ({ ...f, muscle_soreness: v }))}
                lowLabel="Aucune"
                highLabel="Très douloureuses"
                inverted
              />

              <MetricSlider
                icon="brain"
                label="Niveau de stress"
                description="Comment te sens-tu mentalement ?"
                value={formData.stress_level}
                onChange={(v) => setFormData((f) => ({ ...f, stress_level: v }))}
                lowLabel="Détendu"
                highLabel="Très stressé"
                inverted
              />
            </div>

            {/* Notes */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-white mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ajoute des détails sur ton état du jour..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface MetricSliderProps {
  icon: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  inverted?: boolean;
}

function MetricSlider({ icon, label, description, value, onChange, lowLabel, highLabel, inverted = false }: MetricSliderProps) {
  const getColor = (v: number, inv: boolean) => {
    const effectiveValue = inv ? 11 - v : v;
    if (effectiveValue >= 8) return "bg-emerald-500";
    if (effectiveValue >= 6) return "bg-yellow-500";
    if (effectiveValue >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (v: number, inv: boolean) => {
    const effectiveValue = inv ? 11 - v : v;
    if (effectiveValue >= 8) return "text-emerald-400";
    if (effectiveValue >= 6) return "text-yellow-400";
    if (effectiveValue >= 4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="bg-slate-700/30 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
            <MetricIcon name={icon} />
          </div>
          <div>
            <p className="font-medium text-white">{label}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-white text-sm font-bold ${getColor(value, inverted)}`}>
          {value}/10
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          style={{
            background: `linear-gradient(to right, ${inverted ? '#ef4444' : '#10b981'} 0%, ${inverted ? '#10b981' : '#ef4444'} 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-500">{lowLabel}</span>
          <span className="text-xs text-slate-500">{highLabel}</span>
        </div>
      </div>
    </div>
  );
}

function calculatePreviewScore(data: ReadinessFormData): number {
  const sleepWeight = 0.3;
  const energyWeight = 0.3;
  const sorenessWeight = 0.2;
  const stressWeight = 0.2;

  const invertedSoreness = 11 - data.muscle_soreness;
  const invertedStress = 11 - data.stress_level;

  const score =
    data.sleep_quality * sleepWeight +
    data.energy_level * energyWeight +
    invertedSoreness * sorenessWeight +
    invertedStress * stressWeight;

  return Math.round(score * 100) / 100;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 8) return "from-emerald-500/20 to-emerald-600/20";
  if (score >= 6) return "from-yellow-500/20 to-yellow-600/20";
  if (score >= 4) return "from-orange-500/20 to-orange-600/20";
  return "from-red-500/20 to-red-600/20";
}
