import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const isCoach = profile.role === "coach";

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bonjour, {profile.first_name} ! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {isCoach
            ? "Gérez vos athlètes et leurs programmes d'entraînement"
            : "Consultez vos programmes et enregistrez vos performances"}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isCoach ? (
          <>
            <StatCard
              title="Athlètes"
              value="0"
              subtitle="actifs"
              icon="👥"
            />
            <StatCard
              title="Programmes"
              value="0"
              subtitle="créés"
              icon="📋"
            />
            <StatCard
              title="Séances"
              value="0"
              subtitle="cette semaine"
              icon="🏋️"
            />
            <StatCard
              title="Taux de complétion"
              value="0%"
              subtitle="ce mois"
              icon="📈"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Programme actif"
              value="0"
              subtitle="en cours"
              icon="📋"
            />
            <StatCard
              title="Séances"
              value="0"
              subtitle="cette semaine"
              icon="🏋️"
            />
            <StatCard
              title="Séries"
              value="0"
              subtitle="complétées"
              icon="💪"
            />
            <StatCard
              title="Streak"
              value="0"
              subtitle="jours consécutifs"
              icon="🔥"
            />
          </>
        )}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming sessions / Recent activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              {isCoach ? "Activité récente" : "Prochaines séances"}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-slate-400">
                {isCoach
                  ? "L'activité de vos athlètes apparaîtra ici"
                  : "Vos prochaines séances apparaîtront ici"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isCoach
                  ? "Commencez par inviter des athlètes"
                  : "Attendez qu'un coach vous assigne un programme"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Actions rapides
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isCoach ? (
                <>
                  <QuickAction
                    icon="➕"
                    title="Créer un programme"
                    description="Nouveau programme d'entraînement"
                    href="/dashboard/programs/new"
                  />
                  <QuickAction
                    icon="👤"
                    title="Inviter un athlète"
                    description="Ajouter un nouvel athlète"
                    href="/dashboard/athletes"
                  />
                  <QuickAction
                    icon="📊"
                    title="Voir les statistiques"
                    description="Performances de vos athlètes"
                    href="/dashboard/stats"
                  />
                </>
              ) : (
                <>
                  <QuickAction
                    icon="🏋️"
                    title="Commencer une séance"
                    description="Démarrer votre entraînement"
                    href="/dashboard/workout"
                  />
                  <QuickAction
                    icon="📈"
                    title="Voir ma progression"
                    description="Historique et statistiques"
                    href="/dashboard/progress"
                  />
                  <QuickAction
                    icon="💬"
                    title="Contacter mon coach"
                    description="Envoyer un message"
                    href="/dashboard/messages"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">
        →
      </span>
    </a>
  );
}

