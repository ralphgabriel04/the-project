import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, EmptyState, Badge } from "@/components/ui";
import { getConversations } from "@/lib/actions/messages";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";

  // Get conversations
  const result = await getConversations();
  const conversations = result.data || [];

  // Get potential contacts (coaches for athletes, athletes for coaches)
  let contacts: { id: string; first_name: string; last_name: string }[] = [];

  try {
    if (isCoach) {
      // Get coach's athletes - use simpler query without explicit FK reference
      const { data: relationships } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", user.id)
        .eq("status", "accepted")
        .eq("is_deleted", false);

      if (relationships && relationships.length > 0) {
        const athleteIds = relationships.map((r) => r.athlete_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", athleteIds);

        contacts = (profiles || []) as typeof contacts;
      }
    } else {
      // Get athlete's coaches - use simpler query without explicit FK reference
      const { data: relationships } = await supabase
        .from("coach_athletes")
        .select("coach_id")
        .eq("athlete_id", user.id)
        .eq("status", "accepted")
        .eq("is_deleted", false);

      if (relationships && relationships.length > 0) {
        const coachIds = relationships.map((r) => r.coach_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", coachIds);

        contacts = (profiles || []) as typeof contacts;
      }
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
    contacts = [];
  }

  // Filter out contacts already in conversations
  const existingContactIds = new Set(
    conversations.map((c) => c.other_participant?.id).filter(Boolean)
  );
  const newContacts = contacts.filter((c) => !existingContactIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          {isCoach
            ? "Discutez avec vos athlètes"
            : "Discutez avec votre coach"}
        </p>
      </div>

      {/* Start new conversation */}
      {newContacts.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Démarrer une conversation
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {newContacts.map((contact) => {
                const firstName = contact.first_name || "?";
                const lastName = contact.last_name || "?";
                return (
                  <Link
                    key={contact.id}
                    href={`/dashboard/messages/new?recipient=${contact.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-bold">
                      {firstName[0]}{lastName[0]}
                    </div>
                    <span className="text-white">
                      {firstName} {lastName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversations list */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {conversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  currentUserId={user.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💬"
              title="Aucune conversation"
              description={
                isCoach
                  ? "Commencez à discuter avec vos athlètes pour les motiver et les guider."
                  : "Démarrez une conversation avec votre coach pour poser des questions ou demander des conseils."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationRow({
  conversation,
  currentUserId,
}: {
  conversation: {
    id: string;
    other_participant: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      role: string;
    } | null;
    last_message: {
      id: string;
      content: string;
      sender_id: string;
      created_at: string;
      is_read: boolean;
    } | null;
    unread_count: number;
    last_message_at: string;
  };
  currentUserId: string;
}) {
  const participant = conversation.other_participant;
  const firstName = participant?.first_name || "Utilisateur";
  const lastName = participant?.last_name || "Inconnu";
  const initials = `${firstName[0] || "?"}${lastName[0] || "?"}`;

  const isOwnMessage = conversation.last_message?.sender_id === currentUserId;

  return (
    <Link
      href={`/dashboard/messages/${conversation.id}`}
      className="flex items-center gap-4 py-4 hover:bg-slate-700/50 -mx-4 px-4 transition-colors"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
        {conversation.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {conversation.unread_count}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-white truncate">
            {firstName} {lastName}
          </p>
          {conversation.last_message && (
            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatTime(conversation.last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={participant?.role === "coach" ? "success" : "default"}>
            {participant?.role === "coach" ? "Coach" : "Athlète"}
          </Badge>
          {conversation.last_message && (
            <p className="text-sm text-slate-400 truncate flex-1">
              {isOwnMessage && "Vous: "}
              {conversation.last_message.content}
            </p>
          )}
        </div>
      </div>

      <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
    </Link>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) {
    return "Hier";
  }
  if (days < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
