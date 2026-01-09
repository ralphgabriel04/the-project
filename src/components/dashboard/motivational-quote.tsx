"use client";

import { Card, CardContent } from "@/components/ui";
import type { MotivationalQuote, CoachMessageWithCoach } from "@/types/database";
import { SparklesIcon, UserIcon } from "@heroicons/react/24/outline";
import { markMessageRead } from "@/lib/actions/quotes";
import { useEffect } from "react";

interface MotivationalQuoteCardProps {
  quote?: MotivationalQuote;
  coachMessage?: CoachMessageWithCoach;
}

export function MotivationalQuoteCard({ quote, coachMessage }: MotivationalQuoteCardProps) {
  // Mark coach message as read when displayed
  useEffect(() => {
    if (coachMessage && !coachMessage.is_read) {
      markMessageRead(coachMessage.id);
    }
  }, [coachMessage]);

  // Show coach message if available (priority over daily quote)
  if (coachMessage) {
    return (
      <Card className="bg-gradient-to-r from-emerald-900/50 to-slate-800 border-emerald-700/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 text-sm font-medium">
                  Message de {coachMessage.coach.first_name} {coachMessage.coach.last_name}
                </span>
                {!coachMessage.is_read && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <blockquote className="text-lg text-white italic">
                &ldquo;{coachMessage.content}&rdquo;
              </blockquote>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show daily quote
  if (quote) {
    return (
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 text-sm font-medium mb-2">Citation du jour</p>
              <blockquote className="text-lg text-white italic mb-2">
                &ldquo;{quote.content}&rdquo;
              </blockquote>
              {quote.author && (
                <p className="text-slate-400 text-sm">- {quote.author}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback if nothing to show
  return null;
}
