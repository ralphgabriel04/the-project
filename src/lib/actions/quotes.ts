"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MotivationalQuote, CoachMessageWithCoach } from "@/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Get the daily motivational quote
 * Uses a deterministic algorithm based on the date so all users see the same quote
 */
export async function getDailyQuote(): Promise<{
  success: boolean;
  data?: MotivationalQuote;
  error?: string;
}> {
  const supabase = await createClient();

  // Get all active quotes
  const { data: quotes, error } = await supabase
    .from("motivational_quotes")
    .select("*")
    .eq("is_active", true);

  if (error) {
    // Table might not exist yet
    if (error.code === "42P01" || error.message?.includes("motivational_quotes")) {
      return { success: true, data: undefined };
    }
    console.error("Error fetching quotes:", error);
    return { success: false, error: "Erreur lors du chargement de la citation" };
  }

  if (!quotes || quotes.length === 0) {
    return { success: true, data: undefined };
  }

  // Deterministic selection based on date
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quoteIndex = dayOfYear % quotes.length;

  return { success: true, data: quotes[quoteIndex] };
}

/**
 * Get active coach messages for the current athlete
 */
export async function getCoachMessages(): Promise<{
  success: boolean;
  data?: CoachMessageWithCoach[];
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

  // Get messages for this athlete that are active today
  const { data: messages, error } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .lte("display_date", today)
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("created_at", { ascending: false });

  if (error) {
    // Table might not exist yet
    if (error.code === "42P01" || error.message?.includes("coach_messages")) {
      return { success: true, data: [] };
    }
    console.error("Error fetching coach messages:", error);
    return { success: false, error: "Erreur lors du chargement des messages" };
  }

  // Get coach profiles for each message
  const messagesWithCoach = await Promise.all(
    (messages || []).map(async (msg) => {
      const { data: coach } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .eq("id", msg.coach_id)
        .single();

      return {
        ...msg,
        coach: coach || { id: msg.coach_id, first_name: "Coach", last_name: "", avatar_url: null },
      } as CoachMessageWithCoach;
    })
  );

  return { success: true, data: messagesWithCoach };
}

/**
 * Send a motivational message from coach to athlete
 */
export async function sendCoachMessage(
  athleteId: string,
  content: string,
  displayDate?: string,
  expiresAt?: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Verify user is a coach
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return { success: false, error: "Seuls les coaches peuvent envoyer des messages motivants" };
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

  // Insert message
  const { error } = await supabase.from("coach_messages").insert({
    coach_id: user.id,
    athlete_id: athleteId,
    content: content.trim(),
    display_date: displayDate || new Date().toISOString().split("T")[0],
    expires_at: expiresAt || null,
  });

  if (error) {
    console.error("Error sending coach message:", error);
    return { success: false, error: "Erreur lors de l'envoi du message" };
  }

  revalidatePath(`/dashboard/athletes/${athleteId}`);

  return { success: true, message: "Message envoyé avec succès" };
}

/**
 * Mark a coach message as read
 */
export async function markMessageRead(messageId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("coach_messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .eq("athlete_id", user.id);

  if (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }

  return { success: true };
}

/**
 * Delete a coach message (soft delete)
 */
export async function deleteCoachMessage(messageId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Verify ownership (only the coach who sent it can delete)
  const { data: message } = await supabase
    .from("coach_messages")
    .select("coach_id")
    .eq("id", messageId)
    .single();

  if (!message || message.coach_id !== user.id) {
    return { success: false, error: "Vous ne pouvez pas supprimer ce message" };
  }

  const { error } = await supabase
    .from("coach_messages")
    .update({ is_deleted: true })
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting coach message:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }

  return { success: true, message: "Message supprimé" };
}
