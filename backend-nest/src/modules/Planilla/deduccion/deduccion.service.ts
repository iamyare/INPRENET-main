import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Institucion } from '../../Empresarial/entities/net_institucion.entity';
import { Net_Deduccion } from './entities/net_deduccion.entity';
@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(Net_Deduccion)
    public deduccionRepository: Repository<Net_Deduccion>,
    @InjectRepository(Net_Institucion)
    private institucionRepository: Repository<Net_Institucion>
  ) { }

  async create(createDeduccionDto: CreateDeduccionDto): Promise<Net_Deduccion> {
    const existingDeduccion = await this.deduccionRepository.findOne({
        where: { codigo_deduccion: createDeduccionDto.codigo_deduccion }
    });

    if (existingDeduccion) {
        throw new BadRequestException('El código de deducción ya existe.');
    }
    const institucion = await this.institucionRepository.findOne({
        where: { nombre_institucion: createDeduccionDto.nombre_institucion }
    });

    if (!institucion && createDeduccionDto.nombre_institucion) {
        throw new NotFoundException(`Institución con nombre '${createDeduccionDto.nombre_institucion}' no encontrada.`);
    }
    const deduccion = this.deduccionRepository.create({
        ...createDeduccionDto,
        institucion: institucion
    });

    try {
        await this.deduccionRepository.save(deduccion);
        return deduccion;
    } catch (error) {
        if (error.code === 'ORA-00001') {
            throw new BadRequestException('El código de deducción ya existe.');
        } else {
            console.error('Error al guardar la deducción:', error);
            throw new InternalServerErrorException('Ha ocurrido un error al crear la deducción.');
        }
    }
}

  async findAll() {
    /* return this.deduccionRepository.find() */
    try {
      const queryBuilder = await this.deduccionRepository
        .createQueryBuilder('net_deduccion')
        .addSelect('net_deduccion.id_deduccion', 'id_deduccion')
        .addSelect('net_deduccion.nombre_deduccion', 'nombre_deduccion')
        .addSelect('net_deduccion.descripcion_deduccion', 'descripcion_deduccion')
        .addSelect('net_deduccion.prioridad', 'prioridad')
        .addSelect('institucion.nombre_institucion', 'nombre_institucion')
        .innerJoin(Net_Institucion, 'institucion', 'institucion.id_institucion = "net_deduccion".id_institucion')
        .getRawMany();

      return queryBuilder;

    } catch (error) {
      console.log(error);

    }
  }

  async findOneByNombInst(nombre_institucion: string) {
    if (nombre_institucion) {
      const queryBuilder = await this.deduccionRepository
        .createQueryBuilder('NET_DEDUCCION')
        .addSelect('NET_DEDUCCION.ID_DEDUCCION', 'ID_DEDUCCION')
        .addSelect('NET_DEDUCCION.NOMBRE_DEDUCCION', 'NOMBRE_DEDUCCION')
        .innerJoin(Net_Institucion, 'INSTITUCION', 'NET_DEDUCCION.ID_INSTITUCION = INSTITUCION.ID_INSTITUCION')
        .where(`INSTITUCION.NOMBRE_INSTITUCION = '${nombre_institucion}'`)
        .getRawMany();
      return queryBuilder;
    } else {
      throw new NotFoundException(`la deduccion para la empresa ${nombre_institucion} no fue encontrada.`);
    }
  }

  async findOne(id: number) {
    const deduccion = await this.deduccionRepository.findOne({ where: { id_deduccion: id } });
    if (!deduccion) {
      throw new BadRequestException(`deduccion con ID ${id} no encontrado.`);
    }
    return deduccion;
  }

  async update(id_deduccion: number, updateDeduccionDto: UpdateDeduccionDto) {
    const deduccion = await this.deduccionRepository.preload({
      id_deduccion: id_deduccion,
      ...updateDeduccionDto
    });

    if (!deduccion) {
      throw new BadRequestException(`deduccion con ID ${id_deduccion} no encontrado.`);
    }

    try {
      await this.deduccionRepository.save(deduccion);
      return deduccion;
    } catch (error) {
      this.handleException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} deduccion`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('La deduccion ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
