import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceEntityType } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindReferencesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by source entity type',
    enum: ReferenceEntityType,
  })
  @IsOptional()
  @IsEnum(ReferenceEntityType)
  fromEntityType?: ReferenceEntityType;

  @ApiPropertyOptional({
    description: 'Filter by source entity ID',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  fromEntityId?: number;

  @ApiPropertyOptional({
    description: 'Filter by target entity type',
    enum: ReferenceEntityType,
  })
  @IsOptional()
  @IsEnum(ReferenceEntityType)
  toEntityType?: ReferenceEntityType;

  @ApiPropertyOptional({
    description: 'Filter by target entity ID',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  toEntityId?: number;
}
