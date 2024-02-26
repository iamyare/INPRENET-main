import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { Net_Afiliado } from 'src/modules/afiliado/entities/net_afiliado';
import { DetallePagoBeneficio, EstadoEnum } from './entities/detalle_pago_beneficio.entity';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';
import { Planilla } from '../planilla/entities/planilla.entity';
import { DetalleBeneficioAfiliado } from './entities/detalle_beneficio_afiliado.entity';
import { AfiliadoService } from '../../afiliado/afiliado.service';

@Injectable()
export class DetalleBeneficioService {
  private readonly logger = new Logger(DetalleBeneficioService.name)

  constructor(
  @InjectRepository(Net_Afiliado)
  private  afiliadoRepository : Repository<Net_Afiliado>,
  private  AfiliadoService : AfiliadoService,
  
  @InjectRepository(Net_Beneficio)
  private readonly tipoBeneficioRepository : Repository<Net_Beneficio>,
  @InjectRepository(DetallePagoBeneficio)
  private readonly benAfilRepository : Repository<DetallePagoBeneficio>,
  @InjectRepository(Planilla)
  private planillaRepository: Repository<Planilla>,
  @InjectRepository(DetalleBeneficioAfiliado)
  private detalleBeneficioAfiliadoRepository: Repository<DetalleBeneficioAfiliado>,
  @InjectEntityManager() private readonly entityManager: EntityManager
  ){}

  async actualizarEstadoPorPlanilla(idPlanilla: string, nuevoEstado: string): Promise<{ mensaje: string }> {
    try {
      const resultado = await this.benAfilRepository.createQueryBuilder()
        .update(DetallePagoBeneficio)
        .set({ estado: nuevoEstado })
        .where("planilla.id_planilla = :idPlanilla", { idPlanilla })
        .execute();

      if (resultado.affected === 0) {
        throw new NotFoundException(`No se encontraron detalles de beneficio para la planilla con ID ${idPlanilla}`);
      }

      return { mensaje: `Estado actualizado a '${nuevoEstado}' para los detalles de beneficio de la planilla con ID ${idPlanilla}` };
    } catch (error) {
      throw new InternalServerErrorException('Se produjo un error al actualizar los estados de los detalles de beneficio');
    }
  }

