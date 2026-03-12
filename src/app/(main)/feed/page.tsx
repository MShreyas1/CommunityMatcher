import { getFeedProfiles } from "@/actions/feed";
import { SwipeStack } from "@/components/feed/swipe-stack";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const result = await getFeedProfiles();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    if (result.error === "Please create a profile first") {
      redirect("/profile/edit");
    }
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          {typeof result.error === "string" ? result.error : "Something went wrong"}
        </p>
      </div>
    );
  }

  const profiles = result.profiles ?? [];

  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Discover</h1>
      <SwipeStack profiles={profiles} />
    </div>
  );
}
