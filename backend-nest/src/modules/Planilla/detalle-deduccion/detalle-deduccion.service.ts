import { Injectable } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';

@Injectable()
export class DetalleDeduccionService {
  create(createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    return 'This action adds a new detalleDeduccion';
  }

  findAll() {
    return `This action returns all detalleDeduccion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleDeduccion`;
  }

  update(id: number, updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    return `This action updates a #${id} detalleDeduccion`;
  }

  remove(id: number) {
    return `This action removes a #${id} detalleDeduccion`;
  }
}
