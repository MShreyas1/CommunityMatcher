import { redirect } from "next/navigation";
import Link from "next/link";
import { getVettingQueue } from "@/actions/community";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VettingCard } from "./vetting-card";

export default async function VettingPage() {
  const result = await getVettingQueue();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          {typeof result.error === "string" ? result.error : "Something went wrong"}
        </p>
      </div>
    );
  }

  const matches = result.matches ?? [];

  return (
    <div className="mx-auto max-w-2xl py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/community">
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Vetting Queue</h1>
        <Badge variant="secondary" className="ml-auto">
          {matches.length} pending
        </Badge>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ClipboardCheck className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-muted-foreground max-w-xs">
            No matches are waiting for your review right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(
            (match: {
              id: string;
              communityScore: number | null;
              user1: {
                id: string;
                name: string | null;
                profile: {
                  displayName: string;
                  bio: string | null;
                  dateOfBirth: Date | string;
                  gender: string;
                  location: string | null;
                  occupation: string | null;
                  photos: {
                    id: string;
                    url: string;
                    isPrimary: boolean;
                    order: number;
                  }[];
                } | null;
              };
              user2: {
                id: string;
                name: string | null;
                profile: {
                  displayName: string;
                  bio: string | null;
                  dateOfBirth: Date | string;
                  gender: string;
                  location: string | null;
                  occupation: string | null;
                  photos: {
                    id: string;
                    url: string;
                    isPrimary: boolean;
                    order: number;
                  }[];
                } | null;
              };
              votes: { vote: string }[];
            }) => (
              <VettingCard key={match.id} match={match} />
            )
          )}
        </div>
      )}
    </div>
  );
}
