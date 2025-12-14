import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🏋️</span>
          <span className="text-xl font-bold text-white">THE PROJECT</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Se connecter
          </Link>
          <Link href="/register">
            <Button>Commencer gratuitement</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-400 font-medium">
              Nouvelle plateforme de coaching
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Le coaching sportif
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              réinventé
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Une plateforme intelligente qui améliore la communication
            coach-athlète, clarifie les programmes et motive la progression.
            Fini les tableurs et messages dispersés.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px]">
                🚀 Essayer gratuitement
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-400">Gratuit pour débuter</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">∞</p>
              <p className="text-sm text-slate-400">Programmes illimités</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-slate-400">Accès mobile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-24 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Des outils puissants pour les coachs, une expérience simple pour
              les athlètes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📋"
              title="Création de programmes"
              description="Créez des programmes structurés avec exercices, séries, répétitions et temps de repos."
            />
            <FeatureCard
              icon="📱"
              title="Suivi en temps réel"
              description="Vos athlètes saisissent leurs performances directement depuis leur téléphone."
            />
            <FeatureCard
              icon="📊"
              title="Analyses détaillées"
              description="Visualisez la progression avec des graphiques clairs et motivants."
            />
            <FeatureCard
              icon="👥"
              title="Gestion des athlètes"
              description="Invitez, organisez et suivez tous vos athlètes depuis un seul endroit."
            />
            <FeatureCard
              icon="💬"
              title="Commentaires de séance"
              description="Échangez des feedbacks après chaque entraînement."
            />
            <FeatureCard
              icon="📸"
              title="Upload de photos"
              description="Les athlètes peuvent partager des photos de leurs séances."
            />
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Coaches */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Pour les Coachs
              </h3>
              <ul className="space-y-3">
                <ListItem>Créez des programmes en quelques minutes</ListItem>
                <ListItem>Suivez la progression de chaque athlète</ListItem>
                <ListItem>Recevez les feedbacks après chaque séance</ListItem>
                <ListItem>Gagnez du temps sur l&apos;administratif</ListItem>
                <ListItem>Augmentez la rétention de vos clients</ListItem>
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full">Créer mon compte Coach</Button>
              </Link>
            </div>

            {/* For Athletes */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">🏋️</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Pour les Athlètes
              </h3>
              <ul className="space-y-3">
                <ListItem>Consultez votre programme où vous voulez</ListItem>
                <ListItem>Enregistrez vos performances facilement</ListItem>
                <ListItem>Visualisez votre progression</ListItem>
                <ListItem>Communiquez avec votre coach</ListItem>
                <ListItem>Restez motivé grâce au suivi visuel</ListItem>
              </ul>
              <Link href="/register" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Créer mon compte Athlète
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre coaching ?
          </h2>
          <p className="text-slate-400 mb-8">
            Rejoignez THE PROJECT gratuitement et découvrez une nouvelle façon
            de coacher et de progresser.
          </p>
          <Link href="/register">
            <Button size="lg">Commencer maintenant — C&apos;est gratuit</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              <span className="font-bold text-white">THE PROJECT</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Conditions d&apos;utilisation
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} THE PROJECT. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors group">
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-slate-300">
      <span className="text-emerald-500 mt-0.5">✓</span>
      {children}
    </li>
  );
}
