import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController, SectionController],
  providers: [DocumentService, SectionService],
  exports: [DocumentService, SectionService],
})
export class DocumentModule {}
