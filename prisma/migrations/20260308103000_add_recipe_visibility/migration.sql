-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'public';

-- Migrate isPublic to visibility (true -> public, false -> private)
UPDATE "Recipe" SET "visibility" = CASE WHEN "isPublic" = true THEN 'public' ELSE 'private' END;

-- DropColumn
ALTER TABLE "Recipe" DROP COLUMN "isPublic";
