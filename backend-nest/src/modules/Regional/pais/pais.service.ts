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

  async findAll( paginationDto: PaginationDto){
    const { limit = 10, offset = 0 } = paginationDto
    return this.paisRepository.find({
      take: limit,
      skip : offset
    });
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
