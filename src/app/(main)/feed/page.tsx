import { getOwnerFeed } from "@/actions/suggestion";
import { SuggestionStack } from "@/components/feed/suggestion-stack";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const result = await getOwnerFeed();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    if (result.error === "Please create a profile first") {
      redirect("/profile/edit");
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

  const suggestions = result.suggestions ?? [];

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-3xl font-bold text-center mb-8 tracking-tight text-glow">
        Suggestions
      </h1>
      <SuggestionStack suggestions={suggestions} />
    </div>
  );
}
