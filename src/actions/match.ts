"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getMatches() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  const matches = await prisma.match.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            include: {
              photos: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            include: {
              photos: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enrichedMatches = matches.map((match) => {
    const otherUser =
      match.user1.id === userId ? match.user2 : match.user1;

    return {
      ...match,
      otherUser,
    };
  });

  return { success: true, matches: enrichedMatches };
}

const unmatchSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
});

export async function unmatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = unmatchSchema.safeParse({ matchId });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
  });

  if (!match) {
    return { error: "Match not found" };
  }

  if (match.user1Id !== session.user.id && match.user2Id !== session.user.id) {
    return { error: "Not authorized to unmatch" };
  }

  if (match.status === "UNMATCHED") {
    return { error: "Already unmatched" };
  }

  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data: { status: "UNMATCHED" },
  });

  revalidatePath("/matches");
  return { success: true };
}
