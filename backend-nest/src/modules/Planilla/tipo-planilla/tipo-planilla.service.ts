import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTipoPlanillaDto } from './dto/create-tipo-planilla.dto';
import { UpdateTipoPlanillaDto } from './dto/update-tipo-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_TipoPlanilla } from './entities/tipo-planilla.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class TipoPlanillaService {

  private readonly logger = new Logger(TipoPlanillaService.name)

  constructor(
    @InjectRepository(Net_TipoPlanilla)
    private readonly tipoPlanillaRepository: Repository<Net_TipoPlanilla>,
  ) {

  }


  async create(createTipoPlanillaDto: CreateTipoPlanillaDto) {
    try {
      const tipoPlanilla = this.tipoPlanillaRepository.create(createTipoPlanillaDto);
      await this.tipoPlanillaRepository.save(tipoPlanilla);
      return tipoPlanilla;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto, clasePlanilla?: string) {
    const { limit = 10, offset = 0 } = paginationDto
    if (clasePlanilla) {
      return this.tipoPlanillaRepository.find({ where: { clase_planilla: clasePlanilla } })
    } else {
      return this.tipoPlanillaRepository.find()
    }
    /* {

    }
      take: limit,
      skip : offset
    } */
  }

  async findOne(id: number) {
    const tipoPlanilla = await this.tipoPlanillaRepository.findOne({ where: { id_tipo_planilla: id } });
    if (!tipoPlanilla) {
      throw new BadRequestException(`TipoPlanilla con ID ${id} no encontrado.`);
    }
    return tipoPlanilla;
  }


  async update(id: number, updateTipoPlanillaDto: UpdateTipoPlanillaDto) {
    const tipoPlanilla = await this.tipoPlanillaRepository.preload({
      id_tipo_planilla: id,
      ...updateTipoPlanillaDto
    });

    if (!tipoPlanilla) {
      throw new BadRequestException(`TipoPlanilla con ID ${id} no encontrado.`);
    }

    try {
      await this.tipoPlanillaRepository.save(tipoPlanilla);
      return tipoPlanilla;
    } catch (error) {
      this.handleException(error);
    }
  }


  remove(id: number) {
    return `This action removes a #${id} tipoPlanilla`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
