"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CommunityRole, CommunityMemberStatus } from "@/generated/prisma/client";

const inviteVetterSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(CommunityRole),
});

export async function inviteVetter(email: string, role: CommunityRole) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = inviteVetterSchema.safeParse({ email, role });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const vetter = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!vetter) {
    return { error: "No user found with that email" };
  }

  if (vetter.id === session.user.id) {
    return { error: "You cannot invite yourself" };
  }

  // Check if already invited
  const existing = await prisma.communityMember.findUnique({
    where: {
      ownerId_vetterId: {
        ownerId: session.user.id,
        vetterId: vetter.id,
      },
    },
  });

  if (existing) {
    return { error: "This user has already been invited to your community" };
  }

  await prisma.communityMember.create({
    data: {
      ownerId: session.user.id,
      vetterId: vetter.id,
      role: parsed.data.role,
      status: "PENDING",
    },
  });

  revalidatePath("/community");
  return { success: true };
}

const respondToInviteSchema = z.object({
  communityMemberId: z.string().min(1),
  response: z.enum(["ACCEPTED", "DECLINED"]),
});

export async function respondToInvite(
  communityMemberId: string,
  response: "ACCEPTED" | "DECLINED"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = respondToInviteSchema.safeParse({
    communityMemberId,
    response,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const membership = await prisma.communityMember.findUnique({
    where: { id: parsed.data.communityMemberId },
  });

  if (!membership) {
    return { error: "Invitation not found" };
  }

  if (membership.vetterId !== session.user.id) {
    return { error: "Not authorized to respond to this invitation" };
  }

  if (membership.status !== "PENDING") {
    return { error: "This invitation has already been responded to" };
  }

  await prisma.communityMember.update({
    where: { id: parsed.data.communityMemberId },
    data: {
      status: parsed.data.response as CommunityMemberStatus,
    },
  });

  revalidatePath("/community");
  return { success: true };
}

const submitVoteSchema = z.object({
  matchId: z.string().min(1),
  vote: z.enum(["APPROVE", "DENY", "NEUTRAL"]),
  comment: z.string().optional(),
});

export async function submitVote(
  matchId: string,
  vote: "APPROVE" | "DENY" | "NEUTRAL",
  comment?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = submitVoteSchema.safeParse({ matchId, vote, comment });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Verify user is an accepted community member for one of the match participants
  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
  });

  if (!match) {
    return { error: "Match not found" };
  }

  const communityMembership = await prisma.communityMember.findFirst({
    where: {
      vetterId: session.user.id,
      status: "ACCEPTED",
      ownerId: { in: [match.user1Id, match.user2Id] },
    },
  });

  if (!communityMembership) {
    return { error: "You are not authorized to vote on this match" };
  }

  // Check for existing vote
  const existingVote = await prisma.vettingVote.findUnique({
    where: {
      communityMemberId_matchId: {
        communityMemberId: communityMembership.id,
        matchId: parsed.data.matchId,
      },
    },
  });

  if (existingVote) {
    return { error: "You have already voted on this match" };
  }

  // Create the vote
  await prisma.vettingVote.create({
    data: {
      communityMemberId: communityMembership.id,
      matchId: parsed.data.matchId,
      vote: parsed.data.vote,
      comment: parsed.data.comment,
    },
  });

  // Recalculate community score on the match
  const allVotes = await prisma.vettingVote.findMany({
    where: { matchId: parsed.data.matchId },
  });

  const totalVotes = allVotes.length;
  if (totalVotes > 0) {
    const approveCount = allVotes.filter((v: { vote: string }) => v.vote === "APPROVE").length;
    const denyCount = allVotes.filter((v: { vote: string }) => v.vote === "DENY").length;
    // Score: (approvals - denials) / total, normalized to 0-100
    const rawScore = (approveCount - denyCount) / totalVotes;
    const communityScore = Math.round(((rawScore + 1) / 2) * 100);

    await prisma.match.update({
      where: { id: parsed.data.matchId },
      data: { communityScore },
    });
  }

  revalidatePath("/community");
  revalidatePath("/matches");
  return { success: true };
}

