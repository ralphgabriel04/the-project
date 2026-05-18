# Landing Page #39 — Gap Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Cadence landing page teasing (#39) by closing all LCAP legal gaps, adding missing conversion components (sticky CTA, FAQ, referral), installing analytics, and polishing SEO/DX.

**Architecture:** The existing cadence-web is a Next.js 16 App Router project with Tailwind v4, Supabase backend, and Resend email. ~70% is built. We add LCAP consent fields to the DB + API, add 3 missing UI components, install PostHog + Vercel Analytics, and wire up robots/sitemap. No rewrites — surgical additions.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Supabase, Resend, PostHog, Vercel Analytics, Zod 4

**Working directory:** `cadence-web/` (inside the-project monorepo)

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `supabase/migrations/20260412_add_lcap_fields.sql` | Add consent_text, consent_timestamp, consent_ip, referral_code, position columns |
| Modify | `src/lib/validations.ts` | Add `consent` boolean to waitlist schema |
| Modify | `src/app/api/waitlist/route.ts` | Store consent fields + generate referral_code + return it |
| Modify | `src/components/waitlist-form.tsx` | Add LCAP checkbox, send consent, show referral_code on success, update CTA text |
| Modify | `src/components/footer.tsx` | Add physical address (LCAP) |
| Modify | `src/lib/resend.ts` | Add unsubscribe link + physical address to email template |
| Create | `src/components/sticky-cta.tsx` | Sticky bottom bar with email form after scrolling past hero |
| Create | `src/components/faq.tsx` | 3-question accordion |
| Modify | `src/app/page.tsx` | Wire FAQ + StickyCTA into page |
| Create | `src/lib/analytics.ts` | PostHog event helpers |
| Modify | `src/app/layout.tsx` | Add PostHog + Vercel Analytics providers, update CSP |
| Modify | `src/next.config.ts` | Add PostHog to CSP connect-src + script-src |
| Create | `src/app/robots.ts` | Dynamic robots.txt |
| Create | `src/app/sitemap.ts` | Dynamic sitemap.xml |
| Create | `.env.local.example` | Document all env vars |

---

## Task 1: LCAP Database Migration

**Files:**
- Create: `supabase/migrations/20260412_add_lcap_fields.sql`

- [ ] **Step 1: Create migration file**

```sql
-- LCAP (Loi C-28) compliance fields + referral + position
-- Must store consent proof for 3 years per LCAP

ALTER TABLE public.waitlist_subscribers
  ADD COLUMN IF NOT EXISTS consent_text TEXT,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS consent_ip TEXT,
  ADD COLUMN IF NOT EXISTS position INTEGER,
  ADD COLUMN IF NOT EXISTS referred_by TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Generate referral codes for existing rows that don't have one
UPDATE public.waitlist_subscribers
SET referral_code = encode(gen_random_bytes(6), 'hex')
WHERE referral_code IS NULL;

-- Make referral_code unique and auto-generate for new rows
ALTER TABLE public.waitlist_subscribers
  ALTER COLUMN referral_code SET DEFAULT encode(gen_random_bytes(6), 'hex');

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_referral ON public.waitlist_subscribers(referral_code);

-- Index for position ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist_subscribers(position);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260412_add_lcap_fields.sql
git commit -m "feat(db): add LCAP consent fields + referral to waitlist table"
```

---

## Task 2: Update Validation Schema

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Add consent field to waitlist schema**

Add `consent` boolean (must be `true`) to the schema. The file currently has `waitlistSchema` with only `email`. Update it:

```typescript
export const waitlistSchema = z.object({
  email: emailSchema,
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: "Tu dois accepter pour t'inscrire.",
    }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat(validation): add LCAP consent field to waitlist schema"
```

---

## Task 3: Update API Route — Consent + Referral

**Files:**
- Modify: `src/app/api/waitlist/route.ts`

- [ ] **Step 1: Update the POST handler**

Changes needed in the POST function:
1. After validation, extract `consent` from `result.data`
2. Store `consent_text`, `consent_ip`, `consent_timestamp` in the insert
3. Calculate `position` from count before insert
4. Generate `referral_code` server-side (or let DB default handle it)
5. Return `referral_code` in the response

