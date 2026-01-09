import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { LiveDateTime } from "@/components/dashboard/live-datetime";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { MotivationalQuoteCard } from "@/components/dashboard/motivational-quote";
import { ReadinessCard } from "@/components/dashboard/readiness-form";
import { getDailyQuote, getCoachMessages } from "@/lib/actions/quotes";
import { getTodayReadiness } from "@/lib/actions/readiness";

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

  // Fetch data for athlete dashboard
  let quote = undefined;
  let coachMessage = undefined;
  let todayReadiness = undefined;

  if (!isCoach) {
    const [quoteResult, messagesResult, readinessResult] = await Promise.all([
      getDailyQuote(),
      getCoachMessages(),
      getTodayReadiness(),
    ]);

    quote = quoteResult.data;
    // Get the most recent unread coach message, or the most recent one
    const messages = messagesResult.data || [];
    coachMessage = messages.find((m) => !m.is_read) || messages[0];
    todayReadiness = readinessResult.data;
  }

  return (
    <div className="space-y-6">
      {/* Date/Time and Weather section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <LiveDateTime />
        <WeatherWidget />
      </div>

      {/* Motivational Quote (athletes only) */}
      {!isCoach && (quote || coachMessage) && (
        <MotivationalQuoteCard quote={quote} coachMessage={coachMessage} />
      )}

      {/* Welcome section */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Bonjour, {profile.first_name} !
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          {isCoach
            ? "Gérez vos athlètes et leurs programmes d'entraînement"
            : "Créez vos programmes, entraînez-vous et suivez votre progression"}
        </p>
      </div>

      {/* Readiness card (athletes only) */}
      {!isCoach && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ReadinessCard existingLog={todayReadiness} />
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Tendance</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4 text-center">
                <p className="text-slate-400 text-sm">
                  Complétez plusieurs check-ins pour voir votre tendance
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isCoach ? (
          <>
            <StatCard
              title="Athlètes"
              value="0"
              subtitle="actifs"
              icon="users"
            />
            <StatCard
              title="Programmes"
              value="0"
              subtitle="créés"
              icon="clipboard"
            />
            <StatCard
              title="Séances"
              value="0"
              subtitle="cette semaine"
              icon="dumbbell"
            />
            <StatCard
              title="Taux de complétion"
              value="0%"
              subtitle="ce mois"
              icon="chart"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Programme actif"
              value="0"
              subtitle="en cours"
              icon="clipboard"
            />
            <StatCard
              title="Séances"
              value="0"
              subtitle="cette semaine"
              icon="dumbbell"
            />
            <StatCard
              title="Séries"
              value="0"
              subtitle="complétées"
              icon="target"
            />
            <StatCard
              title="Streak"
              value="0"
              subtitle="jours consécutifs"
              icon="fire"
            />
          </>
        )}
      </div>

      {/* Main content */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming sessions / Recent activity */}
        <Card>
          <CardHeader>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {isCoach ? "Activité récente" : "Prochaines séances"}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">
                <CalendarIcon />
              </div>
              <p className="text-slate-400">
                {isCoach
                  ? "L'activité de vos athlètes apparaîtra ici"
                  : "Vos prochaines séances apparaîtront ici"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isCoach
                  ? "Commencez par inviter des athlètes"
                  : "Créez un programme ou attendez que votre coach vous en assigne un"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Actions rapides
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isCoach ? (
                <>
                  <QuickAction
                    icon="plus"
                    title="Créer un programme"
                    description="Nouveau programme d'entraînement"
                    href="/dashboard/programs/new"
                  />
                  <QuickAction
                    icon="user"
                    title="Inviter un athlète"
                    description="Ajouter un nouvel athlète"
                    href="/dashboard/athletes"
                  />
                  <QuickAction
                    icon="chart"
                    title="Voir les statistiques"
                    description="Performances de vos athlètes"
                    href="/dashboard/stats"
                  />
                </>
              ) : (
                <>
                  <QuickAction
                    icon="dumbbell"
                    title="Commencer une séance"
                    description="Démarrer votre entraînement"
                    href="/dashboard/workout"
                  />
                  <QuickAction
                    icon="chart"
                    title="Voir ma progression"
                    description="Historique et statistiques"
                    href="/dashboard/progress"
                  />
                  <QuickAction
                    icon="message"
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
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs sm:text-sm text-slate-400">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{subtitle}</p>
          </div>
          <StatIcon name={icon} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatIcon({ name }: { name: string }) {
  const iconClass = "h-6 w-6 sm:h-8 sm:w-8 text-emerald-400";

  switch (name) {
    case "users":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h2m14 0h2M5 12a2 2 0 012-2V7a2 2 0 114 0v3h2V7a2 2 0 114 0v3a2 2 0 012 2v0a2 2 0 01-2 2v3a2 2 0 11-4 0v-3h-2v3a2 2 0 11-4 0v-3a2 2 0 01-2-2v0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "target":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "fire":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      );
    default:
      return null;
  }
}

function CalendarIcon() {
  return (
    <svg className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
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
      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
    >
      <QuickActionIcon name={icon} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
          {title}
        </p>
        <p className="text-xs text-slate-400 truncate hidden sm:block">{description}</p>
      </div>
      <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}

function QuickActionIcon({ name }: { name: string }) {
  const iconClass = "h-6 w-6 text-emerald-400";

  switch (name) {
    case "plus":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case "user":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h2m14 0h2M5 12a2 2 0 012-2V7a2 2 0 114 0v3h2V7a2 2 0 114 0v3a2 2 0 012 2v0a2 2 0 01-2 2v3a2 2 0 11-4 0v-3h-2v3a2 2 0 11-4 0v-3a2 2 0 01-2-2v0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "message":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    default:
      return null;
  }
}
