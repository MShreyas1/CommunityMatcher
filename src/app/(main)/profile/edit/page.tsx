"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { createProfile, updateProfile } from "@/actions/profile";

const profileFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  location: z.string().optional(),
  occupation: z.string().optional(),
  lookingFor: z.string().optional(),
  ageMin: z.coerce.number().min(18).max(99).optional(),
  ageMax: z.coerce.number().min(18).max(99).optional(),
  maxDistance: z.coerce.number().min(1).optional(),
  relationshipGoal: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema) as never,
    defaultValues: {
      displayName: "",
      bio: "",
      dateOfBirth: "",
      gender: "",
      location: "",
      occupation: "",
      lookingFor: "",
      ageMin: 18,
      ageMax: 99,
      maxDistance: 50,
      relationshipGoal: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setIsEditing(true);
            reset({
              displayName: data.profile.displayName ?? "",
              bio: data.profile.bio ?? "",
              dateOfBirth: data.profile.dateOfBirth
                ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
                : "",
              gender: data.profile.gender ?? "",
              location: data.profile.location ?? "",
              occupation: data.profile.occupation ?? "",
              lookingFor: data.profile.lookingFor ?? "",
              ageMin: data.profile.ageMin ?? 18,
              ageMax: data.profile.ageMax ?? 99,
              maxDistance: data.profile.maxDistance ?? 50,
              relationshipGoal: data.profile.relationshipGoal ?? "",
            });
          }
        }
      } catch {
        // Profile doesn't exist yet, that's fine
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      const result = isEditing
        ? await updateProfile(formData)
        : await createProfile(formData);

      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }

      toast.success(isEditing ? "Profile updated!" : "Profile created!");
      router.push("/profile");
      router.refresh();
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {isEditing ? "Edit Profile" : "Create Profile"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name *
              </label>
              <Input
                id="displayName"
                placeholder="Your display name"
                {...register("displayName")}
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="text-xs text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Tell people about yourself..."
                {...register("bio")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth *
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                aria-invalid={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-sm font-medium">
                Gender *
              </label>
              <select
                id="gender"
                {...register("gender")}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-invalid={!!errors.gender}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                placeholder="City, State"
                {...register("location")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="occupation" className="text-sm font-medium">
                Occupation
              </label>
              <Input
                id="occupation"
                placeholder="What do you do?"
                {...register("occupation")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="lookingFor" className="text-sm font-medium">
                Looking For
              </label>
              <select
                id="lookingFor"
                {...register("lookingFor")}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No preference</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="relationshipGoal" className="text-sm font-medium">
                Relationship Goal
              </label>
              <select
                id="relationshipGoal"
                {...register("relationshipGoal")}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select a goal</option>
                <option value="long-term">Long-term relationship</option>
                <option value="short-term">Short-term dating</option>
                <option value="casual">Casual</option>
                <option value="friendship">Friendship</option>
                <option value="unsure">Not sure yet</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="ageMin" className="text-sm font-medium">
                  Min Age
                </label>
                <Input
                  id="ageMin"
                  type="number"
                  min={18}
                  max={99}
                  {...register("ageMin")}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ageMax" className="text-sm font-medium">
                  Max Age
                </label>
                <Input
                  id="ageMax"
                  type="number"
                  min={18}
                  max={99}
                  {...register("ageMax")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="maxDistance" className="text-sm font-medium">
                Max Distance (miles)
              </label>
              <Input
                id="maxDistance"
                type="number"
                min={1}
                {...register("maxDistance")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
              <div className="text-center">
                <ImagePlus className="mx-auto size-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Photo upload coming soon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  UploadThing integration requires API keys
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Profile"
          ) : (
            "Create Profile"
          )}
        </Button>
      </form>
    </div>
  );
}
