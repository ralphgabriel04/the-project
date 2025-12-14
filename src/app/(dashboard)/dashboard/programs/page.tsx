import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, EmptyState, Badge } from "@/components/ui";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Programmes",
};

export default async function ProgramsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";

  // Get programs based on role
  let programs: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    duration_weeks: number | null;
  }> = [];

  if (isCoach) {
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("coach_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    programs = data || [];
  } else {
    const { data } = await supabase
      .from("program_assignments")
      .select(`
        program:programs(*)
      `)
      .eq("athlete_id", user.id)
      .eq("is_deleted", false);
    programs = data?.map((a) => a.program).filter(Boolean) as typeof programs || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isCoach ? "Mes Programmes" : "Mes Programmes"}
          </h1>
          <p className="text-slate-400 mt-1">
            {isCoach
              ? "Créez et gérez vos programmes d'entraînement"
              : "Consultez vos programmes d'entraînement"}
          </p>
        </div>
        {isCoach && (
          <Link href="/dashboard/programs/new">
            <Button className="sm:w-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer un programme
            </Button>
          </Link>
        )}
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un programme..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {isCoach && (
              <select className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="draft">Brouillons</option>
                <option value="archived">Archivés</option>
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Programs grid */}
      {programs.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="📋"
              title={
                isCoach
                  ? "Aucun programme créé"
                  : "Aucun programme assigné"
              }
              description={
                isCoach
                  ? "Créez votre premier programme d'entraînement pour l'assigner à vos athlètes."
                  : "Votre coach ne vous a pas encore assigné de programme."
              }
              action={
                isCoach
                  ? {
                      label: "Créer un programme",
                      href: "/dashboard/programs/new",
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} isCoach={isCoach} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({
  program,
  isCoach,
}: {
  program: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    duration_weeks: number | null;
  };
  isCoach: boolean;
}) {
  const statusColors = {
    draft: "warning",
    active: "success",
    archived: "default",
  } as const;

  const statusLabels = {
    draft: "Brouillon",
    active: "Actif",
    archived: "Archivé",
  };

  return (
    <Link href={`/dashboard/programs/${program.id}`}>
      <Card className="hover:border-emerald-500/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-white">{program.name}</h3>
            <Badge variant={statusColors[program.status as keyof typeof statusColors] || "default"}>
              {statusLabels[program.status as keyof typeof statusLabels] || program.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {program.description || "Aucune description"}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {program.duration_weeks
                ? `${program.duration_weeks} semaines`
                : "Durée non définie"}
            </span>
            <span className="text-emerald-400 hover:text-emerald-300 font-medium">
              {isCoach ? "Modifier →" : "Voir →"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

