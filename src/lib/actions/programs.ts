"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProgramInsert, SessionInsert, ExerciseInsert } from "@/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: { id: string };
}

/**
 * Create a new program
 */
export async function createProgram(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const durationWeeks = formData.get("duration_weeks") as string;
  const status = (formData.get("status") as string) || "draft";

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Le nom du programme est requis" };
  }

  const programData: ProgramInsert = {
    coach_id: user.id,
    name: name.trim(),
    description: description?.trim() || null,
    duration_weeks: durationWeeks ? parseInt(durationWeeks, 10) : null,
    status: status as "draft" | "active" | "archived",
  };

  const { data, error } = await supabase
    .from("programs")
    .insert(programData)
    .select("id")
    .single();

  if (error) {
    console.error("Program creation error:", error);
    return { success: false, error: "Erreur lors de la création du programme" };
  }

  revalidatePath("/dashboard/programs");

  return {
    success: true,
    message: "Programme créé avec succès !",
    data: { id: data.id },
  };
}

/**
 * Update an existing program
 */
export async function updateProgram(
  programId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const durationWeeks = formData.get("duration_weeks") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("programs")
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      duration_weeks: durationWeeks ? parseInt(durationWeeks, 10) : null,
      status: status as "draft" | "active" | "archived",
    })
    .eq("id", programId)
    .eq("coach_id", user.id);

  if (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  revalidatePath("/dashboard/programs");
  revalidatePath(`/dashboard/programs/${programId}`);

  return { success: true, message: "Programme mis à jour !" };
}

/**
 * Delete a program (soft delete)
 */
export async function deleteProgram(programId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("programs")
    .update({ is_deleted: true })
    .eq("id", programId)
    .eq("coach_id", user.id);

  if (error) {
    console.error("Delete program error:", error);
    return { success: false, error: `Erreur: ${error.message}` };
  }

  revalidatePath("/dashboard/programs");

  return { success: true, message: "Programme supprimé" };
}

/**
 * Duplicate a program with all its sessions and exercises
 */
export async function duplicateProgram(
  programId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get original program
  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
    .eq("coach_id", user.id)
    .single();

  if (!program) {
    return { success: false, error: "Programme non trouvé" };
  }

  // Create duplicate
  const { data: newProgram, error: programError } = await supabase
    .from("programs")
    .insert({
      coach_id: user.id,
      name: `${program.name} (copie)`,
      description: program.description,
      duration_weeks: program.duration_weeks,
      status: "draft",
    })
    .select("id")
    .single();

  if (programError || !newProgram) {
    return { success: false, error: "Erreur lors de la duplication" };
  }

  // Get sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, exercises(*)")
    .eq("program_id", programId)
    .eq("is_deleted", false);

  // Duplicate sessions and exercises
  if (sessions) {
    for (const session of sessions) {
      const { data: newSession } = await supabase
        .from("sessions")
        .insert({
          program_id: newProgram.id,
          name: session.name,
          description: session.description,
          day_of_week: session.day_of_week,
          week_number: session.week_number,
          order_index: session.order_index,
          estimated_duration_minutes: session.estimated_duration_minutes,
        })
        .select("id")
        .single();

      if (newSession && session.exercises) {
        const exercisesToInsert = session.exercises.map((ex: ExerciseInsert & { id?: string }) => ({
          session_id: newSession.id,
          name: ex.name,
          description: ex.description,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          tempo: ex.tempo,
          notes: ex.notes,
          video_url: ex.video_url,
          order_index: ex.order_index,
        }));

        await supabase.from("exercises").insert(exercisesToInsert);
      }
    }
  }

  revalidatePath("/dashboard/programs");

  return {
    success: true,
    message: "Programme dupliqué !",
    data: { id: newProgram.id },
  };
}

/**
 * Create a session in a program
 */
