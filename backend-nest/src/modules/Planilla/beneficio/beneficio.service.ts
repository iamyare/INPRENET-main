import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficio } from './entities/beneficio.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name)
  constructor(){}
  @InjectRepository(Beneficio)
  private beneficioRepository: Repository<Beneficio>
  
  async create(createBeneficioDto: CreateBeneficioDto) {
    try {
      const beneficio = this.beneficioRepository.create(createBeneficioDto);
      return this.beneficioRepository.save(beneficio);
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll() {
    return this.beneficioRepository.find();
  }

/*   async findOne(id: string) {
    const beneficio = await this.beneficioRepository.findOne({ where: { id_beneficio: id } });
    if(!beneficio){
      throw new BadRequestException(`beneficio con ID ${id} no encontrado.`);
    }
    return beneficio;
  } */

  async findOne(term: string) {
    let beneficio: Beneficio;
    if (isUUID(term)) {
      beneficio = await this.beneficioRepository.findOneBy({ id_beneficio: term,});
    } else {
      const queryBuilder = this.beneficioRepository.createQueryBuilder('beneficio');
      beneficio = await queryBuilder
        .where('"nombre_beneficio" = :term OR "id_beneficio" = :term', { term } )
        .getOne();
    }
    if (!beneficio) {
      throw new NotFoundException(`beneficio con ${term}  no encontrado.`);
    }
    return beneficio;
  }

  async update(id: string, updateBeneficioDto: UpdateBeneficioDto) {
    const beneficio = await this.beneficioRepository.preload({
      id_beneficio: id, 
      ...updateBeneficioDto
    });

    if (!beneficio) {
      throw new BadRequestException(`Beneficio con ID ${id} no encontrado.`);
    }

    try {
      await this.beneficioRepository.save(beneficio);
      return beneficio;
    } catch (error) {
      this.handleException(error);
    }
  }


  remove(id: number) {
    return `This action removes a #${id} beneficio`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('El nombre de la empresa o rtn ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
