-- AlterTable
ALTER TABLE "public"."leg_documents" ALTER COLUMN "summary" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "is_public" DROP NOT NULL;
