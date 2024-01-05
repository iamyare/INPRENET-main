import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoIdentificacionDto } from './create-tipo_identificacion.dto';

export class UpdateTipoIdentificacionDto extends PartialType(CreateTipoIdentificacionDto) {}
