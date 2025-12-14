import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "THE PROJECT - Coaching Sportif Intelligent",
    template: "%s | THE PROJECT",
  },
  description:
    "Plateforme de coaching sportif intelligent. Améliorez la communication coach-athlète, la clarté des programmes et le suivi des performances.",
  keywords: [
    "coaching sportif",
    "musculation",
    "programme entraînement",
    "suivi performance",
    "coach personnel",
  ],
  authors: [{ name: "THE PROJECT" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "THE PROJECT",
    title: "THE PROJECT - Coaching Sportif Intelligent",
    description:
      "Plateforme de coaching sportif intelligent pour coachs et athlètes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
