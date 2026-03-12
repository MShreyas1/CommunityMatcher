"use client";

import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface CommunityScoreBadgeProps {
  score: number;
  /** Only render when the viewer is the circle owner. Parent components should pass this. */
  isOwner?: boolean;
}

/**
 * Community score badge — should only be rendered when the viewer is the
 * circle owner. The parent component is responsible for passing isOwner
 * or conditionally rendering this component.
 */
export function CommunityScoreBadge({ score, isOwner = true }: CommunityScoreBadgeProps) {
  // If isOwner is explicitly false, render nothing
  if (!isOwner) {
    return null;
  }

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
