"use client";

import { useState } from "react";
import { Button, Modal, Textarea } from "@/components/ui";
import { completeSession } from "@/lib/actions/training";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface CompleteSessionButtonProps {
  sessionLogId: string;
  startTime?: string;
  variant?: "default" | "large";
}

export function CompleteSessionButton({
  sessionLogId,
  startTime,
  variant = "default",
}: CompleteSessionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    if (rpe) formData.set("rpe", rpe.toString());
    if (notes) formData.set("notes", notes);
    
    // Calculate duration if startTime is provided
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const durationMinutes = Math.round((now - start) / 60000);
      formData.set("duration_minutes", durationMinutes.toString());
    }

    const result = await completeSession(sessionLogId, formData);

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsSubmitting(false);
  };

  const rpeLabels: Record<number, string> = {
    1: "Très facile",
    2: "Facile",
    3: "Modéré",
    4: "Assez difficile",
    5: "Difficile",
    6: "Très difficile",
    7: "Dur",
    8: "Très dur",
    9: "Extrêmement dur",
    10: "Maximum",
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={variant === "large" ? "px-8 py-4 text-lg shadow-lg" : ""}
      >
        <CheckIcon className="h-5 w-5 mr-2" />
        Terminer la séance
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Terminer la séance"
      >
        <div className="space-y-6">
          {/* RPE Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Comment s'est passée cette séance ? (RPE global)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRpe(value)}
                  className={`
                    p-3 rounded-lg text-center transition-all
                    ${rpe === value
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }
                  `}
                >
                  <span className="text-lg font-bold">{value}</span>
                </button>
              ))}
            </div>
            {rpe && (
              <p className="mt-2 text-sm text-slate-400 text-center">
                {rpeLabels[rpe]}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes / Commentaires (optionnel)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comment vous êtes-vous senti ? Des difficultés particulières ?"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Validation..." : "Valider 💪"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

