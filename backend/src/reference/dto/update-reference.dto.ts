import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReferenceDto } from './create-reference.dto';

export class UpdateReferenceDto extends PartialType(
  OmitType(CreateReferenceDto, [
    'fromEntityType',
    'fromEntityId',
    'toEntityType',
    'toEntityId',
  ] as const),
) {}
