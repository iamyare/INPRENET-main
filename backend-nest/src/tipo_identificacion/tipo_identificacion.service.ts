import { Injectable } from '@nestjs/common';
import { CreateTipoIdentificacionDto } from './dto/create-tipo_identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo_identificacion.dto';

@Injectable()
export class TipoIdentificacionService {
  create(createTipoIdentificacionDto: CreateTipoIdentificacionDto) {
    return 'This action adds a new tipoIdentificacion';
  }

  findAll() {
    return `This action returns all tipoIdentificacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoIdentificacion`;
  }

  update(id: number, updateTipoIdentificacionDto: UpdateTipoIdentificacionDto) {
    return `This action updates a #${id} tipoIdentificacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoIdentificacion`;
  }
}
