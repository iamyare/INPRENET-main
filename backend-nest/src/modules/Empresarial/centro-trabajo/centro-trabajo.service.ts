import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './entities/net_centro-trabajo.entity';
import { Repository } from 'typeorm';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';

@Injectable()
export class CentroTrabajoService {

  private readonly logger = new Logger(CentroTrabajoService.name)

  constructor(

    @InjectRepository(Net_Centro_Trabajo)
    private readonly centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Provincia)
    private readonly provinciaRepository: Repository<Provincia>
    
  ){}

  
  async create(createCentroTrabajoDto: CreateCentroTrabajoDto) {
    try {
      const provincia = await this.provinciaRepository.findOneBy({ nombre_provincia: createCentroTrabajoDto.nombre_provincia });
      if (!provincia) {
        throw new BadRequestException('Provincia not found');
      }
  
      return await this.centroTrabajoRepository.save({
        ...createCentroTrabajoDto,
        provincia
      })
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    return `This action returns all centroTrabajo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} centroTrabajo`;
  }

  update(id: number, updateCentroTrabajoDto: UpdateCentroTrabajoDto) {
    return `This action updates a #${id} centroTrabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} centroTrabajo`;
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
