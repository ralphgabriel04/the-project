import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Cadence",
  description:
    "Politique de confidentialité de Cadence. Comment nous protégeons vos données personnelles.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
            Retour à l&apos;accueil
          </Link>

          <h1 className="mb-8 text-4xl font-bold text-[var(--text-primary)]">
            Politique de confidentialité
          </h1>

          <div className="space-y-8 text-[var(--text-secondary)]">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                1. Collecte des données
              </h2>
              <p className="leading-relaxed">
                Lorsque vous vous inscrivez à notre liste d&apos;attente, nous
                collectons uniquement votre adresse email. Cette information est
                utilisée exclusivement pour vous informer du lancement de
                Cadence et vous envoyer des mises à jour importantes concernant
                notre service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                2. Utilisation des données
              </h2>
              <p className="leading-relaxed">
                Votre adresse email sera utilisée pour :
              </p>
              <ul className="mt-4 list-inside list-disc space-y-2">
                <li>Confirmer votre inscription à la liste d&apos;attente</li>
                <li>Vous informer du lancement de Cadence</li>
                <li>
                  Vous envoyer des mises à jour importantes (maximum 1-2 fois
                  par mois)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                3. Protection des données
              </h2>
              <p className="leading-relaxed">
                Vos données sont stockées de manière sécurisée et ne sont jamais
                partagées, vendues ou louées à des tiers. Nous utilisons des
                mesures de sécurité conformes aux standards de l&apos;industrie
                pour protéger vos informations personnelles.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                4. Vos droits (PIPEDA)
              </h2>
              <p className="leading-relaxed">
                Conformément à la Loi sur la protection des renseignements
                personnels et les documents électroniques (PIPEDA), vous avez le
                droit de :
              </p>
              <ul className="mt-4 list-inside list-disc space-y-2">
                <li>
                  Accéder aux données personnelles que nous détenons sur vous
                </li>
                <li>Demander la correction de vos données</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous désinscrire de notre liste à tout moment</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                5. Contact
              </h2>
              <p className="leading-relaxed">
                Pour toute question concernant cette politique de
                confidentialité ou pour exercer vos droits, veuillez nous
                contacter à :{" "}
                <a
                  href="mailto:privacy@cadence.app"
                  className="text-[var(--accent)] hover:underline"
                >
                  privacy@cadence.app
                </a>
              </p>
            </section>

            <section className="border-t border-[var(--border-subtle)] pt-8">
              <p className="text-sm text-[var(--text-muted)]">
                Dernière mise à jour : Avril 2026
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
