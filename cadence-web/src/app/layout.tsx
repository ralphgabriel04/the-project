import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/posthog-provider";

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
