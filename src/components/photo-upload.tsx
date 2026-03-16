"use client";

import { useState, useCallback } from "react";
import { ImagePlus, X, Star, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { deletePhoto } from "@/actions/profile";
import { setPrimaryPhoto } from "@/actions/profile";
import { toast } from "sonner";
import { useDropzone } from "@uploadthing/react";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

interface Photo {
  id: string;
  url: string;
  key: string;
  order: number;
  isPrimary: boolean;
}

interface PhotoUploadProps {
  photos: Photo[];
  onPhotosChange: () => void;
}

export function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload } = useUploadThing("profilePhoto", {
    onUploadProgress: (p) => setUploadProgress(p),
    onClientUploadComplete: () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.success("Photo uploaded!");
      onPhotosChange();
    },
    onUploadError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(error.message || "Upload failed");
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (photos.length + acceptedFiles.length > 6) {
        toast.error("Maximum 6 photos allowed");
        return;
      }
      setIsUploading(true);
      try {
        const compressed = await Promise.all(acceptedFiles.map(compressImage));
        startUpload(compressed);
      } catch {
        toast.error("Failed to process images");
        setIsUploading(false);
      }
    },
    [photos.length, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 6 - photos.length,
    disabled: isUploading || photos.length >= 6,
  });

  async function handleDelete(photoId: string) {
    const result = await deletePhoto(photoId);
    if (result.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : "Failed to delete photo"
      );
    } else {
      toast.success("Photo deleted");
      onPhotosChange();
    }
  }

  async function handleSetPrimary(photoId: string) {
    const result = await setPrimaryPhoto(photoId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Primary photo updated");
      onPhotosChange();
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-border/30"
            >
              <img
                src={photo.url}
                alt="Profile photo"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(photo.id)}
                    className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
                    title="Set as primary"
                  >
                    <Star className="size-4 text-white" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-full bg-white/20 p-2 hover:bg-red-500/60 transition-colors"
                  title="Delete"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {photos.length < 6 && (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors duration-200 cursor-pointer ${
            isDragActive
              ? "border-primary/60 bg-primary/10"
              : "border-border/50 bg-muted/20 hover:bg-muted/30"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto size-8 animate-spin text-primary mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 mb-3">
                  <ImagePlus className="size-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isDragActive
                    ? "Drop photos here"
                    : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  JPG, PNG, WebP up to 4MB ({6 - photos.length} remaining)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
