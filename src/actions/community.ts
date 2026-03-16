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
