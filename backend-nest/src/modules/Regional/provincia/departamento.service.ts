import { Injectable } from '@nestjs/common';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { Net_Departamento } from './entities/net_departamento.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DepartamentoService {

  constructor(
    @InjectRepository(Net_Departamento)
    private departamentoRepository: Repository<Net_Departamento>,
  ) {}


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

  async findByPaisId(paisId: number): Promise<Net_Departamento[]> {
    return await this.departamentoRepository.find({
        where: {
            pais: { id_pais: paisId } // Aquí se especifica la propiedad 'id' del objeto 'pais'
        }
    });
}
}
