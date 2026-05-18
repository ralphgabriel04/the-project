"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
} from "@/components/ui";
import { useToast } from "@/components/ui";
import { createProgram } from "@/lib/actions/programs";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NewProgramPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createProgram(formData);

      if (result.success && result.data) {
        addToast({
          type: "success",
          title: "Programme créé !",
          message: "Vous pouvez maintenant ajouter des séances.",
        });
        router.push(`/dashboard/programs/${result.data.id}`);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/programs"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nouveau programme</h1>
          <p className="text-slate-400 mt-1">
            Créez un programme d&apos;entraînement pour vos athlètes
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Informations du programme
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nom du programme"
              name="name"
              placeholder="Ex: Programme Force 12 semaines"
              required
              autoFocus
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Décrivez l'objectif et le contenu de ce programme..."
              hint="Optionnel - Visible par les athlètes"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Durée (semaines)"
                name="duration_weeks"
                type="number"
                min={1}
                max={52}
                placeholder="Ex: 12"
                hint="Optionnel"
              />

              <Select
                label="Statut"
                name="status"
                options={[
                  { value: "draft", label: "Brouillon" },
                  { value: "active", label: "Actif" },
                ]}
                hint="Les brouillons ne sont pas visibles par les athlètes"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
              <Link href="/dashboard/programs">
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" isLoading={isLoading}>
                Créer le programme
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}








