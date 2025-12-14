"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalContent, ModalFooter } from "@/components/ui";
import { useToast } from "@/components/ui";
import { deleteProgram, duplicateProgram } from "@/lib/actions/programs";
import {
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface ProgramActionsProps {
  programId: string;
  programName: string;
}

export function ProgramActions({ programId, programName }: ProgramActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setIsLoading("duplicate");
    try {
      const result = await duplicateProgram(programId);
      if (result.success && result.data) {
        addToast({
          type: "success",
          title: "Programme dupliqué",
          message: "Vous pouvez maintenant modifier la copie.",
        });
        router.push(`/dashboard/programs/${result.data.id}`);
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsLoading(null);
      setIsMenuOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading("delete");
    try {
      const result = await deleteProgram(programId);
      if (result.success) {
        addToast({
          type: "success",
          title: "Programme supprimé",
        });
        router.push("/dashboard/programs");
      } else {
        addToast({ type: "error", title: "Erreur", message: result.error });
      }
    } finally {
      setIsLoading(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </Button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-20 py-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(`/dashboard/programs/${programId}/edit`);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full"
              >
                <PencilIcon className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={handleDuplicate}
                disabled={isLoading === "duplicate"}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full disabled:opacity-50"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                {isLoading === "duplicate" ? "Duplication..." : "Dupliquer"}
              </button>
              <hr className="my-1 border-slate-700" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors w-full"
              >
                <TrashIcon className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer le programme"
      >
        <ModalContent>
          <p className="text-slate-400">
            Êtes-vous sûr de vouloir supprimer le programme{" "}
            <span className="text-white font-medium">{programName}</span> ?
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Cette action est irréversible. Toutes les séances et exercices
            associés seront également supprimés.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading === "delete"}
          >
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

