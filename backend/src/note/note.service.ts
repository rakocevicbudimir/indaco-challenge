import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NoteEntityType, Prisma } from '@prisma/client';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FindNotesDto } from './dto/find-notes.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  private async checkEntityAccess(
    entityType: NoteEntityType,
    entityId: number,
    userId: number,
  ): Promise<{ hasAccess: boolean; isOwner: boolean }> {
    let hasAccess = false;
    let isOwner = false;

    switch (entityType) {
      case NoteEntityType.document: {
        const document = await this.prisma.document.findFirst({
          where: {
            id: entityId,
            deletedAt: null,
          },
          select: {
            creatorId: true,
            isPublic: true,
          },
        });

        if (document) {
          hasAccess = document.creatorId === userId || !!document.isPublic;
          isOwner = document.creatorId === userId;
        }
        break;
      }

      case NoteEntityType.section: {
        const section = await this.prisma.section.findFirst({
          where: {
            id: entityId,
            deletedAt: null,
          },
          select: {
            document: {
              select: {
                creatorId: true,
                isPublic: true,
              },
            },
          },
        });

        if (section?.document) {
          hasAccess =
            section.document.creatorId === userId ||
            !!section.document.isPublic;
          isOwner = section.document.creatorId === userId;
        }
        break;
      }
    }

    return { hasAccess, isOwner };
  }

  async create(userId: number, dto: CreateNoteDto) {
    // Check if user has access to the entity
    const { hasAccess, isOwner } = await this.checkEntityAccess(
      dto.entityType,
      dto.entityId,
      userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this entity');
    }

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only create notes for your own entities',
      );
    }

    return this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        section: {
          select: {
            id: true,
            title: true,
            document: {
              select: {
                id: true,
                creatorId: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    userId: number,
    query: FindNotesDto,
  ): Promise<PaginatedResponse<any>> {
    const baseWhere: Prisma.NoteWhereInput = {
      deletedAt: null,
      OR: [
        {
          AND: [
            { entityType: NoteEntityType.document },
            {
              document: {
                OR: [{ creatorId: userId }, { isPublic: true }],
                deletedAt: null,
              },
            },
          ],
        },
        {
          AND: [
            { entityType: NoteEntityType.section },
            {
              section: {
                document: {
                  OR: [{ creatorId: userId }, { isPublic: true }],
                  deletedAt: null,
                },
                deletedAt: null,
              },
            },
          ],
        },
      ],
    };

    let where = { ...baseWhere };

    // Add search condition
    if (query.search) {
      const searchConditions: Prisma.NoteWhereInput[] = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];

      where = { AND: [where, { OR: searchConditions }] };
    }

    // Add entity type and ID filters
    if (query.entityType || query.entityId) {
      where = {
        AND: [
          where,
          {
            ...(query.entityType && { entityType: query.entityType }),
            ...(query.entityId && { entityId: query.entityId }),
          },
        ],
      };
    }

    // Get total count
    const total = await this.prisma.note.count({ where });

    // Get paginated results
    const items = await this.prisma.note.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        section: {
          select: {
            id: true,
            title: true,
            document: {
              select: {
                id: true,
                creatorId: true,
              },
            },
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

  async findOne(id: number, userId: number) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          {
            document: {
              OR: [{ creatorId: userId }, { isPublic: true }],
              deletedAt: null,
            },
          },
          {
            section: {
              document: {
                OR: [{ creatorId: userId }, { isPublic: true }],
                deletedAt: null,
              },
              deletedAt: null,
            },
          },
        ],
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        section: {
          select: {
            id: true,
            title: true,
            document: {
              select: {
                id: true,
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(id: number, userId: number, dto: UpdateNoteDto) {
    // Check if note exists and user has access
    const note = await this.findOne(id, userId);

    // Check if user owns the entity
    const isOwner =
      note.document?.creatorId === userId ||
      note.section?.document?.creatorId === userId;

    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to update this note',
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        section: {
          select: {
            id: true,
            title: true,
            document: {
              select: {
                id: true,
                creatorId: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    // Check if note exists and user has access
    const note = await this.findOne(id, userId);

    // Check if user owns the entity
    const isOwner =
      note.document?.creatorId === userId ||
      note.section?.document?.creatorId === userId;

    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to delete this note',
      );
    }

    // Soft delete
    return this.prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
