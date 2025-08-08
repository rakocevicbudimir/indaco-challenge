import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetaType } from '@prisma/client';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateMetaDto {
  @ApiProperty({ description: 'Meta name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Meta description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Meta slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Meta type',
    enum: MetaType,
    default: MetaType.tag,
  })
  @IsEnum(MetaType)
  type: MetaType = MetaType.tag;
}
