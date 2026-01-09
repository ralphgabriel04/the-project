"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { SendMotivationModal } from "./send-motivation-modal";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface AthleteMotivationButtonProps {
  athleteId: string;
  athleteName: string;
}

export function AthleteMotivationButton({ athleteId, athleteName }: AthleteMotivationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <SparklesIcon className="h-4 w-4" />
        Envoyer motivation
      </Button>

      <SendMotivationModal
        athleteId={athleteId}
        athleteName={athleteName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
