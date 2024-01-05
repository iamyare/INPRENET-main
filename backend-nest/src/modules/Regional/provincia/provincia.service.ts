import { Injectable } from '@nestjs/common';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';

@Injectable()
export class ProvinciaService {
  create(createProvinciaDto: CreateProvinciaDto) {
    return 'This action adds a new provincia';
  }

  findAll() {
    return `This action returns all provincia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} provincia`;
  }

  update(id: number, updateProvinciaDto: UpdateProvinciaDto) {
    return `This action updates a #${id} provincia`;
  }

  remove(id: number) {
    return `This action removes a #${id} provincia`;
  }
}
