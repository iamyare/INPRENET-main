import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Deduccion } from './entities/net_deduccion.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(Net_Deduccion)
    public deduccionRepository: Repository<Net_Deduccion>,
    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Detalle_Deduccion)
    private detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>
  ) { }

  async obtenerDeduccionesPorAnioMes(dni: string, anio: number, mes: number): Promise<any> {
    try {
      const persona = await this.personaRepository.findOne({ where: { n_identificacion: dni } });
  
      if (!persona) {
        throw new InternalServerErrorException('Persona no encontrada');
      }
  
      const deducciones = await this.detalleDeduccionRepository.find({
        where: {
          persona: { id_persona: persona.id_persona },
          anio: anio,
          mes: mes,
        },
        relations: [
          'deduccion',
          'detalle_pago_beneficio',
          'detalle_pago_beneficio.planilla',
          'deduccion.centroTrabajo', // Asegúrate de que esta relación esté bien definida en la entidad
        ],
      });
  
      const resultado = {
        persona: {
          n_identificacion: persona.n_identificacion,
          nombre_completo: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim(),
          genero: persona.genero,
          fecha_nacimiento: persona.fecha_nacimiento,
          estado_civil: persona.estado_civil,
          fallecido: persona.fallecido,
          direccion_residencia: persona.direccion_residencia,
          telefono: persona.telefono_1,
        },
        deducciones: deducciones.map(d => ({
          deduccion_id: d.deduccion,
          monto_aplicado: d.monto_aplicado,
          estado_aplicacion: d.estado_aplicacion,
          anio: d.anio,
          mes: d.mes,
          fecha_aplicado: d.fecha_aplicado,
          //planilla: d.detalle_pago_beneficio.planilla ? d.detalle_pago_beneficio.planilla.codigo_planilla : 'N/A',
          centro_trabajo: d.deduccion.centroTrabajo ? d.deduccion.centroTrabajo.nombre_centro_trabajo : 'N/A', // Ajuste aquí
        })),
      };
  
      return resultado;
  
    } catch (error) {
      this.logger.error(`Error al obtener deducciones para el DNI ${dni}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener deducciones');
    }
  }
  


  async create(createDeduccionDto: CreateDeduccionDto): Promise<Net_Deduccion> {
    const existingDeduccion = await this.deduccionRepository.findOne({
        where: { codigo_deduccion: createDeduccionDto.codigo_deduccion }
    });

    if (existingDeduccion) {
        throw new BadRequestException('El código de deducción ya existe.');
    }
    const institucion = await this.centroTrabajoRepository.findOne({
        where: { nombre_centro_trabajo: createDeduccionDto.nombre_institucion }
    });

    if (!institucion && createDeduccionDto.nombre_institucion) {
        throw new NotFoundException(`Institución con nombre '${createDeduccionDto.nombre_institucion}' no encontrada.`);
    }
    const deduccion = this.deduccionRepository.create({
        ...createDeduccionDto,
        centroTrabajo: institucion
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
        .addSelect('centrotrabajo.nombre_centro_trabajo', 'nombre_centro_trabajo')
        .innerJoin(Net_Centro_Trabajo, 'centrotrabajo', 'centrotrabajo.id_centro_trabajo = "centrotrabajo".id_centro_trabajo')
        .getRawMany();

      return queryBuilder;

    } catch (error) {
      console.log(error);

    }
  }

  async findOneByNombInst(nombre_centro_trabajo: string) {
    if (nombre_centro_trabajo) {
      const queryBuilder = await this.deduccionRepository
        .createQueryBuilder('NET_DEDUCCION')
        .addSelect('NET_DEDUCCION.ID_DEDUCCION', 'ID_DEDUCCION')
        .addSelect('NET_DEDUCCION.NOMBRE_DEDUCCION', 'NOMBRE_DEDUCCION')
        .innerJoin(Net_Centro_Trabajo, 'INSTITUCION', 'NET_DEDUCCION.ID_INSTITUCION = INSTITUCION.ID_INSTITUCION')
        .where(`CENTROTRABAJO.NOMBRE_CENTRO_TRABAJO = '${nombre_centro_trabajo}'`)
        .getRawMany();
      return queryBuilder;
    } else {
      throw new NotFoundException(`la deduccion para la empresa ${nombre_centro_trabajo} no fue encontrada.`);
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
