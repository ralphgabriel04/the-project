# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Cadence landing page from a multi-section feature-showcase into a single-screen teasing page with countdown, rotating hints, and waitlist form.

**Architecture:** Delete 5 components (ValueProps, SocialProof, FAQ, CTAFinal, StickyCTA), create 2 new client components (Countdown, RotatingHint), rewrite Hero to integrate everything in one viewport, simplify Footer to a single line, fix checkbox visibility.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, React 19 (useEffect, useState)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/countdown.tsx` | CREATE | Live countdown to Jan 1 2027 |
| `src/components/rotating-hint.tsx` | CREATE | Cycling teaser phrases with fade |
| `src/components/hero.tsx` | REWRITE | Single-screen hero integrating all elements |
| `src/components/waitlist-form.tsx` | MODIFY | Fix checkbox visibility, remove sticky variant |
| `src/components/footer.tsx` | REWRITE | Single-line minimal footer |
| `src/app/page.tsx` | MODIFY | Remove deleted component imports |
| `src/app/globals.css` | MODIFY | Add fade transition utility |
| `src/components/value-props.tsx` | DELETE | Feature showcase not for teasing |
| `src/components/social-proof.tsx` | DELETE | Logic moved into hero |
| `src/components/faq.tsx` | DELETE | Too detailed for teasing |
| `src/components/cta-final.tsx` | DELETE | Redundant second CTA |
| `src/components/sticky-cta.tsx` | DELETE | Not needed on single-screen |

---

### Task 1: Create Countdown Component

**Files:**
- Create: `src/components/countdown.tsx`

- [ ] **Step 1: Create the countdown component**

```tsx
"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2027-01-01T05:00:00Z"); // Midnight EST

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isExpired && mounted) {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-[var(--accent)]">
          C&apos;est le moment!
        </p>
      </div>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: "jours" },
    { value: timeLeft.hours, label: "heures" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="text-center">
      <div className="mb-3 flex justify-center gap-3">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="flex min-w-[4rem] flex-col items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 sm:min-w-[5rem]"
          >
            <span className="text-2xl font-extrabold tabular-nums text-[var(--accent)] sm:text-4xl">
              {mounted ? String(block.value).padStart(2, "0") : "--"}
            </span>
            <span className="mt-1 text-xs uppercase text-[var(--text-muted)]">
              {block.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        avant l&apos;acces early-access
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (component not imported yet, but should compile without errors)

- [ ] **Step 3: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/components/countdown.tsx
git commit -m "feat: add countdown component targeting Jan 1 2027"
```

---

### Task 2: Create RotatingHint Component

**Files:**
- Create: `src/components/rotating-hint.tsx`

- [ ] **Step 1: Create the rotating hint component**

```tsx
"use client";

import { useEffect, useState } from "react";

const HINTS = [
  "Tes athletes vont enfin voir leur progression.",
  "Fini les programmes sur screenshot.",
  "Le lien coach-athlete, simplifie.",
  "Ton gym dans ta poche. Pour vrai.",
  "Tes athletes meritent mieux qu\u0027un Google Sheet.",
];

const CYCLE_MS = 4000;
const FADE_MS = 300;

export function RotatingHint() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % HINTS.length);
        setVisible(true);
      }, FADE_MS);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-8 items-center justify-center">
      <p
        className="text-center text-lg italic text-[var(--text-secondary)] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        &laquo;&nbsp;{HINTS[index]}&nbsp;&raquo;
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/components/rotating-hint.tsx
git commit -m "feat: add rotating hint component with fade transition"
```

---

### Task 3: Fix WaitlistForm Checkbox Visibility

**Files:**
- Modify: `src/components/waitlist-form.tsx:200-206`

- [ ] **Step 1: Update checkbox styles and remove sticky variant**

In `src/components/waitlist-form.tsx`, make these changes:

**Change 1 — Remove `location` prop and sticky variant.** Replace the component signature and remove the sticky rendering block:

Replace:
```tsx
export function WaitlistForm({ location = "hero" }: { location?: "hero" | "bottom" | "sticky" }) {
```
With:
```tsx
export function WaitlistForm() {
```

**Change 2 — Remove the consent bypass for sticky.** In the handleSubmit function, replace:
```tsx
    if (!consent && location !== "sticky") {
```
With:
```tsx
    if (!consent) {
```

**Change 3 — Remove the consent override in body.** Replace:
```tsx
            consent: location === "sticky" ? true : consent,
```
With:
```tsx
            consent,
```

**Change 4 — Remove the entire sticky rendering block.** Delete lines 136-159 (the `if (location === "sticky")` block that returns the compact form).

**Change 5 — Fix the checkbox styling.** Replace:
```tsx
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-colors checked:border-[var(--accent)] checked:bg-[var(--accent)]"
```
With:
```tsx
          className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded border-2 border-white/50 bg-transparent transition-colors checked:border-[var(--accent)] checked:bg-[var(--accent)]"
```

- [ ] **Step 2: Verify it compiles**

Run: `cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web && npx next build --no-lint 2>&1 | tail -10`
Expected: May have errors from sticky-cta.tsx importing with location="sticky" — that's OK, we delete it in Task 6.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/components/waitlist-form.tsx
git commit -m "fix: make LCAP checkbox visible with white border, remove sticky variant"
```

---

### Task 4: Rewrite Hero Component

**Files:**
- Rewrite: `src/components/hero.tsx`

- [ ] **Step 1: Rewrite hero.tsx with all new elements**

Replace the entire content of `src/components/hero.tsx` with:

```tsx
import { WaitlistForm } from "./waitlist-form";
import { Countdown } from "./countdown";
import { RotatingHint } from "./rotating-hint";

interface HeroProps {
  waitlistCount: number;
}

export function Hero({ waitlistCount }: HeroProps) {
  return (
    <section className="bg-gradient-mesh bg-noise relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12 text-center">
      {/* Content wrapper */}
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {/* Quebec badge */}
        <div className="animate-pop-in delay-100 mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm backdrop-blur-sm">
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

        {/* Subtitle */}
        <p className="animate-fade-slide-up delay-200 mb-8 text-[clamp(1.125rem,2.5vw,1.5rem)] leading-relaxed text-[var(--text-secondary)]">
          Pour les coachs. Pour leurs athlètes. Pour de vrai.
        </p>

        {/* Rotating hint */}
        <div className="animate-fade-slide-up delay-350 mb-8">
          <RotatingHint />
        </div>

        {/* Countdown */}
        <div className="animate-fade-slide-up delay-350 mb-10">
          <Countdown />
        </div>

        {/* Waitlist form */}
        <div className="animate-fade-slide-up delay-500 flex justify-center">
          <WaitlistForm />
        </div>

        {/* Conditional social proof */}
        {waitlistCount >= 10 && (
          <p className="animate-fade-in delay-650 mt-6 text-sm text-[var(--text-muted)]">
            {waitlistCount} {waitlistCount === 1 ? "coach est" : "coachs sont"}{" "}
            déjà sur la liste
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
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/components/hero.tsx
git commit -m "feat: rewrite hero as single-screen with countdown, hints, conditional social proof"
```

---

### Task 5: Simplify Footer

**Files:**
- Rewrite: `src/components/footer.tsx`

- [ ] **Step 1: Replace footer with single-line version**

Replace the entire content of `src/components/footer.tsx` with:

```tsx
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center text-sm text-[var(--text-muted)] sm:flex-row sm:justify-center sm:gap-1">
        <span>&copy; {currentYear} Cadence</span>
        <span className="hidden sm:inline" aria-hidden="true">
          &middot;
        </span>
        <span>Montréal, Québec, Canada</span>
        <span className="hidden sm:inline" aria-hidden="true">
          &middot;
        </span>
        <Link
          href="/privacy"
          className="transition-colors duration-200 hover:text-[var(--accent)]"
        >
          Politique de confidentialité
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/components/footer.tsx
git commit -m "refactor: simplify footer to single LCAP-compliant line"
```

---

### Task 6: Simplify Page and Delete Unused Components

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/value-props.tsx`
- Delete: `src/components/social-proof.tsx`
- Delete: `src/components/faq.tsx`
- Delete: `src/components/cta-final.tsx`
- Delete: `src/components/sticky-cta.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire content of `src/app/page.tsx` with:

```tsx
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { createServerSupabaseClient } from "@/lib/supabase";

async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = createServerSupabaseClient();
    const { count } = await supabase
      .from("waitlist_subscribers")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Home() {
  const waitlistCount = await getWaitlistCount();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero waitlistCount={waitlistCount} />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Delete unused components**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
rm src/components/value-props.tsx
rm src/components/social-proof.tsx
rm src/components/faq.tsx
rm src/components/cta-final.tsx
rm src/components/sticky-cta.tsx
```

- [ ] **Step 3: Verify full build**

Run: `cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web && npx next build --no-lint 2>&1 | tail -15`
Expected: Build succeeds with 0 errors. Fewer pages generated (no FAQ/CTA sections to render).

- [ ] **Step 4: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/app/page.tsx
git add -u src/components/value-props.tsx src/components/social-proof.tsx src/components/faq.tsx src/components/cta-final.tsx src/components/sticky-cta.tsx
git commit -m "refactor: simplify page to single-screen, delete unused components"
```

---

### Task 7: Add CSS Fade Utility

**Files:**
- Modify: `src/app/globals.css:156-158`

- [ ] **Step 1: Add the transition-fade utility class**

In `src/app/globals.css`, add after the `::selection` block (after line 156):

```css
/* Fade transition for rotating hints */
.transition-fade {
  transition: opacity 300ms var(--ease-out-expo);
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web
git add src/app/globals.css
git commit -m "style: add fade transition utility for rotating hints"
```

---

### Task 8: Visual Testing

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

Run: `cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web && npm run dev`

- [ ] **Step 2: Test desktop (1440x900)**

Open http://localhost:3000 and verify:
- All content visible without scrolling (single-screen)
- Navbar: "CADENCE" + "Bientot" badge
- Quebec badge visible
- Headline with gradient text
- Subtitle: "Pour les coachs. Pour leurs athletes. Pour de vrai."
- Rotating hint cycling every 4s with fade
- Countdown showing 4 blocks (jours/heures/min/sec) in accent color
- "avant l'acces early-access" label below countdown
- Email form with "Reserve ma place" button
- Checkbox has **white border** when unchecked (not invisible)
- Checkbox turns accent color when checked
- Button disabled until checkbox checked
- Footer: single line with copyright, Montreal address, privacy link
- No Value Props, FAQ, CTA Final, or Sticky CTA visible
- Social proof NOT visible (waitlist count < 10)

- [ ] **Step 3: Test mobile (375x812)**

Resize to 375px width and verify:
- All content still visible (may need minimal scroll on very small screens)
- Countdown blocks use smaller text (text-2xl)
- Form stacks vertically
- Footer wraps gracefully

- [ ] **Step 4: Test form submission**

- Check the LCAP checkbox (should be clearly visible)
- Enter test@example.com
- Click "Reserve ma place"
- Expected: error message (no Supabase in dev) — "Oups, quelque chose a plante."

- [ ] **Step 5: Final build verification**

Run: `cd C:/Users/ralph/OneDrive/Documents/GitHub/the-project/cadence-web && npx next build --no-lint`
Expected: Build succeeds, 0 TypeScript errors.

---

## Self-Review Checklist

**Spec coverage:**
- [x] Countdown component → Task 1
- [x] RotatingHint component → Task 2
- [x] Checkbox visibility fix → Task 3
- [x] Hero rewrite with all elements → Task 4
- [x] Footer simplification → Task 5
- [x] Page simplification + component deletion → Task 6
- [x] CSS fade utility → Task 7
- [x] Visual testing → Task 8
- [x] LCAP compliance (checkbox, address, privacy) → Tasks 3, 4, 5

**Placeholder scan:** No TBD/TODO/placeholders found.

**Type consistency:**
- `Hero` accepts `waitlistCount: number` prop (Task 4) — `page.tsx` passes it (Task 6) ✓
- `WaitlistForm` has no props (Task 3) — `Hero` calls `<WaitlistForm />` with no props (Task 4) ✓
- `Countdown` has no props (Task 1) — `Hero` calls `<Countdown />` (Task 4) ✓
- `RotatingHint` has no props (Task 2) — `Hero` calls `<RotatingHint />` (Task 4) ✓
