/*
  Warnings:

  - You are about to drop the column `entity_id` on the `leg_entity_meta` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."leg_entity_meta" DROP CONSTRAINT "leg_entity_meta_blog_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_entity_meta" DROP CONSTRAINT "leg_entity_meta_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."leg_entity_meta" DROP CONSTRAINT "leg_entity_meta_section_id_fkey";

-- AlterTable
ALTER TABLE "public"."leg_entity_meta" DROP COLUMN "entity_id",
ADD COLUMN     "blog_id" INTEGER,
ADD COLUMN     "document_id" INTEGER,
ADD COLUMN     "section_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."leg_blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."leg_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."leg_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
