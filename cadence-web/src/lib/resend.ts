import { Resend } from "resend";

// Initialize Resend client
// Only use in server-side code (API routes)
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

// Email template for waitlist confirmation
export function getWaitlistConfirmationEmail(position: number, referralCode: string | null) {
  return {
    subject: "Tu es sur la liste !",
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px;">
          <!-- Logo/Brand -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">CADENCE</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #141416; border-radius: 12px; padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #FFFFFF;">Salut !</h2>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #A1A1AA;">
                Tu es le <strong style="color: #FF6B4A;">#${position}e</strong> sur la liste d'attente de Cadence.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #A1A1AA;">
                On travaille fort pour te livrer la meilleure app de coaching sportif au Québec. On te recontacte bientôt.
              </p>

              <!-- Position Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, rgba(255, 107, 74, 0.2), rgba(255, 143, 107, 0.1)); border: 1px solid rgba(255, 107, 74, 0.3); border-radius: 8px; padding: 16px 32px;">
                      <span style="font-size: 14px; color: #A1A1AA;">Ta position</span>
                      <br>
                      <span style="font-size: 32px; font-weight: 800; color: #FF6B4A;">#${position}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #A1A1AA;">
                — Ralph & Alexandre<br>
                <span style="color: #71717A;">Cofondateurs de Cadence</span>
              </p>

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
            </td>
          </tr>

          <!-- Footer -->
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
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
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
  };
}
