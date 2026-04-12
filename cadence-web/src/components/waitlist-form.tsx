"use client";

import { useState, useTransition, useRef } from "react";
import { z } from "zod";

const emailSchema = z.string().min(1).email();

type FormState = "idle" | "loading" | "success" | "error";

interface FormResponse {
  success?: boolean;
  position?: number;
  referralCode?: string | null;
  error?: string;
  message?: string;
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const referralRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setFormState("error");
      setResponse({ error: "Hmm, vérifie ton adresse courriel." });
      return;
    }

    if (!consent) {
      setFormState("error");
      setResponse({ error: "Tu dois accepter pour t'inscrire." });
      return;
    }

    startTransition(async () => {
      setFormState("loading");
      setResponse(null);

      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            consent,
          }),
        });

        const data: FormResponse = await res.json();

        if (res.ok && data.success) {
          setFormState("success");
          setResponse(data);
          setEmail("");
        } else {
          setFormState("error");
          setResponse(data);
        }
      } catch {
        setFormState("error");
        setResponse({
          error: "Oups, quelque chose a planté. Réessaie dans un instant.",
        });
      }
    });
  };

  const isLoading = formState === "loading" || isPending;

  const handleCopyReferral = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/?ref=${response?.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state
  if (formState === "success" && response?.position) {
    return (
      <div className="w-full max-w-md">
        <div className="animate-pop-in rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-6 text-center">
          <div className="mb-3 text-3xl" aria-hidden="true">✅</div>
          <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
            Tu es sur la liste !
          </h3>
          <p className="mb-4 text-[var(--text-secondary)]">
            On te recontacte quand c&apos;est prêt.
          </p>
          <div className="animate-pulse-glow mb-4 inline-block rounded-lg bg-[var(--bg-secondary)] px-6 py-3">
            <span className="block text-sm text-[var(--text-secondary)]">
              Ta position
            </span>
            <span className="text-3xl font-extrabold text-[var(--accent)]">
              #{response.position}
            </span>
          </div>

          {response.referralCode && (
            <div className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
                Partage ce lien — chaque ami inscrit te fait monter ⬆️
              </p>
              <div className="flex gap-2">
                <input
                  ref={referralRef}
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${response.referralCode}`}
                  className="flex-1 truncate rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formState === "error") setFormState("idle");
            }}
            placeholder="ton@courriel.com"
            disabled={isLoading}
            aria-label="Adresse courriel"
            className="h-14 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:border-[var(--accent)] focus:bg-[var(--bg-elevated)] focus:shadow-[0_0_0_3px_var(--accent-glow)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !email || !consent}
          className="group relative h-14 cursor-pointer overflow-hidden rounded-xl bg-[var(--accent)] px-6 font-semibold text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-[0_0_24px_var(--accent-glow)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:w-auto sm:min-w-[200px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Un instant...</span>
            </span>
          ) : (
            <span>Réserve ma place</span>
          )}
        </button>
      </div>

      {/* LCAP Consent Checkbox — NOT pre-checked */}
      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded border border-white/50 bg-transparent transition-colors checked:border-[var(--accent)] checked:bg-[var(--accent)]"
          aria-required="true"
        />
        <span className="text-sm leading-relaxed text-[var(--text-muted)]">
          J&apos;accepte de recevoir des nouvelles de Cadence par courriel.
          <br />
          <span className="text-xs text-[var(--text-muted)]/70">
            Tu peux te désabonner en tout temps.{" "}
            <a href="/privacy" className="underline hover:text-[var(--accent)]">
              Politique de confidentialité
            </a>
          </span>
        </span>
      </label>

      {/* Error message */}
      {formState === "error" && response?.error && (
        <p className="mt-3 animate-fade-in text-sm text-[var(--error)]" role="alert">
          {response.error}
        </p>
      )}
    </form>
  );
}