Replace the insert block (lines ~56-87) and response block. The full updated POST handler:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Doucement ! Réessaie dans une minute." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || "Hmm, vérifie ton adresse courriel.";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email } = result.data;

    // Initialize Supabase
    const supabase = createServerSupabaseClient();

    // Check for duplicate
    const { data: existingSubscriber } = await supabase
      .from("waitlist_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "Tu es déjà sur la liste ! \u{1F64C}" },
        { status: 409 }
      );
    }

    // Get current count for position
    const { count } = await supabase
      .from("waitlist_subscribers")
      .select("*", { count: "exact", head: true });

    const position = (count ?? 0) + 1;

    // LCAP consent text (must match checkbox label exactly)
    const consentText =
      "J'accepte de recevoir des nouvelles de Cadence par courriel. Je peux me désabonner en tout temps.";

    // Insert new subscriber with LCAP fields
    const { data: newSubscriber, error: insertError } = await supabase
      .from("waitlist_subscribers")
      .insert({
        email,
        source: "landing_page",
        confirmed: false,
        position,
        consent_text: consentText,
        consent_ip: ip,
        consent_timestamp: new Date().toISOString(),
      })
      .select("referral_code")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Oups, quelque chose a planté. Réessaie dans un instant." },
        { status: 500 }
      );
    }

    const referralCode = newSubscriber?.referral_code ?? null;

    // Send confirmation email
    const resend = createResendClient();
    if (resend) {
      const emailContent = getWaitlistConfirmationEmail(position, referralCode);
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Cadence <onboarding@resend.dev>";

      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    } else {
      console.log(
        `[DEV] Would send confirmation email to ${email} (position #${position})`
      );
    }

    return NextResponse.json(
      {
        success: true,
        position,
        referralCode,
        message: "Tu es sur la liste !",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Oups, quelque chose a planté. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/waitlist/route.ts
git commit -m "feat(api): store LCAP consent + referral_code in waitlist"
```

---

## Task 4: Update Waitlist Form — LCAP Checkbox + CTA + Referral

**Files:**
- Modify: `src/components/waitlist-form.tsx`

- [ ] **Step 1: Add consent state, checkbox, update CTA text, show referral on success**

Key changes:
1. Add `consent` state (boolean, default false)
2. Send `consent` in the POST body
3. Change CTA from "Rejoins la liste d'attente" to "Réserve ma place"
4. Add checkbox below the form: "J'accepte de recevoir des nouvelles de Cadence par courriel"
5. Disable submit button if consent is false
6. In success state, show referral code with copy button
7. Change placeholder from "ton@email.com" to "ton@courriel.com"

Full replacement of `waitlist-form.tsx`:

```tsx
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

export function WaitlistForm({ location = "hero" }: { location?: "hero" | "bottom" | "sticky" }) {
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

          {/* Referral link */}
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

  // Compact mode for sticky CTA (no checkbox, just email + button)
  if (location === "sticky") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-2">
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
          className="h-11 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          className="h-11 shrink-0 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {isLoading ? "..." : "Réserve ma place"}
        </button>
      </form>
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

      {/* LCAP Consent Checkbox */}
      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-colors checked:border-[var(--accent)] checked:bg-[var(--accent)]"
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/waitlist-form.tsx
git commit -m "feat(form): add LCAP checkbox, 'Réserve ma place' CTA, referral code display"
```

---

## Task 5: Update Footer — Physical Address (LCAP)

**Files:**
- Modify: `src/components/footer.tsx`

- [ ] **Step 1: Add physical address to footer**

After the copyright span in the bottom bar, add the physical address. Replace the bottom bar div (lines 70-78):

```tsx
{/* Bottom bar */}
<div className="mt-10 flex flex-col items-center gap-4 border-t border-[var(--border-subtle)] pt-8 text-sm text-[var(--text-muted)] md:flex-row md:justify-between">
  <div className="flex flex-col items-center gap-1 md:items-start">
    <span>&copy; {currentYear} Cadence. Tous droits réservés.</span>
    <span className="text-xs">Montréal, Québec, Canada</span>
  </div>
  <Link
    href="/privacy"
    className="transition-colors duration-200 hover:text-[var(--accent)]"
  >
    Politique de confidentialité
  </Link>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/footer.tsx
git commit -m "feat(footer): add LCAP-required physical address"
```

---

## Task 6: Update Email Template — Unsubscribe + Address

**Files:**
- Modify: `src/lib/resend.ts`

- [ ] **Step 1: Update getWaitlistConfirmationEmail signature and content**

Add `referralCode` param. Add unsubscribe link + physical address to footer of both HTML and text versions. Update the function signature:

```typescript
export function getWaitlistConfirmationEmail(position: number, referralCode: string | null) {
```

In the HTML template, after the "Cofondateurs" paragraph and before closing `</td>` of main content, add the referral block (if referralCode exists):

```html
${referralCode ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">
    <tr>
      <td style="font-size: 14px; color: #A1A1AA; line-height: 1.6;">
        <strong style="color: #FFFFFF;">Partage ton lien</strong> — chaque ami inscrit te fait monter dans la file :<br>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://cadence-web.vercel.app'}/?ref=${referralCode}" style="color: #FF6B4A; text-decoration: underline;">
          ${process.env.NEXT_PUBLIC_BASE_URL || 'https://cadence-web.vercel.app'}/?ref=${referralCode}
        </a>
      </td>
    </tr>
  </table>
` : ''}
```

In the HTML footer section, replace the existing footer `<tr>` with:

```html
<tr>
  <td align="center" style="padding-top: 32px;">
    <p style="margin: 0; font-size: 14px; color: #71717A;">
      Cadence — Le coaching sportif, repensé pour ici.
    </p>
    <p style="margin: 8px 0 0; font-size: 12px; color: #52525B;">
      Montréal, Québec, Canada
    </p>
    <p style="margin: 8px 0 0; font-size: 12px; color: #52525B;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://cadence-web.vercel.app'}/privacy" style="color: #52525B; text-decoration: underline;">Se désabonner</a>
    </p>
  </td>
</tr>
```

Update the text version to include the referral link and unsubscribe footer:

```typescript
text: `Salut !

Tu es le #${position}e sur la liste d'attente de Cadence.

On travaille fort pour te livrer la meilleure app de coaching sportif au Québec. On te recontacte bientôt.
${referralCode ? `
Partage ton lien — chaque ami inscrit te fait monter dans la file :
${process.env.NEXT_PUBLIC_BASE_URL || 'https://cadence-web.vercel.app'}/?ref=${referralCode}
` : ''}
— Ralph & Alexandre, cofondateurs de Cadence

---
Cadence — Le coaching sportif, repensé pour ici.
Montréal, Québec, Canada
Se désabonner : ${process.env.NEXT_PUBLIC_BASE_URL || 'https://cadence-web.vercel.app'}/privacy`,
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/resend.ts
git commit -m "feat(email): add LCAP unsubscribe link, address, referral link"
```

---

## Task 7: Create Sticky CTA Component

**Files:**
- Create: `src/components/sticky-cta.tsx`

- [ ] **Step 1: Create the sticky CTA bar**

This bar appears fixed at the bottom of the screen after the user scrolls past the hero section. On mobile it's full-width. It contains a compact version of the waitlist form.

```tsx
"use client";

import { useEffect, useState } from "react";
import { WaitlistForm } from "./waitlist-form";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~80% of viewport height (past the hero)
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="complementary"
      aria-label="Inscription rapide"
    >
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <WaitlistForm location="sticky" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sticky-cta.tsx
git commit -m "feat(ui): add sticky CTA bar for +8-12% conversion"
```

---

## Task 8: Create FAQ Accordion Component

**Files:**
- Create: `src/components/faq.tsx`

- [ ] **Step 1: Create FAQ with native details/summary accordion**

Uses native `<details>` for zero JS, accessible by default. 3 questions as per spec.

```tsx
const faqs = [
  {
    question: "C'est quoi Cadence exactement ?",
    answer:
      "Une app mobile qui permet aux coachs de créer des programmes, suivre leurs athlètes en temps réel, et mesurer la compliance et la readiness. Tout en français.",
  },
  {
    question: "Ça va coûter combien ?",
    answer:
      "On annonce les prix au lancement. Les inscrits sur la waitlist auront un tarif fondateur exclusif.",
  },
  {
    question: "Quand est-ce que ça sort ?",
    answer:
      "Beta prévue automne 2026. Les premiers sur la liste seront invités en priorité.",
  },
];

export function FAQ() {
  return (
    <section className="bg-noise relative px-6 py-20">
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 transition-colors open:bg-[var(--bg-secondary)]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-[var(--text-secondary)] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/faq.tsx
git commit -m "feat(ui): add FAQ accordion with 3 questions"
```

---

## Task 9: Wire New Components Into Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import and add FAQ + StickyCTA to page**

Replace the full page.tsx:

```tsx
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ValueProps } from "@/components/value-props";
import { SocialProof } from "@/components/social-proof";
import { FAQ } from "@/components/faq";
import { CTAFinal } from "@/components/cta-final";
import { Footer } from "@/components/footer";
import { StickyCTA } from "@/components/sticky-cta";
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
        <Hero />
        <ValueProps />
        <SocialProof initialCount={waitlistCount} />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(page): wire FAQ and sticky CTA into landing page"
```

---

## Task 10: Install & Configure PostHog + Vercel Analytics

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/app/layout.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Install packages**

```bash
cd cadence-web && npm install posthog-js @vercel/analytics
```

- [ ] **Step 2: Create analytics helpers**

Create `src/lib/analytics.ts`:

```typescript
import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!key) {
    console.log("[DEV] PostHog not configured — NEXT_PUBLIC_POSTHOG_KEY missing");
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

// Pre-defined events matching the spec
export const analytics = {
  scrollDepth: (depth: "25" | "50" | "75" | "100") =>
    trackEvent("scroll_depth", { depth }),
  emailFormFocus: () => trackEvent("email_form_focus"),
  emailFormSubmit: (success: boolean, position?: number) =>
    trackEvent("email_form_submit", { success, ...(position && { position }) }),
  emailFormError: (type: "invalid" | "exists" | "rate_limited") =>
    trackEvent("email_form_error", { type }),
  ctaClick: (location: "hero" | "bottom" | "sticky") =>
    trackEvent("cta_click", { location }),
  faqToggle: (question: string) =>
    trackEvent("faq_toggle", { question }),
  referralCopy: (referralCode: string) =>
    trackEvent("referral_copy", { referral_code: referralCode }),
};
```

- [ ] **Step 3: Create PostHog provider component**

Create `src/components/posthog-provider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 4: Update layout.tsx to add providers**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/posthog-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cadence — Le coaching sportif, repensé pour ici.",
  description:
    "La plateforme de coaching sportif conçue au Québec, en français. Suivi d'entraînement, readiness check, progression — tout en une app.",
  keywords: [
    "coaching sportif",
    "app entraînement",
    "suivi musculation",
    "coach personnel",
    "Québec",
    "programme musculation",
    "suivi athlètes",
  ],
  authors: [{ name: "Cadence" }],
  creator: "Cadence",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://cadence-web.vercel.app"
  ),
  openGraph: {
    title: "Cadence — Le coaching sportif, repensé pour ici.",
    description: "Rejoins la liste d'attente. Lancement automne 2026.",
    locale: "fr_CA",
    type: "website",
    siteName: "Cadence",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadence — Le coaching sportif, repensé pour ici.",
    description: "Rejoins la liste d'attente. Lancement automne 2026.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} dark`}>
      <body className="min-h-screen bg-[var(--bg-primary)] antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Update CSP in next.config.ts**

In the `Content-Security-Policy` header value array, add PostHog domains:
- Add to `script-src`: `https://us-assets.i.posthog.com`
- Add to `connect-src`: `https://us.i.posthog.com https://us-assets.i.posthog.com`

The updated CSP line:

```typescript
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.resend.com https://us.i.posthog.com https://us-assets.i.posthog.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
  ].join("; "),
},
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics.ts src/components/posthog-provider.tsx src/app/layout.tsx next.config.ts package.json package-lock.json
git commit -m "feat(analytics): add PostHog + Vercel Analytics with event helpers"
```

---

## Task 11: SEO — robots.ts + sitemap.ts

**Files:**
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create robots.ts**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://cadence-web.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Create sitemap.ts**

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://cadence-web.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.ts src/app/sitemap.ts
git commit -m "feat(seo): add dynamic robots.txt and sitemap.xml"
```

---

## Task 12: Create .env.local.example

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Create example env file**

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=Cadence <noreply@cadence.app>

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# App
NEXT_PUBLIC_BASE_URL=https://cadence-web.vercel.app
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs: add .env.local.example with all required variables"
```

---

## Task 13: Build Verification + Obsidian Notes

**Files:**
- None (verification only)

- [ ] **Step 1: Run build to check for errors**

```bash
cd cadence-web && npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Move Obsidian research file and create project notes**

Move `Fideral Vault/Cadence/Recherche Landing Page Teasing Waitlist.md` to the `Note` vault.
Create implementation notes in `Fideral Vault/Cadence/` documenting what was built.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: build verification pass"
```
