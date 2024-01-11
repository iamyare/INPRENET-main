import { Injectable } from '@nestjs/common';
import { CreateInstitucionDto } from './dto/create-institucion.dto';
import { UpdateInstitucionDto } from './dto/update-institucion.dto';

@Injectable()
export class InstitucionService {
  create(createInstitucionDto: CreateInstitucionDto) {
    return 'This action adds a new institucion';
  }

  findAll() {
    return `This action returns all institucion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} institucion`;
  }

  update(id: number, updateInstitucionDto: UpdateInstitucionDto) {
    return `This action updates a #${id} institucion`;
  }

  remove(id: number) {
    return `This action removes a #${id} institucion`;
  }
}
