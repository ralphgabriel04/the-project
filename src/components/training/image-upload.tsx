"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui";
import { uploadSessionImage } from "@/lib/actions/training";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ImageUploadProps {
  sessionLogId: string;
  onUpload?: () => void;
}

export function ImageUpload({ sessionLogId, onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.set("image", file);

    const result = await uploadSessionImage(sessionLogId, formData);

    if (result.success) {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUpload?.();
    } else {
      setError(result.error || "Erreur lors de l'upload");
    }

    setIsUploading(false);
  };

  const handleCancel = () => {
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-emerald-500/50 transition-colors text-slate-400 hover:text-slate-300"
        >
          <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
          <span className="text-sm">Ajouter une photo</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}








