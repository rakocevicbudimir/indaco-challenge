import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Blog summary' })
  @IsString()
  summary: string;

  @ApiProperty({ description: 'Blog content' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Blog status',
    enum: Status,
    default: Status.DRAFT,
  })
  @IsEnum(Status)
  status: Status = Status.DRAFT;

  @ApiProperty({
    description: 'Whether the blog is premium content',
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPremium: boolean = false;

  @ApiPropertyOptional({
    description: 'Array of meta IDs to associate with the blog',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) =>
          typeof v === 'string' ? parseInt(v, 10) : (v as number),
        )
      : typeof value === 'string'
        ? value.split(',').map((v) => parseInt(v, 10))
        : [],
  )
  metaIds?: number[];
}