export async function createSession(
  programId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Verify program belongs to user
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("coach_id", user.id)
    .single();

  if (!program) {
    return { success: false, error: "Programme non trouvé" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const dayOfWeek = formData.get("day_of_week") as string;
  const weekNumber = formData.get("week_number") as string;
  const duration = formData.get("estimated_duration_minutes") as string;

  // Get next order index
  const { data: lastSession } = await supabase
    .from("sessions")
    .select("order_index")
    .eq("program_id", programId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (lastSession?.order_index ?? -1) + 1;

  const sessionData: SessionInsert = {
    program_id: programId,
    name: name?.trim() || `Séance ${orderIndex + 1}`,
    description: description?.trim() || null,
    day_of_week: dayOfWeek ? parseInt(dayOfWeek, 10) : null,
    week_number: weekNumber ? parseInt(weekNumber, 10) : 1,
    order_index: orderIndex,
    estimated_duration_minutes: duration ? parseInt(duration, 10) : null,
  };

  const { data, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select("id")
    .single();

  if (error) {
    console.error("Session creation error:", error);
    return { success: false, error: "Erreur lors de la création de la séance" };
  }

  revalidatePath(`/dashboard/programs/${programId}`);

  return {
    success: true,
    message: "Séance créée !",
    data: { id: data.id },
  };
}

/**
 * Update a session
 */
export async function updateSession(
  sessionId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const dayOfWeek = formData.get("day_of_week") as string;
  const weekNumber = formData.get("week_number") as string;
  const duration = formData.get("estimated_duration_minutes") as string;

  const { data: session, error } = await supabase
    .from("sessions")
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      day_of_week: dayOfWeek ? parseInt(dayOfWeek, 10) : null,
      week_number: weekNumber ? parseInt(weekNumber, 10) : 1,
      estimated_duration_minutes: duration ? parseInt(duration, 10) : null,
    })
    .eq("id", sessionId)
    .select("program_id")
    .single();

  if (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  revalidatePath(`/dashboard/programs/${session.program_id}`);

  return { success: true, message: "Séance mise à jour !" };
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .update({ is_deleted: true })
    .eq("id", sessionId)
    .select("program_id")
    .single();

  if (error) {
    console.error("Delete session error:", error);
    return { success: false, error: `Erreur: ${error.message}` };
  }

  revalidatePath(`/dashboard/programs/${session.program_id}`);

  return { success: true, message: "Séance supprimée" };
}

/**
 * Create an exercise in a session
 */
export async function createExercise(
  sessionId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const name = formData.get("name") as string;
  const sets = formData.get("sets") as string;
  const reps = formData.get("reps") as string;
  const restSeconds = formData.get("rest_seconds") as string;
  const tempo = formData.get("tempo") as string;
  const notes = formData.get("notes") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Le nom de l'exercice est requis" };
  }

  // Get next order index
  const { data: lastExercise } = await supabase
    .from("exercises")
    .select("order_index")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (lastExercise?.order_index ?? -1) + 1;

  const exerciseData: ExerciseInsert = {
    session_id: sessionId,
    name: name.trim(),
    sets: sets ? parseInt(sets, 10) : null,
    reps: reps?.trim() || null,
    rest_seconds: restSeconds ? parseInt(restSeconds, 10) : null,
    tempo: tempo?.trim() || null,
    notes: notes?.trim() || null,
    order_index: orderIndex,
  };

  const { data, error } = await supabase
    .from("exercises")
    .insert(exerciseData)
    .select("id, session:sessions(program_id)")
    .single();

  if (error) {
    console.error("Exercise creation error:", error);
    return { success: false, error: "Erreur lors de la création de l'exercice" };
  }

  const programId = (data.session as { program_id: string })?.program_id;
  if (programId) {
    revalidatePath(`/dashboard/programs/${programId}`);
  }

  return {
    success: true,
    message: "Exercice ajouté !",
    data: { id: data.id },
  };
}

/**
 * Update an exercise
 */
export async function updateExercise(
  exerciseId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const name = formData.get("name") as string;
  const sets = formData.get("sets") as string;
  const reps = formData.get("reps") as string;
  const restSeconds = formData.get("rest_seconds") as string;
  const tempo = formData.get("tempo") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase
    .from("exercises")
    .update({
      name: name?.trim(),
      sets: sets ? parseInt(sets, 10) : null,
      reps: reps?.trim() || null,
      rest_seconds: restSeconds ? parseInt(restSeconds, 10) : null,
      tempo: tempo?.trim() || null,
      notes: notes?.trim() || null,
    })
    .eq("id", exerciseId);

  if (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  return { success: true, message: "Exercice mis à jour !" };
}

/**
 * Delete an exercise
 */
export async function deleteExercise(exerciseId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get exercise to find its session and program for revalidation
  const { data: exercise } = await supabase
    .from("exercises")
    .select("session_id, session:sessions(program_id)")
    .eq("id", exerciseId)
    .single();

  const { error } = await supabase
    .from("exercises")
    .update({ is_deleted: true })
    .eq("id", exerciseId);

  if (error) {
    console.error("Delete exercise error:", error);
    return { success: false, error: `Erreur: ${error.message}` };
  }

  // Revalidate the program page
  if (exercise?.session?.program_id) {
    revalidatePath(`/dashboard/programs/${exercise.session.program_id}`);
  }

  return { success: true, message: "Exercice supprimé" };
}

/**
 * Assign a program to an athlete
 */
export async function assignProgram(
  programId: string,
  athleteId: string,
  startDate?: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Verify coach-athlete relationship
  const { data: relationship } = await supabase
    .from("coach_athletes")
    .select("id")
    .eq("coach_id", user.id)
    .eq("athlete_id", athleteId)
    .eq("status", "accepted")
    .single();

  if (!relationship) {
    return { success: false, error: "Cet athlète n'est pas dans votre équipe" };
  }

  // Check if already assigned
  const { data: existing } = await supabase
    .from("program_assignments")
    .select("id")
    .eq("program_id", programId)
    .eq("athlete_id", athleteId)
    .eq("is_deleted", false)
    .single();

  if (existing) {
    return { success: false, error: "Ce programme est déjà assigné à cet athlète" };
  }

  const { error } = await supabase.from("program_assignments").insert({
    program_id: programId,
    athlete_id: athleteId,
    start_date: startDate || null,
  });

  if (error) {
    console.error("Assignment error:", error);
    return { success: false, error: "Erreur lors de l'assignation" };
  }

  revalidatePath(`/dashboard/programs/${programId}`);
  revalidatePath("/dashboard/athletes");

  return { success: true, message: "Programme assigné !" };
}

