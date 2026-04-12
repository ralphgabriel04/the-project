import { NextRequest, NextResponse } from "next/server";
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
