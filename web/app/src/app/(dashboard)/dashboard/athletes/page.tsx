import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, EmptyState, Badge } from "@/components/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AthletesHeader } from "@/components/athletes/athletes-client";

export const metadata = {
  title: "Mes Athlètes",
};

export default async function AthletesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user is a coach
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/dashboard");
  }

  // Get coach's athletes
  const { data: relationships } = await supabase
    .from("coach_athletes")
    .select(`
      *,
      athlete:profiles!coach_athletes_athlete_id_fkey(*)
    `)
    .eq("coach_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const allRelationships = relationships || [];
  // Filter out relationships where athlete profile is null
  const athletes = allRelationships.filter((r) => r.athlete !== null);
  const pendingCount = athletes.filter((r) => r.status === "pending").length;
  const activeCount = athletes.filter((r) => r.status === "accepted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Mes Athlètes</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Gérez vos athlètes et leurs programmes
          </p>
        </div>
        <AthletesHeader />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={athletes.length} />
        <StatCard label="Actifs" value={activeCount} variant="success" />
        <StatCard label="En attente" value={pendingCount} variant="warning" />
        <StatCard label="Programmes assignés" value={0} />
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un athlète..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Tous les statuts</option>
              <option value="accepted">Actifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Athletes list */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Liste des athlètes</h2>
        </CardHeader>
        <CardContent>
          {athletes.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Aucun athlète pour le moment"
              description="Invitez vos premiers athlètes pour commencer à créer des programmes personnalisés."
            />
          ) : (
            <div className="divide-y divide-slate-700">
              {athletes.map((relationship) => (
                <AthleteRow
                  key={relationship.id}
                  athlete={relationship.athlete}
                  status={relationship.status}
                  relationshipId={relationship.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "success" | "warning";
}) {
  const colors = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${colors[variant]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function AthleteRow({
  athlete,
  status,
  relationshipId,
}: {
  athlete: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
  status: string;
  relationshipId: string;
}) {
  const firstName = athlete?.first_name || "Athlète";
  const lastName = athlete?.last_name || "Inconnu";
  const initials = `${firstName[0] || "?"}${lastName[0] || "?"}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate">
            {firstName} {lastName}
          </p>
          <p className="text-xs sm:text-sm text-slate-400">Aucun programme actif</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 ml-13 sm:ml-0">
        <Badge variant={status === "accepted" ? "success" : "warning"}>
          {status === "accepted" ? "Actif" : "En attente"}
        </Badge>
        {athlete?.id && (
          <a
            href={`/dashboard/athletes/${athlete.id}`}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Voir
          </a>
        )}
      </div>
    </div>
  );
}
