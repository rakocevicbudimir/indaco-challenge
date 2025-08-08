import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { FindMetasDto } from './dto/find-metas.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class MetaService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateMetaDto) {
    // Generate slug if not provided
    const slug = dto.slug || this.generateSlug(dto.name);

    try {
      return await this.prisma.meta.create({
        data: {
          name: dto.name,
          description: dto.description,
          slug,
          type: dto.type,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A meta with this name or slug already exists',
          );
        }
      }
      throw error;
    }
  }

  async findAll(query: FindMetasDto): Promise<PaginatedResponse<any>> {
    const where: Prisma.MetaWhereInput = {
      deletedAt: null,
    };

    // Add search condition
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Add type filter
    if (query.type) {
      where.type = query.type;
    }

    // Add slug filter
    if (query.slug) {
      where.slug = query.slug;
    }

    // Get total count
    const total = await this.prisma.meta.count({ where });

    // Get paginated results
    const items = await this.prisma.meta.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            entityMeta: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(total / (query.limit || 10));

    return {
      items: items.map((item) => ({
        ...item,
        usageCount: item._count.entityMeta,
        _count: undefined,
      })),
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

  async findOne(id: number) {
    const meta = await this.prisma.meta.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            entityMeta: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        entityMeta: {
          where: {
            deletedAt: null,
          },
          include: {
            blog: {
              select: {
                id: true,
                title: true,
              },
            },
            document: {
              select: {
                id: true,
                title: true,
              },
            },
            section: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!meta) {
      throw new NotFoundException('Meta not found');
    }

    return {
      ...meta,
      usageCount: meta._count.entityMeta,
      _count: undefined,
    };
  }

  async update(id: number, dto: UpdateMetaDto) {
    const meta = await this.prisma.meta.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!meta) {
      throw new NotFoundException('Meta not found');
    }

    // Generate new slug if name is updated and slug is not provided
    const slug =
      dto.slug || (dto.name ? this.generateSlug(dto.name) : meta.slug);

    try {
      return await this.prisma.meta.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          slug,
          type: dto.type,
        },
        include: {
          _count: {
            select: {
              entityMeta: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A meta with this name or slug already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    const meta = await this.prisma.meta.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            entityMeta: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!meta) {
      throw new NotFoundException('Meta not found');
    }

    if (meta._count.entityMeta > 0) {
      throw new ConflictException('Cannot delete meta that is still in use');
    }

    // Soft delete
    return this.prisma.meta.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
