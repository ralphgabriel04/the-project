import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// Shared brand constants — kept inline to avoid creating a lib file for one-off markup
const BG_PRIMARY = "#0A0A0B";
const BG_CARD = "#141416";
const TEXT = "#FFFFFF";
const MUTED = "#A1A1AA";
const ACCENT = "#FF6B4A";

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Cadence</title>
<style>
  body { margin:0; padding:40px 20px; background:${BG_PRIMARY}; color:${TEXT}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .card { max-width:480px; width:100%; background:${BG_CARD}; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:40px 32px; text-align:center; }
  h1 { margin:0 0 16px; font-size:28px; font-weight:800; color:${ACCENT}; letter-spacing:-0.02em; }
  h2 { margin:0 0 16px; font-size:22px; font-weight:700; color:${TEXT}; }
  p { margin:0 0 20px; font-size:16px; line-height:1.6; color:${MUTED}; }
  button, .btn { display:inline-block; background:${ACCENT}; color:${TEXT}; border:none; border-radius:8px; padding:14px 28px; font-size:16px; font-weight:600; cursor:pointer; text-decoration:none; font-family:inherit; }
  button:hover, .btn:hover { background:#FF8F6B; }
  .secondary { background:transparent; border:1px solid rgba(255,255,255,0.16); color:${MUTED}; margin-left:8px; }
  form { margin:0; }
</style>
</head>
<body>
<div class="card">
  <h1>CADENCE</h1>
  ${body}
</div>
</body>
</html>`;
}

// GET — show confirmation page so email-scanner prefetches can't trigger an unsubscribe
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      renderPage(
        "Lien invalide",
        `<h2>Lien invalide</h2><p>Ce lien de désinscription est incomplet ou expiré.</p>`
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: subscriber } = await supabase
    .from("waitlist_subscribers")
    .select("email, unsubscribed_at")
    .eq("unsubscribe_token", token)
    .single();

  if (!subscriber) {
    return new NextResponse(
      renderPage(
        "Lien invalide",
        `<h2>Lien invalide</h2><p>Ce lien de désinscription est incomplet ou expiré.</p>`
      ),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (subscriber.unsubscribed_at) {
    return new NextResponse(
      renderPage(
        "Déjà désinscrit",
        `<h2>Tu es déjà désinscrit</h2><p>Ton adresse <strong style="color:${TEXT}">${subscriber.email}</strong> ne recevra plus d'emails de Cadence.</p>`
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(
    renderPage(
      "Désinscription",
      `<h2>Te désinscrire de Cadence ?</h2>
       <p>Tu ne recevras plus d'emails à <strong style="color:${TEXT}">${subscriber.email}</strong>. On te retirera aussi de la liste d'attente.</p>
       <form method="POST" action="/api/unsubscribe?token=${encodeURIComponent(token)}">
         <button type="submit">Confirmer la désinscription</button>
         <a href="/" class="btn secondary">Annuler</a>
       </form>`
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// POST — actually perform the unsubscribe
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      renderPage(
        "Lien invalide",
        `<h2>Lien invalide</h2><p>Ce lien de désinscription est incomplet.</p>`
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from("waitlist_subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      is_deleted: true,
    })
    .eq("unsubscribe_token", token)
    .select("email")
    .single();

  if (error || !updated) {
    console.error("Unsubscribe error:", error);
    return new NextResponse(
      renderPage(
        "Oups",
        `<h2>Oups</h2><p>Quelque chose a planté. Réessaie plus tard ou réponds directement à notre email.</p>`
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(
    renderPage(
      "Désinscrit",
      `<h2>C'est fait.</h2>
       <p>Ton adresse <strong style="color:${TEXT}">${updated.email}</strong> ne recevra plus d'emails de Cadence. Merci d'avoir donné Cadence un essai — à bientôt peut-être.</p>
       <a href="/" class="btn">Retour à l'accueil</a>`
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
