import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditProgramForm } from "./edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase
    .from("programs")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: program ? `Modifier ${program.name}` : "Modifier le programme",
  };
}

export default async function EditProgramPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";

  // Get program
  const { data: program, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !program) {
    notFound();
  }

  // Check if user can edit this program
  const canEdit = isCoach
    ? program.coach_id === user.id
    : program.created_by === user.id;

  if (!canEdit) {
    notFound();
  }

  return (
    <EditProgramForm
      program={{
        id: program.id,
        name: program.name,
        description: program.description,
        duration_weeks: program.duration_weeks,
        status: program.status,
      }}
    />
  );
}
