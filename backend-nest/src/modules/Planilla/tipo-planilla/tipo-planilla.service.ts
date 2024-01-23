import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTipoPlanillaDto } from './dto/create-tipo-planilla.dto';
import { UpdateTipoPlanillaDto } from './dto/update-tipo-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TipoPlanilla } from './entities/tipo-planilla.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class TipoPlanillaService {

  private readonly logger = new Logger(TipoPlanillaService.name)

  constructor(
    @InjectRepository(TipoPlanilla)
    private readonly tipoPlanillaRepository: Repository<TipoPlanilla>, 
  ){

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

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.tipoPlanillaRepository.find({
      take: limit,
      skip : offset
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoPlanilla`;
  }

  update(id: number, updateTipoPlanillaDto: UpdateTipoPlanillaDto) {
    return `This action updates a #${id} tipoPlanilla`;
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
