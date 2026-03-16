import { redirect } from "next/navigation";
import { getSuggestFeed } from "@/actions/suggestion";
import { SuggestStack } from "@/components/suggest/suggest-stack";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface SuggestPageProps {
  params: Promise<{ ownerId: string }>;
}

export default async function SuggestPage({ params }: SuggestPageProps) {
  const { ownerId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true },
  });

  if (!owner) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">User not found</p>
      </div>
    );
  }

  const result = await getSuggestFeed(ownerId);

  if (result.error) {
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

  const profiles = result.profiles ?? [];

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-3xl font-bold text-center mb-2 tracking-tight text-glow">
        Suggest Profiles
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-8">
        for {owner.name ?? "your friend"}
      </p>
      <SuggestStack profiles={profiles} ownerId={ownerId} />
    </div>
  );
}
