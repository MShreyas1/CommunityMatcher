"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50).trim(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  gender: z.string().min(1, "Gender is required"),
  location: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  detailPreset: z.string().optional(),
  detailAnswers: z.string().optional(),
  lookingFor: z.string().optional(),
  ageMin: z.coerce.number().min(18).max(99).optional(),
  ageMax: z.coerce.number().min(18).max(99).optional(),
  maxDistance: z.coerce.number().min(1).max(500).optional(),
  relationshipGoal: z.string().optional(),
});

const updateProfileSchema = profileSchema.partial();

export async function createProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Rate limit: 10 per minute
  const rateLimitResult = rateLimit({
    key: `create-profile:${session.user.id}`,
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return { error: "Too many requests. Please try again shortly." };
  }

  const get = (key: string) => formData.get(key) ?? undefined;

  const parsed = profileSchema.safeParse({
    displayName: get("displayName"),
    bio: get("bio"),
    dateOfBirth: get("dateOfBirth"),
    gender: get("gender"),
    location: get("location"),
    occupation: get("occupation"),
    detailPreset: get("detailPreset"),
    detailAnswers: get("detailAnswers"),
    lookingFor: get("lookingFor"),
    ageMin: get("ageMin"),
    ageMax: get("ageMax"),
    maxDistance: get("maxDistance"),
    relationshipGoal: get("relationshipGoal"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (existingProfile) {
    return { error: "Profile already exists" };
  }

  const { dateOfBirth, detailAnswers, ...rest } = parsed.data;

  const profile = await prisma.profile.create({
    data: {
      ...rest,
      dateOfBirth: new Date(dateOfBirth),
      detailAnswers: detailAnswers ? JSON.parse(detailAnswers) : undefined,
      userId: session.user.id,
    },
  });

  revalidatePath("/profile");
  return { success: true, profileId: profile.id };
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Rate limit: 10 per minute
  const rateLimitResult = rateLimit({
    key: `update-profile:${session.user.id}`,
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return { error: "Too many requests. Please try again shortly." };
  }

  const rawData: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (value !== "") {
      rawData[key] = value;
    }
  });

  const parsed = updateProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const { dateOfBirth, detailAnswers, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (dateOfBirth) {
    updateData.dateOfBirth = new Date(dateOfBirth);
  }
  if (detailAnswers) {
    updateData.detailAnswers = JSON.parse(detailAnswers);
  }
  // Allow clearing the preset
  if (rest.detailPreset === "") {
    updateData.detailPreset = null;
    updateData.detailAnswers = null;
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: updateData,
  });

  revalidatePath("/profile");
  return { success: true };
}

const deletePhotoSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

export async function deletePhoto(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = deletePhotoSchema.safeParse({ photoId });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const photo = await prisma.photo.findUnique({
    where: { id: parsed.data.photoId },
    include: { profile: true },
  });

  if (!photo) {
    return { error: "Photo not found" };
  }

  if (photo.profile.userId !== session.user.id) {
    return { error: "Not authorized to delete this photo" };
  }

  await prisma.photo.delete({
    where: { id: parsed.data.photoId },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function setPrimaryPhoto(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { profile: true },
  });

  if (!photo) {
    return { error: "Photo not found" };
  }

  if (photo.profile.userId !== session.user.id) {
    return { error: "Not authorized" };
  }

  // Unset current primary, set new one
  await prisma.$transaction([
    prisma.photo.updateMany({
      where: { profileId: photo.profileId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.photo.update({
      where: { id: photoId },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath("/profile");
  return { success: true };
}
