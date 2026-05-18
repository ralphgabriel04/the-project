import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, Button, EmptyState, Badge } from "@/components/ui";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Programmes",
};

interface ProgramData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  duration_weeks: number | null;
  created_by: string | null;
  coach_id: string | null;
}

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
  let ownPrograms: ProgramData[] = [];
  let assignedPrograms: ProgramData[] = [];

  if (isCoach) {
    // Coaches see their created programs
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("coach_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    ownPrograms = data || [];
  } else {
    // Athletes see both their own programs and assigned programs

    // Try to get own programs (created by athlete) - requires migration 007
    try {
      const { data: ownData, error } = await supabase
        .from("programs")
        .select("*")
        .eq("created_by", user.id)
        .is("coach_id", null)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (!error) {
        ownPrograms = ownData || [];
      }
    } catch {
      // created_by column doesn't exist yet - migration not run
      ownPrograms = [];
    }

    // Assigned programs (from coaches)
    const { data: assignedData } = await supabase
      .from("program_assignments")
      .select(`
        program:programs(*)
      `)
      .eq("athlete_id", user.id)
      .eq("is_deleted", false);

    // Filter out athlete's own programs from assigned list (if they have any)
    const ownProgramIds = new Set(ownPrograms.map(p => p.id));
    assignedPrograms = (assignedData?.map((a) => a.program).filter(Boolean) as ProgramData[] || [])
      .filter(p => p.coach_id !== null && !ownProgramIds.has(p.id));
  }

  // Combined programs for display (all programs for both roles)
  const allPrograms = [...ownPrograms, ...assignedPrograms];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Mes Programmes
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            {isCoach
              ? "Créez et gérez vos programmes d'entraînement"
              : "Créez vos propres programmes ou consultez ceux de votre coach"}
          </p>
        </div>
        {/* Both coaches and athletes can create programs */}
        <Link href="/dashboard/programs/new">
          <Button className="w-full sm:w-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Créer un programme</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
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
            <select className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="draft">Brouillons</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* For athletes: Show own programs first, then assigned */}
      {!isCoach && ownPrograms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Mes programmes personnels</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} isCoach={false} isOwn={true} />
            ))}
          </div>
        </div>
      )}

      {/* Assigned programs for athletes */}
      {!isCoach && assignedPrograms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Programmes de mon coach</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} isCoach={false} isOwn={false} />
            ))}
          </div>
        </div>
      )}

      {/* For coaches: Show all programs */}
      {isCoach && ownPrograms.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} isCoach={true} isOwn={true} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {allPrograms.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon="📋"
              title={
                isCoach
                  ? "Aucun programme créé"
                  : "Aucun programme"
              }
              description={
                isCoach
                  ? "Créez votre premier programme d'entraînement pour l'assigner à vos athlètes."
                  : "Créez votre premier programme d'entraînement personnel ou attendez que votre coach vous en assigne un."
              }
              action={{
                label: "Créer un programme",
                href: "/dashboard/programs/new",
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProgramCard({
  program,
  isCoach,
  isOwn = false,
}: {
  program: ProgramData;
  isCoach: boolean;
  isOwn?: boolean;
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

  // Can edit if coach or if athlete owns the program
  const canEdit = isCoach || isOwn;

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
              {canEdit ? "Modifier →" : "Voir →"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

