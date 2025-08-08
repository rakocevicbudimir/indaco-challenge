import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Section content' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Section status',
    enum: Status,
    default: Status.DRAFT,
  })
  @IsEnum(Status)
  status: Status = Status.DRAFT;

  @ApiProperty({
    description: 'Whether the section is public',
    default: false,
  })
  @IsBoolean()
  isPublic: boolean = false;

  @ApiProperty({ description: 'Section version' })
  @IsString()
  version: string;

  @ApiPropertyOptional({ description: 'Parent section ID' })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Array of meta IDs to associate with the section',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  metaIds?: number[];
}
