import { ApiProperty } from '@nestjs/swagger';
import { ReferenceEntityType } from '@prisma/client';
import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReferenceDto {
  @ApiProperty({ description: 'Reference content/description' })
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiProperty({
    description: 'Type of entity this reference is from',
    enum: ReferenceEntityType,
  })
  @IsEnum(ReferenceEntityType)
  fromEntityType: ReferenceEntityType;

  @ApiProperty({ description: 'ID of the entity this reference is from' })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  fromEntityId: number;

  @ApiProperty({
    description: 'Type of entity this reference points to',
    enum: ReferenceEntityType,
  })
  @IsEnum(ReferenceEntityType)
  toEntityType: ReferenceEntityType;

  @ApiProperty({ description: 'ID of the entity this reference points to' })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  toEntityId: number;
}
