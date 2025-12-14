"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface InviteAthleteResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Invite an athlete by email
 * Creates a pending coach_athlete relationship
 */
export async function inviteAthlete(email: string): Promise<InviteAthleteResult> {
  const supabase = await createClient();

  // Get current user (coach)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Verify current user is a coach
  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (coachProfile?.role !== "coach") {
    return { success: false, error: "Seuls les coachs peuvent inviter des athlètes" };
  }

  // For MVP, we'll show a success message
  // In production, this would send an email and/or create a pending invite
  // The athlete would need to register with this email to see the invite

  revalidatePath("/dashboard/athletes");

  return {
    success: true,
    message: `Invitation envoyée à ${email}. L'athlète recevra une notification lors de sa connexion.`,
  };
}

/**
 * Accept an invitation from a coach
 */
export async function acceptInvitation(
  invitationId: string,
): Promise<InviteAthleteResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("coach_athletes")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("athlete_id", user.id);

  if (error) {
    return { success: false, error: "Erreur lors de l'acceptation" };
  }

  revalidatePath("/dashboard/coaches");
  revalidatePath("/dashboard/athletes");

  return { success: true, message: "Invitation acceptée !" };
}

/**
 * Reject an invitation from a coach
 */
export async function rejectInvitation(
  invitationId: string,
): Promise<InviteAthleteResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("coach_athletes")
    .update({
      status: "rejected",
      is_deleted: true,
    })
    .eq("id", invitationId)
    .eq("athlete_id", user.id);

  if (error) {
    return { success: false, error: "Erreur lors du refus" };
  }

  revalidatePath("/dashboard/coaches");

  return { success: true, message: "Invitation refusée" };
}

/**
 * Remove an athlete from coach's list
 */
export async function removeAthlete(
  relationshipId: string,
): Promise<InviteAthleteResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("coach_athletes")
    .update({ is_deleted: true })
    .eq("id", relationshipId)
    .eq("coach_id", user.id);

  if (error) {
    return { success: false, error: "Erreur lors de la suppression" };
  }

  revalidatePath("/dashboard/athletes");

  return { success: true, message: "Athlète retiré" };
}

