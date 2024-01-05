import { Injectable } from '@nestjs/common';
import { CreateBeneficioPlanillaDto } from './dto/create-beneficio_planilla.dto';
import { UpdateBeneficioPlanillaDto } from './dto/update-beneficio_planilla.dto';

@Injectable()
export class BeneficioPlanillaService {
  create(createBeneficioPlanillaDto: CreateBeneficioPlanillaDto) {
    return 'This action adds a new beneficioPlanilla';
  }

  findAll() {
    return `This action returns all beneficioPlanilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficioPlanilla`;
  }

  update(id: number, updateBeneficioPlanillaDto: UpdateBeneficioPlanillaDto) {
    return `This action updates a #${id} beneficioPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficioPlanilla`;
  }
}
