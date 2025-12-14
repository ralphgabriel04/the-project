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
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent className="space-y-4">
            <Input
              label="Nom de l'exercice"
              name="name"
              placeholder="Ex: Développé couché, Squat, Tractions..."
              required
              autoFocus
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Séries"
                name="sets"
                type="number"
                min={1}
                placeholder="Ex: 4"
              />

              <Input
                label="Répétitions"
                name="reps"
                placeholder="Ex: 8-12 ou AMRAP"
                hint="Peut être un nombre ou une plage"
              />

              <Input
                label="Repos (sec)"
                name="rest_seconds"
                type="number"
                min={0}
                placeholder="Ex: 90"
              />
            </div>

            <Input
              label="Tempo"
              name="tempo"
              placeholder="Ex: 3-1-2-0"
              hint="Excentrique-Pause bas-Concentrique-Pause haut"
            />

            <Textarea
              label="Notes / Instructions"
              name="notes"
              placeholder="Instructions spécifiques pour cet exercice..."
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
              Ajouter l&apos;exercice
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

