import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { waitlistSchema } from "@/lib/validations";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createResendClient, getWaitlistConfirmationEmail } from "@/lib/resend";
import { headers } from "next/headers";

// Simple in-memory rate limiting (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

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

    const { email, turnstileToken } = result.data;

    // Verify Cloudflare Turnstile token server-side (skip if widget failed on client)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      const verifyForm = new URLSearchParams();
      verifyForm.append("secret", turnstileSecret);
      verifyForm.append("response", turnstileToken);
      verifyForm.append("remoteip", ip);

      try {
        const verifyRes = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            body: verifyForm,
          }
        );
        const verifyData: { success: boolean; "error-codes"?: string[] } =
          await verifyRes.json();

        if (!verifyData.success) {
          console.error("Turnstile verification failed:", verifyData["error-codes"]);
          return NextResponse.json(
            { error: "Vérification anti-bot échouée. Réessaie." },
            { status: 403 }
          );
        }
      } catch (verifyError) {
        console.error("Turnstile verify request failed:", verifyError);
        return NextResponse.json(
          { error: "Vérification anti-bot indisponible. Réessaie dans un instant." },
          { status: 503 }
        );
      }
    } else {
      console.warn("TURNSTILE_SECRET_KEY not set — skipping bot verification");
    }

    // Initialize Supabase
    const supabase = createServerSupabaseClient();

    // Check for existing row (active or previously unsubscribed)
    const { data: existingSubscriber } = await supabase
      .from("waitlist_subscribers")
      .select("id, is_deleted")
      .eq("email", email)
      .maybeSingle();

    // Active subscriber → block duplicate
    if (existingSubscriber && !existingSubscriber.is_deleted) {
      return NextResponse.json(
        { error: "Tu es déjà sur la liste ! \u{1F64C}" },
        { status: 409 }
      );
    }

    // Get current count of ACTIVE subscribers for position
    const { count } = await supabase
      .from("waitlist_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false);

    const position = (count ?? 0) + 1;

    // LCAP consent text (must match checkbox label exactly)
    const consentText =
      "J'accepte de recevoir des nouvelles de Cadence par courriel. Je peux me désabonner en tout temps.";

    const consentPayload = {
      confirmed: false,
      position,
      consent_text: consentText,
      consent_ip: ip,
      consent_timestamp: new Date().toISOString(),
    };

    let referralCode: string | null = null;
    let unsubscribeToken: string | null = null;

    if (existingSubscriber?.is_deleted) {
      // Reactivate previously unsubscribed row with a fresh consent record
      // and a rotated unsubscribe_token so old email links stop working.
      const { data: reactivated, error: updateError } = await supabase
        .from("waitlist_subscribers")
        .update({
          ...consentPayload,
          is_deleted: false,
          unsubscribed_at: null,
          unsubscribe_token: randomUUID(),
        })
        .eq("id", existingSubscriber.id)
        .select("referral_code, unsubscribe_token")
        .single();

      if (updateError || !reactivated) {
        console.error(
          "Supabase reactivate error —",
          "message:", updateError?.message,
          "code:", updateError?.code,
          "details:", updateError?.details,
          "hint:", updateError?.hint,
        );
        return NextResponse.json(
          { error: "Oups, quelque chose a planté. Réessaie dans un instant." },
          { status: 500 }
        );
      }

      referralCode = reactivated.referral_code ?? null;
      unsubscribeToken = reactivated.unsubscribe_token ?? null;
    } else {
      // Insert brand-new subscriber
      const { data: newSubscriber, error: insertError } = await supabase
        .from("waitlist_subscribers")
        .insert({
          email,
          source: "landing_page",
          ...consentPayload,
        })
        .select("referral_code, unsubscribe_token")
        .single();

      if (insertError) {
        console.error(
          "Supabase insert error —",
          "message:", insertError.message,
          "code:", insertError.code,
          "details:", insertError.details,
          "hint:", insertError.hint,
        );
        return NextResponse.json(
          { error: "Oups, quelque chose a planté. Réessaie dans un instant." },
          { status: 500 }
        );
      }

      referralCode = newSubscriber?.referral_code ?? null;
      unsubscribeToken = newSubscriber?.unsubscribe_token ?? null;
    }

    // Send confirmation email
    const resend = createResendClient();
    if (resend && unsubscribeToken) {
      const emailContent = getWaitlistConfirmationEmail({
        position,
        referralCode,
        unsubscribeToken,
      });
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Cadence <onboarding@resend.dev>";

      try {
        const { error: sendError } = await resend.emails.send({
          from: fromEmail,
          to: email,
          replyTo: emailContent.replyTo,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          headers: emailContent.headers,
        });
        if (sendError) {
          console.error(
            "Resend send error —",
            "name:", sendError.name,
            "message:", sendError.message,
          );
        }
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

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
