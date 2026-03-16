import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMatches } from "@/actions/match";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";

export default async function MatchesPage() {
  const result = await getMatches();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">
          {typeof result.error === "string"
            ? result.error
            : "Something went wrong"}
        </p>
      </div>
    );
  }

  const matches = result.matches ?? [];

  return (
    <div className="mx-auto max-w-2xl py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-8 mb-6 glow-sm">
            <Sparkles className="size-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2 tracking-tight">
            No matches yet
          </h2>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            When your community suggests someone and you approve, they&apos;ll
            appear here.
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
                <div className="group rounded-2xl overflow-hidden border border-border/30 bg-card card-shadow transition-all duration-300 hover:card-shadow-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer">
                  <div className="relative aspect-square w-full bg-muted overflow-hidden">
                    {primaryPhoto ? (
                      <Image
                        src={primaryPhoto.url}
                        alt={
                          profile?.displayName ?? otherUser.name ?? "Match"
                        }
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No photo
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                    {match.communityScore > 0 && (
                      <div className="absolute top-2.5 right-2.5">
                        <Badge
                          variant={
                            match.communityScore >= 70
                              ? "default"
                              : "secondary"
                          }
                          className="gap-0.5 text-[0.6rem] rounded-full px-2"
                        >
                          <Shield className="size-2.5" />
                          {match.communityScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="font-semibold text-sm truncate">
                      {profile?.displayName ?? otherUser.name ?? "Unknown"}
                    </h3>
                    {lastMessage ? (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <MessageCircle className="size-3 shrink-0 text-primary/60" />
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                        <Heart className="size-3 shrink-0" />
                        Match Active! Say hello!
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
