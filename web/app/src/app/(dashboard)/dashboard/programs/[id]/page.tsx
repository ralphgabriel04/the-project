import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Badge, EmptyState } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ProgramActions } from "@/components/programs/program-actions";
import { SessionCard } from "@/components/programs/session-card";
import { AddSessionButton } from "@/components/programs/add-session";
import { AssignProgramButton } from "@/components/programs/assign-program";
import { AthleteSessionCard } from "@/components/training/athlete-session-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase
    .from("programs")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: program?.name || "Programme",
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";
  const isAthlete = profile?.role === "athlete";

  // Get program with sessions and exercises
  // For coaches: filter by coach_id
  // For athletes: RLS will filter automatically based on assignments
  let query = supabase
    .from("programs")
    .select(`
      *,
      sessions(
        *,
        exercises(*)
      ),
      program_assignments(
        id,
        athlete:profiles(id, first_name, last_name)
      )
    `)
    .eq("id", id)
    .eq("is_deleted", false);

  // Only coaches need to filter by coach_id
  if (isCoach) {
    query = query.eq("coach_id", user.id);
  }

  const { data: program, error } = await query.single();

  if (error || !program) {
    notFound();
  }

  // Check if athlete owns this program (created it themselves)
  const isOwner = isCoach
    ? program.coach_id === user.id
    : program.created_by === user.id;

  // Can manage = coach who owns OR athlete who created
  const canManageProgram = isOwner;

  // Sort sessions by order_index
  const sessions = (program.sessions || [])
    .filter((s: { is_deleted: boolean }) => !s.is_deleted)
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index);

  // For athletes: get their session logs for this program's sessions
  let sessionLogsMap: Record<string, Array<{
    id: string;
    completed_at: string | null;
    overall_rpe: number | null;
    created_at: string;
  }>> = {};

  if (!isCoach) {
    const sessionIds = sessions.map((s: { id: string }) => s.id);
    if (sessionIds.length > 0) {
      const { data: logs } = await supabase
        .from("session_logs")
        .select("id, session_id, completed_at, overall_rpe, created_at")
        .eq("athlete_id", user.id)
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false });

      // Group logs by session_id
      (logs || []).forEach((log: { session_id: string; id: string; completed_at: string | null; overall_rpe: number | null; created_at: string }) => {
        if (!sessionLogsMap[log.session_id]) {
          sessionLogsMap[log.session_id] = [];
        }
        sessionLogsMap[log.session_id].push(log);
      });
    }
  }

  // Get athletes for assignment
  const { data: athletes } = await supabase
    .from("coach_athletes")
    .select(`
      athlete:profiles!coach_athletes_athlete_id_fkey(id, first_name, last_name)
    `)
    .eq("coach_id", user.id)
    .eq("status", "accepted")
    .eq("is_deleted", false);

  const availableAthletes = athletes?.map((a) => a.athlete) || [];
  const assignedAthleteIds = (program.program_assignments || []).map(
    (a: { athlete: { id: string } }) => a.athlete?.id,
  );

  const statusColors = {
    draft: "warning",
    active: "success",
    archived: "default",
  } as const;

  const statusLabels = {
    draft: "Brouillon",
    active: "Actif",
    archived: "Archivé",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/programs"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors mt-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{program.name}</h1>
              <Badge
                variant={
                  statusColors[program.status as keyof typeof statusColors]
                }
              >
                {statusLabels[program.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            {program.description && (
              <p className="text-slate-400 mt-2 max-w-2xl">
                {program.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
              {program.duration_weeks && (
                <span>📅 {program.duration_weeks} semaines</span>
              )}
              <span>📋 {sessions.length} séance(s)</span>
              <span>
                👥 {program.program_assignments?.length || 0} athlète(s)
              </span>
            </div>
          </div>
        </div>

        {canManageProgram && (
          <ProgramActions programId={program.id} programName={program.name} />
        )}
      </div>

      {/* Quick actions - for program owners */}
      {canManageProgram && (
        <div className="flex flex-wrap gap-3">
          <AddSessionButton programId={program.id} />
          {/* Only coaches can assign athletes */}
          {isCoach && (
            <AssignProgramButton
              programId={program.id}
              athletes={availableAthletes}
              assignedAthleteIds={assignedAthleteIds}
            />
          )}
        </div>
      )}

      {/* Assigned athletes */}
      {program.program_assignments && program.program_assignments.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Athlètes assignés
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {program.program_assignments.map(
                (assignment: { id: string; athlete: { first_name: string; last_name: string } }) => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-full"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                      {assignment.athlete.first_name[0]}
                      {assignment.athlete.last_name[0]}
                    </div>
                    <span className="text-sm text-white">
                      {assignment.athlete.first_name} {assignment.athlete.last_name}
                    </span>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Séances ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="📋"
                title="Aucune séance"
                description={canManageProgram
                  ? "Ajoutez votre première séance à ce programme."
                  : "Ce programme n'a pas encore de séances."
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className={canManageProgram ? "space-y-4" : "grid md:grid-cols-2 gap-4"}>
            {sessions.map((session: {
              id: string;
              name: string;
              description: string | null;
              day_of_week: number | null;
              estimated_duration_minutes: number | null;
              exercises: Array<{
                id: string;
                name: string;
                sets: number | null;
                reps: string | null;
                rest_seconds: number | null;
                is_deleted: boolean;
              }>;
            }, index: number) => (
              canManageProgram ? (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  programId={program.id}
                />
              ) : (
                <AthleteSessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  recentLogs={sessionLogsMap[session.id] || []}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

