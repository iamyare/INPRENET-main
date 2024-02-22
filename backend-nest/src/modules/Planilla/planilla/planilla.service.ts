import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import { Afiliado } from 'src/modules/afiliado/entities/afiliado';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { DetalleBeneficio } from '../detalle_beneficio/entities/detalle_beneficio.entity';
import { Planilla } from './entities/planilla.entity';
import { TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { isUUID } from 'class-validator';
import { DetalleBeneficioService } from '../detalle_beneficio/detalle_beneficio.service';
import { DetalleDeduccionService } from '../detalle-deduccion/detalle-deduccion.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(DetalleBeneficio)
    private detalleBeneficioRepository: Repository<DetalleBeneficio>,
    @InjectRepository(Afiliado)
    private afiliadoRepository: Repository<Afiliado>,
    @InjectRepository(Planilla)
    private planillaRepository: Repository<Planilla>,
    @InjectRepository(TipoPlanilla)
    private tipoPlanillaRepository: Repository<TipoPlanilla>,
    private detalleBeneficioService: DetalleBeneficioService,
    private detalleDeduccionService: DetalleDeduccionService){};

    async update(id_planilla: string, updatePlanillaDto: UpdatePlanillaDto): Promise<Planilla> {
      const planilla = await this.planillaRepository.preload({
          id_planilla: id_planilla,
          ...updatePlanillaDto
      });
  
      if (!planilla) throw new NotFoundException(`Planilla con el ID: ${id_planilla} no encontrada`);
  
      try {
          await this.planillaRepository.save(planilla);
          return planilla;
      } catch (error) {
          this.handleException(error); // Asegúrate de tener un método para manejar las excepciones
      }
  }

  async calcularTotalPlanilla(idPlanilla: string): Promise<any> {
    if (!isUUID(idPlanilla)) {
      throw new BadRequestException('El identificador de la planilla no es válido.');
    }
  
    const query = `
    SELECT
    SUM(beneficio."Total Beneficio") AS "Total Beneficio",
    SUM(deduccion."Total Deducciones") AS "Total Deducciones",
    SUM(beneficio."Total Beneficio") - SUM(deduccion."Total Deducciones") AS "Total Planilla"
  FROM
    (SELECT
      afil."id_afiliado",
      SUM(COALESCE(detBA."monto_por_periodo", 0)) AS "Total Beneficio"
    FROM
      "C##TEST"."afiliado" afil
    LEFT JOIN
      "C##TEST"."detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
      "C##TEST"."detalle_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
      AND detBs."id_planilla" = :idPlanilla
    GROUP BY
      afil."id_afiliado"
    ) beneficio
  INNER JOIN
    (SELECT
      afil."id_afiliado",
      SUM(COALESCE(detDs."monto_aplicado", 0)) AS "Total Deducciones"
    FROM
      "C##TEST"."afiliado" afil
    LEFT JOIN
      "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
      AND detDs."id_planilla" = :idPlanilla
    GROUP BY
      afil."id_afiliado"
    ) deduccion ON beneficio."id_afiliado" = deduccion."id_afiliado"
    `;
    console.log(query);
    
    try {
      const result = await this.entityManager.query(query, [idPlanilla, idPlanilla]);
      // Si esperas un solo resultado, puedes directamente devolver ese objeto.
      return {
          totalBeneficio: Number(result[0]["Total Beneficio"]),
          totalDeducciones: Number(result[0]["Total Deducciones"]),
          totalPlanilla: Number(result[0]["Total Planilla"])
      };
  } catch (error) {
      this.logger.error(`Error al calcular el total de la planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al calcular el total de la planilla.');
    }
  }
  
  

    async actualizarBeneficiosYDeduccionesConTransaccion(detallesBeneficios: any[], detallesDeducciones: any[]): Promise<void> {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
          try {
              // Asegúrate de que `detallesBeneficios` y `detallesDeducciones` se traten como arrays
              for (const detalleBeneficio of detallesBeneficios) {
                  await this.detalleBeneficioService.actualizarPlanillaYEstadoDeBeneficio([detalleBeneficio], transactionalEntityManager);
              }
  
              for (const detalleDeduccion of detallesDeducciones) {
                  await this.detalleDeduccionService.actualizarPlanillasYEstadosDeDeducciones([detalleDeduccion], transactionalEntityManager);
              }
          } catch (error) {
              this.logger.error('Error en la transacción para actualizar beneficios y deducciones', error);
              throw new InternalServerErrorException('Fallo en la actualización de beneficios y deducciones');
          }
      });
  }

    async obtenerAfilOrdinaria(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
      const query = `
      SELECT
      COALESCE(deducciones."id_afiliado", beneficios."id_afiliado") AS "id_afiliado",
      COALESCE(deducciones."dni", beneficios."dni") AS "dni",
      COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
      beneficios."Total Beneficio",
      deducciones."Total Deducciones"
  FROM
      (SELECT
              afil."id_afiliado",
              afil."dni",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
              SUM(detBA."monto_por_periodo") AS "Total Beneficio"
        FROM
              "C##TEST"."afiliado" afil
        INNER JOIN
              "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
              
        LEFT JOIN
          "C##TEST"."detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado" 
          AND TO_DATE(detBA."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
          AND TO_DATE(detBA."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
        LEFT JOIN
          "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
        LEFT JOIN
          "C##TEST"."detalle_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
          AND detBs."estado" = 'NO PAGADA' 
          
        GROUP BY
              afil."id_afiliado",
              afil."dni",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", ''))) beneficios
  
  FULL OUTER JOIN
      (SELECT
              afil."id_afiliado",
              afil."dni",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
              SUM(detDs."monto_aplicado") AS "Total Deducciones"
        FROM
              "C##TEST"."afiliado" afil
        INNER JOIN
              "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
        LEFT JOIN
              "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
              AND detDs."estado_aplicacion" = 'NO COBRADA'
              AND TO_DATE(CONCAT(detDs."anio", LPAD(detDs."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
        LEFT JOIN
              "C##TEST"."deduccion" ded ON ded."id_deduccion" = detDs."id_deduccion"
  
        GROUP BY
              afil."id_afiliado",
              afil."dni",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", ''))) deducciones ON deducciones."id_afiliado" = beneficios."id_afiliado"
  WHERE
      ((deducciones."id_afiliado" IS NOT NULL AND EXISTS (
                  SELECT detD."id_afiliado"
                  FROM "C##TEST"."detalle_deduccion" detD
                  WHERE  detD."estado_aplicacion" = 'COBRADA' AND
                  detD."id_afiliado" = deducciones."id_afiliado"
              ))
      OR
      (beneficios."id_afiliado" IS NOT NULL AND EXISTS (
                  SELECT detBA."id_afiliado"
                  FROM "C##TEST"."detalle_beneficio_afiliado" detBA
                  LEFT JOIN
                      "C##TEST"."detalle_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
                  WHERE detBs."estado" = 'PAGADA' AND
                      detBA."id_afiliado" = beneficios."id_afiliado"
              ))) AND beneficios."Total Beneficio" IS NOT NULL AND
              beneficios."Total Beneficio" IS NOT NULL

      `;

      try {
        return await this.entityManager.query(query);
      } catch (error) {
        this.logger.error('Error ejecutando la consulta de obtenerAfilOrdinaria', error.stack);
        throw new InternalServerErrorException('Error al ejecutar la consulta en la base de datos');
      }
    }

    async obtenerAfilExtraordinaria(): Promise<any> {
      const query = `
      SELECT COALESCE(deducciones."id_afiliado", beneficios."id_afiliado") AS "id_afiliado",
       COALESCE(deducciones."dni", beneficios."dni") AS "dni",
       COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
       beneficios."Total Beneficio",
       deducciones."Total Deducciones"
FROM
    (SELECT
        afil."id_afiliado",
        afil."dni",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
            SUM(detBA."monto_por_periodo") AS "Total Beneficio"
    FROM
        "C##TEST"."afiliado" afil
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    
    LEFT JOIN
        "C##TEST"."detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
        "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
    LEFT JOIN
        "C##TEST"."detalle_beneficio" detBs ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
        
    WHERE
        detBs."estado" = 'INCONSISTENCIA'
    GROUP BY
        afil."id_afiliado", afil."dni", TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')))  beneficios
FULL OUTER JOIN
    (SELECT
        afil."id_afiliado",
        afil."dni",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
            SUM(detDs."monto_aplicado") AS "Total Deducciones"
    FROM
        "C##TEST"."afiliado" afil
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
    LEFT JOIN
        "C##TEST"."deduccion" ded ON ded."id_deduccion" = detDs."id_deduccion" 
    WHERE
        detDs."estado_aplicacion" = 'INCONSISTENCIA'
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')))  deducciones

    ON beneficios."id_afiliado" = deducciones."id_afiliado"
      `;
       
       
      try {
        return await this.entityManager.query(query);
      } catch (error) {
        this.logger.error('Error ejecutando la consulta de obtenerAfilExtraordinaria', error.stack);
        throw new InternalServerErrorException('Error al ejecutar la consulta en la base de datos');
      }
    }

    async obtenerAfilComplementaria(): Promise<any> {
      const query = `
      SELECT 
    COALESCE(deducciones."id_afiliado", beneficios."id_afiliado") AS "id_afiliado",
    COALESCE(deducciones."dni", beneficios."dni") AS "dni",
    COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS NOMBRE_COMPLETO,
    beneficios."Total Beneficio",
    deducciones."Total Deducciones"
FROM
    (SELECT
        afil."id_afiliado",
        afil."dni",
        detBs."estado",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        ) AS NOMBRE_COMPLETO,
        SUM(detBA."monto_por_periodo") AS "Total Beneficio"
    FROM
        "C##TEST"."afiliado" afil
    LEFT JOIN
        "C##TEST"."detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
        "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
    LEFT JOIN
        "C##TEST"."detalle_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
        
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    WHERE
        detBs."estado" = 'NO PAGADA' AND
        detBA."id_afiliado" NOT IN (
            SELECT
                detBA."id_afiliado"
            FROM
                "C##TEST"."detalle_beneficio_afiliado" detBA
            LEFT JOIN
                "C##TEST"."detalle_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
            WHERE
                detBs."estado" NOT IN ('NO PAGADA', 'INCONSISTENCIA')
        )  AND
        detBs."estado" != 'INCONSISTENCIA'
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        detBs."estado",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        )
    ) beneficios
FULL OUTER JOIN
    (SELECT
        afil."id_afiliado",
        afil."dni",
        detDs."estado_aplicacion",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        ) AS NOMBRE_COMPLETO,
        SUM(detDs."monto_aplicado") AS "Total Deducciones"
    FROM
        "C##TEST"."afiliado" afil
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
    LEFT JOIN
        "C##TEST"."deduccion" ded ON detDs."id_deduccion" = ded."id_deduccion"
    WHERE
        detDs."estado_aplicacion" = 'NO COBRADA' AND
        (
            detDs."id_afiliado" NOT IN (
                SELECT detD."id_afiliado"
                FROM "C##TEST"."detalle_deduccion" detD
                WHERE detD."estado_aplicacion" NOT IN ('NO COBRADA', 'INCONSISTENCIA')
            )
        ) AND
        detDs."estado_aplicacion" != 'INCONSISTENCIA' AND
        NOT EXISTS (
            SELECT 1
            FROM "C##TEST"."detalle_deduccion" detD
            WHERE detD."id_afiliado" = afil."id_afiliado" AND detD."estado_aplicacion" = 'COBRADA'
        ) AND
        NOT EXISTS (
            SELECT 1
                FROM "C##TEST"."detalle_beneficio" detB
            LEFT JOIN
                "C##TEST"."detalle_beneficio_afiliado" detBA ON detB."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
            WHERE 
                detBA."id_afiliado" = afil."id_afiliado" AND detB."estado" = 'PAGADA'
        )
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        detDs."estado_aplicacion",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')

        )
    )  deducciones ON deducciones."id_afiliado" = beneficios."id_afiliado"
    WHERE
        deducciones."estado_aplicacion" = 'NO COBRADA' AND beneficios."estado" = 'NO PAGADA'
      `;
      try {
        return await this.entityManager.query(query);
      } catch (error) {
        this.logger.error('Error ejecutando la consulta de obtenerAfilComplementaria', error.stack);
        throw new InternalServerErrorException('Error al ejecutar la consulta en la base de datos');
      }
    }

    async ObtenerPreliminar(idPlanilla: string): Promise<any> {
      const query = `
      SELECT
      COALESCE(deducciones."id_afiliado", beneficios."id_afiliado") AS "id_afiliado",
      COALESCE(deducciones."dni", beneficios."dni") AS "dni",
      COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
      COALESCE(beneficios."Total Beneficio", 0) AS "Total Beneficio",
      COALESCE(deducciones."Total Deducciones", 0) AS "Total Deducciones"
  FROM
      (SELECT
          afil."id_afiliado",
          afil."dni",
          TRIM(
              afil."primer_nombre" || ' ' ||
              COALESCE(afil."segundo_nombre", '') || ' ' ||
              COALESCE(afil."tercer_nombre", '') || ' ' ||
              afil."primer_apellido" || ' ' ||
              COALESCE(afil."segundo_apellido", '')) AS "NOMBRE_COMPLETO",
          SUM(COALESCE(detBA."monto_por_periodo", 0)) AS "Total Beneficio"
      FROM
          "C##TEST"."afiliado" afil
      LEFT JOIN
          "C##TEST"."detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
      LEFT JOIN
          "C##TEST"."detalle_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
          AND detBs."id_planilla" = '${idPlanilla}'
      GROUP BY
          afil."id_afiliado",
          afil."dni",
          TRIM(
              afil."primer_nombre" || ' ' ||
              COALESCE(afil."segundo_nombre", '') || ' ' ||
              COALESCE(afil."tercer_nombre", '') || ' ' ||
              afil."primer_apellido" || ' ' ||
              COALESCE(afil."segundo_apellido", '')) 
      HAVING
          SUM(COALESCE(detBA."monto_por_periodo", 0)) > 0) beneficios
  FULL OUTER JOIN
      (SELECT
          afil."id_afiliado",
          afil."dni",
          TRIM(
              afil."primer_nombre" || ' ' ||
              COALESCE(afil."segundo_nombre", '') || ' ' ||
              COALESCE(afil."tercer_nombre", '') || ' ' ||
              afil."primer_apellido" || ' ' ||
              COALESCE(afil."segundo_apellido", '')) AS "NOMBRE_COMPLETO",
          SUM(COALESCE(detDs."monto_aplicado", 0)) AS "Total Deducciones"
      FROM
          "C##TEST"."afiliado" afil
      LEFT JOIN
          "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
          AND detDs."id_planilla" = '${idPlanilla}'
      GROUP BY
          afil."id_afiliado",
          afil."dni",
          TRIM(
              afil."primer_nombre" || ' ' ||
              COALESCE(afil."segundo_nombre", '') || ' ' ||
              COALESCE(afil."tercer_nombre", '') || ' ' ||
              afil."primer_apellido" || ' ' ||
              COALESCE(afil."segundo_apellido", '')) 
      HAVING
          SUM(COALESCE(detDs."monto_aplicado", 0)) > 0) deducciones
  ON deducciones."id_afiliado" = beneficios."id_afiliado"
      `;
      try {
        const result = await this.entityManager.query(query);
        return result;
      } catch (error) {
        this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
      }
    }

    async ObtenerPlanDefin(codPlanilla: string): Promise<any> {
      if (codPlanilla) {
        const queryBuilder = await this.planillaRepository
        .createQueryBuilder('planilla')
        .addSelect('planilla.id_planilla', 'id_planilla')
        .addSelect('planilla.codigo_planilla', 'codigo_planilla')
        .addSelect('planilla.fecha_apertura', 'fecha_apertura')
        .addSelect('planilla.secuencia', 'secuencia')
        .addSelect('planilla.estado', 'estado')
        .addSelect('planilla.periodoInicio', 'periodoInicio')
        .addSelect('planilla.periodoFinalizacion', 'periodoFinalizacion')
        .addSelect('tipP.nombre_planilla', 'nombre_planilla')
        .innerJoin(TipoPlanilla, 'tipP', 'tipP.id_tipo_planilla = planilla.id_tipo_planilla')
        .where(`planilla.codigo_planilla = '${codPlanilla}'  AND planilla.estado = \'CERRADA\' ` )
        .getRawMany();

        return queryBuilder[0];
        } else {
          throw new NotFoundException(`planilla con ${codPlanilla} no encontrado.`);
      }
    }

  async create(createPlanillaDto: CreatePlanillaDto) {
    const { codigo_planilla, secuencia, periodoInicio, periodoFinalizacion, nombre_planilla,  } = createPlanillaDto;

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOneBy({ nombre_planilla: createPlanillaDto.nombre_planilla });
      
      if (tipoPlanilla && tipoPlanilla.id_tipo_planilla) {

          const planilla =  this.planillaRepository.create({
            "codigo_planilla": codigo_planilla,
            "secuencia": secuencia,
            "periodoInicio": periodoInicio,
            "periodoFinalizacion": periodoFinalizacion,
            "tipoPlanilla": tipoPlanilla
          })
          await this.planillaRepository.save(planilla)
          return planilla;
        
      } else {
          throw new Error("No se encontró ningún tipo de planilla con el nombre proporcionado");
      }
      
      
    } catch (error) {
      this.handleException(error);
    }
    return 'This action adds a new planilla';
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.planillaRepository.find({
      take: limit,
      skip: offset,
      relations: ['tipoPlanilla'], // Agrega esta línea para cargar la relación
    });
  }
  

  async getDeduccionesNoAplicadas(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryBuilder  = await this.afiliadoRepository
    .createQueryBuilder('afil')
    .select([
      'afil.id_afiliado',
      'afil.dni',
      'afil.primer_nombre',
      'LISTAGG(DISTINCT ben.id_beneficio, \',\') AS beneficiosIds',
      'LISTAGG(DISTINCT ben.nombre_beneficio, \',\') AS beneficiosNombres',
      'LISTAGG(DISTINCT ded.id_deduccion, \',\') AS deduccionesIds',
      'LISTAGG(DISTINCT ded.nombre_deduccion, \',\') AS deduccionesNombres',
    ])
    .leftJoin(DetalleDeduccion, 'detD', 'afil.id_afiliado = detD.id_afiliado')
    .leftJoin(Deduccion, 'ded', 'detD.id_deduccion = ded.id_deduccion')
    .leftJoin(DetalleBeneficio, 'detB', 'afil.id_afiliado = detB.id_afiliado')
    .leftJoin(Beneficio, 'ben', 'detB.id_beneficio = ben.id_beneficio')
    .where(`
      (TO_DATE(detB.periodoInicio, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoInicio}', 'DD-MM-YYYY')) AND
      (TO_DATE(detB.periodoFinalizacion, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')) OR
      (TO_DATE(CONCAT(detD.anio, LPAD(detD.mes, 2, '0')), 'YYYYMM') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY'))
    `)
    .groupBy('afil.id_afiliado, afil.primer_nombre, afil.dni');
  return queryBuilder.getRawMany();
  }

  async getBeneficiosNoAplicados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const resultado = await this.detalleBeneficioRepository
      .createQueryBuilder('detBen')
      .select('detBen.id_afiliado', 'id_afiliado')
      .select('detBen.id_beneficio', 'id_beneficio')
      .addSelect('afil.primer_nombre', 'primer_nombre')
      .addSelect('afil.segundo_nombre', 'segundo_nombre')
      .addSelect('afil.primer_apellido', 'primer_apellido')
      .addSelect('afil.segundo_apellido', 'segundo_apellido')
      .addSelect('afil.dni', 'dni')
      .addSelect('detBen.monto', 'monto')
      .addSelect('detBen.nombre_beneficio', 'nombre_beneficio')
      .leftJoin(Afiliado, 'afil', 'afil.id_afiliado = detBen.id_afiliado')
      .leftJoin(Beneficio, 'ben', 'ben.id_beneficio = detBen.id_beneficio')
      .where(`
      (TO_DATE(detBen.periodoInicio, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoInicio}', 'DD-MM-YYYY')) AND
      (TO_DATE(detBen.periodoFinalizacion, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY'))
      `, {
        periodoInicio: periodoInicio,
        periodoFinalizacion: periodoFinalizacion,
      })
      .getRawMany();
    return resultado;
  }

  /* 
    * Busca planillas que esten activas
   */
  async findOne(term: any) {
    let Planilla: Planilla;
    
    if (isUUID(term)) {
      Planilla = await this.planillaRepository.findOneBy({ id_planilla: term});
    } else {
      const queryBuilder = await this.planillaRepository
      .createQueryBuilder('planilla')
      .addSelect('planilla.id_planilla', 'id_planilla')
      .addSelect('planilla.codigo_planilla', 'codigo_planilla')
      .addSelect('planilla.fecha_apertura', 'fecha_apertura')
      .addSelect('planilla.secuencia', 'secuencia')
      .addSelect('planilla.estado', 'estado')
      .addSelect('planilla.periodoInicio', 'periodoInicio')
      .addSelect('planilla.periodoFinalizacion', 'periodoFinalizacion')
      .addSelect('tipP.nombre_planilla', 'nombre_planilla')
      .innerJoin(TipoPlanilla, 'tipP', 'tipP.id_tipo_planilla = planilla.id_tipo_planilla')
      .where('planilla.codigo_planilla = :term AND planilla.estado = \'ACTIVA\'', { term } )
      .getRawMany();
      return queryBuilder[0];
      
      /* Planilla = await queryBuilder */
    }
    if (!Planilla) {
      throw new NotFoundException(`planilla con ${term} no encontrado.`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
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