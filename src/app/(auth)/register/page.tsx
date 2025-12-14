"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, CardContent } from "@/components/ui";
import type { UserRole } from "@/types/database";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!role) {
      setError("Veuillez sélectionner un rôle");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: role,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Cet email est déjà utilisé");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setError("Erreur lors de la création du compte");
        return;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        role: role,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't show error to user as auth succeeded
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Role selection
  if (step === 1) {
    return (
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Rejoignez THE PROJECT 🚀
          </h1>
          <p className="text-slate-400">
            Choisissez votre profil pour commencer
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Coach Card */}
          <button
            onClick={() => handleRoleSelect("coach")}
            className="group p-6 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-left transition-all hover:border-emerald-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Je suis Coach
            </h3>
            <p className="text-slate-400 text-sm">
              Créez des programmes, suivez vos athlètes et analysez leurs
              performances.
            </p>
          </button>

          {/* Athlete Card */}
          <button
            onClick={() => handleRoleSelect("athlete")}
            className="group p-6 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-left transition-all hover:border-emerald-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Je suis Athlète
            </h3>
            <p className="text-slate-400 text-sm">
              Suivez vos programmes, enregistrez vos performances et progressez.
            </p>
          </button>
        </div>

        <p className="text-center mt-8 text-slate-400">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  // Step 2: Registration form
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <button
          onClick={() => setStep(1)}
          className="text-slate-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-1"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          Créer votre compte{" "}
          {role === "coach" ? "Coach 👨‍🏫" : "Athlète 🏋️"}
        </h1>
        <p className="text-slate-400">
          Remplissez vos informations pour commencer
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                name="firstName"
                placeholder="Jean"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                autoComplete="given-name"
                autoFocus
              />
              <Input
                label="Nom"
                type="text"
                name="lastName"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              autoComplete="new-password"
              hint="Minimum 6 caractères"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center mt-6 text-slate-400">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

