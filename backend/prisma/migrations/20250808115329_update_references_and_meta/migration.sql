-- AlterTable
ALTER TABLE "public"."leg_entity_meta" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."leg_references" ALTER COLUMN "content" DROP NOT NULL;
