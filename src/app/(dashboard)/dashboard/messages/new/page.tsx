import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createOrGetConversation } from "@/lib/actions/messages";

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

  // If failed, redirect back to messages with error
  redirect("/dashboard/messages");
}
