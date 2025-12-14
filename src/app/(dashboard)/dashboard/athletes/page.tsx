import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, Button, EmptyState, Badge } from "@/components/ui";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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

  // Get coach's athletes
  const { data: relationships } = await supabase
    .from("coach_athletes")
    .select(`
      *,
      athlete:profiles!coach_athletes_athlete_id_fkey(*)
    `)
    .eq("coach_id", user.id)
    .eq("is_deleted", false);

  const athletes = relationships || [];
  const pendingCount = athletes.filter((r) => r.status === "pending").length;
  const activeCount = athletes.filter((r) => r.status === "accepted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes Athlètes</h1>
          <p className="text-slate-400 mt-1">
            Gérez vos athlètes et leurs programmes
          </p>
        </div>
        <Button className="sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2" />
          Inviter un athlète
        </Button>
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
              action={{
                label: "Inviter un athlète",
                href: "#",
              }}
            />
          ) : (
            <div className="divide-y divide-slate-700">
              {athletes.map((relationship) => (
                <AthleteRow
                  key={relationship.id}
                  athlete={relationship.athlete}
                  status={relationship.status}
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
}: {
  athlete: { first_name: string; last_name: string; avatar_url?: string | null };
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
          {athlete.first_name[0]}
          {athlete.last_name[0]}
        </div>
        <div>
          <p className="font-medium text-white">
            {athlete.first_name} {athlete.last_name}
          </p>
          <p className="text-sm text-slate-400">Aucun programme actif</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={status === "accepted" ? "success" : "warning"}>
          {status === "accepted" ? "Actif" : "En attente"}
        </Badge>
        <Button variant="ghost" size="sm">
          Voir
        </Button>
      </div>
    </div>
  );
}

