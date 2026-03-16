"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = sendMessageSchema.safeParse({ conversationId, content });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Verify user is a participant in this conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return { error: "Not a participant in this conversation" };
  }

  const message = await prisma.message.create({
    data: {
      conversationId: parsed.data.conversationId,
      senderId: session.user.id,
      content: parsed.data.content,
    },
  });

  revalidatePath("/messages");
  return { success: true, message };
}

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          participants: {
            where: { userId: { not: userId } },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  profile: {
                    select: {
                      displayName: true,
                      photos: {
                        where: { isPrimary: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          match: {
            select: { status: true },
          },
        },
      },
    },
  });

  // Build conversations with unread count
  const conversations = await Promise.all(
    participations.map(async (p: (typeof participations)[number]) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: userId },
          createdAt: { gt: p.lastReadAt ?? new Date(0) },
        },
      });

      const lastMessage = p.conversation.messages[0] ?? null;
      const otherParticipant = p.conversation.participants[0]?.user ?? null;

      return {
        id: p.conversation.id,
        matchStatus: p.conversation.match.status,
        lastMessage,
        unreadCount,
        otherUser: otherParticipant,
        lastReadAt: p.lastReadAt,
      };
    })
  );

  // Sort by last message date descending
  conversations.sort((a: { lastMessage: { createdAt: Date } | null }, b: { lastMessage: { createdAt: Date } | null }) => {
    const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
    const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return { success: true, conversations };
}

const getMessagesSchema = z.object({
  conversationId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit: number = 50
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = getMessagesSchema.safeParse({
    conversationId,
    cursor,
    limit,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return { error: "Not a participant in this conversation" };
  }

  const take = parsed.data.limit ?? 50;

  const messages = await prisma.message.findMany({
    where: { conversationId: parsed.data.conversationId },
    orderBy: { createdAt: "desc" },
    take: take + 1, // fetch one extra to determine if there's a next page
    ...(parsed.data.cursor
      ? {
          cursor: { id: parsed.data.cursor },
          skip: 1, // skip the cursor itself
        }
      : {}),
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const hasMore = messages.length > take;
  const resultMessages = hasMore ? messages.slice(0, take) : messages;
  const nextCursor = hasMore
    ? resultMessages[resultMessages.length - 1]?.id
    : undefined;

  return {
    success: true,
    messages: resultMessages,
    nextCursor,
    hasMore,
  };
}

const markAsReadSchema = z.object({
  conversationId: z.string().min(1),
});

export async function markAsRead(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = markAsReadSchema.safeParse({ conversationId });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return { error: "Not a participant in this conversation" };
  }

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  revalidatePath("/messages");
  return { success: true };
}
