"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Vetter's browse feed — profiles matching the owner's preferences,
 * excluding already-suggested and already-matched profiles.
 */
export async function getSuggestFeed(ownerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Verify the current user is an accepted vetter for this owner
  const membership = await prisma.communityMember.findFirst({
    where: {
      ownerId,
      vetterId: session.user.id,
      status: "ACCEPTED",
    },
  });

  if (!membership) {
    return { error: "You are not an accepted vetter for this user" };
  }

  // Get owner's profile for preference filtering
  const ownerProfile = await prisma.profile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    return { error: "Owner has not created a profile yet" };
  }

  // Get IDs to exclude: owner, current vetter, already-suggested, already-matched
  const existingSuggestions = await prisma.suggestion.findMany({
    where: { ownerId },
    select: { suggestedId: true },
  });

  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: ownerId }, { user2Id: ownerId }],
      status: "ACTIVE",
    },
    select: { user1Id: true, user2Id: true },
  });

  const matchedIds = existingMatches.map((m) =>
    m.user1Id === ownerId ? m.user2Id : m.user1Id
  );

  const excludeIds = [
    ownerId,
    session.user.id,
    ...existingSuggestions.map((s) => s.suggestedId),
    ...matchedIds,
  ];

  // Calculate age range from owner's preferences
  const now = new Date();
  const maxBirthDate = new Date(
    now.getFullYear() - ownerProfile.ageMin,
    now.getMonth(),
    now.getDate()
  );
  const minBirthDate = new Date(
    now.getFullYear() - ownerProfile.ageMax,
    now.getMonth(),
    now.getDate()
  );

  // Build gender filter based on owner's lookingFor preference
  const genderFilter: Record<string, unknown> = {};
  if (ownerProfile.lookingFor && ownerProfile.lookingFor !== "everyone") {
    genderFilter.gender =
      ownerProfile.lookingFor === "men"
        ? "male"
        : ownerProfile.lookingFor === "women"
          ? "female"
          : ownerProfile.lookingFor;
  }

  const profiles = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludeIds },
      dateOfBirth: {
        gte: minBirthDate,
        lte: maxBirthDate,
      },
      ...genderFilter,
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      user: {
        select: { id: true, name: true },
      },
    },
    take: 20,
  });

  // Get the owner's checklist items so vetters can fill them out
  const checklistItems = await prisma.checklistItem.findMany({
    where: { userId: ownerId },
    orderBy: { order: "asc" },
    select: { id: true, label: true },
  });

  return { success: true, profiles, membershipId: membership.id, checklistItems };
}

const createSuggestionSchema = z.object({
  ownerId: z.string().min(1),
  suggestedId: z.string().min(1),
  vote: z.enum(["APPROVE", "DENY", "NEUTRAL"]),
  comment: z.string().max(500).optional(),
  checkedItemIds: z.array(z.string()).optional(),
});

/**
 * Vetter suggests a profile to a circle owner.
 * Creates or finds existing Suggestion, adds a SuggestionVote, recalculates community score.
 * Optionally records which checklist items the vetter checked.
 */
