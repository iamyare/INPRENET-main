import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficio } from './entities/beneficio.entity';

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

  findOne(id: number) {
    return `This action returns a #${id} beneficio`;
  }

  update(id: number, updateBeneficioDto: UpdateBeneficioDto) {
    return `This action updates a #${id} beneficio`;
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
