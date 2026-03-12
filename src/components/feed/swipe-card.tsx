"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase } from "lucide-react";
import { CommunityScoreBadge } from "./community-score-badge";

interface SwipeCardProfile {
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

interface SwipeCardProps {
  profile: SwipeCardProfile;
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

export function SwipeCard({ profile }: SwipeCardProps) {
  const age = calculateAge(profile.dateOfBirth);
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={profile.displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No photo
          </div>
        )}
        {profile.communityScore != null && (
          <div className="absolute top-3 right-3">
            <CommunityScoreBadge score={profile.communityScore} />
          </div>
        )}
      </div>
      <CardContent className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {profile.displayName}, {age}
          </h2>
        </div>
        {profile.occupation && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="size-3.5" />
            {profile.occupation}
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {profile.location}
          </div>
        )}
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
