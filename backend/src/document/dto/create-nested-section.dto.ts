import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { CreateNestedReferenceDto } from './create-nested-reference.dto';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNestedSectionDto {
  @ApiProperty({ description: 'Section title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Section content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Section status',
    enum: Status,
    default: Status.DRAFT,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status = Status.DRAFT;

  @ApiPropertyOptional({
    description: 'Whether the section is public',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ description: 'Section version' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({
    description: 'Array of meta IDs to associate with the section',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  metaIds?: number[];

  @ApiPropertyOptional({
    description: 'Nested subsections',
    type: [CreateNestedSectionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNestedSectionDto)
  children?: CreateNestedSectionDto[];

  @ApiPropertyOptional({
    description: 'References to other entities',
    type: [CreateNestedReferenceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNestedReferenceDto)
  toReferences?: CreateNestedReferenceDto[];
}
