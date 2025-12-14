import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { TrainingExerciseCard } from "@/components/training/exercise-card";
import { CompleteSessionButton } from "@/components/training/complete-session";
import { ImageUpload } from "@/components/training/image-upload";
import { SessionTimer } from "@/components/training/session-timer";

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

  // Get the most recent session log for this session (completed or not)
  let { data: sessionLog } = await supabase
    .from("session_logs")
    .select(`
      *,
      exercise_logs(*),
      session_images(*)
    `)
    .eq("session_id", sessionId)
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no session log exists, create a new one
  // If the most recent one is completed, allow viewing but don't create new
  if (!sessionLog) {
    const { data: newLog, error: insertError } = await supabase
      .from("session_logs")
      .insert({
        session_id: sessionId,
        athlete_id: user.id,
      })
      .select("*, exercise_logs(*), session_images(*)")
      .single();
    
    if (insertError) {
      console.error("Error creating session log:", insertError);
    }
    
    sessionLog = newLog;
  }

  // Sort exercises by order_index
  const exercises = (session.exercises || [])
    .filter((e: { is_deleted: boolean }) => !e.is_deleted)
    .sort((a: { order_index: number }, b: { order_index: number }) => 
      a.order_index - b.order_index
    );

  // Handle case where session log couldn't be created
  if (!sessionLog) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <Link
            href={`/dashboard/programs/${session.program.id}`}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors mt-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            <p className="text-red-400 mt-2">
              Erreur : Impossible de démarrer la séance. Veuillez réessayer ou contacter le support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Session is completed only if completed_at has a value
  const isCompleted = !!sessionLog.completed_at;

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

      {/* Timer */}
      {sessionLog && (
        <div className="flex justify-center">
          <SessionTimer
            startTime={sessionLog.created_at}
            isCompleted={isCompleted}
            completedAt={sessionLog.completed_at}
          />
        </div>
      )}

      {/* Session info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
            <span>📋 {exercises.length} exercices</span>
            {session.estimated_duration_minutes && (
              <span>⏱️ ~{session.estimated_duration_minutes} min</span>
            )}
            <span>📅 {new Date().toLocaleDateString("fr-FR")}</span>
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

      {/* Photos section */}
      {sessionLog && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">📸 Photos</h2>
          </CardHeader>
          <CardContent>
            {/* Show existing photos */}
            {sessionLog.session_images && sessionLog.session_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {sessionLog.session_images
                  .filter((img: { is_deleted?: boolean }) => !img.is_deleted)
                  .map((image: { id: string; image_url: string; caption?: string }) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.caption || "Photo de séance"}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
              </div>
            )}
            
            {/* Upload new photo (only if not completed) */}
            {!isCompleted ? (
              <ImageUpload sessionLogId={sessionLog.id} />
            ) : (
              sessionLog.session_images?.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  Aucune photo pour cette séance.
                </p>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Complete button at bottom */}
      {!isCompleted && sessionLog && (
        <div className="sticky bottom-6 flex justify-center">
          <CompleteSessionButton 
            sessionLogId={sessionLog.id}
            startTime={sessionLog.created_at}
            variant="large"
          />
        </div>
      )}
    </div>
  );
}

