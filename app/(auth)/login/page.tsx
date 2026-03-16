"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

const loginSchema = z.object({
  email: z.string().email("Ange en giltig e-post"),
  password: z.string().min(1, "Lösenord krävs"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/feed";
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setIsRedirecting(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Ogiltig e-post eller lösenord.");
        setIsRedirecting(false);
        return;
      }
      window.location.href = callbackUrl || "/feed";
    } catch {
      setIsRedirecting(false);
    }
  }

  const isBusy = isSubmitting || isRedirecting;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Logga in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
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
              autoComplete="current-password"
              {...register("password")}
              className={errors.password ? styles.inputError : undefined}
            />
            {errors.password && (
              <span className={styles.fieldError}>
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className={styles.submit}
            disabled={isBusy}
            aria-busy={isBusy}
          >
            {isBusy ? "Loggar in..." : "Logga in"}
          </button>
        </form>
        <p className={styles.footer}>
          Har du inget konto?{" "}
          <Link href="/register" className={styles.link}>
            Registrera dig
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Logga in</h1>
        <div className={styles.form} aria-hidden>
          <div className={styles.field}>
            <label>E-post</label>
            <div style={{ height: 40, background: "var(--color-border, #e5e5e5)", borderRadius: 4 }} />
          </div>
          <div className={styles.field}>
            <label>Lösenord</label>
            <div style={{ height: 40, background: "var(--color-border, #e5e5e5)", borderRadius: 4 }} />
          </div>
          <button type="button" className={styles.submit} disabled>
            Laddar...
          </button>
        </div>
        <p className={styles.footer}>
          Har du inget konto?{" "}
          <Link href="/register" className={styles.link}>
            Registrera dig
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
