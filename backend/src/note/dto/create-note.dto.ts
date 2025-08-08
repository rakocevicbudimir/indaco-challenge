import { ApiProperty } from '@nestjs/swagger';
import { NoteEntityType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateNoteDto {
  @ApiProperty({ description: 'Note title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Type of entity this note belongs to',
    enum: NoteEntityType,
  })
  @IsEnum(NoteEntityType)
  entityType: NoteEntityType;

  @ApiProperty({ description: 'ID of the entity this note belongs to' })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  entityId: number;
}
