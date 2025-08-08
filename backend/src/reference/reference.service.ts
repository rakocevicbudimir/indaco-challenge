import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReferenceEntityType } from '@prisma/client';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { FindReferencesDto } from './dto/find-references.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ReferenceService {
  constructor(private prisma: PrismaService) {}

  private async checkEntityAccess(
    entityType: ReferenceEntityType,
    entityId: number,
    userId: number,
  ): Promise<{ hasAccess: boolean; isOwner: boolean }> {
    let hasAccess = false;
    let isOwner = false;

    switch (entityType) {
      case ReferenceEntityType.blog: {
        const blog = await this.prisma.blog.findFirst({
          where: {
            id: entityId,
            deletedAt: null,
          },
          select: {
            authorId: true,
            isPremium: true,
          },
        });

        if (blog) {
          hasAccess = blog.authorId === userId || !blog.isPremium;
          isOwner = blog.authorId === userId;
        }
        break;
      }

      case ReferenceEntityType.document: {
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

      case ReferenceEntityType.section: {
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

  async create(userId: number, dto: CreateReferenceDto) {
    // Check if user has access to both entities
    const fromAccess = await this.checkEntityAccess(
      dto.fromEntityType,
      dto.fromEntityId,
      userId,
    );

    const toAccess = await this.checkEntityAccess(
      dto.toEntityType,
      dto.toEntityId,
      userId,
    );

    if (!fromAccess.hasAccess || !toAccess.hasAccess) {
      throw new ForbiddenException(
        'You do not have access to one or both entities',
      );
    }

    if (!fromAccess.isOwner) {
      throw new ForbiddenException(
        'You can only create references from your own entities',
      );
    }

    return this.prisma.reference.create({
      data: {
        content: dto.content,
        fromEntityType: dto.fromEntityType,
        fromEntityId: dto.fromEntityId,
        toEntityType: dto.toEntityType,
        toEntityId: dto.toEntityId,
      },
    });
  }

  async findAll(
    userId: number,
    query: FindReferencesDto,
  ): Promise<PaginatedResponse<any>> {
    const baseWhere: Prisma.ReferenceWhereInput = {
      deletedAt: null,
    };

    // Add search condition
    if (query.search) {
      baseWhere.content = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Add entity filters
    if (query.fromEntityType) {
      baseWhere.fromEntityType = query.fromEntityType;
    }
    if (query.fromEntityId) {
      baseWhere.fromEntityId = query.fromEntityId;
    }
    if (query.toEntityType) {
      baseWhere.toEntityType = query.toEntityType;
    }
    if (query.toEntityId) {
      baseWhere.toEntityId = query.toEntityId;
    }

    // Get paginated results
    const items = await this.prisma.reference.findMany({
      where: baseWhere,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter out references that the user doesn't have access to
    const accessibleItems = await Promise.all(
      items.map(async (item) => {
        const [fromAccess, toAccess] = await Promise.all([
          this.checkEntityAccess(
            item.fromEntityType,
            item.fromEntityId,
            userId,
          ),
          this.checkEntityAccess(item.toEntityType, item.toEntityId, userId),
        ]);

        return fromAccess.hasAccess && toAccess.hasAccess ? item : null;
      }),
    );

    const filteredItems = accessibleItems.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    const totalPages = Math.ceil(filteredItems.length / (query.limit || 10));

    return {
      items: filteredItems,
      meta: {
        total: filteredItems.length,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages,
        hasNextPage: (query.page || 1) < totalPages,
        hasPreviousPage: (query.page || 1) > 1,
      },
    };
  }

  async findOne(id: number, userId: number) {
    const reference = await this.prisma.reference.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!reference) {
      throw new NotFoundException('Reference not found');
    }

    // Check if user has access to both entities
    const [fromAccess, toAccess] = await Promise.all([
      this.checkEntityAccess(
        reference.fromEntityType,
        reference.fromEntityId,
        userId,
      ),
      this.checkEntityAccess(
        reference.toEntityType,
        reference.toEntityId,
        userId,
      ),
    ]);

    if (!fromAccess.hasAccess || !toAccess.hasAccess) {
      throw new ForbiddenException('You do not have access to this reference');
    }

    return reference;
  }

  async update(id: number, userId: number, dto: UpdateReferenceDto) {
    const reference = await this.findOne(id, userId);

    // Check if user owns the source entity
    const fromAccess = await this.checkEntityAccess(
      reference.fromEntityType,
      reference.fromEntityId,
      userId,
    );

    if (!fromAccess.isOwner) {
      throw new ForbiddenException(
        'You can only update references from your own entities',
      );
    }

    return this.prisma.reference.update({
      where: { id },
      data: {
        content: dto.content,
      },
    });
  }

  async remove(id: number, userId: number) {
    const reference = await this.findOne(id, userId);

    // Check if user owns the source entity
    const fromAccess = await this.checkEntityAccess(
      reference.fromEntityType,
      reference.fromEntityId,
      userId,
    );

    if (!fromAccess.isOwner) {
      throw new ForbiddenException(
        'You can only delete references from your own entities',
      );
    }

    // Soft delete
    return this.prisma.reference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
