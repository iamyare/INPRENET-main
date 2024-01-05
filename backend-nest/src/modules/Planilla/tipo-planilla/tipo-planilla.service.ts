import { Injectable } from '@nestjs/common';
import { CreateTipoPlanillaDto } from './dto/create-tipo-planilla.dto';
import { UpdateTipoPlanillaDto } from './dto/update-tipo-planilla.dto';

@Injectable()
export class TipoPlanillaService {
  create(createTipoPlanillaDto: CreateTipoPlanillaDto) {
    return 'This action adds a new tipoPlanilla';
  }

  findAll() {
    return `This action returns all tipoPlanilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoPlanilla`;
  }

  update(id: number, updateTipoPlanillaDto: UpdateTipoPlanillaDto) {
    return `This action updates a #${id} tipoPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoPlanilla`;
  }
}
