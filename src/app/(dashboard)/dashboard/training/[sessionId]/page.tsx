import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { TrainingExerciseCard } from "@/components/training/exercise-card";
import { CardioExerciseCard } from "@/components/training/cardio-exercise-card";
import { CompleteSessionButton } from "@/components/training/complete-session";
import { PauseSessionButton } from "@/components/training/pause-session";
import { ImageUpload } from "@/components/training/image-upload";
import { SessionTimer } from "@/components/training/session-timer";
import type { ExerciseType, IntensityLevel } from "@/types/database";

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
        coach_id,
        created_by
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

  // Check if user is the creator of the program (athlete-created programs)
  const isCreator = session.program.created_by === user.id;

  // If not assigned, not the coach, and not the creator, deny access
  if (!assignment && session.program.coach_id !== user.id && !isCreator) {
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

  // Get session type with fallback
  const sessionType: ExerciseType = (session.session_type as ExerciseType) || "strength";

  // Fetch last performances for cardio exercises
  const cardioExercises = exercises.filter(
    (e: { exercise_type?: ExerciseType }) => e.exercise_type === "cardio" || e.exercise_type === "flexibility"
  );

  const lastPerformances: Record<string, {
    distance_km?: number | null;
    duration_minutes?: number | null;
    heart_rate_avg?: number | null;
    pace_per_km_seconds?: number | null;
  }> = {};

  // Fetch last performance for each cardio exercise
  for (const exercise of cardioExercises) {
    const { data: lastPerf } = await supabase
      .from("exercise_logs")
      .select(`
        distance_km,
        duration_minutes,
        heart_rate_avg,
        pace_per_km_seconds,
        session_logs!inner(completed_at)
      `)
      .eq("exercise_id", exercise.id)
      .eq("athlete_id", user.id)
      .eq("is_deleted", false)
      .not("session_logs.completed_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastPerf) {
      lastPerformances[exercise.id] = lastPerf;
    }
  }

  // Type style mapping
  const typeStyles: Record<ExerciseType, { bg: string; text: string; label: string }> = {
    strength: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Musculation" },
    cardio: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Cardio" },
    flexibility: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Mobilite" },
  };
  const sessionTypeStyle = typeStyles[sessionType];

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

  // Session states
  const isCompleted = !!sessionLog.completed_at;
  const isPaused = !!sessionLog.paused_at;

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{session.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded ${sessionTypeStyle.bg} ${sessionTypeStyle.text}`}>
              {sessionTypeStyle.label}
            </span>
            {isCompleted ? (
              <Badge variant="success">Terminee</Badge>
            ) : isPaused ? (
              <Badge variant="default">En pause</Badge>
            ) : (
              <Badge variant="warning">En cours</Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-400 mt-1 truncate">
            Programme : {session.program.name}
          </p>
          {session.description && (
            <p className="text-slate-500 mt-2">{session.description}</p>
          )}
        </div>
      </div>

      {/* Timer and Pause button */}
      {sessionLog && (
        <div className="flex flex-col items-center gap-4">
          <SessionTimer
            startTime={sessionLog.created_at}
            isCompleted={isCompleted}
            completedAt={sessionLog.completed_at}
            isPaused={isPaused}
            pausedAt={sessionLog.paused_at}
            totalPausedSeconds={sessionLog.total_paused_seconds || 0}
          />
          {!isCompleted && (
            <PauseSessionButton
              sessionLogId={sessionLog.id}
              isPaused={isPaused}
            />
          )}
        </div>
      )}

      {/* Session info */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400 flex-wrap">
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
              description: string | null;
              sets: number | null;
              reps: string | null;
              rest_seconds: number | null;
              tempo: string | null;
              notes: string | null;
              exercise_type?: ExerciseType;
              target_distance_km: number | null;
              target_duration_minutes: number | null;
              target_heart_rate: number | null;
              intensity: IntensityLevel | null;
            }, index: number) => {
              const exerciseType = exercise.exercise_type || "strength";
              const exerciseLogs = (sessionLog?.exercise_logs || []).filter(
                (log: { exercise_id: string }) => log.exercise_id === exercise.id
              );

              // Render cardio card for cardio/flexibility exercises
              if (exerciseType === "cardio" || exerciseType === "flexibility") {
                return (
                  <CardioExerciseCard
                    key={exercise.id}
                    exercise={{
                      id: exercise.id,
                      name: exercise.name,
                      description: exercise.description,
                      target_distance_km: exercise.target_distance_km,
                      target_duration_minutes: exercise.target_duration_minutes,
                      target_heart_rate: exercise.target_heart_rate,
                      intensity: exercise.intensity,
                      notes: exercise.notes,
                    }}
                    index={index}
                    sessionLogId={sessionLog?.id || ""}
                    exerciseLog={exerciseLogs[0] || null}
                    lastPerformance={lastPerformances[exercise.id] || null}
                    isCompleted={isCompleted}
                  />
                );
              }

              // Render strength card for strength exercises
              return (
                <TrainingExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  sessionLogId={sessionLog?.id || ""}
                  exerciseLogs={exerciseLogs}
                  isCompleted={isCompleted}
                />
              );
            })}
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

