"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalContent, ModalFooter, Input } from "@/components/ui";
import { useToast } from "@/components/ui";
import { assignProgram } from "@/lib/actions/programs";
import { UserPlusIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
}

interface AssignProgramButtonProps {
  programId: string;
  athletes: Athlete[];
  assignedAthleteIds: string[];
}

export function AssignProgramButton({
  programId,
  athletes,
  assignedAthleteIds,
}: AssignProgramButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableAthletes = athletes.filter(
    (a) => !assignedAthleteIds.includes(a.id),
  );

  const handleAssign = async () => {
    if (!selectedAthleteId) return;

    setIsLoading(true);
    try {
      const result = await assignProgram(
        programId,
        selectedAthleteId,
        startDate || undefined,
      );

      if (result.success) {
        addToast({
          type: "success",
          title: "Programme assigné",
          message: "L'athlète peut maintenant voir ce programme.",
        });
        setIsOpen(false);
        setSelectedAthleteId(null);
        setStartDate("");
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (athletes.length === 0) {
    return (
      <Button variant="outline" disabled>
        <UserPlusIcon className="h-5 w-5 mr-2" />
        Aucun athlète disponible
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <UserPlusIcon className="h-5 w-5 mr-2" />
        Assigner à un athlète
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Assigner le programme"
        size="md"
      >
        <ModalContent className="space-y-4">
          {availableAthletes.length === 0 ? (
            <p className="text-slate-400">
              Ce programme est déjà assigné à tous vos athlètes.
            </p>
          ) : (
            <>
              <p className="text-slate-400 text-sm">
                Sélectionnez l&apos;athlète qui recevra ce programme.
              </p>

              <div className="space-y-2">
                {availableAthletes.map((athlete) => (
                  <button
                    key={athlete.id}
                    onClick={() => setSelectedAthleteId(athlete.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg border transition-colors
                      ${
                        selectedAthleteId === athlete.id
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
                      {athlete.first_name[0]}
                      {athlete.last_name[0]}
                    </div>
                    <span className="flex-1 text-left text-white">
                      {athlete.first_name} {athlete.last_name}
                    </span>
                    {selectedAthleteId === athlete.id && (
                      <CheckIcon className="h-5 w-5 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>

              <Input
                label="Date de début (optionnel)"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                hint="Laissez vide pour un démarrage immédiat"
              />
            </>
          )}
        </ModalContent>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAthleteId || availableAthletes.length === 0}
            isLoading={isLoading}
          >
            Assigner
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