export async function createSuggestion(
  ownerId: string,
  suggestedId: string,
  vote: "APPROVE" | "DENY" | "NEUTRAL",
  comment?: string,
  checkedItemIds?: string[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Email verification check
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });

  if (!user?.emailVerified) {
    return { error: "Please verify your email before creating suggestions." };
  }

  // Rate limit: 10 per minute
  const rateLimitResult = rateLimit({
    key: `create-suggestion:${session.user.id}`,
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return { error: "Too many requests. Please try again shortly." };
  }

  const parsed = createSuggestionSchema.safeParse({
    ownerId,
    suggestedId,
    vote,
    comment,
    checkedItemIds,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Verify the current user is an accepted vetter for this owner
  const membership = await prisma.communityMember.findFirst({
    where: {
      ownerId,
      vetterId: session.user.id,
      status: "ACCEPTED",
    },
  });

  if (!membership) {
    return { error: "You are not an accepted vetter for this user" };
  }

  // Create or find existing suggestion
  const suggestion = await prisma.suggestion.upsert({
    where: {
      ownerId_suggestedId: { ownerId, suggestedId },
    },
    create: {
      ownerId,
      suggestedId,
    },
    update: {},
  });

  // Check for existing vote from this vetter
  const existingVote = await prisma.suggestionVote.findUnique({
    where: {
      communityMemberId_suggestionId: {
        communityMemberId: membership.id,
        suggestionId: suggestion.id,
      },
    },
  });

  if (existingVote) {
    return { error: "You have already voted on this suggestion" };
  }

  // Create the vote
  const newVote = await prisma.suggestionVote.create({
    data: {
      suggestionId: suggestion.id,
      communityMemberId: membership.id,
      vote: parsed.data.vote,
      comment: parsed.data.comment,
    },
  });

  // Create checklist responses for checked items
  if (parsed.data.checkedItemIds && parsed.data.checkedItemIds.length > 0) {
    await prisma.checklistResponse.createMany({
      data: parsed.data.checkedItemIds.map((itemId) => ({
        suggestionVoteId: newVote.id,
        checklistItemId: itemId,
      })),
    });
  }

  // Recalculate community score
  const allVotes = await prisma.suggestionVote.findMany({
    where: { suggestionId: suggestion.id },
  });

  const totalVotes = allVotes.length;
  if (totalVotes > 0) {
    const approveCount = allVotes.filter((v) => v.vote === "APPROVE").length;
    const denyCount = allVotes.filter((v) => v.vote === "DENY").length;
    const rawScore = (approveCount - denyCount) / totalVotes;
    const communityScore = Math.round(((rawScore + 1) / 2) * 100);

    await prisma.suggestion.update({
      where: { id: suggestion.id },
      data: { communityScore },
    });
  }

  revalidatePath("/community");
  return { success: true };
}

/**
 * Owner's feed — all PENDING suggestions sorted by community score desc,
 * with votes/comments/vetter info included.
 */
export async function getOwnerFeed() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  const myProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!myProfile) {
    return { error: "Please create a profile first" };
  }

  const suggestions = await prisma.suggestion.findMany({
    where: {
      ownerId: userId,
      status: "PENDING",
    },
    include: {
      suggested: {
        select: {
          id: true,
          name: true,
          profile: {
            include: {
              photos: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      votes: {
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
          checklistResponses: {
            include: {
              checklistItem: {
                select: { id: true, label: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { communityScore: "desc" },
  });

  return { success: true, suggestions };
}

/**
 * Discovery feed — profiles matching the current user's preferences that
 * haven't been suggested, matched, or passed on yet. Shown alongside (but
 * after) community-vetted suggestions so the feed is never empty.
 */
export async function getDiscoveryProfiles() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  const myProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!myProfile) {
    return { error: "Please create a profile first" };
  }

  // IDs to exclude: self, anyone already in a Suggestion (any status), active matches
  const existingSuggestions = await prisma.suggestion.findMany({
    where: { ownerId: userId },
    select: { suggestedId: true },
  });

  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      status: "ACTIVE",
    },
    select: { user1Id: true, user2Id: true },
  });

  const matchedIds = existingMatches.map((m) =>
    m.user1Id === userId ? m.user2Id : m.user1Id
  );

  const excludeIds = [
    userId,
    ...existingSuggestions.map((s) => s.suggestedId),
    ...matchedIds,
  ];

  // Age range filter
  const now = new Date();
  const maxBirthDate = new Date(
    now.getFullYear() - myProfile.ageMin,
    now.getMonth(),
    now.getDate()
  );
  const minBirthDate = new Date(
    now.getFullYear() - myProfile.ageMax,
    now.getMonth(),
    now.getDate()
  );

  // Gender filter
  const genderFilter: Record<string, unknown> = {};
  if (myProfile.lookingFor && myProfile.lookingFor !== "everyone") {
    genderFilter.gender =
      myProfile.lookingFor === "men"
        ? "male"
        : myProfile.lookingFor === "women"
          ? "female"
          : myProfile.lookingFor;
  }

  const profiles = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludeIds },
      dateOfBirth: {
        gte: minBirthDate,
        lte: maxBirthDate,
      },
      ...genderFilter,
    },
    include: {
      photos: { orderBy: { order: "asc" } },
      user: { select: { id: true, name: true } },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return { success: true, profiles };
}

/**
 * Owner acts on a discovery profile (one without a community suggestion).
 * APPROVED → creates Suggestion (APPROVED) + Match + Conversation.
 * PASSED → creates Suggestion (PASSED) so it won't reappear.
 */
export async function respondToDiscovery(
  targetUserId: string,
  action: "APPROVED" | "PASSED"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  if (targetUserId === userId) {
    return { error: "Cannot match with yourself" };
  }

  // Check no existing suggestion already
  const existing = await prisma.suggestion.findUnique({
    where: { ownerId_suggestedId: { ownerId: userId, suggestedId: targetUserId } },
  });

  if (existing) {
    return { error: "Already acted on this profile" };
  }

  if (action === "PASSED") {
    await prisma.suggestion.create({
      data: {
        ownerId: userId,
        suggestedId: targetUserId,
        status: "PASSED",
      },
    });

    revalidatePath("/feed");
    return { success: true };
  }

  // APPROVED — create suggestion + match + conversation
  const [u1, u2] = [userId, targetUserId].sort();

  await prisma.$transaction(async (tx) => {
    const suggestion = await tx.suggestion.create({
      data: {
        ownerId: userId,
        suggestedId: targetUserId,
        status: "APPROVED",
        communityScore: 0,
      },
    });

    const match = await tx.match.create({
      data: {
        user1Id: u1,
        user2Id: u2,
        status: "ACTIVE",
        communityScore: 0,
        suggestionId: suggestion.id,
      },
    });

    const conversation = await tx.conversation.create({
      data: { matchId: match.id },
    });

    await tx.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId: u1 },
        { conversationId: conversation.id, userId: u2 },
      ],
    });
  });

  revalidatePath("/feed");
  revalidatePath("/matches");
  return { success: true, matched: true };
}

