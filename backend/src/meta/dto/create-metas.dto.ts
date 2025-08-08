import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateMetaDto } from './create-meta.dto';

export class CreateMetasDto {
  @ApiProperty({
    description: 'Array of metas to create',
    type: [CreateMetaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMetaDto)
  metas: CreateMetaDto[];
}
