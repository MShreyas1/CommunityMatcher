import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "./chat-window";

interface MessagePageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: MessagePageProps) {
  const { conversationId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    redirect("/messages");
  }

  // Get the other participant's info
  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: { not: userId },
    },
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
  });

  const otherUser = otherParticipant?.user ?? null;
  const otherDisplayName =
    otherUser?.profile?.displayName ?? otherUser?.name ?? "Unknown";
  const otherAvatar =
    otherUser?.profile?.photos?.[0]?.url ?? otherUser?.image ?? null;

  return (
    <ChatWindow
      conversationId={conversationId}
      currentUserId={userId}
      otherUserName={otherDisplayName}
      otherUserAvatar={otherAvatar}
    />
  );
}
