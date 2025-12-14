import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, EmptyState, Badge } from "@/components/ui";
import { InvitationActions } from "@/components/athletes/athlete-actions";

export const metadata = {
  title: "Mes Coachs",
};

export default async function CoachesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user is an athlete
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "athlete") {
    redirect("/dashboard");
  }

  // Get athlete's coaches
  const { data: relationships } = await supabase
    .from("coach_athletes")
    .select(`
      *,
      coach:profiles!coach_athletes_coach_id_fkey(*)
    `)
    .eq("athlete_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const coaches = relationships || [];
  const activeCoaches = coaches.filter((r) => r.status === "accepted");
  const pendingInvites = coaches.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mes Coachs</h1>
        <p className="text-slate-400 mt-1">
          Vos coachs et invitations en attente
        </p>
      </div>

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-lg">📬</span>
              <h2 className="text-lg font-semibold text-white">
                Invitations en attente ({pendingInvites.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                      {invite.coach.first_name[0]}
                      {invite.coach.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {invite.coach.first_name} {invite.coach.last_name}
                      </p>
                      <p className="text-sm text-slate-400">
                        Vous invite à rejoindre son équipe
                      </p>
                    </div>
                  </div>
                  <InvitationActions invitationId={invite.id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active coaches */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Mes Coachs ({activeCoaches.length})
          </h2>
        </CardHeader>
        <CardContent>
          {activeCoaches.length === 0 ? (
            <EmptyState
              icon="👨‍🏫"
              title="Aucun coach pour le moment"
              description="Demandez à votre coach de vous envoyer une invitation pour rejoindre son équipe."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeCoaches.map((relationship) => (
                <CoachCard key={relationship.id} coach={relationship.coach} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CoachCard({
  coach,
}: {
  coach: {
    first_name: string;
    last_name: string;
    bio?: string | null;
    avatar_url?: string | null;
  };
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {coach.first_name[0]}
        {coach.last_name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white">
            {coach.first_name} {coach.last_name}
          </p>
          <Badge variant="coach">Coach</Badge>
        </div>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
          {coach.bio || "Aucune description"}
        </p>
      </div>
    </div>
  );
}
