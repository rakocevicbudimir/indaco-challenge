-- AlterTable
ALTER TABLE "public"."leg_sections" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "is_public" DROP NOT NULL,
ALTER COLUMN "version" DROP NOT NULL;
