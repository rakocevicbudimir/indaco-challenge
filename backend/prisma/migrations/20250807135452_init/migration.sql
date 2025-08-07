/*
  Warnings:

  - The values [USER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_active` on the `leg_users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MetaType" AS ENUM ('tag', 'category');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('blog', 'document', 'section');

-- CreateEnum
CREATE TYPE "public"."NoteEntityType" AS ENUM ('document', 'section');

-- CreateEnum
CREATE TYPE "public"."ReferenceEntityType" AS ENUM ('blog', 'document', 'section');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('user', 'admin');
ALTER TABLE "public"."leg_users" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "public"."leg_users" ALTER COLUMN "roles" TYPE "public"."Role_new"[] USING ("roles"::text::"public"."Role_new"[]);
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."leg_users" ALTER COLUMN "roles" SET DEFAULT ARRAY['user']::"public"."Role"[];
COMMIT;

-- AlterTable
ALTER TABLE "public"."leg_users" DROP COLUMN "is_active",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "is_premium" DROP DEFAULT,
ALTER COLUMN "roles" SET DEFAULT ARRAY['user']::"public"."Role"[];

-- CreateTable
CREATE TABLE "public"."leg_metas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."MetaType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_blogs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "is_premium" BOOLEAN NOT NULL,
    "author_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_documents" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_sections" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_notes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "entity_type" "public"."NoteEntityType" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_entity_meta" (
    "id" SERIAL NOT NULL,
    "entity_type" "public"."EntityType" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "meta_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_entity_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leg_references" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "from_entity_id" INTEGER NOT NULL,
    "from_entity_type" "public"."ReferenceEntityType" NOT NULL,
    "to_entity_id" INTEGER NOT NULL,
    "to_entity_type" "public"."ReferenceEntityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leg_references_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."leg_blogs" ADD CONSTRAINT "leg_blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."leg_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_documents" ADD CONSTRAINT "leg_documents_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."leg_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_sections" ADD CONSTRAINT "leg_sections_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."leg_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_sections" ADD CONSTRAINT "leg_sections_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."leg_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_notes" ADD CONSTRAINT "leg_notes_document_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."leg_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_notes" ADD CONSTRAINT "leg_notes_section_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."leg_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_blog_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."leg_blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_document_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."leg_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_section_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."leg_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_entity_meta" ADD CONSTRAINT "leg_entity_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "public"."leg_metas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
