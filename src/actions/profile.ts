"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  gender: z.string().min(1, "Gender is required"),
  location: z.string().optional(),
  occupation: z.string().optional(),
  lookingFor: z.string().optional(),
  ageMin: z.coerce.number().min(18).max(99).optional(),
  ageMax: z.coerce.number().min(18).max(99).optional(),
  maxDistance: z.coerce.number().min(1).optional(),
  relationshipGoal: z.string().optional(),
});

const updateProfileSchema = profileSchema.partial();

export async function createProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    location: formData.get("location"),
    occupation: formData.get("occupation"),
    lookingFor: formData.get("lookingFor"),
    ageMin: formData.get("ageMin"),
    ageMax: formData.get("ageMax"),
    maxDistance: formData.get("maxDistance"),
    relationshipGoal: formData.get("relationshipGoal"),
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

  const { dateOfBirth, ...rest } = parsed.data;

  const profile = await prisma.profile.create({
    data: {
      ...rest,
      dateOfBirth: new Date(dateOfBirth),
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

  const { dateOfBirth, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (dateOfBirth) {
    updateData.dateOfBirth = new Date(dateOfBirth);
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
