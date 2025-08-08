import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum BlogSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
}

export class FindBlogsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against title, summary and content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    description: 'Filter by premium content',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPremium?: boolean;

  @ApiPropertyOptional({
    description: 'Filter blogs created after this date',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter blogs created before this date',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    enum: BlogSortBy,
    default: BlogSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy: BlogSortBy = BlogSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    default: 'desc',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value as 'asc' | 'desc';
    return value.toLowerCase() as 'asc' | 'desc';
  })
  @IsEnum(['asc', 'desc'] as const)
  sortOrder: 'asc' | 'desc' = 'desc';
}
