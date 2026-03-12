"use client";

import { useState, useTransition } from "react";
import { Heart, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SwipeCard } from "./swipe-card";
import { recordSwipe } from "@/actions/feed";

interface FeedProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  dateOfBirth: Date | string;
  gender: string;
  location: string | null;
  occupation: string | null;
  photos: { id: string; url: string; isPrimary: boolean; order: number }[];
  user: { id: string; name: string | null };
  communityScore?: number | null;
}

interface SwipeStackProps {
  profiles: FeedProfile[];
}

export function SwipeStack({ profiles }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const currentProfile = profiles[currentIndex];

  function handleSwipe(action: "ACCEPT" | "PASS") {
    if (!currentProfile) return;

    startTransition(async () => {
      const result = await recordSwipe(currentProfile.userId, action);

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong"
        );
        return;
      }

      if (result.matched) {
        toast.success("It's a match!", {
          description: `You and ${currentProfile.displayName} liked each other!`,
        });
      }

      setCurrentIndex((prev) => prev + 1);
    });
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 mb-6">
          <Sparkles className="size-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2 tracking-tight">
          You&apos;re all caught up
        </h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Check back later for new people in your communities.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="transition-all duration-300 ease-out">
        <SwipeCard profile={currentProfile} />
      </div>

      <div className="flex items-center gap-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 active:scale-95 card-shadow"
          onClick={() => handleSwipe("PASS")}
          disabled={isPending}
          aria-label="Pass"
        >
          <X className="size-7 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-green-500/30 hover:border-green-500 hover:bg-green-500/10 transition-all duration-200 hover:scale-110 active:scale-95 card-shadow"
          onClick={() => handleSwipe("ACCEPT")}
          disabled={isPending}
          aria-label="Like"
        >
          <Heart className="size-7 text-green-500" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        {currentIndex + 1} of {profiles.length}
      </p>
    </div>
  );
}
