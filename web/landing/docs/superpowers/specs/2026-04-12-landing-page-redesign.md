# Landing Page Redesign — Teasing Pre-Launch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Cadence landing page from a feature-showcase into a mystery-driven, single-screen teasing page that maximizes waitlist signups through urgency (countdown), curiosity (rotating hints), and simplicity (one-screen, one CTA).

**Architecture:** Single-screen page (100vh) with all content centered vertically. Remove all multi-section components (Value Props, FAQ, CTA Final, Sticky CTA, Social Proof). Replace with a unified Hero that integrates countdown, rotating hints, waitlist form, and conditional social proof. Two new client components: Countdown and RotatingHint.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, existing design system "Kinetic Pulse" (dark mode, Electric Coral accent).

---

## Context

The current landing page looks like a launched product page — it showcases features (dashboard, timer, PRs, mobile-first), has multiple scroll sections (Value Props, FAQ, CTA Final), and reveals too much about what Cadence does. For a pre-launch teasing page, the goal is the opposite: mystery, urgency, curiosity, and a single clear action (join the waitlist).

### Design Principles

1. **Mystery over features** — Never name a feature. Hint at emotional benefits instead.
2. **Urgency via countdown** — A live countdown to early-access creates event-like anticipation.
3. **One screen, one action** — Everything fits in the viewport. No scrolling needed to find the CTA.
4. **Dual audience** — Speak to both coaches AND athletes without detailing what either gets.
5. **LCAP compliant** — Consent checkbox must be visible (white border when unchecked), physical address in footer, unsubscribe mention.

### Reference Inspirations

- Odota: ultra-minimal, single card, social proof with avatars
- WAYT: gradient background, compact form, "join the queue"
- Superhuman/Linear: prominent countdown, mystery-driven pre-launch

---

## Page Structure

Single viewport (100vh), centered vertically, stacked layout:

```
┌─────────────────────────────────────────┐
│  CADENCE                      [Bientot] │  Navbar (existing, unchanged)
│                                         │
│            Concue au Quebec             │  Badge (existing, unchanged)
│                                         │
│       Le coaching sportif,              │
│       repense pour ici.                 │  Headline (existing, unchanged)
│                                         │
│   Pour les coachs. Pour leurs           │
│   athletes. Pour de vrai.               │  Subtitle (NEW - replaces old one)
│                                         │
│   "Tes athletes vont enfin voir         │
│    leur progression."                   │  Rotating hint (NEW, fades every 4s)
│                                         │
│     ┌──┐  ┌──┐  ┌──┐  ┌──┐            │
│     │47│  │12│  │35│  │08│            │
│     │j │  │h │  │m │  │s │            │  Countdown (NEW)
│     └──┘  └──┘  └──┘  └──┘            │
│     avant l'acces early-access          │
│                                         │
│  ┌─────────────────┬──────────────────┐ │
│  │ ton@courriel.com│ Reserve ma place │ │  Form (existing, improved checkbox)
│  └─────────────────┴──────────────────┘ │
│  [x] J'accepte de recevoir...           │  Checkbox (white border when unchecked)
│                                         │
│     12 coachs sur la liste              │  Social proof (only if >= 10)
│                                         │
│─────────────────────────────────────────│
│  (c) 2026 · Montreal, QC · Privacy      │  Footer (simplified to one line)
└─────────────────────────────────────────┘
```

---

## Components

### 1. Countdown (`src/components/countdown.tsx`) — NEW

Client component. Counts down to January 1, 2027 00:00:00 EST.

**Visual spec:**
- 4 blocks side by side with gap-3
- Each block: `bg-[var(--bg-secondary)]` with `border border-[var(--border-subtle)]` and `rounded-xl`
- Padding: `px-4 py-3` (desktop), `px-3 py-2` (mobile)
- Number: `text-4xl font-extrabold text-[var(--accent)]` (desktop), `text-2xl` (mobile)
- Label below number: `text-xs text-[var(--text-muted)]` uppercase — "jours", "heures", "min", "sec"
- Below all 4 blocks: `text-sm text-[var(--text-secondary)]` — "avant l'acces early-access"

**Behavior:**
- Updates every second via `setInterval`
- When countdown reaches 0, display "C'est le moment!" instead of numbers
- Use `useEffect` with cleanup for the interval
- Calculate time diff from `new Date('2027-01-01T05:00:00Z')` (midnight EST = 05:00 UTC)

### 2. RotatingHint (`src/components/rotating-hint.tsx`) — NEW

Client component. Displays one hint at a time, cycling with a fade transition.

**Hints array (5 items):**
1. "Tes athletes vont enfin voir leur progression."
2. "Fini les programmes sur screenshot."
3. "Le lien coach-athlete, simplifie."
4. "Ton gym dans ta poche. Pour vrai."
5. "Tes athletes meritent mieux qu'un Google Sheet."

**Visual spec:**
- Container: fixed height `h-8` to prevent layout shift
- Text: `text-lg text-[var(--text-secondary)] italic` centered
- Quotes: wrapped in guillemets ("...") for emphasis

