"use client";

import { useState, useTransition, useCallback } from "react";
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
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const currentSuggestion = suggestions[currentIndex];

  const handleAction = useCallback(
    (action: "APPROVED" | "PASSED") => {
      if (!currentSuggestion || isAnimating) return;

      // Start swipe animation
      setSwipeDirection(action === "APPROVED" ? "right" : "left");
      setIsAnimating(true);

      // After animation completes, do the API call and advance
      setTimeout(() => {
        startTransition(async () => {
          const result = await respondToSuggestion(currentSuggestion.id, action);

          if (result.error) {
            toast.error(
              typeof result.error === "string"
                ? result.error
                : "Something went wrong"
            );
            setSwipeDirection(null);
            setIsAnimating(false);
            return;
          }

          if (action === "APPROVED") {
            toast.success("It's a match!", {
              description: "Start chatting now.",
            });
          }

          setSwipeDirection(null);
          setCurrentIndex((prev) => prev + 1);
          setCardKey((prev) => prev + 1);

          // Small delay before allowing next interaction
          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        });
      }, 350);
    },
    [currentSuggestion, isAnimating, startTransition]
  );

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

  const swipeClass = swipeDirection === "right"
    ? "animate-swipe-right"
    : swipeDirection === "left"
      ? "animate-swipe-left"
      : "animate-card-enter";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {/* Shadow card behind for depth */}
        {currentIndex + 1 < suggestions.length && (
          <div className="absolute inset-0 translate-y-2 scale-[0.96] opacity-40 pointer-events-none">
            <SuggestionCard suggestion={suggestions[currentIndex + 1]} />
          </div>
        )}
        <div key={cardKey} className={swipeClass}>
          <SuggestionCard suggestion={currentSuggestion} />
        </div>
      </div>

      {/* Swipe indicator overlays */}
      <div className="flex items-center gap-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-red"
          onClick={() => handleAction("PASSED")}
          disabled={isPending || isAnimating}
          aria-label="Pass"
        >
          <X className="size-7 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-green-500/30 bg-green-500/5 hover:border-green-500 hover:bg-green-500/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-green"
          onClick={() => handleAction("APPROVED")}
          disabled={isPending || isAnimating}
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
