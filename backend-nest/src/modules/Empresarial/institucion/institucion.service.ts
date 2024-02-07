import { Injectable, Logger } from '@nestjs/common';
import { CreateInstitucionDto } from './dto/create-institucion.dto';
import { UpdateInstitucionDto } from './dto/update-institucion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institucion } from './entities/institucion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InstitucionService {

  private readonly logger = new Logger(InstitucionService.name)

  constructor(
    @InjectRepository(Institucion)
    private institucionRepository : Repository<Institucion>
  ){}

  create(createInstitucionDto: CreateInstitucionDto) {
    return 'This action adds a new institucion';
  }

  findAll() {
    const institucion = this.institucionRepository.find()
    return institucion;
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
