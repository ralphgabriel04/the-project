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
              <MetricItem label="Sommeil" value={existingLog.sleep_quality} />
              <MetricItem label="Energie" value={existingLog.energy_level} />
              <MetricItem label="Courbatures" value={existingLog.muscle_soreness} inverted />
              <MetricItem label="Stress" value={existingLog.stress_level} inverted />
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
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={getColor(displayValue, inverted)}>{displayValue}/10</span>
    </div>
  );
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Check-in Readiness</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-lg">Enregistre !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <SliderField
              label="Qualite du sommeil"
              description="1 = Tres mauvais, 10 = Excellent"
              value={formData.sleep_quality}
              onChange={(v) => setFormData((f) => ({ ...f, sleep_quality: v }))}
            />

            <SliderField
              label="Niveau d'energie"
              description="1 = Epuise, 10 = Plein d'energie"
              value={formData.energy_level}
              onChange={(v) => setFormData((f) => ({ ...f, energy_level: v }))}
            />

            <SliderField
              label="Courbatures musculaires"
              description="1 = Aucune, 10 = Tres douloureuses"
              value={formData.muscle_soreness}
              onChange={(v) => setFormData((f) => ({ ...f, muscle_soreness: v }))}
              inverted
            />

            <SliderField
              label="Niveau de stress"
              description="1 = Detendu, 10 = Tres stresse"
              value={formData.stress_level}
              onChange={(v) => setFormData((f) => ({ ...f, stress_level: v }))}
              inverted
            />

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Comment te sens-tu aujourd'hui ?"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>

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
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  inverted?: boolean;
}

function SliderField({ label, description, value, onChange, inverted = false }: SliderFieldProps) {
  const getColor = (v: number, inv: boolean) => {
    const effectiveValue = inv ? 11 - v : v;
    if (effectiveValue >= 8) return "bg-emerald-500";
    if (effectiveValue >= 6) return "bg-yellow-500";
    if (effectiveValue >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className={`px-2 py-1 rounded text-white text-sm ${getColor(value, inverted)}`}>
          {value}/10
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2">{description}</p>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
