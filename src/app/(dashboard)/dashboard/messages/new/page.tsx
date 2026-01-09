import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createOrGetConversation } from "@/lib/actions/messages";
import { Card, CardContent } from "@/components/ui";
import { ExclamationTriangleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PageProps {
  searchParams: Promise<{ recipient?: string }>;
}

export const metadata = {
  title: "Nouvelle conversation",
};

export default async function NewConversationPage({ searchParams }: PageProps) {
  const { recipient } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!recipient) {
    redirect("/dashboard/messages");
  }

  // Create or get the conversation
  const result = await createOrGetConversation(recipient);

  if (result.success && result.conversationId) {
    redirect(`/dashboard/messages/${result.conversationId}`);
  }

  // Get recipient info for error display
  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", recipient)
    .single();

  const recipientName = recipientProfile
    ? `${recipientProfile.first_name} ${recipientProfile.last_name}`
    : "cet utilisateur";

  // Show error page instead of silent redirect
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Impossible de démarrer la conversation
          </h1>
          <p className="text-slate-400 mb-4">
            {result.error || `Vous ne pouvez pas discuter avec ${recipientName}.`}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Assurez-vous d&apos;avoir une relation coach-athlète acceptée avant de pouvoir envoyer des messages.
          </p>
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux messages
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
