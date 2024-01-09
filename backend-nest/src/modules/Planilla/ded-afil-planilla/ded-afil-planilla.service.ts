import { Injectable } from '@nestjs/common';
import { CreateDedAfilPlanillaDto } from './dto/create-ded-afil-planilla.dto';
import { UpdateDedAfilPlanillaDto } from './dto/update-ded-afil-planilla.dto';

@Injectable()
export class DedAfilPlanillaService {
  create(createDedAfilPlanillaDto: CreateDedAfilPlanillaDto) {
    return 'This action adds a new dedAfilPlanilla';
  }

  findAll() {
    return `This action returns all dedAfilPlanilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dedAfilPlanilla`;
  }

  update(id: number, updateDedAfilPlanillaDto: UpdateDedAfilPlanillaDto) {
    return `This action updates a #${id} dedAfilPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} dedAfilPlanilla`;
  }
}
