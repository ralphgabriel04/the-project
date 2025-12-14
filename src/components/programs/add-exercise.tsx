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
import { createExercise } from "@/lib/actions/programs";
import { PlusIcon } from "@heroicons/react/24/outline";

interface AddExerciseButtonProps {
  sessionId: string;
}

export function AddExerciseButton({ sessionId }: AddExerciseButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createExercise(sessionId, formData);

      if (result.success) {
        addToast({ type: "success", title: "Exercice ajouté" });
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
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Ajouter un exercice
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nouvel exercice"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent className="space-y-3">
            <Input
              label="Nom de l'exercice"
              name="name"
              placeholder="Ex: Squat, Développé couché..."
              required
              autoFocus
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Séries"
                name="sets"
                type="number"
                min={1}
                placeholder="4"
              />
              <Input
                label="Reps"
                name="reps"
                placeholder="8-12"
              />
              <Input
                label="Repos (s)"
                name="rest_seconds"
                type="number"
                min={0}
                placeholder="90"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Tempo (optionnel)"
                name="tempo"
                placeholder="3-1-2-0"
              />
              <div className="text-xs text-slate-500 self-end pb-2">
                Exc-Pause-Conc-Pause
              </div>
            </div>

            <Textarea
              label="Notes (optionnel)"
              name="notes"
              placeholder="Instructions..."
              rows={2}
            />
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
              Ajouter
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