/**
 * Get the vetting queue for the current user.
 * Privacy: Does NOT include other vetters' votes — only returns matches
 * that need the current user's vote.
 */
export async function getVettingQueue() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Get all community memberships where current user is an accepted vetter
  const memberships = await prisma.communityMember.findMany({
    where: {
      vetterId: session.user.id,
      status: "ACCEPTED",
    },
    select: {
      id: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (memberships.length === 0) {
    return { success: true, matches: [] };
  }

  const ownerIds = memberships.map((m: { ownerId: string }) => m.ownerId);
  const membershipIds = memberships.map((m: { id: string }) => m.id);

  // Build a map of ownerId -> ownerName for display
  const ownerNameMap: Record<string, string | null> = {};
  for (const m of memberships) {
    ownerNameMap[m.ownerId] = m.owner.name;
  }

  // Find active matches involving the owners that the user hasn't voted on yet
  const matches = await prisma.match.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { user1Id: { in: ownerIds } },
        { user2Id: { in: ownerIds } },
      ],
      votes: {
        none: {
          communityMemberId: { in: membershipIds },
        },
      },
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          profile: {
            include: { photos: { orderBy: { order: "asc" }, take: 1 } },
          },
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          profile: {
            include: { photos: { orderBy: { order: "asc" }, take: 1 } },
          },
        },
      },
      // Do NOT include votes — vetters should not see other vetters' votes
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach the owner name for each match so the vetter knows who they're vetting for
  const matchesWithOwner = matches.map((match) => {
    const vettingForId = ownerIds.find(
      (id: string) => id === match.user1Id || id === match.user2Id
    );
    return {
      ...match,
      vettingForName: vettingForId ? ownerNameMap[vettingForId] : null,
    };
  });

  return { success: true, matches: matchesWithOwner };
}

/**
 * Get community members — separated into owner view vs vetter view.
 *
 * Owner view: Full member list (vetters they invited) with status.
 * Vetter view: Only the owner's name they vet for. NO info about other vetters.
 */
export async function getCommunityMembers() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Owner view: Get members of the user's community circle (people they invited)
  const members = await prisma.communityMember.findMany({
    where: { ownerId: session.user.id },
    include: {
      vetter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Vetter view: Only show the owner's name — no info about other vetters
  const vettingFor = await prisma.communityMember.findMany({
    where: { vetterId: session.user.id },
    select: {
      id: true,
      role: true,
      status: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, members, vettingFor };
}

/**
 * Get the current user's own votes. Vetters can only see their own past votes.
 * Does NOT return other vetters' votes.
 */
export async function getMyVotes() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Get all memberships for this user
  const memberships = await prisma.communityMember.findMany({
    where: {
      vetterId: session.user.id,
      status: "ACCEPTED",
    },
    select: { id: true },
  });

  if (memberships.length === 0) {
    return { success: true, votes: [] };
  }

  const membershipIds = memberships.map((m: { id: string }) => m.id);

  // Only fetch this user's own votes
  const votes = await prisma.vettingVote.findMany({
    where: {
      communityMemberId: { in: membershipIds },
    },
    include: {
      match: {
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, votes };
}

/**
 * Get all votes for a specific match. Only accessible to the circle owner
 * (someone whose user ID is user1Id or user2Id on the match).
 * Returns individual votes and the aggregated community score.
 */
export async function getMatchVotes(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return { error: "Match not found" };
  }

  // Only the circle owner (a participant of the match) can see votes
  if (match.user1Id !== session.user.id && match.user2Id !== session.user.id) {
    return { error: "Not authorized to view votes for this match" };
  }

  const votes = await prisma.vettingVote.findMany({
    where: { matchId },
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
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    votes,
    communityScore: match.communityScore,
  };
}
