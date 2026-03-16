import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  profilePhoto: f({
    image: { maxFileSize: "4MB", maxFileCount: 6 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");

      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: { photos: true },
      });

      if (!profile) throw new Error("Profile not found");
      if (profile.photos.length >= 6)
        throw new Error("Maximum 6 photos allowed");

      const remainingSlots = 6 - profile.photos.length;

      return { userId: session.user.id, profileId: profile.id, remainingSlots };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const currentPhotos = await prisma.photo.count({
        where: { profileId: metadata.profileId },
      });

      await prisma.photo.create({
        data: {
          url: file.ufsUrl,
          key: file.key,
          order: currentPhotos,
          isPrimary: currentPhotos === 0,
          profileId: metadata.profileId,
        },
      });

      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
