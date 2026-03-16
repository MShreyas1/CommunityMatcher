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
import { Loader2 } from "lucide-react";
import { createProfile, updateProfile } from "@/actions/profile";
import { PhotoUpload } from "@/components/photo-upload";
import { DETAIL_PRESETS, getPresetById } from "@/lib/detail-presets";

const profileFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  location: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  lookingFor: z.string().optional(),
  ageMin: z.coerce.number().min(18).max(99).optional(),
  ageMax: z.coerce.number().min(18).max(99).optional(),
  maxDistance: z.coerce.number().min(1).max(500).optional(),
  relationshipGoal: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<
    { id: string; url: string; key: string; order: number; isPrimary: boolean }[]
  >([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [detailAnswers, setDetailAnswers] = useState<Record<string, string>>({});

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
            if (data.profile.detailPreset) {
              setSelectedPreset(data.profile.detailPreset);
            }
            if (data.profile.detailAnswers) {
              setDetailAnswers(data.profile.detailAnswers);
            }
            if (data.profile.photos) {
              setPhotos(data.profile.photos);
            }
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

      if (selectedPreset) {
        formData.set("detailPreset", selectedPreset);
        const filledAnswers = Object.fromEntries(
          Object.entries(detailAnswers).filter(([, v]) => v !== "")
        );
        if (Object.keys(filledAnswers).length > 0) {
          formData.set("detailAnswers", JSON.stringify(filledAnswers));
        }
      }

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
              maxLength={50}
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
              maxLength={500}
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
              maxLength={100}
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
              maxLength={100}
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

        {/* Detail Preset */}
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">Details</h2>
          <p className="text-xs text-muted-foreground">
            Select a cultural preset to add more details to your profile. This is optional.
          </p>

          <div className="space-y-2">
            <label htmlFor="detailPreset" className="text-sm font-medium">
              Preset
            </label>
            <select
              id="detailPreset"
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                if (!e.target.value) setDetailAnswers({});
              }}
              className={selectClassName}
            >
              <option value="">None</option>
              {DETAIL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPreset && (() => {
            const preset = getPresetById(selectedPreset);
            if (!preset) return null;
            return (
              <div className="space-y-4 pt-2">
                {preset.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label htmlFor={`detail-${field.key}`} className="text-sm font-medium">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={`detail-${field.key}`}
                        value={detailAnswers[field.key] ?? ""}
                        onChange={(e) =>
                          setDetailAnswers((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className={selectClassName}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={`detail-${field.key}`}
                        placeholder={field.placeholder}
                        value={detailAnswers[field.key] ?? ""}
                        onChange={(e) =>
                          setDetailAnswers((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Photos */}
        <div className="rounded-2xl border border-border/30 bg-card p-6 card-shadow space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Photos</h2>
          <PhotoUpload
            photos={photos}
            onPhotosChange={async () => {
              const res = await fetch("/api/profile");
              if (res.ok) {
                const data = await res.json();
                if (data.profile?.photos) {
                  setPhotos(data.profile.photos);
                }
              }
            }}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl gradient-primary border-0 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] glow hover:glow-lg"
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
