import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, Button, Input, Textarea, Tabs, TabList, TabTrigger, TabContent } from "@/components/ui";

export const metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-slate-400 mt-1">
          Gérez votre compte et vos préférences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabList>
          <TabTrigger value="profile">Profil</TabTrigger>
          <TabTrigger value="account">Compte</TabTrigger>
          <TabTrigger value="notifications">Notifications</TabTrigger>
        </TabList>

        {/* Profile Tab */}
        <TabContent value="profile">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">
                Informations personnelles
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-2xl">
                  {profile.first_name[0]}
                  {profile.last_name[0]}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">
                    JPG, PNG ou GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  name="firstName"
                  defaultValue={profile.first_name}
                />
                <Input
                  label="Nom"
                  name="lastName"
                  defaultValue={profile.last_name}
                />
              </div>

              <Textarea
                label="Bio"
                name="bio"
                defaultValue={profile.bio || ""}
                placeholder="Parlez un peu de vous..."
                hint="Visible par vos athlètes ou coachs"
              />

              <div className="flex justify-end">
                <Button>Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* Account Tab */}
        <TabContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Email</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Adresse email"
                  type="email"
                  name="email"
                  defaultValue={user.email}
                  disabled
                />
                <p className="text-sm text-slate-400">
                  Contactez le support pour changer votre email.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">
                  Mot de passe
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                />
                <div className="flex justify-end">
                  <Button>Changer le mot de passe</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/30">
              <CardHeader>
                <h2 className="text-lg font-semibold text-red-400">
                  Zone de danger
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">
                  Supprimer votre compte est irréversible. Toutes vos données
                  seront définitivement effacées.
                </p>
                <Button variant="danger">Supprimer mon compte</Button>
              </CardContent>
            </Card>
          </div>
        </TabContent>

        {/* Notifications Tab */}
        <TabContent value="notifications">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">
                Préférences de notification
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationToggle
                title="Notifications par email"
                description="Recevez des emails pour les mises à jour importantes"
                defaultChecked
              />
              <NotificationToggle
                title="Rappels de séance"
                description="Soyez notifié avant vos séances d'entraînement"
                defaultChecked
              />
              <NotificationToggle
                title="Nouveaux commentaires"
                description="Notification quand quelqu'un commente une séance"
                defaultChecked
              />
              <NotificationToggle
                title="Rapports hebdomadaires"
                description="Résumé de votre activité chaque semaine"
              />

              <div className="flex justify-end">
                <Button>Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabContent>
      </Tabs>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );
}

