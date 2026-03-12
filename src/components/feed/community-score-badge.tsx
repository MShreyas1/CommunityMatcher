"use client";

import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface CommunityScoreBadgeProps {
  score: number;
}

export function CommunityScoreBadge({ score }: CommunityScoreBadgeProps) {
  return (
    <Badge
      variant={score >= 70 ? "default" : score >= 40 ? "secondary" : "destructive"}
      className="gap-1"
    >
      <Shield className="size-3" />
      {score}% approved
    </Badge>
  );
}
