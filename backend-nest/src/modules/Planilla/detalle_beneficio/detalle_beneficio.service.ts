import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { DetalleBeneficio, EstadoEnum } from './entities/detalle_beneficio.entity';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';

@Injectable()
export class DetalleBeneficioService {
  private readonly logger = new Logger(DetalleBeneficioService.name)
  
  @InjectRepository(Afiliado)
  private readonly afiliadoRepository : Repository<Afiliado>
  @InjectRepository(Beneficio)
  private readonly tipoBeneficioRepository : Repository<Beneficio>

  @InjectRepository(DetalleBeneficio)
  private readonly benAfilRepository : Repository<DetalleBeneficio>

  async create(datos: any): Promise<any> {
    try {
      const afiliado = await this.afiliadoRepository.findOne({
        where: { dni: datos.dni },
      });
      if (!afiliado) {
        throw new BadRequestException('Afiliado no encontrado');
      }

      const tipoBeneficio = await this.tipoBeneficioRepository.findOne({
        where: { nombre_beneficio: datos.tipo_beneficio },
      });
      if (!tipoBeneficio) {
        throw new BadRequestException('Tipo de beneficio no encontrado');
      }

      // Conversión de las fechas
      const periodoInicio = this.convertirCadenaAFecha(datos.periodoInicio);
      const periodoFinalizacion = this.convertirCadenaAFecha(datos.periodoFinalizacion);

      // Verificar que las fechas sean válidas
      if (!periodoInicio || !periodoFinalizacion) {
        throw new BadRequestException('Formato de fecha inválido. Usa DD-MM-YYYY.');
      }

      // Creación del nuevo detalle de beneficio
      const nuevoDetalle = this.benAfilRepository.create({
        afiliado,
        beneficio: tipoBeneficio,
        periodoInicio,
        periodoFinalizacion,
        monto: datos.monto,
        estado: datos.estado || 'NO PAGADO',  // Asume un estado por defecto si no se proporciona
        modalidad_pago: datos.modalidad_pago,
        num_rentas_aplicadas: datos.num_rentas_aplicadas,
      });

      return await this.benAfilRepository.save(nuevoDetalle);
    } catch (error) {
      this.handleException(error);
    }
  }

  private convertirCadenaAFecha(cadena: string): Date | null {
    const partes = cadena.split('-');
    if (partes.length === 3) {
      const [dia, mes, año] = partes.map(parte => parseInt(parte, 10));
      const fecha = new Date(año, mes - 1, dia);
      if (!isNaN(fecha.getTime())) {
        return fecha;
      }
    }
    return null;
  }

  findAll() {
    return `This action returns all beneficioPlanilla`;
  }

  async findOne(term: string) {
    let benAfil: DetalleBeneficio;
    if (isUUID(term)) {
      benAfil = await this.benAfilRepository.findOneBy({ id_beneficio_planilla: term });
    } else {
      const queryBuilder = this.benAfilRepository.createQueryBuilder('afiliado');
      benAfil = await queryBuilder
        .where('"id_beneficio_planilla" = :term', { term })
        .getOne();
    }
    if (!benAfil) {
      throw new NotFoundException(`el beneficio  ${term} para el afiliado no existe no existe`);
    }
    return benAfil;
  }

  update(id: number, updateDetalleBeneficioDto: UpdateDetalleBeneficioDto) {
    return `This action updates a #${id} beneficioPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficioPlanilla`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    // Verifica si el error es un BadRequestException y propaga el mismo
    if (error instanceof BadRequestException) {
      throw error;
    }
    // Verifica errores específicos de la base de datos o de la lógica de negocio
    if (error.driverError && error.driverError.errorNum) {
      // Aquí puedes agregar más condiciones según los códigos de error específicos de tu base de datos
      if (error.driverError.errorNum === 1) {
        throw new BadRequestException('El beneficio ya fue asignado');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
  

  async findByDateRange(fechaInicio: Date, fechaFin: Date, idAfiliado: string): Promise<DetalleBeneficio[]> {
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
      throw new BadRequestException('El rango de fechas proporcionado no es válido.');
    }
  
    try {
      return await this.benAfilRepository.find({
        where: {
          afiliado: { id_afiliado: idAfiliado },
          periodoInicio: MoreThanOrEqual(fechaInicio),
          periodoFinalizacion: LessThanOrEqual(fechaFin),
          estado: Not(EstadoEnum.INCONSISTENCIA)
        },
        relations: ['afiliado', 'beneficio']
      });
    } catch (error) {
      this.logger.error(`Error al buscar detalles de beneficio por rango de fechas y afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar detalles de beneficio por rango de fechas y afiliado');
    }
  }



  async findInconsistentBeneficiosByAfiliado(idAfiliado: string) {
    try {
      return await this.benAfilRepository.createQueryBuilder('detB')
        .innerJoinAndSelect('detB.beneficio', 'ben')
        .where('detB.estado = :estado', { estado: 'INCONSISTENCIA' })
        .andWhere('detB.afiliado = :idAfiliado', { idAfiliado })
        .select(['ben.nombre_beneficio', 'detB.monto', 'detB.estado'])
        .getMany();
    } catch (error) {
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }
  
  
  


}
