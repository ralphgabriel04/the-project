"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TrainingActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: { id: string };
}

/**
 * Start a training session - creates a session_log
 */
export async function startSession(
  sessionId: string,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Check if there's already an incomplete session log for today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingLog } = await supabase
    .from("session_logs")
    .select("id")
    .eq("session_id", sessionId)
    .eq("athlete_id", user.id)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)
    .single();

  if (existingLog) {
    return {
      success: true,
      message: "Session déjà commencée",
      data: { id: existingLog.id },
    };
  }

  // Create session log
  const { data, error } = await supabase
    .from("session_logs")
    .insert({
      session_id: sessionId,
      athlete_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Start session error:", error);
    return { success: false, error: "Erreur lors du démarrage de la séance" };
  }

  return {
    success: true,
    message: "Séance commencée !",
    data: { id: data.id },
  };
}

/**
 * Complete a training session
 */
export async function completeSession(
  sessionLogId: string,
  formData: FormData,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const rpe = formData.get("rpe") as string;
  const notes = formData.get("notes") as string;
  const durationMinutes = formData.get("duration_minutes") as string;

  const { error } = await supabase
    .from("session_logs")
    .update({
      completed_at: new Date().toISOString(),
      overall_rpe: rpe ? parseInt(rpe, 10) : null,
      athlete_notes: notes?.trim() || null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
    })
    .eq("id", sessionLogId)
    .eq("athlete_id", user.id);

  if (error) {
    console.error("Complete session error:", error);
    return { success: false, error: "Erreur lors de la validation" };
  }

  // Revalidate all relevant paths
  revalidatePath("/dashboard/programs", "layout");
  revalidatePath("/dashboard/training", "layout");

  return {
    success: true,
    message: "Séance terminée ! Bravo 💪",
  };
}

/**
 * Log an exercise set
 */