**Behavior:**
- Cycle every 4 seconds
- Fade out (300ms) → swap text → fade in (300ms)
- Use CSS opacity transition, not keyframe animation
- Use `useEffect` with `setInterval` and cleanup

### 3. Hero (`src/components/hero.tsx`) — REWRITE

Server component wrapper, but imports client components (Countdown, RotatingHint, WaitlistForm).

**Layout changes:**
- `min-h-screen` (full viewport)
- `flex flex-col items-center justify-center` (centered vertically)
- `text-center` always (remove `lg:text-left`)
- Tighter spacing between elements (reduce mb values)

**Content order (top to bottom):**
1. Quebec badge (existing) — `mb-6`
2. Headline (existing) — `mb-3`
3. New subtitle: "Pour les coachs. Pour leurs athletes. Pour de vrai." — `mb-8`
4. `<RotatingHint />` — `mb-8`
5. `<Countdown />` — `mb-10`
6. `<WaitlistForm />` — `mb-6`
7. Conditional social proof (inline, not a separate component) — only render if `waitlistCount >= 10`

**Social proof (inline in hero):**
- Text: `text-sm text-[var(--text-muted)]`
- Format: "X coachs sont deja sur la liste"
- No avatars, no separate section
- Passed via `waitlistCount` prop from page.tsx

**Removed from hero:**
- Old subheadline ("Une app pensee pour les coachs d'ici...")
- `lg:text-left` and `lg:justify-start` (always centered now)

### 4. WaitlistForm (`src/components/waitlist-form.tsx`) — MODIFY

**Changes:**
- Checkbox unchecked state: `border-white/50 bg-transparent` instead of `border-[var(--border-subtle)] bg-[var(--bg-secondary)]`
- Checkbox size: `h-[18px] w-[18px]` instead of `h-4 w-4`
- Remove `location` prop entirely (no more "sticky" variant)
- Remove sticky form rendering code
- Keep hero form rendering (default)

### 5. Footer (`src/components/footer.tsx`) — SIMPLIFY

**Reduce to a single line:**
```
(c) 2026 Cadence · Montreal, Quebec, Canada · Politique de confidentialite
```

- Remove social links (Instagram, LinkedIn) — move to post-launch
- Remove logo and tagline repetition
- Single `div` with `text-sm text-[var(--text-muted)]` centered
- Keep the privacy link (`/privacy`)
- Keep the physical address (LCAP requirement)

### 6. Page (`src/app/page.tsx`) — SIMPLIFY

```tsx
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

Remove imports: ValueProps, SocialProof, FAQ, CTAFinal, StickyCTA.

---

## Components to DELETE

| File | Reason |
|------|--------|
| `src/components/value-props.tsx` | Feature showcase — contradicts teasing approach |
| `src/components/social-proof.tsx` | Logic moved inline into Hero |
| `src/components/faq.tsx` | Too much info for a teasing page |
| `src/components/cta-final.tsx` | Redundant — one-screen has only one CTA |
| `src/components/sticky-cta.tsx` | Unnecessary — one-screen, form always visible |

---

## CSS Changes (`globals.css`)

**Add fade transition utility:**
```css
.transition-fade {
  transition: opacity 300ms var(--ease-out-expo);
}
```

**No other CSS changes needed.** Existing animations (fadeSlideUp, popIn, pulse-glow) and design tokens remain.

---

## Unchanged Components

| Component | Status |
|-----------|--------|
| `navbar.tsx` | No changes |
| `posthog-provider.tsx` | No changes |
| `src/lib/analytics.ts` | No changes (keep events, some will fire less) |
| `src/lib/validations.ts` | No changes |
| `src/lib/resend.ts` | No changes |
| `src/app/api/waitlist/route.ts` | No changes |
| `src/app/robots.ts` | No changes |
| `src/app/sitemap.ts` | No changes (keep / and /privacy) |
| `src/app/layout.tsx` | No changes |
| `next.config.ts` | No changes |

---

## LCAP Compliance Checklist

- [x] Consent checkbox NOT pre-checked
- [x] Checkbox visually obvious (white border when unchecked)
- [x] Clear consent text: "J'accepte de recevoir des nouvelles de Cadence par courriel"
- [x] Unsubscribe mention visible
- [x] Privacy policy link accessible
- [x] Physical address in footer: "Montreal, Quebec, Canada"
- [x] consent_text, consent_timestamp, consent_ip stored in Supabase (no change to API)

---

## SEO Impact

- Page title: unchanged ("Cadence — Le coaching sportif, repense pour ici.")
- Meta description: could update to mention "coming January 2027" for relevance
- OpenGraph: unchanged
- robots.txt / sitemap.xml: unchanged

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Visit to signup | 10-15% | 15-20% (less friction, one-screen) |
| Load time | < 1.5s | < 1.0s (fewer components) |
| Lighthouse | > 95 | > 97 (simpler page) |
| Bounce rate | unknown | < 40% |
