import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import { Net_Afiliado } from 'src/modules/afiliado/entities/net_afiliado';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { Net_Deduccion } from '../deduccion/entities/net_deduccion.entity';
import { Net_Planilla } from './entities/net_planilla.entity';
import { Net_TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Pago_Beneficio } from '../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
/* import { DetallePagoBeneficio } from '../detalle_beneficio/entities/detalle_pago_beneficio.entity';
import { Planilla } from './entities/planilla.entity';
import { TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity'; */
import { isUUID } from 'class-validator';
import { DetalleBeneficioService } from '../detalle_beneficio/detalle_beneficio.service';
import { DetalleDeduccionService } from '../detalle-deduccion/detalle-deduccion.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private detalleBeneficioRepository: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_Afiliado)
    private afiliadoRepository: Repository<Net_Afiliado>,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectRepository(Net_TipoPlanilla)
    private tipoPlanillaRepository: Repository<Net_TipoPlanilla>,
    private detalleBeneficioService: DetalleBeneficioService,
    private detalleDeduccionService: DetalleDeduccionService){
  };

    async update(id_planilla: string, updatePlanillaDto: UpdatePlanillaDto): Promise<Net_Planilla> {
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

  async generarVoucher(idPlanilla: string, dni: string): Promise<any> {
    if (!isUUID(idPlanilla)) {
      throw new BadRequestException('El ID de la planilla no es válido');
    }

    try {
      const beneficios = await this.entityManager.query(
        `SELECT
            ben."id_beneficio",
            ben."nombre_beneficio",
            SUM(COALESCE(dpb."monto_a_pagar", 0)) AS "Total Monto Beneficio"
        FROM
            "beneficio" ben
        INNER JOIN
            "net_detalle_beneficio_afiliado" dba ON ben."id_beneficio" = dba."id_beneficio"
        INNER JOIN
            "net_detalle_pago_beneficio" dpb ON dba."id_detalle_ben_afil" = dpb."id_beneficio_afiliado"
        INNER JOIN
            "net_afiliado" afil ON dba."id_afiliado" = afil."id_afiliado"
        WHERE
            dpb."id_planilla" = :idPlanilla AND afil."dni" = :dni
        GROUP BY
            ben."id_beneficio", ben."nombre_beneficio"`,
        [ idPlanilla, dni ]
      );

      const deducciones = await this.entityManager.query(
        `SELECT
            ded."id_deduccion",
            ded."nombre_deduccion" || ' - ' || inst."nombre_institucion" AS "nombre_deduccion",
            COALESCE(SUM(detDed."monto_aplicado"), 0) AS "Total Monto Aplicado"
        FROM
            "net_detalle_deduccion" detDed
        INNER JOIN
            "deduccion" ded ON detDed."id_deduccion" = ded."id_deduccion"
        LEFT JOIN
            "institucion" inst ON detDed."id_institucion" = inst."id_institucion"
        INNER JOIN
            "net_afiliado" afil ON detDed."id_afiliado" = afil."id_afiliado"
        WHERE
            detDed."id_planilla" = :idPlanilla AND afil."dni" = :dni
        GROUP BY
            ded."id_deduccion", ded."nombre_deduccion", inst."nombre_institucion"`,
        [ idPlanilla, dni ]
      );

      return { beneficios, deducciones };
    } catch (error) {
      this.logger.error('Error al obtener los totales por DNI y planilla', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getTotalPorDedYBen(idPlanilla: string): Promise<any> {
    if (!isUUID(idPlanilla)) {
        throw new BadRequestException('El ID de la planilla no es válido');
    }

    try {
        const beneficios = await this.entityManager.query(
            `SELECT
                ben."id_beneficio",
                ben."nombre_beneficio",
                SUM(COALESCE(dpb."monto_a_pagar", 0)) AS "Total Monto Beneficio"
            FROM
                "beneficio" ben
            INNER JOIN
                "net_detalle_beneficio_afiliado" dba ON ben."id_beneficio" = dba."id_beneficio"
            INNER JOIN
                "net_detalle_pago_beneficio" dpb ON dba."id_detalle_ben_afil" = dpb."id_beneficio_afiliado"
            WHERE
                dpb."id_planilla" = :idPlanilla
            GROUP BY
                ben."id_beneficio", ben."nombre_beneficio"`,
            [idPlanilla]
        );

        // La consulta de deducciones permanece sin cambios, ya que no se menciona una modificación en esa parte
        const deducciones = await this.entityManager.query(
          `SELECT
              ded."id_deduccion",
              ded."nombre_deduccion" || ' - ' || inst."nombre_institucion" AS "nombre_deduccion",
              COALESCE(SUM(detDed."monto_aplicado"), 0) AS "Total Monto Aplicado"
          FROM
              "detalle_deduccion" detDed
          INNER JOIN
              "deduccion" ded ON detDed."id_deduccion" = ded."id_deduccion"
          LEFT JOIN
              "institucion" inst ON detDed."id_institucion" = inst."id_institucion"
          WHERE
              detDed."id_planilla" = :idPlanilla
          GROUP BY
              ded."id_deduccion", ded."nombre_deduccion", inst."nombre_institucion"`,  // Agregado el nombre de la institución al GROUP BY
          [idPlanilla]
      );
      
        return { beneficios, deducciones };
    } catch (error) {
        this.logger.error('Error al obtener los totales por planilla', error.stack);
        throw new InternalServerErrorException();
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
        SUM(COALESCE(detBs."monto_a_pagar", 0)) AS "Total Beneficio"
      FROM
        "Net_Afiliado" afil
      LEFT JOIN
        "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
      LEFT JOIN
        "net_detalle_pago_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
        AND detBs."id_planilla" = :idPlanilla
      GROUP BY
        afil."id_afiliado"
      ) beneficio
    INNER JOIN
      (SELECT
        afil."id_afiliado",
        SUM(COALESCE(detDs."monto_aplicado", 0)) AS "Total Deducciones"
      FROM
        "Net_Afiliado" afil
      LEFT JOIN
        "detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
        AND detDs."id_planilla" = :idPlanilla
      GROUP BY
        afil."id_afiliado"
      ) deduccion ON beneficio."id_afiliado" = deduccion."id_afiliado"
      `;
  
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
      COALESCE(deducciones."tipo_afiliado", beneficios."tipo_afiliado") AS "tipo_afiliado",
      COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
      beneficios."Total Beneficio",
      deducciones."Total Deducciones"
  FROM
      (SELECT
              afil."id_afiliado",
              afil."dni",
              detAf."tipo_afiliado",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
              SUM(detBs."monto_a_pagar") AS "Total Beneficio"
        FROM
              "Net_Afiliado" afil
        INNER JOIN
              "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
              
        LEFT JOIN
          "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado" 
          AND TO_DATE(detBA."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
          AND TO_DATE(detBA."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
        LEFT JOIN
          "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
        LEFT JOIN
          "net_detalle_pago_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
          AND detBs."estado" = 'NO PAGADA' 
          
        GROUP BY
              afil."id_afiliado",
              afil."dni",
              detAf."tipo_afiliado",
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
              detAf."tipo_afiliado",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
              SUM(detDs."monto_aplicado") AS "Total Deducciones"
        FROM
              "Net_Afiliado" afil
        INNER JOIN
              "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
        LEFT JOIN
              "detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
              AND detDs."estado_aplicacion" = 'NO COBRADA'
              AND TO_DATE(CONCAT(detDs."anio", LPAD(detDs."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
        LEFT JOIN
              "net_deduccion" ded ON ded."id_deduccion" = detDs."id_deduccion"
  
        GROUP BY
              afil."id_afiliado",
              afil."dni",
              detAf."tipo_afiliado",
              TRIM(
                  afil."primer_nombre" || ' ' ||
                  COALESCE(afil."segundo_nombre", '') || ' ' ||
                  COALESCE(afil."tercer_nombre", '') || ' ' ||
                  afil."primer_apellido" || ' ' ||
                  COALESCE(afil."segundo_apellido", ''))) deducciones ON deducciones."id_afiliado" = beneficios."id_afiliado"
  WHERE
      ((deducciones."id_afiliado" IS NOT NULL AND EXISTS (
                  SELECT detD."id_afiliado"
                  FROM "detalle_deduccion" detD
                  WHERE  detD."estado_aplicacion" = 'COBRADA' AND
                  detD."id_afiliado" = deducciones."id_afiliado"
              ))
      OR
      (beneficios."id_afiliado" IS NOT NULL AND EXISTS (
                  SELECT detBA."id_afiliado"
                  FROM "net_detalle_beneficio_afiliado" detBA
                  LEFT JOIN
                      "net_detalle_pago_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
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
       COALESCE(deducciones."tipo_afiliado", beneficios."tipo_afiliado") AS "tipo_afiliado",
       COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
       beneficios."Total Beneficio",
       deducciones."Total Deducciones"
FROM
    (SELECT
        afil."id_afiliado",
        afil."dni",
        detAf."tipo_afiliado",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')) AS NOMBRE_COMPLETO,
            SUM(detBs."monto_a_pagar") AS "Total Beneficio"
    FROM
        "Net_Afiliado" afil
    INNER JOIN
        "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    
    LEFT JOIN
        "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
        "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
    LEFT JOIN
        "net_detalle_pago_beneficio" detBs ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
        
    WHERE
        detBs."estado" = 'INCONSISTENCIA'
    GROUP BY
        detAf."tipo_afiliado",
        afil."id_afiliado", afil."dni", TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')))  beneficios
FULL OUTER JOIN
    (SELECT
        detAf."tipo_afiliado",
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
        "Net_Afiliado" afil
    INNER JOIN
        "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
    LEFT JOIN
        "net_deduccion" ded ON ded."id_deduccion" = detDs."id_deduccion" 
    WHERE
        detDs."estado_aplicacion" = 'INCONSISTENCIA'
    GROUP BY
        detAf."tipo_afiliado",
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
    COALESCE(deducciones."tipo_afiliado", beneficios."tipo_afiliado") AS "tipo_afiliado",
    COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS NOMBRE_COMPLETO,
    beneficios."Total Beneficio",
    deducciones."Total Deducciones"
FROM
    (SELECT
        afil."id_afiliado",
        afil."dni",
        detAf."tipo_afiliado",
        detBs."estado",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        ) AS NOMBRE_COMPLETO,
        SUM(detBs."monto_a_pagar") AS "Total Beneficio"
    FROM
        "Net_Afiliado" afil
    LEFT JOIN
        "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
        "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
    LEFT JOIN
        "net_detalle_pago_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
        
    INNER JOIN
        "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    WHERE
        detBs."estado" = 'NO PAGADA' AND
        detBA."id_afiliado" NOT IN (
            SELECT
                detBA."id_afiliado"
            FROM
                "net_detalle_beneficio_afiliado" detBA
            LEFT JOIN
                "net_detalle_pago_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
            WHERE
                detBs."estado" NOT IN ('NO PAGADA', 'INCONSISTENCIA')
        )  AND
        detBs."estado" != 'INCONSISTENCIA'
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        detAf."tipo_afiliado",
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
        detAf."tipo_afiliado",
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
        "Net_Afiliado" afil
    INNER JOIN
        "detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
    LEFT JOIN
        "net_deduccion" ded ON detDs."id_deduccion" = ded."id_deduccion"
    WHERE
        detDs."estado_aplicacion" = 'NO COBRADA' AND
        (
            detDs."id_afiliado" NOT IN (
                SELECT detD."id_afiliado"
                FROM "detalle_deduccion" detD
                WHERE detD."estado_aplicacion" NOT IN ('NO COBRADA', 'INCONSISTENCIA')
            )
        ) AND
        detDs."estado_aplicacion" != 'INCONSISTENCIA' AND
        NOT EXISTS (
            SELECT 1
            FROM "detalle_deduccion" detD
            WHERE detD."id_afiliado" = afil."id_afiliado" AND detD."estado_aplicacion" = 'COBRADA'
        ) AND
        NOT EXISTS (
            SELECT 1
                FROM "net_detalle_pago_beneficio" detB
            LEFT JOIN
                "net_detalle_beneficio_afiliado" detBA ON detB."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
            WHERE 
                detBA."id_afiliado" = afil."id_afiliado" AND detB."estado" = 'PAGADA'
        )
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        detAf."tipo_afiliado",
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
    COALESCE(deducciones."Total Deducciones", 0) AS "Total Deducciones",
    COALESCE(deducciones."correo_1", beneficios."correo_1") AS "correo_1",
    COALESCE(deducciones."fecha_cierre", beneficios."fecha_cierre") AS "fecha_cierre"
FROM
    (SELECT
        afil."id_afiliado",
        afil."dni",
        afil."correo_1",
        TRIM(
            afil."primer_nombre" || ' ' ||
            COALESCE(afil."segundo_nombre", '') || ' ' ||
            COALESCE(afil."tercer_nombre", '') || ' ' ||
            afil."primer_apellido" || ' ' ||
            COALESCE(afil."segundo_apellido", '')
        ) AS "NOMBRE_COMPLETO",
        SUM(COALESCE(detBs."monto_a_pagar", 0)) AS "Total Beneficio",
        pla."fecha_cierre"
    FROM
        "net_afiliado" afil
    LEFT JOIN
        "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
    LEFT JOIN
        "net_detalle_pago_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
    LEFT JOIN
        "planilla" pla ON detBs."id_planilla" = pla."id_planilla"
    WHERE
        pla."id_planilla" = '${idPlanilla}'
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        afil."correo_1",
        pla."fecha_cierre",
        TRIM(
            afil."primer_nombre" || ' ' ||
            COALESCE(afil."segundo_nombre", '') || ' ' ||
            COALESCE(afil."tercer_nombre", '') || ' ' ||
            afil."primer_apellido" || ' ' ||
            COALESCE(afil."segundo_apellido", '')
        )
    HAVING
        SUM(COALESCE(detBs."monto_a_pagar", 0)) > 0
    ) beneficios
FULL OUTER JOIN
    (SELECT
        afil."id_afiliado",
        afil."dni",
        afil."correo_1",
        TRIM(
            afil."primer_nombre" || ' ' ||
            COALESCE(afil."segundo_nombre", '') || ' ' ||
            COALESCE(afil."tercer_nombre", '') || ' ' ||
            afil."primer_apellido" || ' ' ||
            COALESCE(afil."segundo_apellido", '')
        ) AS "NOMBRE_COMPLETO",
        SUM(COALESCE(detDs."monto_aplicado", 0)) AS "Total Deducciones",
        pla."fecha_cierre"
    FROM
        "net_afiliado" afil
    LEFT JOIN
        "detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
    LEFT JOIN
        "planilla" pla ON detDs."id_planilla" = pla."id_planilla"
    WHERE
        pla."id_planilla" = '${idPlanilla}'
    GROUP BY
        afil."id_afiliado",
        afil."dni",
        afil."correo_1",
        pla."fecha_cierre",
        TRIM(
            afil."primer_nombre" || ' ' ||
            COALESCE(afil."segundo_nombre", '') || ' ' ||
            COALESCE(afil."tercer_nombre", '') || ' ' ||
            afil."primer_apellido" || ' ' ||
            COALESCE(afil."segundo_apellido", '')
        )
    HAVING
        SUM(COALESCE(detDs."monto_aplicado", 0)) > 0
    ) deducciones
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
        .innerJoin(Net_TipoPlanilla, 'tipP', 'tipP.id_tipo_planilla = planilla.id_tipo_planilla')
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
    .leftJoin(Net_Detalle_Deduccion, 'detD', 'afil.id_afiliado = detD.id_afiliado')
    .leftJoin(Net_Deduccion, 'ded', 'detD.id_deduccion = ded.id_deduccion')
    .leftJoin(Net_Detalle_Pago_Beneficio, 'detB', 'afil.id_afiliado = detB.id_afiliado')
    .leftJoin(Net_Beneficio, 'ben', 'detB.id_beneficio = ben.id_beneficio')
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
      .leftJoin(Net_Afiliado, 'afil', 'afil.id_afiliado = detBen.id_afiliado')
      .leftJoin(Net_Beneficio, 'ben', 'ben.id_beneficio = detBen.id_beneficio')
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
    let Planilla: Net_Planilla;
    
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
      .innerJoin(Net_TipoPlanilla, 'tipP', 'tipP.id_tipo_planilla = planilla.id_tipo_planilla')
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