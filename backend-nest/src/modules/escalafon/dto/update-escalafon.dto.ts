import { PartialType } from '@nestjs/mapped-types';
import { CreateEscalafonDto } from './create-escalafon.dto';

export class UpdateEscalafonDto extends PartialType(CreateEscalafonDto) {}
