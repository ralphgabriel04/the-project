import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { TrophyIcon, FireIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Ma Progression",
};

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all completed sessions
  const { data: allSessionLogs } = await supabase
    .from("session_logs")
    .select("id, completed_at, duration_minutes, created_at")
    .eq("athlete_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  // Calculate stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const sessionsThisWeek = allSessionLogs?.filter(
    (log) => new Date(log.completed_at!) >= weekStart
  ).length || 0;

  const sessionsThisMonth = allSessionLogs?.filter(
    (log) => new Date(log.completed_at!) >= monthStart
  ).length || 0;

  const totalSessions = allSessionLogs?.length || 0;

  // Calculate total training time
  const totalMinutes = allSessionLogs?.reduce(
    (acc, log) => acc + (log.duration_minutes || 0),
    0
  ) || 0;
  const totalHours = Math.floor(totalMinutes / 60);

  // Get exercise logs for volume and PRs
  const { data: exerciseLogs } = await supabase
    .from("exercise_logs")
    .select(`
      id,
      weight_kg,
      reps_completed,
      created_at,
      exercise:exercises(id, name)
    `)
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  // Calculate total volume (weight × reps)
  const totalVolume = exerciseLogs?.reduce((acc, log) => {
    const weight = log.weight_kg || 0;
    const reps = log.reps_completed || 0;
    return acc + weight * reps;
  }, 0) || 0;

  // Calculate personal records (best weight for each exercise)
  const personalRecords: Record<string, { name: string; weight: number; reps: number; date: string }> = {};
  exerciseLogs?.forEach((log) => {
    if (!log.exercise || !log.weight_kg) return;
    const exerciseId = (log.exercise as { id: string }).id;
    const exerciseName = (log.exercise as { name: string }).name;
    const weight = log.weight_kg;

    if (!personalRecords[exerciseId] || personalRecords[exerciseId].weight < weight) {
      personalRecords[exerciseId] = {
        name: exerciseName,
        weight,
        reps: log.reps_completed || 0,
        date: log.created_at,
      };
    }
  });

  // Get top 5 PRs by weight
  const topPRs = Object.values(personalRecords)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  // Calculate streak (consecutive days with completed sessions)
  let streak = 0;
  if (allSessionLogs && allSessionLogs.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group sessions by date
    const sessionsByDate = new Map<string, boolean>();
    allSessionLogs.forEach((log) => {
      const date = new Date(log.completed_at!);
      date.setHours(0, 0, 0, 0);
      sessionsByDate.set(date.toISOString(), true);
    });

    // Count streak from today backwards
    let checkDate = new Date(today);
    while (sessionsByDate.has(checkDate.toISOString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no session today, check if there was one yesterday
    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (sessionsByDate.has(checkDate.toISOString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  // Calculate sessions per week for the last 8 weeks
  const weeklyData: { week: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStartDate = new Date(weekStart);
    weekStartDate.setDate(weekStartDate.getDate() - i * 7);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    const count = allSessionLogs?.filter((log) => {
      const date = new Date(log.completed_at!);
      return date >= weekStartDate && date <= weekEndDate;
    }).length || 0;

    weeklyData.push({
      week: weekStartDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      count,
    });
  }

  const maxWeeklyCount = Math.max(...weeklyData.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Ma Progression</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Suivez vos performances et vos records personnels
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FireIcon className="h-6 w-6 text-orange-400" />}
          value={streak}
          label="Jours consécutifs"
          subLabel={streak > 0 ? "Continuez comme ça !" : "Commencez votre streak"}
          variant="warning"
        />
        <StatCard
          icon={<ChartBarIcon className="h-6 w-6 text-emerald-400" />}
          value={sessionsThisWeek}
          label="Séances cette semaine"
          variant="success"
        />
        <StatCard
          icon={<ChartBarIcon className="h-6 w-6 text-blue-400" />}
          value={sessionsThisMonth}
          label="Séances ce mois"
          variant="default"
        />
        <StatCard
          icon={<TrophyIcon className="h-6 w-6 text-amber-400" />}
          value={totalSessions}
          label="Total des séances"
          variant="default"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Temps d&apos;entraînement</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-400">
                {totalHours}h {totalMinutes % 60}m
              </p>
              <p className="text-sm text-slate-400 mt-2">Temps total d&apos;entraînement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Volume total</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">
                {formatWeight(totalVolume)}
              </p>
              <p className="text-sm text-slate-400 mt-2">kg soulevés au total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Séances par semaine</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-emerald-500/80 rounded-t transition-all"
                  style={{
                    height: `${(week.count / maxWeeklyCount) * 100}%`,
                    minHeight: week.count > 0 ? "8px" : "0px",
                  }}
                />
                <span className="text-xs text-slate-400 hidden sm:block">{week.week}</span>
                <span className="text-xs text-white font-medium">{week.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Records personnels</h2>
            <Badge variant="warning">Top 5</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topPRs.length > 0 ? (
            <div className="space-y-3">
              {topPRs.map((pr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-amber-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{pr.name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(pr.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{pr.weight} kg</p>
                    <p className="text-xs text-slate-400">{pr.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun record pour le moment</p>
              <p className="text-sm mt-1">Commencez à enregistrer vos séances !</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Dernières séances</h2>
        </CardHeader>
        <CardContent>
          {allSessionLogs && allSessionLogs.length > 0 ? (
            <div className="space-y-2">
              {allSessionLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {new Date(log.completed_at!).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {log.duration_minutes && (
                      <p className="text-sm text-slate-400">
                        {log.duration_minutes} min
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Aucune séance terminée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  subLabel,
  variant = "default",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  subLabel?: string;
  variant?: "default" | "success" | "warning";
}) {
  const valueColors = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className={`text-2xl font-bold ${valueColors[variant]}`}>
            {value}
          </span>
        </div>
        <p className="text-sm text-slate-400">{label}</p>
        {subLabel && (
          <p className="text-xs text-slate-500 mt-1">{subLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

function formatWeight(weight: number): string {
  if (weight >= 1000000) {
    return `${(weight / 1000000).toFixed(1)}M`;
  }
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)}k`;
  }
  return weight.toFixed(0);
}
