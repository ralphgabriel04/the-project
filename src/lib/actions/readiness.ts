"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ReadinessLog } from "@/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ReadinessFormData {
  sleep_quality: number;
  energy_level: number;
  muscle_soreness: number;
  stress_level: number;
  notes?: string;
}

/**
 * Calculate overall readiness score from individual metrics
 * Formula: sleep(30%) + energy(30%) + soreness(20%) + stress(20%)
 * Note: soreness and stress are inverted (high value = bad)
 */
function calculateOverallScore(data: ReadinessFormData): number {
  const sleepWeight = 0.3;
  const energyWeight = 0.3;
  const sorenessWeight = 0.2;
  const stressWeight = 0.2;

  // Soreness and stress are inverted (10 = bad, 1 = good)
  const invertedSoreness = 11 - data.muscle_soreness;
  const invertedStress = 11 - data.stress_level;

  const score =
    data.sleep_quality * sleepWeight +
    data.energy_level * energyWeight +
    invertedSoreness * sorenessWeight +
    invertedStress * stressWeight;

  return Math.round(score * 100) / 100;
}

/**
 * Log readiness for today (upsert - creates or updates)
 */
export async function logReadiness(data: ReadinessFormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const today = new Date().toISOString().split("T")[0];
  const overallScore = calculateOverallScore(data);

  // Try to upsert (Supabase doesn't support onConflict with RLS well, so we check first)
  const { data: existing } = await supabase
    .from("readiness_logs")
    .select("id")
    .eq("athlete_id", user.id)
    .eq("log_date", today)
    .eq("is_deleted", false)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("readiness_logs")
      .update({
        sleep_quality: data.sleep_quality,
        energy_level: data.energy_level,
        muscle_soreness: data.muscle_soreness,
        stress_level: data.stress_level,
        overall_score: overallScore,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating readiness:", error);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }
  } else {
    // Insert new
    const { error } = await supabase.from("readiness_logs").insert({
      athlete_id: user.id,
      log_date: today,
      sleep_quality: data.sleep_quality,
      energy_level: data.energy_level,
      muscle_soreness: data.muscle_soreness,
      stress_level: data.stress_level,
      overall_score: overallScore,
      notes: data.notes || null,
    });

    if (error) {
      console.error("Error inserting readiness:", error);
      return { success: false, error: "Erreur lors de l'enregistrement" };
    }
  }

  revalidatePath("/dashboard");

  return { success: true, message: "Readiness enregistré avec succès" };
}

/**
 * Get today's readiness log for the current user
 */
export async function getTodayReadiness(): Promise<{
  success: boolean;
  data?: ReadinessLog;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("readiness_logs")
    .select("*")
    .eq("athlete_id", user.id)
    .eq("log_date", today)
    .eq("is_deleted", false)
    .single();

  if (error) {
    // Table might not exist yet or no record for today
    if (error.code === "42P01" || error.message?.includes("readiness_logs")) {
      return { success: true, data: undefined };
    }
    if (error.code === "PGRST116") {
      // No rows found
      return { success: true, data: undefined };
    }
    console.error("Error fetching today readiness:", error);
    return { success: false, error: "Erreur lors du chargement" };
  }

  return { success: true, data };
}

/**
 * Get readiness history for the past N days
 */
export async function getReadinessHistory(days: number = 30): Promise<{
  success: boolean;
  data?: ReadinessLog[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("readiness_logs")
    .select("*")
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .gte("log_date", startDate.toISOString().split("T")[0])
    .order("log_date", { ascending: false });

  if (error) {
    // Table might not exist yet
    if (error.code === "42P01" || error.message?.includes("readiness_logs")) {
      return { success: true, data: [] };
    }
    console.error("Error fetching readiness history:", error);
    return { success: false, error: "Erreur lors du chargement" };
  }

  return { success: true, data: data || [] };
}

/**
 * Get readiness for a specific athlete (for coaches)
 */
export async function getAthleteReadiness(athleteId: string): Promise<{
  success: boolean;
  data?: ReadinessLog;
  error?: string;
}> {
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
    .eq("is_deleted", false)
    .single();

  if (!relationship) {
    return { success: false, error: "Cet athlète n'est pas dans votre liste" };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("readiness_logs")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("log_date", today)
    .eq("is_deleted", false)
    .single();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST116") {
      return { success: true, data: undefined };
    }
    console.error("Error fetching athlete readiness:", error);
    return { success: false, error: "Erreur lors du chargement" };
  }

  return { success: true, data };
}

/**
 * Calculate data-based readiness score (Level 2)
 * Uses training data, RPE, volume, and rest days
 */
export async function calculateDataBasedReadiness(): Promise<{
  success: boolean;
  score?: number;
  factors?: {
    trainingLoad: number;
    avgRpe: number;
    restDays: number;
    trend: "improving" | "stable" | "declining";
  };
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get training data from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: sessionLogs, error } = await supabase
    .from("session_logs")
    .select("overall_rpe, completed_at, duration_minutes")
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .gte("completed_at", sevenDaysAgo.toISOString())
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching training data:", error);
    return { success: false, error: "Erreur lors du calcul" };
  }

  const logs = sessionLogs || [];

  if (logs.length === 0) {
    // No training data - assume fully rested
    return {
      success: true,
      score: 8.5,
      factors: {
        trainingLoad: 0,
        avgRpe: 0,
        restDays: 7,
        trend: "stable",
      },
    };
  }

  // Calculate metrics
  const totalSessions = logs.length;
  const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
  const avgRpe = logs.reduce((sum, log) => sum + (log.overall_rpe || 5), 0) / logs.length;

  // Count rest days (days without training)
  const trainingDays = new Set(
    logs.map((log) => new Date(log.completed_at).toISOString().split("T")[0])
  );
  const restDays = 7 - trainingDays.size;

  // Calculate training load (simplified)
  const trainingLoad = totalMinutes * (avgRpe / 10);

  // Calculate score (inverse of training load, with rest days bonus)
  let score = 10;

  // High training load reduces score
  if (trainingLoad > 500) score -= 3;
  else if (trainingLoad > 300) score -= 2;
  else if (trainingLoad > 150) score -= 1;

  // High RPE reduces score
  if (avgRpe > 8) score -= 2;
  else if (avgRpe > 7) score -= 1;
  else if (avgRpe > 6) score -= 0.5;

  // Rest days improve score
  if (restDays >= 2) score += 1;
  else if (restDays === 0) score -= 1;

  // Clamp between 1-10
  score = Math.max(1, Math.min(10, score));

  // Determine trend based on recent vs earlier RPE
  const recentLogs = logs.slice(0, Math.ceil(logs.length / 2));
  const earlierLogs = logs.slice(Math.ceil(logs.length / 2));

  const recentAvgRpe = recentLogs.reduce((sum, log) => sum + (log.overall_rpe || 5), 0) / recentLogs.length;
  const earlierAvgRpe = earlierLogs.length > 0
    ? earlierLogs.reduce((sum, log) => sum + (log.overall_rpe || 5), 0) / earlierLogs.length
    : recentAvgRpe;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (recentAvgRpe < earlierAvgRpe - 0.5) trend = "improving";
  else if (recentAvgRpe > earlierAvgRpe + 0.5) trend = "declining";

  return {
    success: true,
    score: Math.round(score * 10) / 10,
    factors: {
      trainingLoad: Math.round(trainingLoad),
      avgRpe: Math.round(avgRpe * 10) / 10,
      restDays,
      trend,
    },
  };
}
