import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getConversation } from "@/lib/actions/messages";
import { MessageInput } from "@/components/messages/message-input";
import { MessageTime, MessageDate } from "@/components/messages/message-time";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { conversationId } = await params;
  const result = await getConversation(conversationId);

  if (!result.success || !result.data) {
    return { title: "Conversation" };
  }

  const { other_participant } = result.data.conversation;
  return {
    title: `${other_participant?.first_name || "Conversation"}`,
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getConversation(conversationId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { conversation, messages, currentUserId } = result.data;
  const otherParticipant = conversation.other_participant;

  const firstName = otherParticipant?.first_name || "Utilisateur";
  const lastName = otherParticipant?.last_name || "Inconnu";
  const initials = `${firstName[0] || "?"}${lastName[0] || "?"}`;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/dashboard/messages"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {firstName} {lastName}
            </h1>
            <p className="text-sm text-slate-400 capitalize">
              {otherParticipant?.role === "coach" ? "Coach" : "Athlète"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showDate = index === 0 || !isSameDay(
                new Date(messages[index - 1].created_at),
                new Date(message.created_at)
              );

              return (
                <div key={message.id}>
                  {showDate && (
                    <MessageDate timestamp={message.created_at} />
                  )}
                  <div
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-2xl
                        ${isOwn
                          ? "bg-emerald-500 text-white rounded-br-sm"
                          : "bg-slate-700 text-white rounded-bl-sm"}
                      `}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <MessageTime
                        timestamp={message.created_at}
                        className={`text-xs mt-1 block ${
                          isOwn ? "text-emerald-200" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <p>Aucun message pour le moment</p>
                <p className="text-sm mt-1">Envoyez le premier message !</p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Message input */}
        <div className="border-t border-slate-700 p-4">
          <MessageInput conversationId={conversationId} />
        </div>
      </Card>
    </div>
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
