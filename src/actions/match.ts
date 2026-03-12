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

  // Get the current user's accepted community members (their vetters)
  const myVetterMemberships = await prisma.communityMember.findMany({
    where: {
      ownerId: userId,
      status: "ACCEPTED",
    },
    select: { id: true },
  });
  const myVetterMembershipIds = myVetterMemberships.map((m: { id: string }) => m.id);

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ["ACTIVE", "PENDING_VETTING"] },
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
      // Include only votes from the current user's own circle (hub-and-spoke privacy)
      votes: {
        where: {
          communityMemberId: { in: myVetterMembershipIds },
        },
        include: {
          communityMember: {
            include: {
              vetter: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // For PENDING_VETTING matches, also include vetters who haven't voted yet
  const enrichedMatches = await Promise.all(
    matches.map(async (match: (typeof matches)[number]) => {
      const otherUser =
        match.user1.id === userId ? match.user2 : match.user1;

      // For pending matches, get all the user's vetters so we can show who hasn't voted
      let allVetters: { id: string; vetterId: string; vetter: { id: string; name: string | null; image: string | null } }[] = [];
      if (match.status === "PENDING_VETTING" && myVetterMembershipIds.length > 0) {
        allVetters = await prisma.communityMember.findMany({
          where: {
            ownerId: userId,
            status: "ACCEPTED",
          },
          select: {
            id: true,
            vetterId: true,
            vetter: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });
      }

      return {
        ...match,
        otherUser,
        allVetters,
      };
    })
  );

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
