import { Resend } from "resend";

// ============================================================================
// Brand & compliance constants
// TODO before launch: replace COMPANY_POSTAL_ADDRESS with a real civic address
// (LCAP requires a valid physical mailing address in every commercial email).
// ============================================================================
const COMPANY_NAME = "Cadence";
const COMPANY_FOUNDERS = "Ralph & Alexandre";
const COMPANY_POSTAL_ADDRESS = "Montréal, QC, Canada"; // TODO: civic address
const REPLY_TO_EMAIL = "hello@cadence.app"; // TODO: verify domain in Resend
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cadence-web.vercel.app";

// Design tokens (mirror globals.css — Kinetic Pulse)
const BG_PRIMARY = "#0A0A0B";
const BG_CARD = "#141416";
const TEXT = "#FFFFFF";
const MUTED = "#A1A1AA";
const DIM = "#71717A";
const FAINT = "#52525B";
const ACCENT = "#FF6B4A";
const ACCENT_SOFT = "#FF8F6B";

// Initialize Resend client
export function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY not configured. Email sending will be skipped in development."
    );
    return null;
  }

  return new Resend(apiKey);
}

export interface WaitlistEmailOptions {
  position: number;
  referralCode: string | null;
  unsubscribeToken: string;
}

export function getWaitlistConfirmationEmail(opts: WaitlistEmailOptions) {
  const { position, referralCode, unsubscribeToken } = opts;
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const referralUrl = referralCode ? `${BASE_URL}/?ref=${referralCode}` : null;
  const preheader = `Tu es #${position} sur la liste d'attente. On te recontacte bientôt.`;

  return {
    subject: `Tu es #${position} sur la liste d'attente de Cadence`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Bienvenue sur la liste d'attente de ${COMPANY_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_PRIMARY}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${BG_PRIMARY}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${TEXT}; letter-spacing: -0.02em;">CADENCE</h1>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: ${BG_CARD}; border-radius: 12px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.08);">

              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${TEXT};">Salut !</h2>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${MUTED};">
                Merci de t'être inscrit à la liste d'attente de <strong style="color: ${TEXT};">${COMPANY_NAME}</strong>. C'est officiel — tu seras parmi les premiers à essayer l'app quand on sera prêt.
              </p>

              <!-- Position badge -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background: linear-gradient(135deg, rgba(255, 107, 74, 0.18), rgba(255, 143, 107, 0.08)); border: 1px solid rgba(255, 107, 74, 0.3); border-radius: 10px; padding: 20px 36px;" align="center">
                          <div style="font-size: 13px; color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.05em;">Ta position</div>
                          <div style="font-size: 44px; font-weight: 800; color: ${ACCENT}; line-height: 1; margin-top: 4px;">#${position}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${MUTED};">
                On travaille fort pour te livrer la meilleure app de coaching sportif au Québec — pensée pour les coachs <em>et</em> leurs athlètes. On te recontacte dès que l'accès anticipé ouvre.
              </p>

              ${
                referralUrl
                  ? `
              <!-- Referral section -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: ${TEXT};">Monte dans la file ⬆️</p>
                    <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: ${MUTED};">
                      Partage ton lien personnel. Chaque ami inscrit te fait gagner des places.
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                      <a href="${referralUrl}" style="color: ${ACCENT}; text-decoration: underline; word-break: break-all;">${referralUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- Signature -->
              <p style="margin: 32px 0 0; font-size: 15px; line-height: 1.6; color: ${MUTED};">
                À bientôt,<br>
                <strong style="color: ${TEXT};">${COMPANY_FOUNDERS}</strong><br>
                <span style="color: ${DIM}; font-size: 13px;">Cofondateurs de ${COMPANY_NAME}</span>
              </p>

            </td>
          </tr>

          <!-- Consent reminder + commercial disclosure -->
          <tr>
            <td style="padding: 24px 8px 12px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: ${FAINT}; text-align: center;">
                Tu reçois ce courriel parce que tu t'es inscrit à la liste d'attente de ${COMPANY_NAME} sur ${BASE_URL} et que tu as accepté de recevoir de nos nouvelles. C'est un message commercial au sens de la Loi canadienne anti-pourriel (LCAP).
              </p>
            </td>
          </tr>

          <!-- Postal address (LCAP requirement) -->
          <tr>
            <td align="center" style="padding: 12px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${FAINT};">
                <strong style="color: ${MUTED};">${COMPANY_NAME}</strong><br>
                ${COMPANY_POSTAL_ADDRESS}
              </p>
            </td>
          </tr>

          <!-- Unsubscribe + privacy -->
          <tr>
            <td align="center" style="padding: 12px 8px 32px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.8; color: ${FAINT};">
                <a href="${unsubscribeUrl}" style="color: ${MUTED}; text-decoration: underline;">Se désabonner</a>
                &nbsp;·&nbsp;
                <a href="${BASE_URL}/privacy" style="color: ${MUTED}; text-decoration: underline;">Politique de confidentialité</a>
                &nbsp;·&nbsp;
                <a href="mailto:${REPLY_TO_EMAIL}" style="color: ${MUTED}; text-decoration: underline;">Nous contacter</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Salut !

Merci de t'être inscrit à la liste d'attente de ${COMPANY_NAME}.

TA POSITION : #${position}

On travaille fort pour te livrer la meilleure app de coaching sportif au Québec — pensée pour les coachs ET leurs athlètes. On te recontacte dès que l'accès anticipé ouvre.
${
  referralUrl
    ? `
Monte dans la file — partage ton lien personnel, chaque ami inscrit te fait gagner des places :
${referralUrl}
`
    : ""
}
À bientôt,
${COMPANY_FOUNDERS}
Cofondateurs de ${COMPANY_NAME}

---
Tu reçois ce courriel parce que tu t'es inscrit à la liste d'attente de ${COMPANY_NAME} sur ${BASE_URL} et que tu as accepté de recevoir de nos nouvelles. C'est un message commercial au sens de la Loi canadienne anti-pourriel (LCAP).

${COMPANY_NAME}
${COMPANY_POSTAL_ADDRESS}

Se désabonner : ${unsubscribeUrl}
Politique de confidentialité : ${BASE_URL}/privacy
Nous contacter : ${REPLY_TO_EMAIL}`,
    // Headers for native mail-client unsubscribe (Gmail/Yahoo one-click)
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${REPLY_TO_EMAIL}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    replyTo: REPLY_TO_EMAIL,
    preheader,
  };
}
