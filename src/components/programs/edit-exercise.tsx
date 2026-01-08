"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  Input,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui";
import { updateExercise } from "@/lib/actions/programs";
import { PencilIcon } from "@heroicons/react/24/outline";

interface Exercise {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  tempo?: string | null;
  notes?: string | null;
}

interface EditExerciseButtonProps {
  exercise: Exercise;
}

export function EditExerciseButton({ exercise }: EditExerciseButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateExercise(exercise.id, formData);

      if (result.success) {
        addToast({ type: "success", title: "Exercice mis à jour" });
        setIsOpen(false);
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modifier l'exercice"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent className="space-y-4">
            <Input
              label="Nom de l'exercice"
              name="name"
              placeholder="Ex: Squat, Développé couché..."
              required
              autoFocus
              defaultValue={exercise.name}
            />

            <Textarea
              label="Notes / Instructions"
              name="notes"
              placeholder="Instructions spécifiques pour cet exercice..."
              rows={3}
              defaultValue={exercise.notes || ""}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Séries"
                name="sets"
                type="number"
                min={1}
                placeholder="Ex: 4"
                defaultValue={exercise.sets?.toString() || ""}
              />
              <Input
                label="Répétitions"
                name="reps"
                placeholder="Ex: 8-12"
                defaultValue={exercise.reps || ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Repos (secondes)"
                name="rest_seconds"
                type="number"
                min={0}
                placeholder="Ex: 90"
                defaultValue={exercise.rest_seconds?.toString() || ""}
              />
              <div>
                <Input
                  label="Tempo"
                  name="tempo"
                  placeholder="Ex: 3-1-2-0"
                  defaultValue={exercise.tempo || ""}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Excentrique-Pause-Concentrique-Pause
                </p>
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Enregistrer
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
