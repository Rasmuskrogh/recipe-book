"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const registerSchema = z
  .object({
    name: z.string().min(1, "Namn krävs"),
    email: z.string().email("Ange en giltig e-post"),
    password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Lösenorden matchar inte",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = json.error;
      if (err && typeof err === "object" && !Array.isArray(err)) {
        if (err.email?.[0]) setFormError("email", { message: err.email[0] });
        if (err.name?.[0]) setFormError("name", { message: err.name[0] });
        if (err.password?.[0])
          setFormError("password", { message: err.password[0] });
        if (err.email || err.name || err.password) return;
      }
      setError(
        typeof json.error === "string"
          ? json.error
          : "Registreringen misslyckades."
      );
      return;
    }
    router.push("/login?callbackUrl=/feed");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registrera</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.field}>
            <label htmlFor="name">Namn</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className={errors.name ? styles.inputError : undefined}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={errors.email ? styles.inputError : undefined}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className={errors.password ? styles.inputError : undefined}
            />
            {errors.password && (
              <span className={styles.fieldError}>
                {errors.password.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Bekräfta lösenord</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? styles.inputError : undefined}
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Skapar konto..." : "Registrera"}
          </button>
        </form>
        <p className={styles.footer}>
          Har du redan konto?{" "}
          <Link href="/login" className={styles.link}>
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}
