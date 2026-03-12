import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Calendar,
  Pencil,
  Heart,
  Target,
  Ruler,
} from "lucide-react";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) {
    redirect("/profile/edit");
  }

  const age = calculateAge(profile.dateOfBirth);
  const primaryPhoto =
    profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];

  return (
    <div className="mx-auto max-w-lg py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Link href="/profile/edit">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/50 hover:bg-primary/5 transition-all duration-200"
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main profile card */}
      <div className="rounded-3xl overflow-hidden card-shadow-lg bg-card border border-border/30">
        <div className="relative aspect-[3/4] w-full bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={profile.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No photos yet
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold drop-shadow-md">
              {profile.displayName}, {age}
            </h2>
            <Badge
              variant="secondary"
              className="mt-2 bg-white/20 text-white border-0 backdrop-blur-sm"
            >
              {profile.gender}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="space-y-3">
            {profile.occupation && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="size-4 text-primary" />
                </div>
                {profile.occupation}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="size-4 text-primary" />
                </div>
                {profile.location}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="size-4 text-primary" />
              </div>
              {profile.dateOfBirth.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences card */}
      <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Preferences</h3>
        <div className="space-y-3">
          {profile.lookingFor && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="size-4 text-primary" />
              </div>
              Looking for: {profile.lookingFor}
            </div>
          )}
          {profile.relationshipGoal && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Target className="size-4 text-primary" />
              </div>
              Goal: {profile.relationshipGoal}
            </div>
          )}
          {(profile.ageMin || profile.ageMax) && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="size-4 text-primary" />
              </div>
              Age range: {profile.ageMin ?? 18} - {profile.ageMax ?? 99}
            </div>
          )}
          {profile.maxDistance && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Ruler className="size-4 text-primary" />
              </div>
              Max distance: {profile.maxDistance} miles
            </div>
          )}
        </div>
      </div>

      {/* Photos grid */}
      {profile.photos.length > 1 && (
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Photos</h3>
          <div className="grid grid-cols-3 gap-3">
            {profile.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted"
              >
                <Image
                  src={photo.url}
                  alt="Profile photo"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
