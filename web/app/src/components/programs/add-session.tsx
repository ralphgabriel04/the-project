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
  Select,
} from "@/components/ui";
import { useToast } from "@/components/ui";
import { createSession } from "@/lib/actions/programs";
import { PlusIcon } from "@heroicons/react/24/outline";

interface AddSessionButtonProps {
  programId: string;
}

export function AddSessionButton({ programId }: AddSessionButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createSession(programId, formData);

      if (result.success) {
        addToast({
          type: "success",
          title: "Séance créée",
          message: "Vous pouvez maintenant ajouter des exercices.",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dayOptions = [
    { value: "", label: "Non défini" },
    { value: "1", label: "Lundi" },
    { value: "2", label: "Mardi" },
    { value: "3", label: "Mercredi" },
    { value: "4", label: "Jeudi" },
    { value: "5", label: "Vendredi" },
    { value: "6", label: "Samedi" },
    { value: "7", label: "Dimanche" },
  ];

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusIcon className="h-5 w-5 mr-2" />
        Ajouter une séance
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nouvelle séance"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent className="space-y-4">
            <Input
              label="Nom de la séance"
              name="name"
              placeholder="Ex: Push Day, Jambes, Full Body..."
              required
              autoFocus
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Notes ou instructions pour cette séance..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Jour de la semaine"
                name="day_of_week"
                options={dayOptions}
              />

              <Input
                label="Durée estimée (minutes)"
                name="estimated_duration_minutes"
                type="number"
                min={1}
                placeholder="Ex: 60"
              />
            </div>

            <Input
              label="Numéro de semaine"
              name="week_number"
              type="number"
              min={1}
              defaultValue={1}
              hint="Pour les programmes multi-semaines"
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
              Créer la séance
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}








