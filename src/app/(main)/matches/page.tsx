import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMatches } from "@/actions/match";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Shield } from "lucide-react";

export default async function MatchesPage() {
  const result = await getMatches();

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
      <h1 className="text-2xl font-bold">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Heart className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground max-w-xs">
            Keep swiping to find your match! When you and someone else both
            like each other, you&apos;ll see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {matches.map((match) => {
            const otherUser = match.otherUser;
            const profile = otherUser.profile;
            const primaryPhoto =
              profile?.photos?.find(
                (p: { isPrimary: boolean }) => p.isPrimary
              ) ?? profile?.photos?.[0];
            const lastMessage = match.conversation?.messages?.[0];

            return (
              <Link
                key={match.id}
                href={`/messages/${match.conversation?.id ?? ""}`}
              >
                <Card className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
                  <div className="relative aspect-square w-full bg-muted">
                    {primaryPhoto ? (
                      <Image
                        src={primaryPhoto.url}
                        alt={
                          profile?.displayName ?? otherUser.name ?? "Match"
                        }
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No photo
                      </div>
                    )}
                    {match.communityScore != null && (
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            match.communityScore >= 70
                              ? "default"
                              : "secondary"
                          }
                          className="gap-0.5 text-[0.6rem]"
                        >
                          <Shield className="size-2.5" />
                          {match.communityScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm truncate">
                      {profile?.displayName ?? otherUser.name ?? "Unknown"}
                    </h3>
                    {lastMessage ? (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MessageCircle className="size-3 shrink-0" />
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Say hello!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
