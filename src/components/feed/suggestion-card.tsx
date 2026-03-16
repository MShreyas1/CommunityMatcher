"use client";

import Image from "next/image";
import {
  MapPin,
  Briefcase,
  Shield,
  Check,
  X,
  Minus,
  ClipboardCheck,
  ScrollText,
  Compass,
} from "lucide-react";
import { getPresetById } from "@/lib/detail-presets";
import { Badge } from "@/components/ui/badge";
import { CommunityScoreBadge } from "./community-score-badge";
import type { FeedItem } from "./suggestion-stack";

interface ChecklistResponseInfo {
  checklistItem: {
    id: string;
    label: string;
  };
}

interface VoteInfo {
  vote: string;
  comment: string | null;
  checklistResponses?: ChecklistResponseInfo[];
  communityMember: {
    role: string;
    vetter: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
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

function VoteIcon({ vote }: { vote: string }) {
  if (vote === "APPROVE")
    return <Check className="size-3.5 text-green-500" />;
  if (vote === "DENY") return <X className="size-3.5 text-red-500" />;
  return <Minus className="size-3.5 text-yellow-500" />;
}

interface SuggestionCardProps {
  feedItem: FeedItem;
}

export function SuggestionCard({ feedItem }: SuggestionCardProps) {
  let displayName: string;
  let bio: string | null;
  let dateOfBirth: Date | string;
  let location: string | null;
  let occupation: string | null;
  let detailPreset: string | null;
  let detailAnswers: unknown;
  let photos: { id: string; url: string; isPrimary: boolean; order: number }[];
  let communityScore = 0;
  let votes: VoteInfo[] = [];
  let isDiscovery = false;

  if (feedItem.type === "suggestion") {
    const profile = feedItem.data.suggested.profile;
    if (!profile) return null;
    displayName = profile.displayName;
    bio = profile.bio;
    dateOfBirth = profile.dateOfBirth;
    location = profile.location;
    occupation = profile.occupation;
    detailPreset = profile.detailPreset;
    detailAnswers = profile.detailAnswers;
    photos = profile.photos;
    communityScore = feedItem.data.communityScore;
    votes = feedItem.data.votes;
  } else {
    const p = feedItem.data;
    displayName = p.displayName;
    bio = p.bio;
    dateOfBirth = p.dateOfBirth;
    location = p.location;
    occupation = p.occupation;
    detailPreset = p.detailPreset;
    detailAnswers = p.detailAnswers;
    photos = p.photos;
    isDiscovery = true;
  }

  const age = calculateAge(dateOfBirth);
  const primaryPhoto = photos.find((p) => p.isPrimary) ?? photos[0];

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden card-shadow-lg bg-card border border-border/30 hover:border-primary/15 transition-all duration-300">
      {/* Photo area */}
      <div className="relative aspect-[3/4] w-full bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No photo
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {communityScore > 0 && (
          <div className="absolute top-4 right-4">
            <CommunityScoreBadge score={communityScore} />
          </div>
        )}

        {isDiscovery && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50">
              <Compass className="size-3" />
              Discover
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h2 className="text-2xl font-bold drop-shadow-md">
            {displayName}, {age}
          </h2>
          {occupation && (
            <div className="flex items-center gap-1.5 text-sm text-white/90 mt-1">
              <Briefcase className="size-3.5" />
              {occupation}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-white/90 mt-0.5">
              <MapPin className="size-3.5" />
              {location}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="px-5 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Detail Preset Answers */}
      {detailPreset &&
        detailAnswers != null &&
        (() => {
          const preset = getPresetById(detailPreset);
          if (!preset) return null;
          const answers = detailAnswers as Record<string, string>;
          const filledFields = preset.fields.filter((f) => answers[f.key]);
          if (filledFields.length === 0) return null;
          return (
            <div className="px-5 py-3 border-t border-border/30">
              <div className="flex items-center gap-1.5 mb-2">
                <ScrollText className="size-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-muted-foreground">
                  {preset.name} Details
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {filledFields.map((field) => (
                  <div key={field.key} className="text-xs">
                    <span className="text-muted-foreground">
                      {field.label}:
                    </span>{" "}
                    <span className="font-medium">{answers[field.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      {/* Community Endorsement Section — only for vetted suggestions */}
      {votes.length > 0 && (
        <div className="px-5 py-4 border-t border-border/30 mt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Community Endorsement</h3>
          </div>
          <div className="space-y-2.5">
            {votes.map((vote, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <VoteIcon vote={vote.vote} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {vote.communityMember.vetter.name ?? "Vetter"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[0.6rem] px-1.5 py-0"
                    >
                      {vote.communityMember.role.toLowerCase()}
                    </Badge>
                  </div>
                  {vote.checklistResponses &&
                    vote.checklistResponses.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vote.checklistResponses.map((cr) => (
                          <span
                            key={cr.checklistItem.id}
                            className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 text-[0.6rem] font-medium"
                          >
                            <ClipboardCheck className="size-2.5" />
                            {cr.checklistItem.label}
                          </span>
                        ))}
                      </div>
                    )}
                  {vote.comment && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      &ldquo;{vote.comment}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
