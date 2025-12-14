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

  revalidatePath("/dashboard/programs");

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
      uploaded_by: user.id,
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

