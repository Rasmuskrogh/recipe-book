-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "totalTime" INTEGER;

-- Backfill: set totalTime from prepTime + cookTime
UPDATE "Recipe"
SET "totalTime" = COALESCE("prepTime", 0) + COALESCE("cookTime", 0)
WHERE "totalTime" IS NULL;
