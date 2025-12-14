"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalFooter, Button, Input } from "@/components/ui";
import { inviteAthlete } from "@/lib/actions/athletes";
import { useToast } from "@/components/ui";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteAthleteModal({ isOpen, onClose }: InviteModalProps) {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await inviteAthlete(email);

      if (result.success) {
        addToast({
          type: "success",
          title: "Invitation envoyée",
          message: result.message,
        });
        setEmail("");
        onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Inviter un athlète">
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <p className="text-slate-400 text-sm mb-4">
            Entrez l&apos;adresse email de l&apos;athlète que vous souhaitez inviter.
            Il recevra une notification pour rejoindre votre équipe.
          </p>

          <Input
            label="Email de l'athlète"
            type="email"
            name="email"
            placeholder="athlete@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Envoyer l&apos;invitation
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