export async function logExerciseSet(
  sessionLogId: string,
  exerciseId: string,
  formData: FormData,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const setNumber = formData.get("set_number") as string;
  const weightKg = formData.get("weight_kg") as string;
  const repsCompleted = formData.get("reps_completed") as string;
  const rpe = formData.get("rpe") as string;
  const notes = formData.get("notes") as string;

  const { data, error } = await supabase
    .from("exercise_logs")
    .insert({
      session_log_id: sessionLogId,
      exercise_id: exerciseId,
      athlete_id: user.id,
      set_number: parseInt(setNumber, 10),
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      reps_completed: repsCompleted ? parseInt(repsCompleted, 10) : null,
      rpe: rpe ? parseInt(rpe, 10) : null,
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Log exercise error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }

  return {
    success: true,
    message: "Série enregistrée !",
    data: { id: data.id },
  };
}

/**
 * Update an exercise log
 */
export async function updateExerciseLog(
  exerciseLogId: string,
  formData: FormData,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const weightKg = formData.get("weight_kg") as string;
  const repsCompleted = formData.get("reps_completed") as string;
  const rpe = formData.get("rpe") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase
    .from("exercise_logs")
    .update({
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      reps_completed: repsCompleted ? parseInt(repsCompleted, 10) : null,
      rpe: rpe ? parseInt(rpe, 10) : null,
      notes: notes?.trim() || null,
    })
    .eq("id", exerciseLogId)
    .eq("athlete_id", user.id);

  if (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  return { success: true, message: "Mis à jour !" };
}

/**
 * Get session logs for an athlete
 */
export async function getSessionLogs(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("session_logs")
    .select(`
      *,
      exercise_logs(*)
    `)
    .eq("session_id", sessionId)
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

/**
 * Pause a training session
 */
export async function pauseSession(
  sessionLogId: string,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get current session log to verify it's not already paused or completed
  const { data: sessionLog } = await supabase
    .from("session_logs")
    .select("paused_at, completed_at")
    .eq("id", sessionLogId)
    .eq("athlete_id", user.id)
    .single();

  if (!sessionLog) {
    return { success: false, error: "Séance non trouvée" };
  }

  if (sessionLog.completed_at) {
    return { success: false, error: "Séance déjà terminée" };
  }

  if (sessionLog.paused_at) {
    return { success: false, error: "Séance déjà en pause" };
  }

  const { error } = await supabase
    .from("session_logs")
    .update({
      paused_at: new Date().toISOString(),
    })
    .eq("id", sessionLogId)
    .eq("athlete_id", user.id);

  if (error) {
    console.error("Pause session error:", error);
    return { success: false, error: "Erreur lors de la mise en pause" };
  }

  revalidatePath("/dashboard/training", "layout");
  revalidatePath("/dashboard/workout");

  return {
    success: true,
    message: "Séance mise en pause",
  };
}

/**
 * Resume a paused training session
 */
export async function resumeSession(
  sessionLogId: string,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get current session log
  const { data: sessionLog } = await supabase
    .from("session_logs")
    .select("paused_at, total_paused_seconds, completed_at")
    .eq("id", sessionLogId)
    .eq("athlete_id", user.id)
    .single();

  if (!sessionLog) {
    return { success: false, error: "Séance non trouvée" };
  }

  if (sessionLog.completed_at) {
    return { success: false, error: "Séance déjà terminée" };
  }

  if (!sessionLog.paused_at) {
    return { success: false, error: "Séance n'est pas en pause" };
  }

  // Calculate time spent paused
  const pausedAt = new Date(sessionLog.paused_at).getTime();
  const now = Date.now();
  const pausedSeconds = Math.floor((now - pausedAt) / 1000);
  const newTotalPaused = (sessionLog.total_paused_seconds || 0) + pausedSeconds;

  const { error } = await supabase
    .from("session_logs")
    .update({
      paused_at: null,
      total_paused_seconds: newTotalPaused,
    })
    .eq("id", sessionLogId)
    .eq("athlete_id", user.id);

  if (error) {
    console.error("Resume session error:", error);
    return { success: false, error: "Erreur lors de la reprise" };
  }

  revalidatePath("/dashboard/training", "layout");
  revalidatePath("/dashboard/workout");

  return {
    success: true,
    message: "Séance reprise",
  };
}

/**
 * Log a cardio exercise (distance, duration, heart rate)
 */
export async function logCardioExercise(
  sessionLogId: string,
  exerciseId: string,
  formData: FormData,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifie" };
  }

  const distanceKm = formData.get("distance_km") as string;
  const durationMinutes = formData.get("duration_minutes") as string;
  const heartRateAvg = formData.get("heart_rate_avg") as string;
  const heartRateMax = formData.get("heart_rate_max") as string;
  const notes = formData.get("notes") as string;

  // Calculate pace if distance and duration provided
  let pacePerKmSeconds: number | null = null;
  if (distanceKm && durationMinutes) {
    const distance = parseFloat(distanceKm);
    const duration = parseInt(durationMinutes, 10);
    if (distance > 0 && duration > 0) {
      pacePerKmSeconds = Math.round((duration * 60) / distance);
    }
  }

  const { data, error } = await supabase
    .from("exercise_logs")
    .insert({
      session_log_id: sessionLogId,
      exercise_id: exerciseId,
      athlete_id: user.id,
      set_number: 1, // Cardio exercises typically have a single "set"
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      heart_rate_avg: heartRateAvg ? parseInt(heartRateAvg, 10) : null,
      heart_rate_max: heartRateMax ? parseInt(heartRateMax, 10) : null,
      pace_per_km_seconds: pacePerKmSeconds,
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Log cardio exercise error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }

  return {
    success: true,
    message: "Exercice enregistre !",
    data: { id: data.id },
  };
}

/**
 * Get last performance for an exercise
 */
export async function getLastExercisePerformance(
  exerciseId: string,
  athleteId?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetAthleteId = athleteId || user?.id;
  if (!targetAthleteId) {
    return null;
  }

  // Use RPC function if available, otherwise fallback to direct query
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_last_exercise_performance",
    {
      p_exercise_id: exerciseId,
      p_athlete_id: targetAthleteId,
    }
  );

  if (!rpcError && rpcData && rpcData.length > 0) {
    return rpcData[0];
  }

  // Fallback query
  const { data } = await supabase
    .from("exercise_logs")
    .select(`
      id,
      weight_kg,
      reps_completed,
      rpe,
      distance_km,
      duration_minutes,
      heart_rate_avg,
      pace_per_km_seconds,
      session_logs!inner(completed_at)
    `)
    .eq("exercise_id", exerciseId)
    .eq("athlete_id", targetAthleteId)
    .eq("is_deleted", false)
    .not("session_logs.completed_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Upload a session image
 */
export async function uploadSessionImage(
  sessionLogId: string,
  formData: FormData,
): Promise<TrainingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const file = formData.get("image") as File;
  if (!file) {
    return { success: false, error: "Aucun fichier sélectionné" };
  }

  // Upload to Supabase Storage
  const fileName = `${user.id}/${sessionLogId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("session-images")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: "Erreur lors de l'upload" };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("session-images")
    .getPublicUrl(fileName);

  // Save to session_images table
  const { data, error } = await supabase
    .from("session_images")
    .insert({
      session_log_id: sessionLogId,
      image_url: urlData.publicUrl,
      athlete_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Save image error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }

  return {
    success: true,
    message: "Image ajoutée !",
    data: { id: data.id },
  };
}

