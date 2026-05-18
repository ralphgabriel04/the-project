"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { sendCoachMessage } from "@/lib/actions/quotes";
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface SendMotivationModalProps {
  athleteId: string;
  athleteName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SendMotivationModal({
  athleteId,
  athleteName,
  isOpen,
  onClose,
}: SendMotivationModalProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await sendCoachMessage(
      athleteId,
      content,
      undefined, // display_date = today
      expiresAt || undefined
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setContent("");
        setExpiresAt("");
        setSuccess(false);
        router.refresh();
      }, 1500);
    } else {
      setError(result.error || "Erreur lors de l'envoi");
    }

    setIsSubmitting(false);
  };

  const quickMessages = [
    "Tu es sur la bonne voie, continue comme ca !",
    "Chaque entrainement te rapproche de ton objectif.",
    "La constance est la cle du succes. Bravo pour ta regularite !",
    "Tu es plus fort que tu ne le penses. Depasse-toi aujourd'hui !",
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Envoyer un message</h2>
              <p className="text-sm text-slate-400">a {athleteName}</p>
            </div>
          </div>
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
            <p className="text-white text-lg">Message envoye !</p>
            <p className="text-slate-400 text-sm mt-1">
              {athleteName} le verra sur son tableau de bord
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Quick message suggestions */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Suggestions rapides:</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setContent(msg)}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  >
                    {msg.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Message content */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Votre message motivant
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ecrivez un message personnel pour motiver votre athlete..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={4}
                required
              />
            </div>

            {/* Expiration date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Date d&apos;expiration (optionnel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Le message sera visible jusqu&apos;a cette date
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
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
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
