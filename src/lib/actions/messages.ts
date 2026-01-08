"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: { id: string };
}

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié", data: [] };
  }

  // Get conversations where user is a participant
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      participant_1,
      participant_2,
      last_message_at,
      created_at
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .eq("is_deleted", false)
    .order("last_message_at", { ascending: false });

  // If conversations table doesn't exist yet (migration not run), return empty
  if (error) {
    if (error.message?.includes("conversations") || error.code === "42P01") {
      // Table doesn't exist - return empty with success
      return { success: true, data: [] };
    }
    console.error("Error fetching conversations:", error);
    return { success: false, error: "Erreur lors du chargement", data: [] };
  }

  // Get the other participant's profile for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherParticipantId =
        conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;

      // Get other participant's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, role")
        .eq("id", otherParticipantId)
        .single();

      // Get last message
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("id, content, sender_id, created_at, is_read")
        .eq("conversation_id", conv.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("is_read", false)
        .neq("sender_id", user.id)
        .eq("is_deleted", false);

      return {
        ...conv,
        other_participant: profile,
        last_message: lastMessage,
        unread_count: unreadCount || 0,
      };
    })
  );

  return { success: true, data: conversationsWithDetails };
}

/**
 * Get a conversation with its messages
 */
export async function getConversation(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .single();

  // If conversations table doesn't exist yet (migration not run), return error
  if (convError) {
    if (convError.message?.includes("conversations") || convError.code === "42P01") {
      return { success: false, error: "Messagerie non disponible" };
    }
    return { success: false, error: "Conversation non trouvée" };
  }

  if (!conversation) {
    return { success: false, error: "Conversation non trouvée" };
  }

  // Get other participant's profile
  const otherParticipantId =
    conversation.participant_1 === user.id
      ? conversation.participant_2
      : conversation.participant_1;

  const { data: otherParticipant } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, role")
    .eq("id", otherParticipantId)
    .single();

  // Get messages
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      sender_id,
      is_read,
      created_at
    `)
    .eq("conversation_id", conversationId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("Error fetching messages:", msgError);
    return { success: false, error: "Erreur lors du chargement des messages" };
  }

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  return {
    success: true,
    data: {
      conversation: {
        ...conversation,
        other_participant: otherParticipant,
      },
      messages: messages || [],
      currentUserId: user.id,
    },
  };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Le message ne peut pas être vide" };
  }

  // Verify user is part of this conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .single();

  if (!conversation) {
    return { success: false, error: "Conversation non trouvée" };
  }

  // Insert message
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Erreur lors de l'envoi" };
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");

  return { success: true, data: { id: data.id } };
}

/**
 * Create or get a conversation with another user
 */
export async function createOrGetConversation(
  recipientId: string
): Promise<ActionResult & { conversationId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  if (recipientId === user.id) {
    return { success: false, error: "Vous ne pouvez pas démarrer une conversation avec vous-même" };
  }

  // Normalize order (smaller UUID first)
  const [p1, p2] = user.id < recipientId ? [user.id, recipientId] : [recipientId, user.id];

  // Check if conversation exists
  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_1", p1)
    .eq("participant_2", p2)
    .eq("is_deleted", false)
    .single();

  // If conversations table doesn't exist yet (migration not run), return error
  if (existingError && (existingError.message?.includes("conversations") || existingError.code === "42P01")) {
    return { success: false, error: "Messagerie non disponible" };
  }

  if (existing) {
    return { success: true, conversationId: existing.id };
  }

  // Verify there's a coach-athlete relationship
  const { data: relationship } = await supabase
    .from("coach_athletes")
    .select("id")
    .or(`and(coach_id.eq.${user.id},athlete_id.eq.${recipientId}),and(coach_id.eq.${recipientId},athlete_id.eq.${user.id})`)
    .eq("is_deleted", false)
    .single();

  if (!relationship) {
    return { success: false, error: "Vous ne pouvez discuter qu'avec votre coach ou vos athlètes" };
  }

  // Create conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_1: p1,
      participant_2: p2,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error: "Erreur lors de la création de la conversation" };
  }

  revalidatePath("/dashboard/messages");

  return { success: true, conversationId: data.id };
}

/**
 * Get unread message count for the current user
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  // Get all conversations the user is part of
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .eq("is_deleted", false);

  // If conversations table doesn't exist yet (migration not run), return 0
  if (error) {
    return 0;
  }

  if (!conversations || conversations.length === 0) {
    return 0;
  }

  const conversationIds = conversations.map((c) => c.id);

  // Count unread messages
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .eq("is_read", false)
    .neq("sender_id", user.id)
    .eq("is_deleted", false);

  return count || 0;
}
