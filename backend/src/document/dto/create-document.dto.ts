import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the document',
    example: 'My Document',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The summary of the document',
    example: 'This is a summary of my document',
  })
  summary?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The content of the document',
    example: 'This is the content of my document',
  })
  content?: string;

  @IsEnum(Status)
  @IsOptional()
  @ApiProperty({
    description: 'The status of the document',
    example: 'draft',
  })
  status?: Status;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Whether the document is public',
    example: true,
  })
  isPublic?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'Array of meta IDs to associate with the document',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  metaIds?: number[];
}
