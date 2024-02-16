import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Afiliado } from 'src/modules/afiliado/entities/afiliado';
import { DetalleBeneficio, EstadoEnum } from './entities/detalle_beneficio.entity';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';
import { Planilla } from '../planilla/entities/planilla.entity';

@Injectable()
export class DetalleBeneficioService {
  private readonly logger = new Logger(DetalleBeneficioService.name)

  constructor(
  @InjectRepository(Afiliado)
  private readonly afiliadoRepository : Repository<Afiliado>,
  @InjectRepository(Beneficio)
  private readonly tipoBeneficioRepository : Repository<Beneficio>,
  @InjectRepository(DetalleBeneficio)
  private readonly benAfilRepository : Repository<DetalleBeneficio>,
  @InjectRepository(Planilla)
  private planillaRepository: Repository<Planilla>,
  @InjectEntityManager() private readonly entityManager: EntityManager
  ){

  }

  async getDetalleBeneficiosPorAfiliadoYPlanilla(idAfiliado: string, idPlanilla: string): Promise<any> {
    const query = `
      SELECT
        db."id_beneficio_planilla",
        db."id_afiliado",
        db."id_beneficio",
        db."estado",
        db."modalidad_pago",
        db."monto",
        db."num_rentas_aplicadas",
        db."periodoInicio",
        db."periodoFinalizacion",
        db."id_planilla"
      FROM
        "detalle_beneficio" db
      WHERE
        db."id_afiliado" = :idAfiliado
        AND db."id_planilla" = :idPlanilla
    `;
    try {
      // Asegúrate de pasar los parámetros como un array en el orden en que aparecen en la consulta
      const detalleBeneficios = await this.entityManager.query(query, [idAfiliado, idPlanilla]);
      return detalleBeneficios;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de beneficio por afiliado y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de beneficio por afiliado y planilla.');
    }
  }
  


  async getRangoDetalleBeneficios(idAfiliado: string, fechaInicio: string, fechaFin: string): Promise<any> {
    const query = `
      SELECT
        db."id_beneficio_planilla",
        db."estado",
        db."monto",
        db."modalidad_pago",
        db."num_rentas_aplicadas",
        db."periodoInicio",
        db."periodoFinalizacion",
        b."nombre_beneficio",
        afil."id_afiliado",
        TRIM(
          afil."primer_nombre" || ' ' || 
          COALESCE(afil."segundo_nombre", '') || ' ' || 
          COALESCE(afil."tercer_nombre", '') || ' ' || 
          afil."primer_apellido" || ' ' || 
          COALESCE(afil."segundo_apellido", '')
        ) AS "nombre_completo"
      FROM
        "C##TEST"."detalle_beneficio" db
      JOIN
        "C##TEST"."beneficio" b ON db."id_beneficio" = b."id_beneficio"
      JOIN
        "C##TEST"."afiliado" afil ON db."id_afiliado" = afil."id_afiliado"
      WHERE
        db."id_afiliado" = :idAfiliado
      AND
        db."estado" = 'NO PAGADA'
      AND
        (TO_DATE(db."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY')
         OR
         TO_DATE(db."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY'))
    `;
    try {
      const parametros = { idAfiliado, fechaInicio, fechaFin };
      return await this.benAfilRepository.query(query, [idAfiliado, fechaInicio, fechaFin, fechaInicio, fechaFin]);
    } catch (error) {
      this.logger.error('Error al obtener los detalles de beneficio', error.stack);
      throw new InternalServerErrorException('Error al consultar los detalles de beneficio en la base de datos');
    }
}

async obtenerDetallesBeneficioComplePorAfiliado(idAfiliado: string): Promise<any[]> {
  try {
    const query = `
      SELECT
        detB."id_beneficio_planilla",
        detB."monto",
        detB."estado",
        detB."modalidad_pago",
        detB."num_rentas_aplicadas",
        detB."periodoInicio",
        detB."periodoFinalizacion",
        afil."id_afiliado",
        afil."dni",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        ) AS "nombre_completo",
        ben."nombre_beneficio",
        ben."descripcion_beneficio"
      FROM
        "detalle_beneficio" detB
      JOIN
        "beneficio" ben ON detB."id_beneficio" = ben."id_beneficio"
      JOIN
        "afiliado" afil ON detB."id_afiliado" = afil."id_afiliado"
      WHERE
        afil."id_afiliado" = :1 AND
        detB."estado" != 'INCONSISTENCIA' AND
        detB."id_afiliado" NOT IN (
          SELECT
            detD."id_afiliado"
          FROM
            "detalle_deduccion" detD
          WHERE
            detD."estado_aplicacion" = 'COBRADA'
        )
        AND detB."id_afiliado" NOT IN (
          SELECT
            detB2."id_afiliado"
          FROM
            "detalle_beneficio" detB2
          WHERE
            detB2."estado" = 'PAGADA'
        )
      ORDER BY
        ben."id_beneficio"
    `;

    console.log(query);
    

    return await this.benAfilRepository.query(query, [idAfiliado]); // Usando un array para los parámetros
  } catch (error) {
    this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
    throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
  }
}

async actualizarPlanillaYEstadoDeBeneficio(detalles: { idBeneficioPlanilla: string; codigoPlanilla: string; estado: string }[], transactionalEntityManager?: EntityManager): Promise<DetalleBeneficio[]> {
  const resultados = [];
  const entityManager = transactionalEntityManager ? transactionalEntityManager : this.entityManager;

  for (const { idBeneficioPlanilla, codigoPlanilla, estado } of detalles) {
    const beneficio = await entityManager.findOne(DetalleBeneficio, { where: { id_beneficio_planilla: idBeneficioPlanilla } });
    if (!beneficio) {
      throw new NotFoundException(`DetalleBeneficio con ID "${idBeneficioPlanilla}" no encontrado`);
    }

    const planilla = await entityManager.findOne(Planilla, { where: { codigo_planilla: codigoPlanilla } });
    if (!planilla) {
      throw new NotFoundException(`Planilla con código "${codigoPlanilla}" no encontrada`);
    }

    beneficio.planilla = planilla;
    beneficio.estado = estado; // Actualiza el estado

    resultados.push(await entityManager.save(beneficio));
  }
  return resultados;
}


  async create(datos: any): Promise<any> {
    /* try {
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
    } */
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


  async findInconsistentBeneficiosByAfiliado(idAfiliado: string) {
    try {
      return await this.benAfilRepository.createQueryBuilder('detB')
        .innerJoinAndSelect('detB.beneficio', 'ben')
        .where('detB.estado = :estado', { estado: 'INCONSISTENCIA' })
        .andWhere('detB.afiliado = :idAfiliado', { idAfiliado })
        .select([
          'detB.id_beneficio_planilla', // ID del detalle beneficio
          'detB.periodoInicio',
          'detB.periodoFinalizacion',
          'ben.nombre_beneficio',
          'ben.id_beneficio', // Asumiendo que 'id_beneficio' es el nombre de la columna en la entidad 'beneficio'
          'detB.monto',
          'detB.estado'
        ])
        .getMany();
    } catch (error) {
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }
  
  
  
  


}
