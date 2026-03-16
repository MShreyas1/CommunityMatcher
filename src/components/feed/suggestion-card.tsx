"use client";

import Image from "next/image";
import { MapPin, Briefcase, Shield, Check, X, Minus, ClipboardCheck, ScrollText } from "lucide-react";
import { getPresetById } from "@/lib/detail-presets";
import { Badge } from "@/components/ui/badge";
import { CommunityScoreBadge } from "./community-score-badge";

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
    detailPreset: string | null;
    detailAnswers: Record<string, string> | null;
    photos: { id: string; url: string; isPrimary: boolean; order: number }[];
  } | null;
}

interface SuggestionCardProps {
  suggestion: {
    id: string;
    communityScore: number;
    suggested: SuggestionProfile;
    votes: VoteInfo[];
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
  if (vote === "APPROVE") return <Check className="size-3.5 text-green-500" />;
  if (vote === "DENY") return <X className="size-3.5 text-red-500" />;
  return <Minus className="size-3.5 text-yellow-500" />;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const profile = suggestion.suggested.profile;
  if (!profile) return null;

  const age = calculateAge(profile.dateOfBirth);
  const primaryPhoto =
    profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden card-shadow-lg bg-card border border-border/30 hover:border-primary/15 transition-all duration-300">
      {/* Photo area */}
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
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {suggestion.communityScore > 0 && (
          <div className="absolute top-4 right-4">
            <CommunityScoreBadge score={suggestion.communityScore} />
          </div>
        )}

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

      {/* Bio */}
      {profile.bio && (
        <div className="px-5 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Detail Preset Answers */}
      {profile.detailPreset && profile.detailAnswers && (() => {
        const preset = getPresetById(profile.detailPreset);
        if (!preset) return null;
        const answers = profile.detailAnswers;
        const filledFields = preset.fields.filter((f) => answers[f.key]);
        if (filledFields.length === 0) return null;
        return (
          <div className="px-5 py-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 mb-2">
              <ScrollText className="size-3.5 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground">{preset.name} Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {filledFields.map((field) => (
                <div key={field.key} className="text-xs">
                  <span className="text-muted-foreground">{field.label}:</span>{" "}
                  <span className="font-medium">{answers[field.key]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Community Endorsement Section */}
      {suggestion.votes.length > 0 && (
        <div className="px-5 py-4 border-t border-border/30 mt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Community Endorsement</h3>
          </div>
          <div className="space-y-2.5">
            {suggestion.votes.map((vote, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <VoteIcon vote={vote.vote} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {vote.communityMember.vetter.name ?? "Vetter"}
                    </span>
                    <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0">
                      {vote.communityMember.role.toLowerCase()}
                    </Badge>
                  </div>
                  {vote.checklistResponses && vote.checklistResponses.length > 0 && (
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
