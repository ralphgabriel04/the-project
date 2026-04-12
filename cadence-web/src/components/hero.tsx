import { Countdown } from "./countdown";
import { RotatingHint } from "./rotating-hint";
import { WaitlistForm } from "./waitlist-form";

export function Hero({ waitlistCount }: { waitlistCount: number }) {
  return (
    <section className="bg-gradient-mesh bg-noise relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      {/* Content wrapper */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
        {/* Quebec badge */}
        <div className="animate-pop-in delay-500 mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm backdrop-blur-sm">
          <span role="img" aria-label="Drapeau Canada">
            🇨🇦
          </span>
          <span className="text-[var(--text-secondary)]">
            Conçue au Québec, en français
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-slide-up delay-100 mb-3 text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)]">
          Le coaching sportif,
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
            repensé pour ici.
          </span>
        </h1>

        {/* Subtitle — dual audience */}
        <p className="animate-fade-slide-up delay-200 mb-8 max-w-xl text-[clamp(1.125rem,2.5vw,1.375rem)] leading-relaxed text-[var(--text-secondary)]">
          Pour les coachs. Pour leurs athlètes. Pour de vrai.
        </p>

        {/* Rotating hint */}
        <div className="animate-fade-slide-up delay-300 mb-8 w-full">
          <RotatingHint />
        </div>

        {/* Countdown */}
        <div className="animate-fade-slide-up delay-350 mb-10">
          <Countdown />
        </div>

        {/* Waitlist form */}
        <div className="animate-fade-slide-up delay-400 mb-6 flex w-full justify-center">
          <WaitlistForm />
        </div>

        {/* Conditional social proof */}
        {waitlistCount >= 10 && (
          <p className="animate-fade-slide-up delay-500 text-sm text-[var(--text-muted)]">
            {waitlistCount} coachs sont déjà sur la liste
          </p>
        )}
      </div>

      {/* Decorative gradient orb */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
