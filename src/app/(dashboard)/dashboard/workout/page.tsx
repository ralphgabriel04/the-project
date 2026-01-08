import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, EmptyState, Badge } from "@/components/ui";
import { PlayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Commencer un entraînement",
};

interface SessionData {
  id: string;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  day_of_week: number | null;
  program: {
    id: string;
    name: string;
    coach_id: string | null;
    created_by: string | null;
  };
}

export default async function WorkoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get assigned programs first
  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("program_id")
    .eq("athlete_id", user.id)
    .eq("is_deleted", false);

  const assignedProgramIds = assignments?.map((a) => a.program_id) || [];

  // Get all sessions from assigned programs
  let assignedSessions: {
    id: string;
    name: string;
    description: string | null;
    estimated_duration_minutes: number | null;
    day_of_week: number | null;
    program: { id: string; name: string; coach_id: string | null };
  }[] = [];

  if (assignedProgramIds.length > 0) {
    const { data } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        estimated_duration_minutes,
        day_of_week,
        program:programs!inner(id, name, coach_id)
      `)
      .eq("is_deleted", false)
      .in("program_id", assignedProgramIds);

    assignedSessions = (data || []) as typeof assignedSessions;
  }

  // Try to get sessions from own programs (athlete created) - requires migration 007
  let ownSessions: typeof assignedSessions = [];
  const { data: ownData, error: ownError } = await supabase
    .from("sessions")
    .select(`
      id,
      name,
      description,
      estimated_duration_minutes,
      day_of_week,
      program:programs!inner(id, name, coach_id)
    `)
    .eq("is_deleted", false)
    .eq("programs.created_by", user.id)
    .is("programs.coach_id", null);

  // Only use ownSessions if no error (created_by column might not exist)
  if (!ownError) {
    ownSessions = (ownData || []) as typeof ownSessions;
  }

  // Combine sessions (add created_by: null for compatibility)
  const allSessions: SessionData[] = [
    ...(ownSessions || []).map(s => ({ ...s, program: { ...s.program, created_by: user.id } })),
    ...(assignedSessions || []).map(s => ({ ...s, program: { ...s.program, created_by: null } })),
  ] as SessionData[];

  // Get today's completed sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayLogs } = await supabase
    .from("session_logs")
    .select("session_id, completed_at")
    .eq("athlete_id", user.id)
    .gte("created_at", today.toISOString());

  const completedToday = new Set(
    todayLogs
      ?.filter((log) => log.completed_at)
      .map((log) => log.session_id) || []
  );

  const inProgressToday = new Set(
    todayLogs
      ?.filter((log) => !log.completed_at)
      .map((log) => log.session_id) || []
  );

  // Get current day of week (1 = Monday, 7 = Sunday)
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  // Sort sessions: today's sessions first, then by program
  const sortedSessions = allSessions.sort((a, b) => {
    // Today's sessions first
    const aIsToday = a.day_of_week === dayOfWeek;
    const bIsToday = b.day_of_week === dayOfWeek;
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;

    // Then by program name
    return a.program.name.localeCompare(b.program.name);
  });

  // Group sessions by program
  const sessionsByProgram = sortedSessions.reduce(
    (acc, session) => {
      const programId = session.program.id;
      if (!acc[programId]) {
        acc[programId] = {
          program: session.program,
          sessions: [],
        };
      }
      acc[programId].sessions.push(session);
      return acc;
    },
    {} as Record<string, { program: SessionData["program"]; sessions: SessionData[] }>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Commencer un entraînement
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Choisissez une séance pour commencer votre entraînement
        </p>
      </div>

      {/* Today's Suggested Sessions */}
      {sortedSessions.some((s) => s.day_of_week === dayOfWeek) && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              🎯 Séances du jour ({getDayName(dayOfWeek)})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSessions
                .filter((s) => s.day_of_week === dayOfWeek)
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isCompleted={completedToday.has(session.id)}
                    isInProgress={inProgressToday.has(session.id)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sessions by Program */}
      {Object.keys(sessionsByProgram).length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Toutes les séances</h2>
          {Object.values(sessionsByProgram).map(({ program, sessions }) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{program.name}</h3>
                  <Badge variant={program.coach_id ? "default" : "success"}>
                    {program.coach_id ? "Coach" : "Personnel"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isCompleted={completedToday.has(session.id)}
                      isInProgress={inProgressToday.has(session.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon="🏋️"
              title="Aucune séance disponible"
              description="Créez un programme avec des séances ou attendez que votre coach vous en assigne un."
              action={{
                label: "Créer un programme",
                href: "/dashboard/programs/new",
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getDayName(day: number): string {
  const days = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  return days[day] || "";
}

function SessionCard({
  session,
  isCompleted,
  isInProgress,
}: {
  session: SessionData;
  isCompleted: boolean;
  isInProgress: boolean;
}) {
  return (
    <Link href={`/dashboard/training/${session.id}`}>
      <div
        className={`
          p-4 rounded-lg border transition-all cursor-pointer
          ${isCompleted
            ? "border-emerald-500/50 bg-emerald-500/10"
            : isInProgress
            ? "border-amber-500/50 bg-amber-500/10"
            : "border-slate-700 bg-slate-800 hover:border-emerald-500/50"}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white truncate">{session.name}</h4>
            {session.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                {session.description}
              </p>
            )}
          </div>
          {isCompleted ? (
            <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <PlayIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          {session.estimated_duration_minutes && (
            <span>⏱️ {session.estimated_duration_minutes} min</span>
          )}
          {session.day_of_week && (
            <span>📅 {getDayName(session.day_of_week)}</span>
          )}
        </div>
        <div className="mt-3">
          {isCompleted ? (
            <span className="text-xs text-emerald-400">Terminée aujourd&apos;hui ✓</span>
          ) : isInProgress ? (
            <span className="text-xs text-amber-400">En cours...</span>
          ) : (
            <span className="text-xs text-emerald-400">Commencer →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
