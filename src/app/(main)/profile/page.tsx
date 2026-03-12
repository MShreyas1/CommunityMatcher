import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto max-w-lg py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-[3/4] w-full bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={profile.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No photos yet
            </div>
          )}
        </div>
        <CardContent className="space-y-4 pt-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {profile.displayName}, {age}
            </h2>
            <Badge variant="secondary" className="mt-1">
              {profile.gender}
            </Badge>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="space-y-2">
            {profile.occupation && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="size-4 text-muted-foreground" />
                {profile.occupation}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                {profile.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              {profile.dateOfBirth.toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.lookingFor && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="size-4 text-muted-foreground" />
              Looking for: {profile.lookingFor}
            </div>
          )}
          {profile.relationshipGoal && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="size-4 text-muted-foreground" />
              Goal: {profile.relationshipGoal}
            </div>
          )}
          {(profile.ageMin || profile.ageMax) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              Age range: {profile.ageMin ?? 18} - {profile.ageMax ?? 99}
            </div>
          )}
          {profile.maxDistance && (
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="size-4 text-muted-foreground" />
              Max distance: {profile.maxDistance} miles
            </div>
          )}
        </CardContent>
      </Card>

      {profile.photos.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={photo.url}
                    alt="Profile photo"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
