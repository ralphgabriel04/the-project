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
import { updateSession } from "@/lib/actions/programs";
import { PencilIcon } from "@heroicons/react/24/outline";

interface Session {
  id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  week_number?: number | null;
  estimated_duration_minutes: number | null;
}

interface EditSessionButtonProps {
  session: Session;
}

export function EditSessionButton({ session }: EditSessionButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateSession(session.id, formData);

      if (result.success) {
        addToast({ type: "success", title: "Séance mise à jour" });
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
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="text-slate-400 hover:text-white"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modifier la séance"
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
              defaultValue={session.name}
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Notes ou instructions pour cette séance..."
              defaultValue={session.description || ""}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Jour de la semaine"
                name="day_of_week"
                options={dayOptions}
                defaultValue={session.day_of_week?.toString() || ""}
              />

              <Input
                label="Durée estimée (minutes)"
                name="estimated_duration_minutes"
                type="number"
                min={1}
                placeholder="Ex: 60"
                defaultValue={session.estimated_duration_minutes?.toString() || ""}
              />
            </div>

            <Input
              label="Numéro de semaine"
              name="week_number"
              type="number"
              min={1}
              defaultValue={session.week_number?.toString() || "1"}
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
              Enregistrer
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
