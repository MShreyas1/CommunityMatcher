"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { submitVote } from "@/actions/community";

interface UserProfile {
  displayName: string;
  bio: string | null;
  dateOfBirth: Date | string;
  gender: string;
  location: string | null;
  occupation: string | null;
  photos: { id: string; url: string; isPrimary: boolean; order: number }[];
}

interface MatchData {
  id: string;
  user1: {
    id: string;
    name: string | null;
    profile: UserProfile | null;
  };
  user2: {
    id: string;
    name: string | null;
    profile: UserProfile | null;
  };
}

interface VettingCardProps {
  match: MatchData;
  vettingForName: string | null;
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

function ProfileMini({ profile, name }: { profile: UserProfile | null; name: string | null }) {
  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground">{name ?? "Unknown"}</p>
      </div>
    );
  }

  const photo = profile.photos?.[0];
  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="flex-1 space-y-2">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
        {photo ? (
          <Image
            src={photo.url}
            alt={profile.displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No photo
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-sm">
          {profile.displayName}, {age}
        </h3>
        <Badge variant="secondary" className="text-[0.6rem] mt-0.5">
          {profile.gender}
        </Badge>
      </div>
      {profile.occupation && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Briefcase className="size-3" />
          {profile.occupation}
        </div>
      )}
      {profile.location && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {profile.location}
        </div>
      )}
      {profile.bio && (
        <p className="text-xs text-muted-foreground line-clamp-3">
          {profile.bio}
        </p>
      )}
    </div>
  );
}

export function VettingCard({ match, vettingForName }: VettingCardProps) {
  const [comment, setComment] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleVote(vote: "APPROVE" | "DENY" | "NEUTRAL") {
    startTransition(async () => {
      const result = await submitVote(
        match.id,
        vote,
        comment.trim() || undefined
      );

      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }

      toast.success("Vote submitted!");
      setHasVoted(true);
    });
  }

  if (hasVoted) {
    return (
      <Card className="opacity-60">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Thanks for your vote on this match!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Match Review</span>
          {vettingForName && (
            <Badge variant="outline" className="text-xs font-normal">
              Vetting for {vettingForName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ProfileMini profile={match.user1.profile} name={match.user1.name} />
          <ProfileMini profile={match.user2.profile} name={match.user2.name} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`comment-${match.id}`} className="text-sm font-medium">
            Comment (optional)
          </label>
          <Textarea
            id={`comment-${match.id}`}
            placeholder="Share your thoughts about this match..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px]"
          />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => handleVote("APPROVE")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="size-3.5" />
          )}
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => handleVote("NEUTRAL")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Minus className="size-3.5" />
          )}
          Neutral
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => handleVote("DENY")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ThumbsDown className="size-3.5" />
          )}
          Deny
        </Button>
      </CardFooter>
    </Card>
  );
}
