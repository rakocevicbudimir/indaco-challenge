import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateReferenceDto } from './create-reference.dto';

export class CreateReferencesDto {
  @ApiProperty({
    description: 'Array of references to create',
    type: [CreateReferenceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReferenceDto)
  references: CreateReferenceDto[];
}
