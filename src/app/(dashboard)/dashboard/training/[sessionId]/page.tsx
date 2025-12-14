import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { TrainingExerciseCard } from "@/components/training/exercise-card";
import { CompleteSessionButton } from "@/components/training/complete-session";
import { ImageUpload } from "@/components/training/image-upload";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  
  const { data: session } = await supabase
    .from("sessions")
    .select("name")
    .eq("id", sessionId)
    .single();

  return {
    title: session?.name || "Entraînement",
  };
}

export default async function TrainingSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get session with exercises
  const { data: session, error } = await supabase
    .from("sessions")
    .select(`
      *,
      program:programs!inner(
        id,
        name,
        coach_id
      ),
      exercises(*)
    `)
    .eq("id", sessionId)
    .eq("is_deleted", false)
    .single();

  if (error || !session) {
    notFound();
  }

  // Verify athlete has access to this program
  const { data: assignment } = await supabase
    .from("program_assignments")
    .select("id")
    .eq("program_id", session.program.id)
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .single();

  // If not assigned and not the coach, deny access
  if (!assignment && session.program.coach_id !== user.id) {
    notFound();
  }

  // Get or create today's session log
  const today = new Date().toISOString().split("T")[0];
  let { data: sessionLog } = await supabase
    .from("session_logs")
    .select(`
      *,
      exercise_logs(*)
    `)
    .eq("session_id", sessionId)
    .eq("athlete_id", user.id)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no session log exists, create one
  if (!sessionLog) {
    const { data: newLog } = await supabase
      .from("session_logs")
      .insert({
        session_id: sessionId,
        athlete_id: user.id,
      })
      .select("*, exercise_logs(*)")
      .single();
    
    sessionLog = newLog;
  }

  // Sort exercises by order_index
  const exercises = (session.exercises || [])
    .filter((e: { is_deleted: boolean }) => !e.is_deleted)
    .sort((a: { order_index: number }, b: { order_index: number }) => 
      a.order_index - b.order_index
    );

  const isCompleted = sessionLog?.completed_at !== null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/dashboard/programs/${session.program.id}`}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors mt-1"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            {isCompleted ? (
              <Badge variant="success">Terminée ✓</Badge>
            ) : (
              <Badge variant="warning">En cours</Badge>
            )}
          </div>
          <p className="text-slate-400 mt-1">
            Programme : {session.program.name}
          </p>
          {session.description && (
            <p className="text-slate-500 mt-2">{session.description}</p>
          )}
        </div>
      </div>

      {/* Session info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>📋 {exercises.length} exercices</span>
              {session.estimated_duration_minutes && (
                <span>⏱️ ~{session.estimated_duration_minutes} min</span>
              )}
              <span>📅 {new Date().toLocaleDateString("fr-FR")}</span>
            </div>
            {!isCompleted && sessionLog && (
              <CompleteSessionButton sessionLogId={sessionLog.id} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Exercices
        </h2>

        {exercises.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">
                Aucun exercice dans cette séance.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise: {
              id: string;
              name: string;
              sets: number | null;
              reps: string | null;
              rest_seconds: number | null;
              tempo: string | null;
              notes: string | null;
            }, index: number) => (
              <TrainingExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                sessionLogId={sessionLog?.id || ""}
                exerciseLogs={(sessionLog?.exercise_logs || []).filter(
                  (log: { exercise_id: string }) => log.exercise_id === exercise.id
                )}
                isCompleted={isCompleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo upload */}
      {sessionLog && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">📸 Photos</h2>
          </CardHeader>
          <CardContent>
            {!isCompleted ? (
              <ImageUpload sessionLogId={sessionLog.id} />
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                Session terminée. Pas de nouvelles photos.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complete button at bottom */}
      {!isCompleted && sessionLog && (
        <div className="sticky bottom-6 flex justify-center">
          <CompleteSessionButton 
            sessionLogId={sessionLog.id} 
            variant="large"
          />
        </div>
      )}
    </div>
  );
}

