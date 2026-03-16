"use client";

import { useState, useTransition } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SuggestionCard } from "./suggestion-card";
import { respondToSuggestion } from "@/actions/suggestion";

interface VoteInfo {
  vote: string;
  comment: string | null;
  communityMember: {
    role: string;
    vetter: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

interface SuggestionProfile {
  id: string;
  name: string | null;
  profile: {
    displayName: string;
    bio: string | null;
    dateOfBirth: Date | string;
    gender: string;
    location: string | null;
    occupation: string | null;
    photos: { id: string; url: string; isPrimary: boolean; order: number }[];
  } | null;
}

interface Suggestion {
  id: string;
  communityScore: number;
  suggested: SuggestionProfile;
  votes: VoteInfo[];
}

interface SuggestionStackProps {
  suggestions: Suggestion[];
}

export function SuggestionStack({ suggestions }: SuggestionStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const currentSuggestion = suggestions[currentIndex];

  function handleAction(action: "APPROVED" | "PASSED") {
    if (!currentSuggestion) return;

    startTransition(async () => {
      const result = await respondToSuggestion(currentSuggestion.id, action);

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong"
        );
        return;
      }

      if (action === "APPROVED") {
        toast.success("It's a match!", {
          description: "Start chatting now.",
        });
      }

      setCurrentIndex((prev) => prev + 1);
    });
  }

  if (!currentSuggestion) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-8 mb-6 glow-sm">
          <Sparkles className="size-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2 tracking-tight">
          No suggestions yet
        </h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Your community hasn&apos;t suggested anyone yet. Ask your vetters to browse and suggest profiles for you!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="transition-all duration-300 ease-out">
        <SuggestionCard suggestion={currentSuggestion} />
      </div>

      <div className="flex items-center gap-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-red"
          onClick={() => handleAction("PASSED")}
          disabled={isPending}
          aria-label="Pass"
        >
          <X className="size-7 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-green-500/30 bg-green-500/5 hover:border-green-500 hover:bg-green-500/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-green"
          onClick={() => handleAction("APPROVED")}
          disabled={isPending}
          aria-label="Approve"
        >
          <Check className="size-7 text-green-500" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        {currentIndex + 1} of {suggestions.length}
      </p>
    </div>
  );
}
