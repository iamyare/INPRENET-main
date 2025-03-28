import { PartialType } from '@nestjs/mapped-types';
import { CreateRnpDto } from './create-rnp.dto';

export class UpdateRnpDto extends PartialType(CreateRnpDto) {}
