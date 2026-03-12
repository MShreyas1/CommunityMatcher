"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
                ? new Date(data.profile.dateOfBirth)
                    .toISOString()
                    .split("T")[0]
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const inputClassName =
    "h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200";
  const selectClassName =
    "flex h-11 w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 transition-colors duration-200";

  return (
    <div className="mx-auto max-w-lg py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Edit Profile" : "Create Profile"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">Basic Info</h2>

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name <span className="text-primary">*</span>
            </label>
            <Input
              id="displayName"
              placeholder="Your display name"
              className={inputClassName}
              {...register("displayName")}
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Tell people about yourself..."
              className="rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200 min-h-[100px]"
              {...register("bio")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth <span className="text-primary">*</span>
            </label>
            <Input
              id="dateOfBirth"
              type="date"
              className={inputClassName}
              {...register("dateOfBirth")}
              aria-invalid={!!errors.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-medium">
              Gender <span className="text-primary">*</span>
            </label>
            <select
              id="gender"
              {...register("gender")}
              className={selectClassName}
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

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              placeholder="City, State"
              className={inputClassName}
              {...register("location")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="occupation" className="text-sm font-medium">
              Occupation
            </label>
            <Input
              id="occupation"
              placeholder="What do you do?"
              className={inputClassName}
              {...register("occupation")}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">Preferences</h2>

          <div className="space-y-2">
            <label htmlFor="lookingFor" className="text-sm font-medium">
              Looking For
            </label>
            <select
              id="lookingFor"
              {...register("lookingFor")}
              className={selectClassName}
            >
              <option value="">No preference</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="relationshipGoal" className="text-sm font-medium">
              Relationship Goal
            </label>
            <select
              id="relationshipGoal"
              {...register("relationshipGoal")}
              className={selectClassName}
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
            <div className="space-y-2">
              <label htmlFor="ageMin" className="text-sm font-medium">
                Min Age
              </label>
              <Input
                id="ageMin"
                type="number"
                min={18}
                max={99}
                className={inputClassName}
                {...register("ageMin")}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ageMax" className="text-sm font-medium">
                Max Age
              </label>
              <Input
                id="ageMax"
                type="number"
                min={18}
                max={99}
                className={inputClassName}
                {...register("ageMax")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="maxDistance" className="text-sm font-medium">
              Max Distance (miles)
            </label>
            <Input
              id="maxDistance"
              type="number"
              min={1}
              className={inputClassName}
              {...register("maxDistance")}
            />
          </div>
        </div>

        {/* Photos */}
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Photos</h2>
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-10 bg-muted/20 transition-colors duration-200 hover:bg-muted/30">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <ImagePlus className="size-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Photo upload coming soon
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                UploadThing integration requires API keys
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl gradient-primary border-0 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
          disabled={isPending}
        >
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
