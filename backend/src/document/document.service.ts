import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FindDocumentsDto } from './dto/find-documents.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDocumentDto: CreateDocumentDto) {
    const { metaIds, ...documentData } = createDocumentDto;

    return this.prisma.document.create({
      data: {
        ...documentData,
        creatorId: userId,
        entityMeta: metaIds?.length
          ? {
              create: metaIds.map((metaId) => ({
                entityType: 'document',
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
        sections: true,
        notes: true,
        entityMeta: {
          include: {
            meta: true,
          },
        },
      },
    });
  }

  update(id: number, userId: number, updateDocumentDto: UpdateDocumentDto) {
    return this.prisma.document.update({
      where: {
        id,
        creatorId: userId,
        deletedAt: null,
      },
      data: updateDocumentDto,
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
