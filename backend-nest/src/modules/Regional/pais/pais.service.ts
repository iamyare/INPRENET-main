import { Injectable } from '@nestjs/common';
import { CreatePaiDto } from './dto/create-pai.dto';
import { UpdatePaiDto } from './dto/update-pai.dto';
import { Net_Pais } from './entities/pais.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PaisService {

  constructor(
    @InjectRepository(Net_Pais)
    private readonly paisRepository: Repository<Net_Pais>,
  ) {}


  create(createPaiDto: CreatePaiDto) {
    return 'This action adds a new pai';
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    
    const queryBuilder = this.paisRepository.createQueryBuilder('pais')
      .take(limit)
      .skip(offset)
      .orderBy('CASE WHEN pais.nombre_pais = :nombre THEN 1 ELSE 2 END', 'ASC')
      .addOrderBy('pais.nombre_pais', 'ASC')
      .setParameter('nombre', 'HONDURAS');
    return queryBuilder.getMany();
  }
  
  findOne(id: number) {
    return `This action returns a #${id} pai`;
  }

  update(id: number, updatePaiDto: UpdatePaiDto) {
    return `This action updates a #${id} pai`;
  }

  remove(id: number) {
    return `This action removes a #${id} pai`;
  }
}
