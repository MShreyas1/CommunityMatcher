"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SuggestionCard } from "./suggestion-card";
import { respondToSuggestion, respondToDiscovery } from "@/actions/suggestion";

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

interface ProfileData {
  displayName: string;
  bio: string | null;
  dateOfBirth: Date | string;
  gender: string;
  location: string | null;
  occupation: string | null;
  detailPreset: string | null;
  detailAnswers: unknown;
  photos: { id: string; url: string; isPrimary: boolean; order: number }[];
}

interface Suggestion {
  id: string;
  communityScore: number;
  suggested: {
    id: string;
    name: string | null;
    profile: ProfileData | null;
  };
  votes: VoteInfo[];
}

interface DiscoveryProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  dateOfBirth: Date | string;
  gender: string;
  location: string | null;
  occupation: string | null;
  detailPreset: string | null;
  detailAnswers: unknown;
  photos: { id: string; url: string; isPrimary: boolean; order: number }[];
  user: { id: string; name: string | null };
}

export type FeedItem =
  | { type: "suggestion"; data: Suggestion }
  | { type: "discovery"; data: DiscoveryProfile };

interface SuggestionStackProps {
  suggestions: Suggestion[];
  discoveryProfiles: DiscoveryProfile[];
}

export function SuggestionStack({
  suggestions,
  discoveryProfiles,
}: SuggestionStackProps) {
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    for (const s of suggestions) {
      items.push({ type: "suggestion", data: s });
    }
    for (const p of discoveryProfiles) {
      items.push({ type: "discovery", data: p });
    }
    return items;
  }, [suggestions, discoveryProfiles]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const currentItem = feedItems[currentIndex];

  const handleAction = useCallback(
    (action: "APPROVED" | "PASSED") => {
      if (!currentItem || isAnimating) return;

      setSwipeDirection(action === "APPROVED" ? "right" : "left");
      setIsAnimating(true);

      setTimeout(() => {
        startTransition(async () => {
          let result;

          if (currentItem.type === "suggestion") {
            result = await respondToSuggestion(currentItem.data.id, action);
          } else {
            result = await respondToDiscovery(
              currentItem.data.user.id,
              action
            );
          }

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

          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        });
      }, 350);
    },
    [currentItem, isAnimating, startTransition]
  );

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-8 mb-6 glow-sm">
          <Sparkles className="size-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2 tracking-tight">
          All caught up!
        </h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          No more profiles to show right now. Check back later for new people!
        </p>
      </div>
    );
  }

  const swipeClass =
    swipeDirection === "right"
      ? "animate-swipe-right"
      : swipeDirection === "left"
        ? "animate-swipe-left"
        : "animate-card-enter";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {currentIndex + 1 < feedItems.length && (
          <div className="absolute inset-0 translate-y-2 scale-[0.96] opacity-40 pointer-events-none">
            <SuggestionCard feedItem={feedItems[currentIndex + 1]} />
          </div>
        )}
        <div key={cardKey} className={swipeClass}>
          <SuggestionCard feedItem={currentItem} />
        </div>
      </div>

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
        {currentIndex + 1} of {feedItems.length}
      </p>
    </div>
  );
}
