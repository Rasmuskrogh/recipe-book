"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing-react";
import { Avatar } from "@/components/ui/Avatar";
import styles from "./EditProfileForm.module.css";

const editProfileSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  bio: z.string().max(500).optional(),
  image: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export interface EditProfileFormProps {
  userId: string;
  username: string;
  defaultValues: { name: string; bio: string; image: string };
}

export function EditProfileForm({
  userId,
  username,
  defaultValues,
}: EditProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
  });

  const imageUrl = watch("image");

  async function onSubmit(data: EditProfileFormData) {
    setError(null);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        bio: data.bio?.trim() || null,
        image: data.image || null,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Kunde inte spara.");
      return;
    }
    router.push(`/profile/${username}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.avatarSection}>
        <Avatar
          src={imageUrl || defaultValues.image || null}
          alt={defaultValues.name || "Profil"}
          size="lg"
        />
        <div>
          <label className={styles.label}>Profilbild</label>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) setValue("image", res[0].url);
            }}
            onUploadError={(err) => {
              console.error("Upload error:", err);
            }}
          />
        </div>
      </div>
      <input type="hidden" {...register("image")} />
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Namn
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={errors.name ? styles.inputError : styles.input}
        />
        {errors.name && (
          <span className={styles.fieldError}>{errors.name.message}</span>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="bio" className={styles.label}>
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register("bio")}
          className={errors.bio ? styles.inputError : styles.input}
        />
        {errors.bio && (
          <span className={styles.fieldError}>{errors.bio.message}</span>
        )}
      </div>
      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? "Sparar…" : "Spara"}
      </button>
    </form>
  );
}
