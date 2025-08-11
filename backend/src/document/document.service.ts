import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EntityType, ReferenceEntityType } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FindDocumentsDto } from './dto/find-documents.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { CreateNestedSectionDto } from './dto/create-nested-section.dto';
// Removed unused CreateNestedReferenceDto import

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  private async createNestedSections(
    sections: CreateNestedSectionDto[],
    documentId: number,
  ): Promise<void> {
    const createSection = async (
      section: CreateNestedSectionDto,
      parentId?: number,
    ): Promise<void> => {
      const { children, metaIds, toReferences, ...sectionData } = section;

      const createdSection = await this.prisma.section.create({
        data: {
          ...sectionData,
          documentId,
          parentId,
          entityMeta: metaIds?.length
            ? {
                create: metaIds.map((metaId) => ({
                  entityType: EntityType.section,
                  metaId,
                })),
              }
            : undefined,
        },
      });

      // Create outgoing references after section exists
      if (toReferences && toReferences.length > 0) {
        await Promise.all(
          toReferences.map((ref) =>
            this.prisma.reference.create({
              data: {
                content: ref.content,
                fromEntityType: ReferenceEntityType.section,
                toEntityType: ref.toEntityType,
                fromSection: { connect: { id: createdSection.id } },
                ...(ref.toEntityType === ReferenceEntityType.blog
                  ? { toBlog: { connect: { id: ref.toEntityId } } }
                  : ref.toEntityType === ReferenceEntityType.document
                    ? { toDocument: { connect: { id: ref.toEntityId } } }
                    : { toSection: { connect: { id: ref.toEntityId } } }),
              },
            }),
          ),
        );
      }

      if (children?.length) {
        await Promise.all(
          children.map((child) => createSection(child, createdSection.id)),
        );
      }
    };

    await Promise.all(sections.map((section) => createSection(section)));
  }

  async create(userId: number, createDocumentDto: CreateDocumentDto) {
    const { metaIds, sections, ...documentData } = createDocumentDto;

    const document = await this.prisma.document.create({
      data: {
        ...documentData,
        creatorId: userId,
        entityMeta: metaIds?.length
          ? {
              create: metaIds.map((metaId) => ({
                entityType: EntityType.document,
                metaId,
              })),
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

    if (sections?.length) {
      await this.createNestedSections(sections, document.id);
    }

    // Fetch the complete document with all nested sections
    return this.findOne(document.id, userId);
  }

  async findAll(
    userId: number | undefined,
    query: FindDocumentsDto,
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.DocumentWhereInput = {
      ...(userId
        ? { OR: [{ creatorId: userId }, { isPublic: true }] }
        : { isPublic: true }),
      deletedAt: null,
    };

    // Add search condition
    if (query.search) {
      const currentOR = Array.isArray(where.OR)
        ? where.OR
        : where.OR
          ? [where.OR]
          : [];
      where.OR = [
        ...currentOR,
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ] as Prisma.DocumentWhereInput[];
    }

    // Add status filter
    if (query.status) {
      where.status = query.status;
    }

    // Add public/private filter
    if (typeof query.isPublic === 'boolean') {
      where.isPublic = query.isPublic;
    }

    // Add meta filter
    if (query.metaIds?.length) {
      where.entityMeta = {
        some: {
          metaId: { in: query.metaIds },
          deletedAt: null,
        },
      };
    }

    // Add date filters
    const dateFilter: Prisma.DateTimeFilter = {};
    if (query.createdAfter) {
      dateFilter.gte = new Date(query.createdAfter);
    }

    if (query.createdBefore) {
      dateFilter.lte = new Date(query.createdBefore);
    }

    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get total count
    const total = await this.prisma.document.count({ where });

    // Get paginated results
    const items = await this.prisma.document.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
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
        fromReferences: true,
        toReferences: true,
      },
    });

    const totalPages = Math.ceil(total / (query.limit || 10));

    return {
      items,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages,
        hasNextPage: (query.page || 1) < totalPages,
        hasPreviousPage: (query.page || 1) > 1,
      },
    };
  }

  findOne(id: number, userId: number | undefined) {
    return this.prisma.document.findFirst({
      where: {
        id,
        ...(userId
          ? { OR: [{ creatorId: userId }, { isPublic: true }] }
          : { isPublic: true }),
        deletedAt: null,
      },
      include: {
        sections: {
          include: {
            entityMeta: {
              include: {
                meta: true,
              },
            },
            fromReferences: true,
            toReferences: true,
          },
        },
        notes: true,
        fromReferences: {
          include: {
            fromSection: true,
            fromBlog: true,
            fromDocument: true,
          },
        },
        toReferences: {
          include: {
            toSection: true,
            toBlog: true,
            toDocument: true,
          },
        },
        entityMeta: {
          include: {
            meta: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    userId: number,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    const updateData: Prisma.DocumentUpdateInput = {};

    if (updateDocumentDto.title !== undefined) {
      updateData.title = updateDocumentDto.title;
    }
    if (updateDocumentDto.summary !== undefined) {
      updateData.summary = updateDocumentDto.summary;
    }
    if (updateDocumentDto.content !== undefined) {
      updateData.content = updateDocumentDto.content;
    }
    if (updateDocumentDto.status !== undefined) {
      updateData.status = updateDocumentDto.status;
    }
    if (updateDocumentDto.isPublic !== undefined) {
      updateData.isPublic = updateDocumentDto.isPublic;
    }

    return this.prisma.document.update({
      where: {
        id,
        creatorId: userId,
        deletedAt: null,
      },
      data: updateData,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.document.update({
      where: {
        id,
        creatorId: userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
