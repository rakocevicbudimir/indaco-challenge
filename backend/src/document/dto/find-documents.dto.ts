import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum DocumentSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
}

export class FindDocumentsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against title and content',
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
    description: 'Filter by public/private documents',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by meta IDs (tags/categories)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(Number)
      : typeof value === 'string'
        ? value.split(',').map(Number)
        : [],
  )
  metaIds?: number[];

  @ApiPropertyOptional({
    description: 'Filter documents created after this date',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter documents created before this date',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    enum: DocumentSortBy,
    default: DocumentSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(DocumentSortBy)
  sortBy: DocumentSortBy = DocumentSortBy.CREATED_AT;

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
