"use client";

import { useState } from "react";
import { Button, Card, CardContent, Modal } from "@/components/ui";
import { logReadiness, type ReadinessFormData } from "@/lib/actions/readiness";
import type { ReadinessLog } from "@/types/database";
import { CheckCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ReadinessFormProps {
  existingLog?: ReadinessLog;
}

export function ReadinessCard({ existingLog }: ReadinessFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (existingLog) {
    // Show compact existing readiness score
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <ReadinessGauge score={existingLog.overall_score || 0} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Readiness</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <MetricItem label="Sommeil" value={existingLog.sleep_quality} />
                <MetricItem label="Énergie" value={existingLog.energy_level} />
                <MetricItem label="Courbatures" value={existingLog.muscle_soreness} inverted />
                <MetricItem label="Stress" value={existingLog.stress_level} inverted />
              </div>
            </div>
          </div>
        </CardContent>

        <ReadinessModal
          isOpen={isModalOpen}
          existingLog={existingLog}
          onClose={() => setIsModalOpen(false)}
        />
      </Card>
    );
  }

  // No log yet - show compact prompt
  return (
    <Card className="border-dashed border-slate-600">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium mb-1">Check-in Readiness</p>
            <p className="text-sm text-slate-400 mb-2">Comment te sens-tu ?</p>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Faire mon check-in
            </Button>
          </div>
        </div>
      </CardContent>

      <ReadinessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}

function ReadinessGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-2xl",
  };

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
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getBgColor(score)} flex items-center justify-center flex-shrink-0`}>
      <span className={`font-bold ${getColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function MetricItem({ label, value, inverted = false }: { label: string; value: number | null; inverted?: boolean }) {
  const displayValue = value || 0;
  const getColor = (v: number, inv: boolean) => {
    const effectiveValue = inv ? 11 - v : v;
    if (effectiveValue >= 8) return "text-emerald-400";
    if (effectiveValue >= 6) return "text-yellow-400";
    if (effectiveValue >= 4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${getColor(displayValue, inverted)}`}>{displayValue}</span>
    </div>
  );
}

interface ReadinessModalProps {
  isOpen: boolean;
  existingLog?: ReadinessLog;
  onClose: () => void;
}

function ReadinessModal({ isOpen, existingLog, onClose }: ReadinessModalProps) {
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
        setSuccess(false);
        router.refresh();
      }, 800);
    }

    setIsSubmitting(false);
  };

  const previewScore = calculatePreviewScore(formData);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check-in Readiness" size="md">
      {success ? (
        <div className="py-8 text-center">
          <CheckCircleIcon className="h-14 w-14 text-emerald-400 mx-auto mb-3" />
          <p className="text-white text-lg">Enregistré !</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Score Preview - Compact */}
          <div className="flex items-center justify-center gap-4 py-4 mb-4 bg-slate-700/30 rounded-xl">
            <ReadinessGauge score={previewScore} size="lg" />
            <div>
              <p className="text-2xl font-bold text-white">{previewScore.toFixed(1)}</p>
              <p className="text-sm text-slate-400">Score prévu</p>
            </div>
          </div>

          {/* Compact Metrics - 2 columns */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <CompactSlider
              label="Sommeil"
              emoji="😴"
              value={formData.sleep_quality}
              onChange={(v) => setFormData((f) => ({ ...f, sleep_quality: v }))}
            />
            <CompactSlider
              label="Énergie"
              emoji="⚡"
              value={formData.energy_level}
              onChange={(v) => setFormData((f) => ({ ...f, energy_level: v }))}
            />
            <CompactSlider
              label="Courbatures"
              emoji="💪"
              value={formData.muscle_soreness}
              onChange={(v) => setFormData((f) => ({ ...f, muscle_soreness: v }))}
              inverted
            />
            <CompactSlider
              label="Stress"
              emoji="🧠"
              value={formData.stress_level}
              onChange={(v) => setFormData((f) => ({ ...f, stress_level: v }))}
              inverted
            />
          </div>

          {/* Notes - Compact */}
          <div className="mb-4">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optionnel)..."
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              {isSubmitting ? "..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

interface CompactSliderProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  inverted?: boolean;
}

function CompactSlider({ label, emoji, value, onChange, inverted = false }: CompactSliderProps) {
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
    <div className="bg-slate-700/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white flex items-center gap-1.5">
          <span>{emoji}</span>
          {label}
        </span>
        <span className={`text-sm font-bold ${getTextColor(value, inverted)}`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        style={{
          accentColor: inverted
            ? (value <= 3 ? '#10b981' : value <= 5 ? '#eab308' : value <= 7 ? '#f97316' : '#ef4444')
            : (value >= 8 ? '#10b981' : value >= 6 ? '#eab308' : value >= 4 ? '#f97316' : '#ef4444')
        }}
      />
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
