"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui";
import { acceptInvitation, rejectInvitation } from "@/lib/actions/athletes";

interface InvitationActionsProps {
  invitationId: string;
}

export function InvitationActions({ invitationId }: InvitationActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setIsLoading("accept");
    try {
      const result = await acceptInvitation(invitationId);
      if (result.success) {
        addToast({
          type: "success",
          title: "Invitation acceptée",
          message: "Vous faites maintenant partie de l'équipe !",
        });
        router.refresh();
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          message: result.error,
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async () => {
    setIsLoading("reject");
    try {
      const result = await rejectInvitation(invitationId);
      if (result.success) {
        addToast({
          type: "info",
          title: "Invitation refusée",
        });
        router.refresh();
      } else {
        addToast({
          type: "error",
          title: "Erreur",
          message: result.error,
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleAccept}
        isLoading={isLoading === "accept"}
        disabled={isLoading !== null}
        size="sm"
      >
        Accepter
      </Button>
      <Button
        onClick={handleReject}
        isLoading={isLoading === "reject"}
        disabled={isLoading !== null}
        variant="secondary"
        size="sm"
      >
        Refuser
      </Button>
    </div>
  );
}

