import { ApiPropertyOptional } from '@nestjs/swagger';
import { NoteEntityType } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindNotesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against title and content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: NoteEntityType,
  })
  @IsOptional()
  @IsEnum(NoteEntityType)
  entityType?: NoteEntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  entityId?: number;
}
