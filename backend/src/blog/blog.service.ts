import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntityType, Prisma } from '@prisma/client';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FindBlogsDto } from './dto/find-blogs.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateBlogDto) {
    // Create blog with metadata if provided
    const metaIds = dto.metaIds
      ?.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
      .filter((id) => !isNaN(id));

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        status: dto.status,
        isPremium: dto.isPremium,
        authorId: userId,
        entityMeta: metaIds?.length
          ? {
              createMany: {
                data: metaIds.map((metaId) => ({
                  metaId,
                  entityType: EntityType.blog,
                  content: '',
                })),
              },
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

  async findAll(
    userId: number | undefined,
    query: FindBlogsDto,
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.BlogWhereInput = {
      deletedAt: null,
      OR: [
        // Author can see all their own blogs
        ...(userId ? [{ authorId: userId }] : []),
        // Non-premium blogs are visible to everyone
        { isPremium: false },
        // Premium blogs are only visible to premium users
        ...(userId
          ? [{ AND: [{ isPremium: true }, { author: { isPremium: true } }] }]
          : []),
      ],
    };

    // Add search condition
    if (query.search) {
      const searchConditions: Prisma.BlogWhereInput[] = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];

      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    }

    // Add status filter
    if (query.status) {
      where.status = query.status;
    }

    // Add premium filter
    if (typeof query.isPremium === 'boolean') {
      where.isPremium = query.isPremium;
    }

    // Add date filters
    if (query.createdAfter || query.createdBefore) {
      where.createdAt = {
        ...(query.createdAfter && { gte: new Date(query.createdAfter) }),
        ...(query.createdBefore && { lte: new Date(query.createdBefore) }),
      };
    }

    // Get total count
    const total = await this.prisma.blog.count({ where });

    // Get paginated results
    const items = await this.prisma.blog.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

  async findOne(id: number, userId: number | undefined) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          // Author can see all their own blogs
          ...(userId ? [{ authorId: userId }] : []),
          // Non-premium blogs are visible to everyone
          { isPremium: false },
          // Premium blogs are only visible to premium users
          ...(userId
            ? [{ AND: [{ isPremium: true }, { author: { isPremium: true } }] }]
            : []),
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async update(id: number, userId: number, dto: UpdateBlogDto) {
    // Verify blog exists and user has access
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        authorId: userId,
        deletedAt: null,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Handle meta updates if provided
    if (dto.metaIds?.length) {
      const metaIds = dto.metaIds
        .map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
        .filter((id) => !isNaN(id));

      if (metaIds.length) {
        // Delete existing meta relationships
        await this.prisma.entityMeta.deleteMany({
          where: {
            entityId: id,
            entityType: EntityType.blog,
          },
        });

        // Create new meta relationships
        await this.prisma.entityMeta.createMany({
          data: metaIds.map((metaId) => ({
            metaId,
            entityId: id,
            entityType: EntityType.blog,
            content: '',
          })),
        });
      }
    }

    // Update blog
    return this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        status: dto.status,
        isPremium: dto.isPremium,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

  async remove(id: number, userId: number) {
    // Verify blog exists and user has access
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        authorId: userId,
        deletedAt: null,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Soft delete
    return this.prisma.blog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