  async createDetalleBeneficioAfiliado(datos: CreateDetalleBeneficioDto): Promise<any> {
    return await this.entityManager.transaction(async manager => {
        try {
            const afiliado = await manager.findOne(Net_Afiliado, { where: { dni: datos.dni } });
            if (!afiliado) {
                throw new BadRequestException('Afiliado no encontrado');
            }

            const beneficio = await manager.findOne(Net_Beneficio, { where: { nombre_beneficio: datos.nombre_beneficio } });
            if (!beneficio) {
                throw new BadRequestException('Tipo de beneficio no encontrado');
            }

            // Asumimos que convertirCadenaAFecha es una función que convierte una cadena de fecha en formato DD-MM-YYYY a un objeto Date
        const periodoInicio = this.convertirCadenaAFecha(datos.periodoInicio);
        const periodoFinalizacion = this.convertirCadenaAFecha(datos.periodoFinalizacion);

        // Verificar que las fechas sean válidas
        if (!periodoInicio || !periodoFinalizacion) {
            throw new BadRequestException('Formato de fecha inválido. Usa DD-MM-YYYY.');
        }

        const nuevoDetalleAfiliado = new DetalleBeneficioAfiliado();
        nuevoDetalleAfiliado.afiliado = afiliado;
        nuevoDetalleAfiliado.beneficio = beneficio;
        nuevoDetalleAfiliado.periodoInicio = periodoInicio;
        nuevoDetalleAfiliado.periodoFinalizacion = periodoFinalizacion;
        nuevoDetalleAfiliado.monto_total = datos.monto_total;
        nuevoDetalleAfiliado.monto_por_periodo = datos.monto_por_periodo;

            const detalleAfiliadoGuardado = await manager.save(nuevoDetalleAfiliado);

            const nuevoDetalleBeneficio = manager.create(DetallePagoBeneficio, {
                detalleBeneficioAfiliado: detalleAfiliadoGuardado,
                metodo_pago: datos.metodo_pago,
                monto_a_pagar: datos.monto_por_periodo,
            });

            await manager.save(nuevoDetalleBeneficio);

            return { detalleAfiliadoGuardado, nuevoDetalleBeneficio };
        } catch (error) {
            this.logger.error(`Error al crear DetalleBeneficioAfiliado y DetalleBeneficio: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error al crear registros, por favor intente más tarde.');
        }
    });
}

  async createBenBenefic(beneficiario: CreateDetalleBeneficioDto, idAfiliado:string): Promise<any> {
    console.log(idAfiliado);
    console.log(beneficiario);

    try {
      const query = `
        SELECT 
            "Afil"."id_afiliado",
            "Afil"."dni",
            "Afil"."primer_nombre",
            "Afil"."segundo_nombre",
            "Afil"."tercer_nombre",
            "Afil"."primer_apellido",
            "Afil"."segundo_apellido",
            "Afil"."sexo",
            "detA"."porcentaje",
            "detA"."tipo_afiliado"
        FROM
            "detalle_afiliado" "detA" INNER JOIN 
            "afiliado" "Afil" ON "detA"."id_afiliado" = "Afil"."id_afiliado"
        WHERE 
            "detA"."id_detalle_afiliado_padre" = ${idAfiliado} AND
            "Afil"."dni" = '${beneficiario.dni}' AND
            "detA"."tipo_afiliado" = 'BENEFICIARIO'
      `;
      
      const beneficiarios = await this.entityManager.query(query);
      console.log(beneficiarios);
        
      return beneficiarios;
    }catch{

    }
  }

  async getDetalleBeneficiosPorAfiliadoYPlanilla(idAfiliado: string, idPlanilla: string): Promise<any> {
    const query = `
    SELECT
        db."id_beneficio_planilla",
        detBA."id_afiliado",
        ben."nombre_beneficio",
        detBA."id_beneficio",
        db."estado",
        db."metodo_pago",
        db."monto_a_pagar" AS "monto",
        detBA."num_rentas_aplicadas",
        detBA."periodoInicio",
        detBA."periodoFinalizacion",
        db."id_planilla"
      FROM
        "detalle_pago_beneficio" db
      INNER JOIN 
        "detalle_beneficio_afiliado" detBA ON db."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
      INNER JOIN 
        "beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
      WHERE
        detBA."id_afiliado" = :idAfiliado
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
    db."monto_a_pagar" as "monto",
    db."metodo_pago",
    detBA."num_rentas_aplicadas",
    detBA."periodoInicio",
    detBA."periodoFinalizacion",
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
    "detalle_pago_beneficio" db
  JOIN
    "detalle_beneficio_afiliado" detBA ON db."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
  JOIN
    "net_beneficio" b ON detBA."id_beneficio" = b."id_beneficio"
  JOIN
    "Net_Afiliado" afil ON detBA."id_afiliado" = afil."id_afiliado"
  WHERE
    detBA."id_afiliado" = :idAfiliado
  AND
    db."estado" = 'NO PAGADA'
  AND
    (TO_DATE(detBA."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY')
     OR
     TO_DATE(detBA."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY'))
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
    detB."monto_a_pagar" as "monto",
    detB."estado",
    detB."metodo_pago",
    detBA."num_rentas_aplicadas",
    detBA."periodoInicio",
    detBA."periodoFinalizacion",
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
    "detalle_pago_beneficio" detB
      JOIN
        "detalle_beneficio_afiliado" detBA ON detBA."id_detalle_ben_afil" = detB."id_beneficio_afiliado"
      JOIN
        "beneficio" ben ON detBA."id_beneficio" = ben."id_beneficio"
      JOIN
        "afiliado" afil ON detBA."id_afiliado" = afil."id_afiliado"
      WHERE
        afil."id_afiliado" = :1 AND
        detB."estado" != 'INCONSISTENCIA' AND
        detBA."id_afiliado" NOT IN (
          SELECT
            detD."id_afiliado"
          FROM
            "detalle_deduccion" detD
          WHERE
            detD."estado_aplicacion" = 'COBRADA'
        )
        AND detBA."id_afiliado" NOT IN (
          SELECT
            detBA2."id_afiliado"
          FROM
            "detalle_beneficio_afiliado" detBA2
        JOIN
            "detalle_pago_beneficio" detB ON detBA2."id_detalle_ben_afil" = detB."id_beneficio_afiliado"
          WHERE
            detB."estado" = 'PAGADA'
        )
      ORDER BY
        ben."id_beneficio"
    `;

    return await this.benAfilRepository.query(query, [idAfiliado]); // Usando un array para los parámetros
  } catch (error) {
    this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
    throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
  }
}

async obtenerBeneficiosDeAfil(dni: string): Promise<any[]> {
  try {
      const query = `SELECT  
      ben."id_beneficio", ben."nombre_beneficio", 
      detBenAfil."num_rentas_aplicadas",
      detBenAfil."monto_total",
      ben."numero_rentas_max" 
      FROM "net_beneficio" ben
      INNER JOIN "detalle_beneficio_afiliado" detBenAfil ON  
      detBenAfil."id_beneficio" = ben."id_beneficio"
      INNER JOIN "Net_Afiliado" afil ON  
      detBenAfil."id_afiliado" = afil."id_afiliado"
      WHERE 
      afil."dni" = '${dni}'`;
    return await this.benAfilRepository.query(query); // Usando un array para los parámetros
  } catch (error) {
    this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
    throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
  }
}

async actualizarPlanillaYEstadoDeBeneficio(detalles: { idBeneficioPlanilla: string; codigoPlanilla: string; estado: string }[], transactionalEntityManager?: EntityManager): Promise<DetallePagoBeneficio[]> {
  const resultados = [];
  const entityManager = transactionalEntityManager ? transactionalEntityManager : this.entityManager;

  for (const { idBeneficioPlanilla, codigoPlanilla, estado } of detalles) {
    const beneficio = await entityManager.findOne(DetallePagoBeneficio, { where: { id_beneficio_planilla: idBeneficioPlanilla } });
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

  /* async create(datos: any): Promise<any> {
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
  } */

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
    let benAfil: DetallePagoBeneficio;
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
      const query = `
      SELECT detB."id_beneficio_planilla",
        detBA."periodoInicio",
        detBA."periodoFinalizacion",
        ben."nombre_beneficio",
        ben."id_beneficio",
        detB."monto_a_pagar" as "monto",
        detB."estado"
      FROM "detalle_pago_beneficio" detB
      INNER JOIN "detalle_beneficio_afiliado" detBA ON detB."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
      INNER JOIN "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
      WHERE detB."estado" = 'INCONSISTENCIA'
    `;
    return await this.benAfilRepository.query(query); 

      /* return await this.benAfilRepository.createQueryBuilder('detB')
        .innerJoinAndSelect('detB.beneficiINo', 'ben')
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
        .getMany(); */
    } catch (error) {
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }
  
}