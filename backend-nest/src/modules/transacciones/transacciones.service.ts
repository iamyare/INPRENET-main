import { Injectable } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';

@Injectable()
export class TransaccionesService {
  create(createTransaccionesDto: CreateTransaccionesDto) {
    return 'This action adds a new transsacione';
  }

  findAll() {
    return `This action returns all transsaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transsacione`;
  }

  update(id: number, updateTranssacioneDto: UpdateTranssacionesDto) {
    return `This action updates a #${id} transsacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} transsacione`;
  }
}
