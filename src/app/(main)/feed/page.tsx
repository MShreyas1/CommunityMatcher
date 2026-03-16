import { getOwnerFeed, getDiscoveryProfiles } from "@/actions/suggestion";
import { SuggestionStack } from "@/components/feed/suggestion-stack";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const [feedResult, discoveryResult] = await Promise.all([
    getOwnerFeed(),
    getDiscoveryProfiles(),
  ]);

  if (feedResult.error) {
    if (feedResult.error === "Not authenticated") {
      redirect("/login");
    }
    if (feedResult.error === "Please create a profile first") {
      redirect("/profile/edit");
    }
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">
          {typeof feedResult.error === "string"
            ? feedResult.error
            : "Something went wrong"}
        </p>
      </div>
    );
  }

  const suggestions = feedResult.suggestions ?? [];
  const discoveryProfiles = discoveryResult.profiles ?? [];

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-3xl font-bold text-center mb-8 tracking-tight text-glow">
        Discover
      </h1>
      <SuggestionStack
        suggestions={suggestions}
        discoveryProfiles={discoveryProfiles}
      />
    </div>
  );
}
