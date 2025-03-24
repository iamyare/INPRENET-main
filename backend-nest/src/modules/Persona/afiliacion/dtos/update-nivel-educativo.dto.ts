import { PartialType } from '@nestjs/mapped-types';
import { CreateNivelEducativoDto } from './create-nivel-educativo.dto';

export class UpdateNivelEducativoDto extends PartialType(CreateNivelEducativoDto) {}
