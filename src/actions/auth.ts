"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Invalid email address").max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // Rate limit: 3 attempts per 15 minutes per email
  const rateLimitResult = rateLimit({
    key: `register:${email}`,
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return {
      error: {
        email: [
          `Too many registration attempts. Please try again in ${Math.ceil(rateLimitResult.resetMs / 60000)} minutes.`,
        ],
      },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: { email: ["A user with this email already exists"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: true, userId: user.id };
}
