import { Injectable } from '@nestjs/common';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Municipio } from './entities/net_municipio.entity';

@Injectable()
export class MunicipioService {

  constructor(
    @InjectRepository(Net_Municipio)
    private municipioRepository: Repository<Net_Municipio>,
  ) {}

  
  create(createMunicipioDto: CreateMunicipioDto) {
    return 'This action adds a new municipio';
  }

  async findAll() {
    return await this.municipioRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} municipio`;
  }

  update(id: number, updateMunicipioDto: UpdateMunicipioDto) {
    return `This action updates a #${id} municipio`;
  }

  remove(id: number) {
    return `This action removes a #${id} municipio`;
  }

  async findByDepartamentoId(departamentoId: number): Promise<Net_Municipio[]> {
    return await this.municipioRepository.find({
      where: {
        departamento: { id_departamento: departamentoId }
      },
      relations: ['departamento'] 
    });
  }
}