const respondSchema = z.object({
  suggestionId: z.string().min(1),
  action: z.enum(["APPROVED", "PASSED"]),
});

/**
 * Owner acts on a suggestion.
 * If APPROVED: creates Match (ACTIVE) + Conversation in a transaction.
 */
export async function respondToSuggestion(
  suggestionId: string,
  action: "APPROVED" | "PASSED"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = respondSchema.safeParse({ suggestionId, action });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return { error: "Suggestion not found" };
  }

  if (suggestion.ownerId !== session.user.id) {
    return { error: "Not authorized" };
  }

  if (suggestion.status !== "PENDING") {
    return { error: "This suggestion has already been acted on" };
  }

  if (action === "PASSED") {
    await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: "PASSED" },
    });

    revalidatePath("/feed");
    return { success: true };
  }

  // APPROVED — create match + conversation in a transaction
  const [u1, u2] = [suggestion.ownerId, suggestion.suggestedId].sort();

  await prisma.$transaction(async (tx) => {
    await tx.suggestion.update({
      where: { id: suggestionId },
      data: { status: "APPROVED" },
    });

    const match = await tx.match.create({
      data: {
        user1Id: u1,
        user2Id: u2,
        status: "ACTIVE",
        communityScore: suggestion.communityScore,
        suggestionId: suggestion.id,
      },
    });

    const conversation = await tx.conversation.create({
      data: { matchId: match.id },
    });

    await tx.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId: u1 },
        { conversationId: conversation.id, userId: u2 },
      ],
    });
  });

  revalidatePath("/feed");
  revalidatePath("/matches");
  return { success: true, matched: true };
}
