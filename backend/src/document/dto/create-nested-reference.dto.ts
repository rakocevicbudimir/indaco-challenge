import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceEntityType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateNestedReferenceDto {
  @ApiPropertyOptional({
    description: 'Reference content',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'ID of the entity being referenced',
    example: 1,
  })
  @IsNumber()
  toEntityId: number;

  @ApiProperty({
    description: 'Type of the entity being referenced',
    enum: ReferenceEntityType,
    example: ReferenceEntityType.section,
  })
  @IsEnum(ReferenceEntityType)
  toEntityType: ReferenceEntityType;
}
