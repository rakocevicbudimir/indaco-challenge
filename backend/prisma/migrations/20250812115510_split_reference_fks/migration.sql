/*
  Warnings:

  - You are about to drop the column `from_entity_id` on the `leg_references` table. All the data in the column will be lost.
  - You are about to drop the column `to_entity_id` on the `leg_references` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_from_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_from_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_from_section_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_to_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_to_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_references" DROP CONSTRAINT "leg_references_to_section_id_fkey";

-- AlterTable
ALTER TABLE "public"."leg_references" DROP COLUMN "from_entity_id",
DROP COLUMN "to_entity_id",
ADD COLUMN     "from_blog_id" INTEGER,
ADD COLUMN     "from_document_id" INTEGER,
ADD COLUMN     "from_section_id" INTEGER,
ADD COLUMN     "to_blog_id" INTEGER,
ADD COLUMN     "to_document_id" INTEGER,
ADD COLUMN     "to_section_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_blog_id_fkey" FOREIGN KEY ("from_blog_id") REFERENCES "public"."leg_blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_document_id_fkey" FOREIGN KEY ("from_document_id") REFERENCES "public"."leg_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_section_id_fkey" FOREIGN KEY ("from_section_id") REFERENCES "public"."leg_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_blog_id_fkey" FOREIGN KEY ("to_blog_id") REFERENCES "public"."leg_blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_document_id_fkey" FOREIGN KEY ("to_document_id") REFERENCES "public"."leg_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_section_id_fkey" FOREIGN KEY ("to_section_id") REFERENCES "public"."leg_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
