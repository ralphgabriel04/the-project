"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { pauseSession, resumeSession } from "@/lib/actions/training";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface PauseSessionButtonProps {
  sessionLogId: string;
  isPaused: boolean;
}

export function PauseSessionButton({
  sessionLogId,
  isPaused: initialIsPaused,
}: PauseSessionButtonProps) {
  const [isPaused, setIsPaused] = useState(initialIsPaused);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);

    const result = isPaused
      ? await resumeSession(sessionLogId)
      : await pauseSession(sessionLogId);

    if (result.success) {
      setIsPaused(!isPaused);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isPaused ? "primary" : "secondary"}
      className="gap-2"
    >
      {isPaused ? (
        <>
          <PlayIcon className="h-5 w-5" />
          {isLoading ? "Reprise..." : "Reprendre"}
        </>
      ) : (
        <>
          <PauseIcon className="h-5 w-5" />
          {isLoading ? "Pause..." : "Pause"}
        </>
      )}
    </Button>
  );
}
