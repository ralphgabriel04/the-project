import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Badge, EmptyState, Avatar } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: athlete } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", id)
    .single();

  const name = athlete 
    ? `${athlete.first_name} ${athlete.last_name}`
    : "Athlète";

  return {
    title: name,
  };
}

export default async function AthletePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify current user is a coach and has access to this athlete
  const { data: relationship } = await supabase
    .from("coach_athletes")
    .select(`
      *,
      athlete:profiles!coach_athletes_athlete_id_fkey(*)
    `)
    .eq("coach_id", user.id)
    .eq("athlete_id", id)
    .eq("is_deleted", false)
    .single();

  if (!relationship) {
    notFound();
  }

  const athlete = relationship.athlete;

  // Get programs assigned to this athlete
  const { data: assignments } = await supabase
    .from("program_assignments")
    .select(`
      *,
      program:programs(*)
    `)
    .eq("athlete_id", id)
    .eq("is_deleted", false);

  const programs = assignments || [];

  // Get recent session logs
  const { data: recentLogs } = await supabase
    .from("session_logs")
    .select(`
      *,
      session:sessions(
        name,
        program:programs(name)
      )
    `)
    .eq("athlete_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const sessionLogs = recentLogs || [];
  const completedSessions = sessionLogs.filter((log) => log.completed_at !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/athletes"
          className="mt-1 p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl">
              {athlete?.first_name?.[0] || "?"}
              {athlete?.last_name?.[0] || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {athlete?.first_name || "Athlète"} {athlete?.last_name || "Inconnu"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={relationship.status === "accepted" ? "success" : "warning"}>
                  {relationship.status === "accepted" ? "Actif" : "En attente"}
                </Badge>
                {athlete?.email && (
                  <span className="text-sm text-slate-400">{athlete.email}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Programmes</p>
            <p className="text-2xl font-bold text-white">{programs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Séances complétées</p>
            <p className="text-2xl font-bold text-emerald-400">{completedSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Récentes</p>
            <p className="text-2xl font-bold text-white">{sessionLogs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Membre depuis</p>
            <p className="text-lg font-bold text-white">
              {new Date(relationship.created_at).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Programs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Programmes assignés ({programs.length})
            </h2>
            <Link
              href={`/dashboard/programs?assign=${id}`}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              + Assigner un programme
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Aucun programme assigné"
              description="Assignez un programme à cet athlète pour commencer son entraînement."
            />
          ) : (
            <div className="space-y-3">
              {programs.map((assignment) => {
                const program = assignment.program;
                if (!program) return null;
                
                return (
                  <Link
                    key={assignment.id}
                    href={`/dashboard/programs/${program.id}`}
                    className="block p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{program.name}</h3>
                        <p className="text-sm text-slate-400">
                          {program.duration_weeks
                            ? `${program.duration_weeks} semaines`
                            : "Durée non définie"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          program.status === "active"
                            ? "success"
                            : program.status === "draft"
                              ? "warning"
                              : "default"
                        }
                      >
                        {program.status === "active"
                          ? "Actif"
                          : program.status === "draft"
                            ? "Brouillon"
                            : "Archivé"}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Activité récente</h2>
        </CardHeader>
        <CardContent>
          {sessionLogs.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Aucune activité"
              description="L'historique d'entraînement de l'athlète apparaîtra ici."
            />
          ) : (
            <div className="space-y-3">
              {sessionLogs.map((log: {
                id: string;
                completed_at: string | null;
                overall_rpe: number | null;
                athlete_notes: string | null;
                created_at: string;
                session: {
                  name: string;
                  program: { name: string };
                };
              }) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {log.session?.name || "Séance"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {log.session?.program?.name || "Programme"}
                      </p>
                    </div>
                    <div className="text-right">
                      {log.completed_at ? (
                        <Badge variant="success">Terminée</Badge>
                      ) : (
                        <Badge variant="warning">En cours</Badge>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(log.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  {(log.overall_rpe || log.athlete_notes) && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      {log.overall_rpe && (
                        <p className="text-sm text-slate-400">
                          RPE: <span className="text-amber-400 font-medium">{log.overall_rpe}/10</span>
                        </p>
                      )}
                      {log.athlete_notes && (
                        <p className="text-sm text-slate-400 mt-1 italic">
                          "{log.athlete_notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

