"use client";

import { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { Check, Minus, X, Sparkles, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createSuggestion } from "@/actions/suggestion";

interface SuggestProfile {
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
}

interface ChecklistItem {
  id: string;
  label: string;
}

interface SuggestStackProps {
  profiles: SuggestProfile[];
  ownerId: string;
  checklistItems?: ChecklistItem[];
}

function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function SuggestStack({ profiles, ownerId, checklistItems = [] }: SuggestStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const currentProfile = profiles[currentIndex];

  const handleVote = useCallback(
    (vote: "APPROVE" | "NEUTRAL" | "DENY") => {
      if (!currentProfile || isAnimating) return;

      // Determine swipe direction from vote
      const direction = vote === "DENY" ? "left" : "right";
      setSwipeDirection(direction);
      setIsAnimating(true);

      setTimeout(() => {
        startTransition(async () => {
          const result = await createSuggestion(
            ownerId,
            currentProfile.userId,
            vote,
            comment.trim() || undefined,
            checkedIds.size > 0 ? Array.from(checkedIds) : undefined
          );

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

          toast.success("Suggestion submitted!");
          setComment("");
          setCheckedIds(new Set());
          setSwipeDirection(null);
          setCurrentIndex((prev) => prev + 1);
          setCardKey((prev) => prev + 1);

          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        });
      }, 350);
    },
    [currentProfile, isAnimating, ownerId, comment, checkedIds, startTransition]
  );

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-8 mb-6 glow-sm">
          <Sparkles className="size-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2 tracking-tight">
          No more profiles
        </h2>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Check back later for new people to suggest.
        </p>
      </div>
    );
  }

  const age = calculateAge(currentProfile.dateOfBirth);
  const primaryPhoto =
    currentProfile.photos.find((p) => p.isPrimary) ?? currentProfile.photos[0];

  const swipeClass = swipeDirection === "right"
    ? "animate-swipe-right"
    : swipeDirection === "left"
      ? "animate-swipe-left"
      : "animate-card-enter";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Profile Card with swipe animation */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Shadow card behind for depth */}
        {currentIndex + 1 < profiles.length && (
          <div className="absolute inset-0 translate-y-2 scale-[0.96] opacity-40 pointer-events-none rounded-3xl overflow-hidden">
            <div className="w-full h-full bg-card border border-border/30 rounded-3xl" />
          </div>
        )}
        <div key={cardKey} className={swipeClass}>
          <div className="rounded-3xl overflow-hidden card-shadow-lg bg-card border border-border/30 hover:border-primary/15 transition-colors duration-300">
            <div className="relative aspect-[3/4] w-full bg-muted">
              {primaryPhoto ? (
                <Image
                  src={primaryPhoto.url}
                  alt={currentProfile.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No photo
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h2 className="text-2xl font-bold drop-shadow-md">
                  {currentProfile.displayName}, {age}
                </h2>
                {currentProfile.occupation && (
                  <div className="flex items-center gap-1.5 text-sm text-white/90 mt-1">
                    <Briefcase className="size-3.5" />
                    {currentProfile.occupation}
                  </div>
                )}
                {currentProfile.location && (
                  <div className="flex items-center gap-1.5 text-sm text-white/90 mt-0.5">
                    <MapPin className="size-3.5" />
                    {currentProfile.location}
                  </div>
                )}
              </div>
            </div>
            {currentProfile.bio && (
              <div className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentProfile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist (optional) */}
      {checklistItems.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Checklist (optional)</p>
          <div className="space-y-1.5">
            {checklistItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(item.id)}
                  onChange={() => {
                    setCheckedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Comment field */}
      <div className="w-full max-w-sm">
        <Textarea
          placeholder="Add a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Vote buttons */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-red"
          onClick={() => handleVote("DENY")}
          disabled={isPending || isAnimating}
          aria-label="Deny"
        >
          <X className="size-6 text-destructive" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500 hover:bg-yellow-500/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_0_15px_oklch(0.80_0.15_90/25%)]"
          onClick={() => handleVote("NEUTRAL")}
          disabled={isPending || isAnimating}
          aria-label="Neutral"
        >
          <Minus className="size-6 text-yellow-500" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-green-500/30 bg-green-500/5 hover:border-green-500 hover:bg-green-500/15 transition-all duration-300 hover:scale-110 active:scale-95 hover:glow-green"
          onClick={() => handleVote("APPROVE")}
          disabled={isPending || isAnimating}
          aria-label="Approve"
        >
          <Check className="size-6 text-green-500" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        {currentIndex + 1} of {profiles.length}
      </p>
    </div>
  );
}
