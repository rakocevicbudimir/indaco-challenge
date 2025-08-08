-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_blog_id_fkey" FOREIGN KEY ("from_entity_id") REFERENCES "public"."leg_blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_document_id_fkey" FOREIGN KEY ("from_entity_id") REFERENCES "public"."leg_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_from_section_id_fkey" FOREIGN KEY ("from_entity_id") REFERENCES "public"."leg_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_blog_id_fkey" FOREIGN KEY ("to_entity_id") REFERENCES "public"."leg_blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_document_id_fkey" FOREIGN KEY ("to_entity_id") REFERENCES "public"."leg_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leg_references" ADD CONSTRAINT "leg_references_to_section_id_fkey" FOREIGN KEY ("to_entity_id") REFERENCES "public"."leg_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
