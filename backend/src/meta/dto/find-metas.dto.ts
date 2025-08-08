import { ApiPropertyOptional } from '@nestjs/swagger';
import { MetaType } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindMetasDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to match against name and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by meta type',
    enum: MetaType,
  })
  @IsOptional()
  @IsEnum(MetaType)
  type?: MetaType;

  @ApiPropertyOptional({
    description: 'Filter by slug',
  })
  @IsOptional()
  @IsString()
  slug?: string;
}
