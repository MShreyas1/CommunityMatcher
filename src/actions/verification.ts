"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function resendVerificationEmail() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const rateLimitResult = rateLimit({
    key: `resend-verification:${session.user.id}`,
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return {
      error: `Too many requests. Please try again in ${Math.ceil(rateLimitResult.resetMs / 60000)} minutes.`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.email) {
    return { error: "User not found" };
  }

  if (user.emailVerified) {
    return { error: "Email is already verified" };
  }

  const verificationToken = await generateVerificationToken(user.email);
  await sendVerificationEmail(user.email, verificationToken.token);

  return { success: true };
}
