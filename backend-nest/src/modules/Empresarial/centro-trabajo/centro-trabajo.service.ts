import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from '../entities/net_centro_trabajo.entity';
import { Repository } from 'typeorm';
import { Net_Departamento } from '../../Regional/provincia/entities/net_departamento.entity';
@Injectable()
export class CentroTrabajoService {

  private readonly logger = new Logger(CentroTrabajoService.name)

  constructor(

    @InjectRepository(Net_Centro_Trabajo)
    private readonly centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Departamento)
    private readonly departamentoRepository: Repository<Net_Departamento>

  ) { }


  async create(createCentroTrabajoDto: CreateCentroTrabajoDto) {
    try {
      const departamento = await this.departamentoRepository.findOneBy({ nombre_departamento: createCentroTrabajoDto.nombre_departamento });
      if (!departamento) {
        throw new BadRequestException('departamento not found');
      }

      return await this.centroTrabajoRepository.save({
        ...createCentroTrabajoDto,
        departamento
      })
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(): Promise<Net_Centro_Trabajo[]> {
    try {
      return await this.centroTrabajoRepository.find();
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAllPriv(): Promise<Net_Centro_Trabajo[]> {
    try {
      return await this.centroTrabajoRepository.find({where: {sector_economico:"PRIVADO"}, order: {nombre_centro_trabajo: "ASC"}});
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(id: number): Promise<Net_Centro_Trabajo> {
    const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo: id } });
    if (!centroTrabajo) {
      throw new NotFoundException(`Centro de Trabajo con ID ${id} no encontrado`);
    }
    return centroTrabajo;
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
