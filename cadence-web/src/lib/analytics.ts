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
