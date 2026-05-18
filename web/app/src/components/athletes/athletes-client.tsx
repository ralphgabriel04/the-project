"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";
import { InviteAthleteModal } from "./invite-modal";

export function AthletesHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
        <PlusIcon className="h-5 w-5 mr-2" />
        Inviter un athlète
      </Button>

      <InviteAthleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}








