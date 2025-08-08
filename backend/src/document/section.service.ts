import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntityType } from '@prisma/client';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(private prisma: PrismaService) {}

  async create(documentId: number, userId: number, dto: CreateSectionDto) {
    // Verify document exists and user has access
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        creatorId: userId,
        deletedAt: null,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Create section with metadata if provided
    return this.prisma.section.create({
      data: {
        ...dto,
        documentId,
        entityMeta: dto.metaIds
          ? {
              createMany: {
                data: dto.metaIds.map((metaId) => ({
                  metaId,
                  entityType: EntityType.section,
                  content: '',
                })),
              },
            }
          : undefined,
      },
      include: {
        entityMeta: {
          include: {
            meta: true,
          },
        },
      },
    });
  }

  async findAll(documentId: number, userId: number | undefined) {
    // Check document access
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        ...(userId
          ? { OR: [{ creatorId: userId }, { isPublic: true }] }
          : { isPublic: true }),
        deletedAt: null,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.section.findMany({
      where: {
        documentId,
        deletedAt: null,
        ...(userId
          ? { OR: [{ document: { creatorId: userId } }, { isPublic: true }] }
          : { isPublic: true }),
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        entityMeta: {
          where: {
            deletedAt: null,
          },
          include: {
            meta: true,
          },
        },
      },
    });
  }

  async findOne(id: number, userId: number | undefined) {
    const section = await this.prisma.section.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(userId
          ? { OR: [{ document: { creatorId: userId } }, { isPublic: true }] }
          : { isPublic: true }),
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        entityMeta: {
          where: {
            deletedAt: null,
          },
          include: {
            meta: true,
          },
        },
        notes: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async update(id: number, userId: number, dto: UpdateSectionDto) {
    // Verify section exists and user has access
    const section = await this.prisma.section.findFirst({
      where: {
        id,
        document: {
          creatorId: userId,
        },
        deletedAt: null,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Handle meta updates if provided
    if (dto.metaIds) {
      // Delete existing meta relationships
      await this.prisma.entityMeta.deleteMany({
        where: {
          entityId: id,
          entityType: EntityType.section,
        },
      });

      // Create new meta relationships
      await this.prisma.entityMeta.createMany({
        data: dto.metaIds.map((metaId) => ({
          metaId,
          entityId: id,
          entityType: EntityType.section,
          content: '',
        })),
      });
    }

    // Update section
    return this.prisma.section.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
        isPublic: dto.isPublic,
        version: dto.version,
        parentId: dto.parentId,
      },
      include: {
        entityMeta: {
          include: {
            meta: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    // Verify section exists and user has access
    const section = await this.prisma.section.findFirst({
      where: {
        id,
        document: {
          creatorId: userId,
        },
        deletedAt: null,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Soft delete
    return this.prisma.section.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
