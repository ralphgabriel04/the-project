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

  // Find the athlete by email in auth.users (need to use admin client or RPC)
  // For MVP, we'll look up by email in profiles if they have already registered
  // First, we need to find user by email using a database function

  // Try to find athlete in auth.users via email lookup
  const { data: athleteUsers } = await supabase.rpc("get_user_id_by_email", {
    user_email: email.toLowerCase().trim(),
  });

  if (!athleteUsers || athleteUsers.length === 0) {
    // User doesn't exist yet - for MVP, we inform the coach
    return {
      success: false,
      error: `Aucun compte trouvé avec l'email ${email}. L'athlète doit d'abord créer un compte.`,
    };
  }

  const athleteId = athleteUsers[0].id;

  // Check if athlete is not a coach
  const { data: athleteProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", athleteId)
    .single();

  if (athleteProfile?.role === "coach") {
    return { success: false, error: "Cet utilisateur est un coach, pas un athlète" };
  }

  // Check if invitation already exists
  const { data: existingInvite } = await supabase
    .from("coach_athletes")
    .select("id, status")
    .eq("coach_id", user.id)
    .eq("athlete_id", athleteId)
    .eq("is_deleted", false)
    .single();

  if (existingInvite) {
    if (existingInvite.status === "accepted") {
      return { success: false, error: "Cet athlète fait déjà partie de votre équipe" };
    }
    if (existingInvite.status === "pending") {
      return { success: false, error: "Une invitation est déjà en attente pour cet athlète" };
    }
  }

  // Create the invitation
  const { error: insertError } = await supabase.from("coach_athletes").insert({
    coach_id: user.id,
    athlete_id: athleteId,
    status: "pending",
  });

  if (insertError) {
    console.error("Invite error:", insertError);
    return { success: false, error: "Erreur lors de l'envoi de l'invitation" };
  }

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

