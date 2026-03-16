"use client";

import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing-react";
import { getUnitsForSystem } from "@/lib/units/converter";
import type { UnitSystem } from "@/lib/units/types";
import { StepEditor } from "@/components/recipe/StepEditor";
import styles from "./page.module.css";

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  notes: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1),
  duration: z.number().int().min(0).optional(),
});

const visibilityOptions = [
  { value: "public", label: "Alla" },
  { value: "friends", label: "Bara vänner" },
  { value: "private", label: "Bara jag" },
] as const;

const categoryOptions = [
  { value: "", label: "—" },
  { value: "frukost", label: "Frukost" },
  { value: "lunch", label: "Lunch" },
  { value: "middag", label: "Middag" },
  { value: "dessert", label: "Dessert" },
  { value: "bakning", label: "Bakning" },
  { value: "snacks", label: "Snacks" },
  { value: "dryck", label: "Dryck" },
  { value: "ovrigt", label: "Övrigt" },
] as const;

const formSchema = z.object({
  title: z.string().min(1, "Titel krävs"),
  description: z.string().optional(),
  category: z.enum(["frukost", "lunch", "middag", "dessert", "bakning", "snacks", "dryck", "ovrigt"]).optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  servings: z.number().int().min(1),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  visibility: z.enum(["public", "friends", "private"]),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function NewRecipePage() {
  const router = useRouter();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [error, setError] = useState<string | null>(null);
  const units = getUnitsForSystem(unitSystem);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      servings: 4,
      visibility: "public",
      ingredients: [{ name: "", amount: 1, unit: "g" }],
      steps: [{ instruction: "" }],
    },
  });

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({
    control,
    name: "ingredients",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: "steps",
  });

  const imageUrl = useWatch({ control, name: "imageUrl", defaultValue: "" });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        imageUrl: data.imageUrl || null,
        category: data.category || null,
        ingredients: data.ingredients.filter((i) => i.name.trim()).map((i) => ({ ...i, amount: Number(i.amount) })),
        steps: data.steps.filter((s) => s.instruction.trim()).map((s) => ({ ...s, duration: s.duration ? Number(s.duration) : undefined })),
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error?.title?.[0] ?? "Kunde inte spara recept.");
      return;
    }
    const recipe = await res.json();
    router.push(`/recipes/${recipe.id}`);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nytt recept</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label>Titel *</label>
          <input {...register("title")} className={errors.title ? styles.inputError : ""} />
          {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
        </div>

        <div className={styles.field}>
          <label>Beskrivning</label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <StepEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Beskriv receptet..."
              />
            )}
          />
        </div>

        <div className={styles.field}>
          <label>Kategori</label>
          <select {...register("category")}>
            {categoryOptions.map((opt) => (
              <option key={opt.value || "none"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Synlighet</label>
          <select {...register("visibility")}>
            {visibilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Svårighetsgrad</label>
            <select {...register("difficulty")}>
              <option value="">—</option>
              <option value="easy">Lätt</option>
              <option value="medium">Medel</option>
              <option value="hard">Svår</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Portioner *</label>
            <input type="number" min={1} {...register("servings", { valueAsNumber: true })} />
            {errors.servings && <span className={styles.fieldError}>{errors.servings.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Förberedelsetid</label>
            <div className={styles.timeInputWrap}>
              <input type="number" min={0} {...register("prepTime", { valueAsNumber: true })} />
              <span className={styles.timeSuffix}>min</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>Tillagningstid</label>
            <div className={styles.timeInputWrap}>
              <input type="number" min={0} {...register("cookTime", { valueAsNumber: true })} />
              <span className={styles.timeSuffix}>min</span>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label>Bild</label>
          <div className={styles.imageUploadZone}>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt=""
                width={200}
                height={200}
                className={styles.preview}
                unoptimized={imageUrl.startsWith("data:")}
              />
            )}
            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button: styles.uploadBtn,
                allowedContent: styles.uploadAllowed,
                container: styles.uploadContainer,
              }}
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) setValue("imageUrl", res[0].url);
              }}
              onUploadError={() => { }}
            />
            <input type="hidden" {...register("imageUrl")} />
          </div>
        </div>

        <div className={styles.unitToggle}>
          <span>Enheter: </span>
          <button
            type="button"
            className={unitSystem === "metric" ? styles.active : ""}
            onClick={() => setUnitSystem("metric")}
          >
            Metric
          </button>
          <button
            type="button"
            className={unitSystem === "imperial" ? styles.active : ""}
            onClick={() => setUnitSystem("imperial")}
          >
            Imperial
          </button>
        </div>

        <section className={styles.section}>
          <h2>Ingredienser</h2>
          {ingFields.map((field, i) => (
            <div key={field.id} className={styles.ingRow}>
              <input placeholder="Namn" {...register(`ingredients.${i}.name`)} />
              <input
                type="number"
                step={0.01}
                min={0}
                placeholder="Mängd"
                {...register(`ingredients.${i}.amount`, { valueAsNumber: true })}
              />
              <select {...register(`ingredients.${i}.unit`)}>
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <input placeholder="Not (valfritt)" {...register(`ingredients.${i}.notes`)} />
              <button type="button" onClick={() => removeIng(i)} className={styles.removeBtnIng} aria-label="Ta bort ingrediens">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendIng({ name: "", amount: 1, unit: units[0] })} className={styles.appendBtn}>
            + Lägg till ingrediens
          </button>
        </section>

        <section className={styles.section}>
          <h2>Steg</h2>
          {stepFields.map((field, i) => (
            <div key={field.id} className={styles.stepRow}>
              <span className={styles.stepNum}>{i + 1}.</span>
              <div className={styles.stepEditorCell}>
                <Controller
                  control={control}
                  name={`steps.${i}.instruction`}
                  render={({ field: stepField }) => (
                    <StepEditor
                      value={stepField.value}
                      onChange={stepField.onChange}
                      placeholder="Instruktion"
                    />
                  )}
                />
              </div>
              <div className={styles.stepActions}>
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  {...register(`steps.${i}.duration`, { valueAsNumber: true })}
                  className={styles.stepDuration}
                />
                <button type="button" onClick={() => removeStep(i)} className={styles.removeBtn}>
                  Ta bort
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendStep({ instruction: "" })} className={styles.appendBtn}>
            + Lägg till steg
          </button>
        </section>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Sparar…" : "Spara recept"}
        </button>
      </form>
    </div>
  );
}
