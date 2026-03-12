"use client";

import { useState, useTransition } from "react";
import { Heart, X } from "lucide-react";
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
        toast.error(typeof result.error === "string" ? result.error : "Something went wrong");
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Heart className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No more profiles</h2>
        <p className="text-muted-foreground max-w-xs">
          Check back later for new people in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <SwipeCard profile={currentProfile} />
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14"
          onClick={() => handleSwipe("PASS")}
          disabled={isPending}
          aria-label="Pass"
        >
          <X className="size-6 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14"
          onClick={() => handleSwipe("ACCEPT")}
          disabled={isPending}
          aria-label="Like"
        >
          <Heart className="size-6 text-green-500" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {currentIndex + 1} of {profiles.length}
      </p>
    </div>
  );
}
