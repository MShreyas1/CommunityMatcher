"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SwipeAction } from "@/generated/prisma/client";

export async function getFeedProfiles() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  // Get current user's profile for preference filtering
  const myProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!myProfile) {
    return { error: "Please create a profile first" };
  }

  // Get IDs the user has already swiped on
  const swipedIds = await prisma.swipe.findMany({
    where: { swiperId: userId },
    select: { swipedId: true },
  });

  const excludeIds = [userId, ...swipedIds.map((s: { swipedId: string }) => s.swipedId)];

  // Calculate age range from preferences
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

  // Build gender filter based on lookingFor preference
  const genderFilter: Record<string, unknown> = {};
  if (myProfile.lookingFor && myProfile.lookingFor !== "everyone") {
    genderFilter.gender = myProfile.lookingFor === "men" ? "male" : myProfile.lookingFor === "women" ? "female" : myProfile.lookingFor;
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

  return { success: true, profiles };
}

const swipeSchema = z.object({
  swipedId: z.string().min(1),
  action: z.nativeEnum(SwipeAction),
});

export async function recordSwipe(swipedId: string, action: SwipeAction) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  const parsed = swipeSchema.safeParse({ swipedId, action });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (userId === swipedId) {
    return { error: "Cannot swipe on yourself" };
  }

  // Check for existing swipe
  const existingSwipe = await prisma.swipe.findUnique({
    where: {
      swiperId_swipedId: { swiperId: userId, swipedId },
    },
  });

  if (existingSwipe) {
    return { error: "Already swiped on this user" };
  }

  // Create swipe
  await prisma.swipe.create({
    data: {
      swiperId: userId,
      swipedId,
      action,
    },
  });

  // Check for mutual ACCEPT
  if (action === "ACCEPT") {
    const mutualSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: swipedId,
        swipedId: userId,
        action: "ACCEPT",
      },
    });

    if (mutualSwipe) {
      // Ensure consistent ordering for the unique constraint
      const [u1, u2] = [userId, swipedId].sort();

      // Create Match, Conversation, and ConversationParticipants in a transaction
      const match = await prisma.$transaction(async (tx) => {
        const newMatch = await tx.match.create({
          data: {
            user1Id: u1,
            user2Id: u2,
            status: "ACTIVE",
          },
        });

        const conversation = await tx.conversation.create({
          data: {
            matchId: newMatch.id,
          },
        });

        await tx.conversationParticipant.createMany({
          data: [
            { conversationId: conversation.id, userId: u1 },
            { conversationId: conversation.id, userId: u2 },
          ],
        });

        return newMatch;
      });

      return { success: true, matched: true, matchId: match.id };
    }
  }

  return { success: true, matched: false };
}
