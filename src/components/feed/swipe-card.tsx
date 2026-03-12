"use client";

import Image from "next/image";
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
  const primaryPhoto =
    profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden card-shadow-lg bg-card border border-border/30">
      {/* Photo area with gradient overlay */}
      <div className="relative aspect-[3/4] w-full bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={profile.displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No photo
          </div>
        )}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Community score badge */}
        {profile.communityScore != null && (
          <div className="absolute top-4 right-4">
            <CommunityScoreBadge score={profile.communityScore} />
          </div>
        )}

        {/* Name overlay on photo */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h2 className="text-2xl font-bold drop-shadow-md">
            {profile.displayName}, {age}
          </h2>
          {profile.occupation && (
            <div className="flex items-center gap-1.5 text-sm text-white/90 mt-1">
              <Briefcase className="size-3.5" />
              {profile.occupation}
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-white/90 mt-0.5">
              <MapPin className="size-3.5" />
              {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* Bio section */}
      {profile.bio && (
        <div className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
}
