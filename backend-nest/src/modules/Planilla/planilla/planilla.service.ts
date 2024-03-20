import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, Repository, getConnection } from 'typeorm';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { Net_Planilla } from './entities/net_planilla.entity';
import { Net_TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Pago_Beneficio } from '../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { isUUID } from 'class-validator';
import { DetalleBeneficioService } from '../detalle_beneficio/detalle_beneficio.service';
import { DetalleDeduccionService } from '../detalle-deduccion/detalle-deduccion.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Net_Deduccion } from '../deduccion/entities/net_deduccion.entity';
import { Net_Detalle_Beneficio_Afiliado } from '../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';
import { Net_Detalle_Afiliado } from 'src/modules/afiliado/entities/Net_detalle_persona.entity';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private detalleBeneficioRepository: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_Persona)
    private personaRepository: Repository<Net_Persona>,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectRepository(Net_TipoPlanilla)
    private tipoPlanillaRepository: Repository<Net_TipoPlanilla>,
    private detalleBeneficioService: DetalleBeneficioService,
    @InjectRepository(Net_Detalle_Beneficio_Afiliado)
    private readonly detalleBeneficioAfiliadoRepository: Repository<Net_Detalle_Beneficio_Afiliado>,
    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private readonly detallePagoBeneficioRepository: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_Detalle_Deduccion)
    private readonly detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
    @InjectRepository(Net_Deduccion)
    private readonly deduccionRepository: Repository<Net_Deduccion>,) {
  };

  async findOne(codigoPlanilla: string): Promise<Net_Planilla | undefined> {
    const planilla = await this.planillaRepository.findOne({
      where: { codigo_planilla: codigoPlanilla, estado: 'ACTIVA' },
      relations: ['tipoPlanilla'],
    });

    if (!planilla) {
      throw new NotFoundException(`Planilla con código ${codigoPlanilla} no encontrada.`);
    }

    return planilla;
  }

  async getPlanillaOrdinariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI, 
        TRIM(
            p.PRIMER_NOMBRE || ' ' || 
            COALESCE(p.SEGUNDO_NOMBRE, '') || ' ' || 
            COALESCE(p.TERCER_NOMBRE, '') || ' ' || 
            p.PRIMER_APELLIDO || ' ' || 
            COALESCE(p.SEGUNDO_APELLIDO, '')
        ) AS NOMBRE_COMPLETO,
        bens."Total Beneficio", 
        COALESCE(deds."Total Deducciones", 0) AS "Total Deducciones"
      FROM 
        NET_PERSONA p
      JOIN (
        SELECT
            dba.ID_BENEFICIARIO AS ID_BENEFICIARIO,
            SUM(dpb.monto_a_pagar) AS "Total Beneficio"
        FROM
            NET_DETALLE_BENEFICIO_AFILIADO dba
        JOIN
            NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
        WHERE
            dba.ID_BENEFICIARIO = dba.ID_CAUSANTE AND
            dpb.estado = 'NO PAGADA' AND
            dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
            EXISTS (
                SELECT 1
                FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
                JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
                WHERE dpb_inner.estado = 'PAGADA' AND
                dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
                dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
            )
        GROUP BY
            dba.ID_BENEFICIARIO
        HAVING 
            SUM(dpb.monto_a_pagar) > 0
      ) bens ON p.ID_PERSONA = bens.ID_BENEFICIARIO
      LEFT JOIN (
        SELECT 
            dd.ID_PERSONA AS ID_PERSONA,
            SUM(dd.MONTO_APLICADO) AS "Total Deducciones"
        FROM 
            NET_DETALLE_DEDUCCION dd
        INNER JOIN 
            NET_PERSONA per ON per.ID_PERSONA = dd.ID_PERSONA
        INNER JOIN 
            NET_DETALLE_PERSONA detPer ON detPer.ID_PERSONA = dd.ID_PERSONA
        INNER JOIN 
            NET_TIPO_PERSONA tipoPer ON tipoPer.ID_TIPO_AFILIADO = detPer.ID_TIPO_PERSONA
        INNER JOIN 
            NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
        
        WHERE
            tipoPer.TIPO_AFILIADO = 'AFILIADO' AND
            d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS') AND
            dd.ESTADO_APLICACION = 'NO COBRADA' AND
            TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
            BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
            AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
        GROUP BY 
            dd.ID_PERSONA
      ) deds ON p.ID_PERSONA = deds.ID_PERSONA
    `;
    const parameters: any = { periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getDesgloseBeneficiosOrdinariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryBeneficios = `
    SELECT 
      p.DNI, 
      dpb.ID_BENEFICIO_PLANILLA,
      b.NOMBRE_BENEFICIO,
      dpb.MONTO_A_PAGAR
    FROM 
      NET_PERSONA p
    JOIN 
      NET_DETALLE_BENEFICIO_AFILIADO dba ON p.ID_PERSONA = dba.ID_BENEFICIARIO
    JOIN 
      NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
    JOIN 
      NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
    WHERE 
      dba.ID_BENEFICIARIO = dba.ID_CAUSANTE AND
      dpb.estado = 'NO PAGADA' AND
      dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
      EXISTS (
          SELECT 1
          FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
          JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
          WHERE dpb_inner.estado = 'PAGADA' AND
          dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
          dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
      )
    `;

    return await this.entityManager.query(queryBeneficios, [periodoInicio, periodoFinalizacion]);
  }

  async getDesgloseDeduccionesOrdinariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryDeducciones = `
    SELECT 
        p.DNI, 
        dd.ID_DED_DEDUCCION,
        d.NOMBRE_DEDUCCION,
        dd.MONTO_APLICADO
    FROM 
        NET_PERSONA p
    INNER JOIN 
        NET_DETALLE_DEDUCCION dd ON p.ID_PERSONA = dd.ID_PERSONA
    INNER JOIN 
        NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
    WHERE 
        d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS') AND
        dd.ESTADO_APLICACION = 'NO COBRADA' AND
        TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
        BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY') AND
        p.ID_PERSONA IN (
            SELECT dba.ID_BENEFICIARIO
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba
            INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
            WHERE 
                dba.ID_BENEFICIARIO = dba.ID_CAUSANTE AND
                dpb.estado = 'NO PAGADA' AND
                dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
                EXISTS (
                    SELECT 1
                    FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
                    JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
                    WHERE dpb_inner.estado = 'PAGADA' AND
                    dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
                    dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
                )
            GROUP BY dba.ID_BENEFICIARIO
            HAVING SUM(dpb.monto_a_pagar) > 0
        )
    `;

    return await this.entityManager.query(queryDeducciones, [periodoInicio, periodoFinalizacion, periodoInicio, periodoFinalizacion]);
  }

  async beneficiosOrdinariaDeAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        b.NOMBRE_BENEFICIO,
        SUM(dpb.monto_a_pagar) AS "MontoAPagar"
      FROM 
        NET_DETALLE_BENEFICIO_AFILIADO dba
      JOIN 
        NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      JOIN 
        NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
      JOIN 
        NET_PERSONA p ON dba.ID_BENEFICIARIO = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND dba.ID_BENEFICIARIO = dba.ID_CAUSANTE 
        AND dpb.estado = 'NO PAGADA'
        AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
      GROUP BY 
        p.DNI,
        b.NOMBRE_BENEFICIO
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async deduccionesOrdinariaDeAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        d.NOMBRE_DEDUCCION,
        SUM(dd.MONTO_APLICADO) AS "MontoAplicado"
      FROM 
        NET_DETALLE_DEDUCCION dd
      JOIN 
        NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
      JOIN 
        NET_PERSONA p ON dd.ID_PERSONA = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
        AND dd.ESTADO_APLICACION = 'NO COBRADA'
        AND (
            TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
            BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
            AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
        )
      GROUP BY 
        p.DNI,
        d.NOMBRE_DEDUCCION
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getPlanillaOrdinariaBenef(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
    SELECT 
    p.DNI, 
    TRIM(
        p.PRIMER_NOMBRE || ' ' || 
        COALESCE(p.SEGUNDO_NOMBRE, '') || ' ' || 
        COALESCE(p.TERCER_NOMBRE, '') || ' ' || 
        p.PRIMER_APELLIDO || ' ' || 
        COALESCE(p.SEGUNDO_APELLIDO, '')
    ) AS NOMBRE_COMPLETO,
    bens."Total Beneficio", 
    COALESCE(deds."Total Deducciones", 0) AS "Total Deducciones"
  FROM 
    NET_PERSONA p
  JOIN (
      SELECT
          dba.ID_BENEFICIARIO AS ID_BENEFICIARIO,
          SUM(dpb.monto_a_pagar) AS "Total Beneficio"
      FROM
          NET_DETALLE_BENEFICIO_AFILIADO dba
      JOIN
          NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      WHERE
          dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
          dpb.estado = 'NO PAGADA'
          AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
          AND EXISTS (
              SELECT 1
              FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
              JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
              WHERE dpb_inner.estado = 'PAGADA'
              AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
              AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
          )
      GROUP BY
          dba.ID_BENEFICIARIO
      HAVING 
          SUM(dpb.monto_a_pagar) > 0
  ) bens ON p.ID_PERSONA = bens.ID_BENEFICIARIO
  LEFT JOIN (
      SELECT 
          dd.ID_PERSONA AS ID_PERSONA,
          SUM(dd.MONTO_APLICADO) AS "Total Deducciones"
          FROM 
          NET_DETALLE_DEDUCCION dd
      INNER JOIN 
          NET_PERSONA per ON per.ID_PERSONA = dd.ID_PERSONA
      INNER JOIN 
          NET_DETALLE_PERSONA detPer ON detPer.ID_PERSONA = dd.ID_PERSONA
      INNER JOIN 
          NET_TIPO_PERSONA tipoPer ON tipoPer.ID_TIPO_AFILIADO = detPer.ID_TIPO_PERSONA
      INNER JOIN 
          NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
      
      WHERE
          tipoPer.TIPO_AFILIADO = 'BENEFICIARIO' AND
          d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
          AND dd.ESTADO_APLICACION = 'NO COBRADA'
          AND (
              TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
              BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
              AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
          )
      GROUP BY 
          dd.ID_PERSONA
  ) deds ON p.ID_PERSONA = deds.ID_PERSONA
    `;

    const parameters: any = { periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getDesgloseBeneficiosOrdinariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryBeneficiosDetallados = `
    SELECT 
    p.DNI, 
    dpb.ID_BENEFICIO_PLANILLA, -- Cambio realizado aquí
    b.NOMBRE_BENEFICIO,
    dpb.MONTO_A_PAGAR
FROM 
    NET_PERSONA p
JOIN 
    NET_DETALLE_BENEFICIO_AFILIADO dba ON p.ID_PERSONA = dba.ID_BENEFICIARIO
JOIN 
    NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
JOIN 
    NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
WHERE 
    dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
    dpb.estado = 'NO PAGADA' AND
    dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
    EXISTS (
        SELECT 1
        FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
        JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
        WHERE dpb_inner.estado = 'PAGADA' AND
        dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
        dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
    )
`;

    return await this.entityManager.query(queryBeneficiosDetallados, [periodoInicio, periodoFinalizacion]);
  }

  async getDesgloseDeduccionesOrdinariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryDeducciones = `
    SELECT 
        p.DNI,
        dd.ID_DED_DEDUCCION,
        d.NOMBRE_DEDUCCION,
        dd.MONTO_APLICADO
    FROM 
        NET_DETALLE_DEDUCCION dd
    JOIN 
        NET_PERSONA p ON p.ID_PERSONA = dd.ID_PERSONA
    JOIN 
        NET_DEDUCCION d ON d.ID_DEDUCCION = dd.ID_DEDUCCION
    JOIN 
        NET_DETALLE_PERSONA detPer ON detPer.ID_PERSONA = dd.ID_PERSONA
    JOIN 
        NET_TIPO_PERSONA tipoPer ON tipoPer.ID_TIPO_AFILIADO = detPer.ID_TIPO_PERSONA
    WHERE
        tipoPer.TIPO_AFILIADO = 'BENEFICIARIO' AND
        d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS') AND
        dd.ESTADO_APLICACION = 'NO COBRADA' AND
        TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY') AND
        p.ID_PERSONA IN (
            SELECT dba.ID_BENEFICIARIO
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba
            INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
            WHERE
                dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
                dpb.estado = 'NO PAGADA' AND
                dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
                EXISTS (
                    SELECT 1
                    FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
                    JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
                    WHERE dpb_inner.estado = 'PAGADA' AND
                    dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
                    dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
                )
            GROUP BY dba.ID_BENEFICIARIO
            HAVING SUM(dpb.monto_a_pagar) > 0
        )
    `;

    return await this.entityManager.query(queryDeducciones, [periodoInicio, periodoFinalizacion, periodoInicio, periodoFinalizacion]);
  }

  async beneficiosOrdinariaDeBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        b.NOMBRE_BENEFICIO,
        dpb.monto_a_pagar AS "MontoAPagar",
        dpb.estado AS "EstadoDelPago",
        dpb.FECHA_CARGA AS "FechaDeCargaDelPago"
      FROM 
        NET_DETALLE_BENEFICIO_AFILIADO dba
      JOIN 
        NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      JOIN 
        NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
      JOIN 
        NET_PERSONA p ON dba.ID_BENEFICIARIO = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE
        AND dpb.estado = 'NO PAGADA'
        AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
      ORDER BY 
        dpb.FECHA_CARGA
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async deduccionesOrdinariaDeBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        d.NOMBRE_DEDUCCION,
        dd.MONTO_APLICADO AS "MontoAplicado",
        dd.ESTADO_APLICACION AS "EstadoDeLaAplicacion",
        TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') AS "FechaDeLaDeduccion"
      FROM 
        NET_DETALLE_DEDUCCION dd
      JOIN 
        NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
      JOIN 
        NET_PERSONA p ON dd.ID_PERSONA = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND d.NOMBRE_DEDUCCION NOT IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
        AND dd.ESTADO_APLICACION = 'NO COBRADA'
        AND (
            TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
            BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
            AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
        )
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getPlanillaComplementariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    try {
      const query = `
      SELECT 
      p.DNI, 
      TRIM(
          p.PRIMER_NOMBRE || ' ' || 
          COALESCE(p.SEGUNDO_NOMBRE, '') || ' ' || 
          COALESCE(p.TERCER_NOMBRE, '') || ' ' || 
          p.PRIMER_APELLIDO || ' ' || 
          COALESCE(p.SEGUNDO_APELLIDO, '')
      ) AS NOMBRE_COMPLETO,
      bens."Total Beneficio" AS "Total Beneficio", 
      COALESCE(deds."Total Deducciones", 0) AS "Total Deducciones"
  FROM 
      NET_PERSONA p
  JOIN (
      SELECT
          dba.ID_BENEFICIARIO,
          SUM(dpb.monto_a_pagar) AS "Total Beneficio"
      FROM
          NET_DETALLE_BENEFICIO_AFILIADO dba
      INNER JOIN
          NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      WHERE
          dpb.estado = 'NO PAGADA'
          AND dba.ID_BENEFICIARIO = dba.ID_CAUSANTE
          AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio, 'DD.MM.YYYY') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
          AND NOT EXISTS (
              SELECT 1
              FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
              INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
              WHERE dpb_inner.estado = 'PAGADA'
              AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
              AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
          )
      GROUP BY
          dba.ID_BENEFICIARIO
      HAVING 
          SUM(dpb.monto_a_pagar) > 0
  ) bens ON p.ID_PERSONA = bens.ID_BENEFICIARIO
  LEFT JOIN (
      SELECT 
          dd.ID_PERSONA,
          SUM(dd.MONTO_APLICADO) AS "Total Deducciones"
          FROM 
              NET_DETALLE_DEDUCCION dd
          INNER JOIN 
              NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
          WHERE 
              d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
              AND dd.ESTADO_APLICACION = 'NO COBRADA'
              AND (
                  TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
                  BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
                  AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
              )
          GROUP BY 
              dd.ID_PERSONA
      ) deds ON p.ID_PERSONA = deds.ID_PERSONA
    `;

      const parameters: any = { periodoInicio, periodoFinalizacion };
      return await this.entityManager.query(query, parameters);

    } catch (error) {
      console.log(error);

    }
  }

  async getDesgloseBeneficiosComplemenariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryBeneficios = `
    SELECT 
    p.DNI, 
    dpb.ID_BENEFICIO_PLANILLA,
    b.NOMBRE_BENEFICIO,
    dpb.MONTO_A_PAGAR
FROM 
    NET_PERSONA p
INNER JOIN 
    NET_DETALLE_BENEFICIO_AFILIADO dba ON p.ID_PERSONA = dba.ID_BENEFICIARIO
INNER JOIN 
    NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
INNER JOIN 
    NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL  
WHERE 
    dba.ID_BENEFICIARIO = dba.ID_CAUSANTE AND
    dpb.estado = 'NO PAGADA' AND
    dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio, 'DD.MM.YYYY') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
    NOT EXISTS (
        SELECT 1
        FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
        JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
        WHERE dpb_inner.estado = 'PAGADA' AND
        dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
        dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
    )
    `;

    return await this.entityManager.query(queryBeneficios, [periodoInicio, periodoFinalizacion]);
  }

  async getDesgloseDeduccionesComplementariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryDeducciones = `
    SELECT 
    p.DNI, 
    dd.ID_DED_DEDUCCION,
    d.NOMBRE_DEDUCCION,
    dd.MONTO_APLICADO
FROM 
    NET_PERSONA p
INNER JOIN 
    NET_DETALLE_DEDUCCION dd ON p.ID_PERSONA = dd.ID_PERSONA
INNER JOIN 
    NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
WHERE 
    d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS') AND
    dd.ESTADO_APLICACION = 'NO COBRADA' AND
    TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
    BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY') AND
    p.ID_PERSONA IN (
        SELECT dba.ID_BENEFICIARIO
        FROM NET_DETALLE_BENEFICIO_AFILIADO dba
        INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
        WHERE dpb.estado = 'NO PAGADA'
        AND dba.ID_BENEFICIARIO = dba.ID_CAUSANTE
        AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio, 'DD.MM.YYYY') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
            INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
            WHERE dpb_inner.estado = 'PAGADA'
            AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
            AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
        )
        GROUP BY dba.ID_BENEFICIARIO
        HAVING SUM(dpb.monto_a_pagar) > 0
    )
`;

    return await this.entityManager.query(queryDeducciones, [periodoInicio, periodoFinalizacion, periodoInicio, periodoFinalizacion]);

  }

  async beneficiosComplementariaDeAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        b.NOMBRE_BENEFICIO,
        dpb.monto_a_pagar AS "MontoAPagar",
        dpb.estado AS "EstadoDelPago",
        dpb.FECHA_CARGA AS "FechaDeCargaDelPago"
      FROM 
        NET_DETALLE_BENEFICIO_AFILIADO dba
      JOIN 
        NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      JOIN 
        NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
      JOIN 
        NET_PERSONA p ON dba.ID_BENEFICIARIO = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND dpb.estado = 'NO PAGADA'
        AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
            JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
            WHERE dpb_inner.estado = 'PAGADA'
            AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
            AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
        )
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async deduccionesComplementariaDeAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        d.NOMBRE_DEDUCCION,
        dd.MONTO_APLICADO AS "MontoAplicado",
        dd.ESTADO_APLICACION AS "EstadoDeLaAplicacion",
        TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') AS "FechaDeLaDeduccion"
      FROM 
        NET_DETALLE_DEDUCCION dd
      JOIN 
        NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
      JOIN 
        NET_PERSONA p ON dd.ID_PERSONA = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
        AND dd.ESTADO_APLICACION = 'NO COBRADA'
        AND (
            TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
            BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
            AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
        )
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getPlanillaComplementariaBenef(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI, 
        TRIM(
            p.PRIMER_NOMBRE || ' ' || 
            COALESCE(p.SEGUNDO_NOMBRE, '') || ' ' || 
            COALESCE(p.TERCER_NOMBRE, '') || ' ' || 
            p.PRIMER_APELLIDO || ' ' || 
            COALESCE(p.SEGUNDO_APELLIDO, '')
        ) AS NOMBRE_COMPLETO,
        bens."Total Beneficio", 
        COALESCE(deds."Total Deducciones", 0) AS "Total Deducciones"
      FROM 
        NET_PERSONA p
      JOIN (
          SELECT
              dba.ID_BENEFICIARIO,
              SUM(dpb.monto_a_pagar) AS "Total Beneficio"
          FROM
              NET_DETALLE_BENEFICIO_AFILIADO dba
          INNER JOIN
              NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
          WHERE
              dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
              dpb.estado = 'NO PAGADA'
              AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
              AND NOT EXISTS (
                  SELECT 1
                  FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
                  INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
                  WHERE dpb_inner.estado = 'PAGADA'
                  AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
                  AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
              )
          GROUP BY
              dba.ID_BENEFICIARIO
          HAVING 
              SUM(dpb.monto_a_pagar) > 0
      ) bens ON p.ID_PERSONA = bens.ID_BENEFICIARIO
      LEFT JOIN (
          SELECT 
              dd.ID_PERSONA,
              SUM(dd.MONTO_APLICADO) AS "Total Deducciones"
              FROM 
              NET_DETALLE_DEDUCCION dd
          INNER JOIN 
              NET_PERSONA per ON per.ID_PERSONA = dd.ID_PERSONA
          INNER JOIN 
              NET_DETALLE_PERSONA detPer ON detPer.ID_PERSONA = dd.ID_PERSONA
          INNER JOIN 
              NET_TIPO_PERSONA tipoPer ON tipoPer.ID_TIPO_AFILIADO = detPer.ID_TIPO_PERSONA
          INNER JOIN 
              NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
          
          WHERE
              tipoPer.TIPO_AFILIADO = 'BENEFICIARIO' AND
              d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
              AND dd.ESTADO_APLICACION = 'NO COBRADA'
              AND (
                  TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
                  BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
                  AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
              )
          GROUP BY 
              dd.ID_PERSONA
      ) deds ON p.ID_PERSONA = deds.ID_PERSONA
    `;

    const parameters: any = { periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async getDesgloseBeneficiosComplemenariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryBeneficios = `
    SELECT 
        p.DNI, 
        dpb.ID_BENEFICIO_PLANILLA,
        b.NOMBRE_BENEFICIO,
        dpb.MONTO_A_PAGAR
    FROM 
        NET_DETALLE_BENEFICIO_AFILIADO dba
    INNER JOIN 
        NET_PERSONA p ON dba.ID_BENEFICIARIO = p.ID_PERSONA
    INNER JOIN 
        NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
    INNER JOIN 
        NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
    WHERE 
        dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
        dpb.estado = 'NO PAGADA' AND
        dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
        NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
            INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
            WHERE dpb_inner.estado = 'PAGADA' AND
            dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
            dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
        )
    `;

    return await this.entityManager.query(queryBeneficios, [periodoInicio, periodoFinalizacion]);
  }

  async getDesgloseDeduccionesComplementariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const queryDeducciones = `
  SELECT 
      p.DNI,
      dd.ID_DED_DEDUCCION,
      d.NOMBRE_DEDUCCION,
      dd.MONTO_APLICADO
  FROM 
      NET_DETALLE_DEDUCCION dd
  INNER JOIN 
      NET_PERSONA p ON dd.ID_PERSONA = p.ID_PERSONA
  INNER JOIN 
      NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
  WHERE 
      d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS') AND
      dd.ESTADO_APLICACION = 'NO COBRADA' AND
      TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
      BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY') AND
      p.ID_PERSONA IN (
          SELECT dba.ID_BENEFICIARIO
          FROM NET_DETALLE_BENEFICIO_AFILIADO dba
          INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
          WHERE
              dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE AND
              dpb.estado = 'NO PAGADA' AND
              dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM') AND
              NOT EXISTS (
                  SELECT 1
                  FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
                  INNER JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
                  WHERE dpb_inner.estado = 'PAGADA' AND
                  dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO AND
                  dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
              )
          GROUP BY dba.ID_BENEFICIARIO
          HAVING SUM(dpb.monto_a_pagar) > 0
      )
  `;

    return await this.entityManager.query(queryDeducciones, [periodoInicio, periodoFinalizacion, periodoInicio, periodoFinalizacion]);
  }

  async beneficiosComplementariaDeBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        b.NOMBRE_BENEFICIO,
        dba.PERIODO_INICIO,
        dba.PERIODO_FINALIZACION,
        dpb.monto_a_pagar AS "MontoAPagar",
        dpb.estado AS "EstadoDelPago",
        dpb.FECHA_CARGA AS "FechaDeCargaDelPago"
      FROM 
        NET_DETALLE_BENEFICIO_AFILIADO dba
      JOIN 
        NET_DETALLE_PAGO_BENEFICIO dpb ON dba.ID_DETALLE_BEN_AFIL = dpb.ID_BENEFICIO_PLANILLA_AFIL
      JOIN 
        NET_BENEFICIO b ON dba.ID_BENEFICIO = b.ID_BENEFICIO
      JOIN 
        NET_PERSONA p ON dba.ID_BENEFICIARIO = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND dba.ID_BENEFICIARIO <> dba.ID_CAUSANTE
        AND dpb.estado = 'NO PAGADA'
        AND dpb.FECHA_CARGA BETWEEN TO_DATE(:periodoInicio || ' 12:00:00 AM', 'DD.MM.YYYY HH:MI:SS PM') AND TO_DATE(:periodoFinalizacion || ' 11:59:59 PM', 'DD.MM.YYYY HH:MI:SS PM')
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_BENEFICIO_AFILIADO dba_inner
            JOIN NET_DETALLE_PAGO_BENEFICIO dpb_inner ON dba_inner.ID_DETALLE_BEN_AFIL = dpb_inner.ID_BENEFICIO_PLANILLA_AFIL
            WHERE dpb_inner.estado = 'PAGADA'
            AND dba_inner.ID_BENEFICIO = dba.ID_BENEFICIO
            AND dba_inner.ID_BENEFICIARIO = dba.ID_BENEFICIARIO
        )
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async deduccionesComplementariaDeBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Promise<any> {
    const query = `
      SELECT 
        p.DNI,
        d.NOMBRE_DEDUCCION,
        dd.MONTO_APLICADO AS "MontoAplicado",
        dd.ESTADO_APLICACION AS "EstadoDeLaAplicacion",
        TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') AS "FechaDeLaDeduccion"
      FROM 
        NET_DETALLE_DEDUCCION dd
      JOIN 
        NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
      JOIN 
        NET_PERSONA p ON dd.ID_PERSONA = p.ID_PERSONA
      WHERE 
        p.DNI = :dni
        AND d.NOMBRE_DEDUCCION IN ('PRESTAMOS', 'TESORERIA', 'EMBARGOS')
        AND dd.ESTADO_APLICACION = 'NO COBRADA'
        AND (
            TO_DATE(CONCAT(dd.ANIO, LPAD(dd.MES, 2, '0')), 'YYYYMM') 
            BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YY') 
            AND TO_DATE(:periodoFinalizacion, 'DD/MM/YY')
        )
    `;

    const parameters: any = { dni, periodoInicio, periodoFinalizacion };
    return await this.entityManager.query(query, parameters);
  }

  async actualizarOrdinariaAfiliadosAPreliminar(idPlanilla: number, periodoInicio: string, periodoFinalizacion: string): Promise<string> {
    // Llamamos al servicio para obtener los beneficios y deducciones con los periodos especificados
    const beneficios = await this.getDesgloseBeneficiosOrdinariaAfiliados(periodoInicio, periodoFinalizacion);
    const deducciones = await this.getDesgloseDeduccionesOrdinariaAfiliados(periodoInicio, periodoFinalizacion);
    if ((!beneficios || beneficios.length === 0) && (!deducciones || deducciones.length === 0)) {
      return 'No se encontraron beneficios ni deducciones para actualizar.';
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizamos los beneficios
      for (const beneficio of beneficios) {
        const updateBeneficioQuery = `
        UPDATE NET_DETALLE_PAGO_BENEFICIO
        SET ID_PLANILLA = :idPlanilla, 
        ESTADO = 'EN PRELIMINAR'
        WHERE ID_BENEFICIO_PLANILLA = :idBeneficioPlanilla
      `;

        const parameters: any = {
          idPlanilla,
          idBeneficioPlanilla: beneficio.ID_BENEFICIO_PLANILLA,
        };

        await queryRunner.query(updateBeneficioQuery, parameters);
      }

      // Actualizamos las deducciones
      for (const deduccion of deducciones) {
        const updateDeduccionQuery = `
        UPDATE NET_DETALLE_DEDUCCION
        SET ID_PLANILLA = :idPlanilla,
        ESTADO_APLICACION = 'EN PRELIMINAR'
        WHERE ID_DED_DEDUCCION = :idDeduccion
      `;

        const parameters: any = {
          idPlanilla,
          idDeduccion: deduccion.ID_DED_DEDUCCION,
        };

        await queryRunner.query(updateDeduccionQuery, parameters);
      }

      // Confirmamos la transacción
      await queryRunner.commitTransaction();

      return 'Todos los beneficios y deducciones han sido actualizados correctamente.';
    } catch (error) {
      // Si hay algún error, hacemos rollback de la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberamos la conexión de la query runner
      await queryRunner.release();
    }
  }

  async actualizarOrdinariaBeneficiariosAPreliminar(idPlanilla: number, periodoInicio: string, periodoFinalizacion: string): Promise<string> {
    // Llamamos al servicio para obtener los beneficios y deducciones de los beneficiarios con los periodos especificados
    const beneficios = await this.getDesgloseBeneficiosOrdinariaBeneficiarios(periodoInicio, periodoFinalizacion);
    const deducciones = await this.getDesgloseDeduccionesOrdinariaBeneficiarios(periodoInicio, periodoFinalizacion);
    
    if ((!beneficios || beneficios.length === 0) && (!deducciones || deducciones.length === 0)) {
      return 'No se encontraron beneficios ni deducciones para actualizar.';
    }
    
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizamos los beneficios de los beneficiarios
      for (const beneficio of beneficios) {
        const updateBeneficioQuery = `
          UPDATE NET_DETALLE_PAGO_BENEFICIO
          SET ID_PLANILLA = :idPlanilla, 
          ESTADO = 'EN PRELIMINAR'
          WHERE ID_BENEFICIO_PLANILLA = :idBeneficioPlanilla
        `;

        const parameters: any = {
          idPlanilla,
          idBeneficioPlanilla: beneficio.ID_BENEFICIO_PLANILLA,
        };

        await queryRunner.query(updateBeneficioQuery, parameters);
      }

      // Actualizamos las deducciones de los beneficiarios
      for (const deduccion of deducciones) {
        const updateDeduccionQuery = `
          UPDATE NET_DETALLE_DEDUCCION
          SET ID_PLANILLA = :idPlanilla,
          ESTADO_APLICACION = 'EN PRELIMINAR'
          WHERE ID_DED_DEDUCCION = :idDeduccion
        `;

        const parameters: any = {
          idPlanilla,
          idDeduccion: deduccion.ID_DED_DEDUCCION,
        };

        await queryRunner.query(updateDeduccionQuery, parameters);
      }

      // Confirmamos la transacción
      await queryRunner.commitTransaction();

      return 'Todos los beneficios y deducciones de los beneficiarios han sido actualizados correctamente.';
    } catch (error) {
      // Si hay algún error, hacemos rollback de la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberamos la conexión de la query runner
      await queryRunner.release();
    }
  }

  async actualizarComplementariaAfiliadosAPreliminar(idPlanilla: number, periodoInicio: string, periodoFinalizacion: string): Promise<string> {
    // Llamamos al servicio para obtener los beneficios y deducciones complementarias con los periodos especificados
    const beneficios = await this.getDesgloseBeneficiosComplemenariaAfiliados(periodoInicio, periodoFinalizacion);
    const deducciones = await this.getDesgloseDeduccionesComplementariaAfiliados(periodoInicio, periodoFinalizacion);
    
    if ((!beneficios || beneficios.length === 0) && (!deducciones || deducciones.length === 0)) {
      return 'No se encontraron beneficios ni deducciones complementarias para actualizar.';
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizamos los beneficios complementarios
      for (const beneficio of beneficios) {
        const updateBeneficioQuery = `
          UPDATE NET_DETALLE_PAGO_BENEFICIO
          SET ID_PLANILLA = :idPlanilla, 
              ESTADO = 'EN PRELIMINAR'
          WHERE ID_BENEFICIO_PLANILLA = :idBeneficioPlanilla
        `;

        const parameters: any = {
          idPlanilla,
          idBeneficioPlanilla: beneficio.ID_BENEFICIO_PLANILLA,
        };

        await queryRunner.query(updateBeneficioQuery, parameters);
      }

      // Actualizamos las deducciones complementarias
      for (const deduccion of deducciones) {
        const updateDeduccionQuery = `
          UPDATE NET_DETALLE_DEDUCCION
          SET ID_PLANILLA = :idPlanilla,
              ESTADO_APLICACION = 'EN PRELIMINAR'
          WHERE ID_DED_DEDUCCION = :idDeduccion
        `;

        const parameters: any = {
          idPlanilla,
          idDeduccion: deduccion.ID_DED_DEDUCCION,
        };

        await queryRunner.query(updateDeduccionQuery, parameters);
      }

      // Confirmamos la transacción
      await queryRunner.commitTransaction();

      return 'Todos los beneficios y deducciones complementarias han sido actualizados correctamente.';
    } catch (error) {
      // Si hay algún error, hacemos rollback de la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberamos la conexión de la query runner
      await queryRunner.release();
    }
  }

  async actualizarComplementariBeneficiariosAPreliminar(idPlanilla: number, periodoInicio: string, periodoFinalizacion: string): Promise<string> {
    const beneficios = await this.getDesgloseBeneficiosComplemenariaBeneficiarios(periodoInicio, periodoFinalizacion);
    const deducciones = await this.getDesgloseDeduccionesComplementariaBeneficiarios(periodoInicio, periodoFinalizacion);
    
    if ((!beneficios || beneficios.length === 0) && (!deducciones || deducciones.length === 0)) {
      return 'No se encontraron beneficios ni deducciones complementarias para actualizar.';
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizamos los beneficios complementarios
      for (const beneficio of beneficios) {
        const updateBeneficioQuery = `
          UPDATE NET_DETALLE_PAGO_BENEFICIO
          SET ID_PLANILLA = :idPlanilla, 
              ESTADO = 'EN PRELIMINAR'
          WHERE ID_BENEFICIO_PLANILLA = :idBeneficioPlanilla
        `;

        const parameters: any = {
          idPlanilla,
          idBeneficioPlanilla: beneficio.ID_BENEFICIO_PLANILLA,
        };

        await queryRunner.query(updateBeneficioQuery, parameters);
      }

      // Actualizamos las deducciones complementarias
      for (const deduccion of deducciones) {
        const updateDeduccionQuery = `
          UPDATE NET_DETALLE_DEDUCCION
          SET ID_PLANILLA = :idPlanilla,
              ESTADO_APLICACION = 'EN PRELIMINAR'
          WHERE ID_DED_DEDUCCION = :idDeduccion
        `;

        const parameters: any = {
          idPlanilla,
          idDeduccion: deduccion.ID_DED_DEDUCCION,
        };

        await queryRunner.query(updateDeduccionQuery, parameters);
      }

      // Confirmamos la transacción
      await queryRunner.commitTransaction();

      return 'Todos los beneficios y deducciones complementarias de los beneficiarios han sido actualizados correctamente.';
    } catch (error) {
      // Si hay algún error, hacemos rollback de la transacción
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberamos la conexión de la query runner
      await queryRunner.release();
    }
  }

    async update(id_planilla: number, updatePlanillaDto: UpdatePlanillaDto): Promise<any> {
      try {
        const planilla = await this.planillaRepository.preload({
          id_planilla: id_planilla,
          ...updatePlanillaDto
        });
        if (!planilla) throw new NotFoundException(`Planilla con el ID: ${id_planilla} no encontrada`);
          await this.planillaRepository.save(planilla);
          return planilla;
      } catch (error) {
        console.log(error);
        this.handleException(error); // Asegúrate de tener un método para manejar las excepciones
      }
  }

  async generarVoucher(idPlanilla: string, dni: string): Promise<any> {
    try {
      const beneficios = await this.entityManager.query(
        `SELECT
        ben."ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO",
        SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) AS "Total Monto Beneficio"
          FROM
            "NET_PERSONA" afil
        LEFT JOIN
            "NET_DETALLE_PERSONA" detP ON afil."ID_PERSONA" = detP."ID_PERSONA"
        INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
            detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
            detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
       INNER JOIN "NET_BENEFICIO" ben ON 
            detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
            detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        LEFT JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detBs ON detBA."ID_DETALLE_BEN_AFIL" = detBs."ID_BENEFICIO_PLANILLA_AFIL"
        LEFT JOIN
            "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
       WHERE
              detBs."ID_PLANILLA" = :idPlanilla AND afil."DNI" = :dni
       GROUP BY
        ben."ID_BENEFICIO", ben."NOMBRE_BENEFICIO"`,
        [idPlanilla, dni]
      );
      const deducciones = await this.entityManager.query(
        `SELECT
        ded."ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" || ' - ' || inst."NOMBRE_INSTITUCION" AS "nombre_deduccion",
        COALESCE(SUM(detDed."MONTO_APLICADO"), 0) AS "Total Monto Aplicado"
      FROM
          "NET_DETALLE_DEDUCCION" detDed
      INNER JOIN
          "NET_DEDUCCION" ded ON detDed."ID_DEDUCCION" = ded."ID_DEDUCCION"
      LEFT JOIN
          "NET_INSTITUCION" inst ON ded."ID_INSTITUCION" = inst."ID_INSTITUCION"
      INNER JOIN
          "NET_PERSONA" afil ON detDed."ID_PERSONA" = afil."ID_PERSONA"
      WHERE
          detDed."ID_PLANILLA" = :idPlanilla AND afil."DNI" = :dni
      GROUP BY
          ded."ID_DEDUCCION", ded."NOMBRE_DEDUCCION", inst."NOMBRE_INSTITUCION"`,
        [idPlanilla, dni]
      );

      return { beneficios, deducciones };
    } catch (error) {
      console.log(error);
      
      this.logger.error('Error al obtener los totales por DNI y planilla', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getTotalPorDedYBen(idPlanilla: string): Promise<any> {
    /* if (!isUUID(idPlanilla)) {
        throw new BadRequestException('El ID de la planilla no es válido');
    } */
    console.log('entro aqui');


    try {
      const beneficios = await this.entityManager.query(
        `SELECT
                ben."id_beneficio",
                ben."nombre_beneficio",
                SUM(COALESCE(dpb."monto_a_pagar", 0)) AS "Total Monto Beneficio"
            FROM
                "net_beneficio" ben
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
                "net_detalle_deduccion" detDed
            INNER JOIN
                "net_deduccion" ded ON detDed."id_deduccion" = ded."id_deduccion"
            LEFT JOIN
                "net_institucion" inst ON ded."id_institucion" = inst."id_institucion"
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
      const query = `
      SELECT
      SUM(beneficio."Total Beneficio") AS "Total Beneficio",
      SUM(deduccion."Total Deducciones") AS "Total Deducciones",
      SUM(beneficio."Total Beneficio") - SUM(deduccion."Total Deducciones") AS "Total Planilla"
    FROM
      (SELECT
        afil."ID_PERSONA",
        SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) AS "Total Beneficio"
      FROM
          "NET_PERSONA" afil
      LEFT JOIN
          "NET_DETALLE_PERSONA" detP ON afil."ID_PERSONA" = detP."ID_PERSONA"
      INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
          detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
          detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
      LEFT JOIN
          "NET_DETALLE_PAGO_BENEFICIO" detBs ON detBA."ID_DETALLE_BEN_AFIL" = detBs."ID_BENEFICIO_PLANILLA_AFIL"
          AND detBs."ID_PLANILLA" = :idPlanilla
      LEFT JOIN
          "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
      GROUP BY
        afil."ID_PERSONA"
      ) beneficio
    INNER JOIN
      (SELECT
        afil."ID_PERSONA",
        SUM(COALESCE(detDs."MONTO_APLICADO", 0)) AS "Total Deducciones"
      FROM
        "NET_PERSONA" afil
      LEFT JOIN
        "NET_DETALLE_DEDUCCION" detDs ON afil."ID_PERSONA" = detDs."ID_PERSONA"
        AND detDs."ID_PLANILLA" = :idPlanilla
      GROUP BY
        afil."ID_PERSONA"
      ) deduccion ON beneficio."ID_PERSONA" = deduccion."ID_PERSONA"
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
  async ObtenerPlanDefin(codPlanilla: string): Promise<any> {
    try {
      if (codPlanilla) {
        const queryBuilder = await this.planillaRepository
        .createQueryBuilder('planilla')
        .addSelect('planilla.ID_PLANILLA', 'id_planilla')
        .addSelect('planilla.CODIGO_PLANILLA', 'codigo_planilla')
        .addSelect('planilla.FECHA_APERTURA', 'fecha_apertura')
        .addSelect('planilla.SECUENCIA', 'secuencia')
        .addSelect('planilla.ESTADO', 'estado')
        .addSelect('planilla.PERIODO_INICIO', 'periodoInicio')
        .addSelect('planilla.PERIODO_FINALIZACION', 'periodoFinalizacion')
        .addSelect('tipP.NOMBRE_PLANILLA', 'nombre_planilla')
        .innerJoin(Net_TipoPlanilla, 'tipP', 'tipP.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA')
        .where(`planilla.CODIGO_PLANILLA = '${codPlanilla}'  AND planilla.ESTADO = \'CERRADA\' ` )
        .getRawMany();

        return queryBuilder[0];
        } else {
          throw new NotFoundException(`planilla con ${codPlanilla} no encontrado.`);
      }
    } catch (error) {
      console.log(error);
    }
  } 

  async ObtenerPlanDefinPersonas(codPlanilla: string): Promise<any> {
    try {
      const query = `SELECT
      COALESCE(deducciones."ID_PERSONA", beneficios."ID_PERSONA") AS "ID_PERSONA",
      COALESCE(deducciones."DNI", beneficios."DNI") AS "DNI",
      COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
      COALESCE(beneficios."Total Beneficio", 0) AS "Total Beneficio",
      COALESCE(deducciones."Total Deducciones", 0) AS "Total Deducciones",
      COALESCE(deducciones."CORREO_1", beneficios."CORREO_1") AS "CORREO_1",
      COALESCE(deducciones."FECHA_CIERRE", beneficios."FECHA_CIERRE") AS "FECHA_CIERRE"
  FROM
      (SELECT
          afil."ID_PERSONA",
          afil."DNI",
          afil."CORREO_1",
          TRIM(
              afil."PRIMER_NOMBRE" || ' ' ||
              COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
              COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
              afil."PRIMER_APELLIDO" || ' ' ||
              COALESCE(afil."SEGUNDO_APELLIDO", '')
          ) AS "NOMBRE_COMPLETO",
          SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) AS "Total Beneficio",
          pla."FECHA_CIERRE"
      FROM
          "NET_PERSONA" afil
      LEFT JOIN
          "NET_DETALLE_PERSONA" detP ON afil."ID_PERSONA" = detP."ID_PERSONA"
      INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
          detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
          detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
      LEFT JOIN
          "NET_DETALLE_PAGO_BENEFICIO" detBs ON detBA."ID_DETALLE_BEN_AFIL" = detBs."ID_BENEFICIO_PLANILLA_AFIL"
      LEFT JOIN
          "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
      WHERE
          detBs."ESTADO" = 'PAGADA' AND
          pla."CODIGO_PLANILLA" = '${codPlanilla}'
      GROUP BY
          afil."ID_PERSONA",
          afil."DNI",
          afil."CORREO_1",
          pla."FECHA_CIERRE",
          TRIM(
              afil."PRIMER_NOMBRE" || ' ' ||
              COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
              COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
              afil."PRIMER_APELLIDO" || ' ' ||
              COALESCE(afil."SEGUNDO_APELLIDO", '')
          )
      HAVING
          SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) > 0
      ) beneficios
  FULL OUTER JOIN
      (SELECT
          afil."ID_PERSONA",
          afil."DNI",
          afil."CORREO_1",
          TRIM(
              afil."PRIMER_NOMBRE" || ' ' ||
              COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
              COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
              afil."PRIMER_APELLIDO" || ' ' ||
              COALESCE(afil."SEGUNDO_APELLIDO", '')
          ) AS "NOMBRE_COMPLETO",
          SUM(COALESCE(detDs."MONTO_APLICADO", 0)) AS "Total Deducciones",
          pla."FECHA_CIERRE"
      FROM
          "NET_PERSONA" afil
      LEFT JOIN
          "NET_DETALLE_DEDUCCION" detDs ON afil."ID_PERSONA" = detDs."ID_PERSONA"
      LEFT JOIN
          "NET_PLANILLA" pla ON detDs."ID_PLANILLA" = pla."ID_PLANILLA"
      WHERE
      detDs."ESTADO_APLICACION" = 'COBRADA' AND
          pla."CODIGO_PLANILLA" = '${codPlanilla}'
      GROUP BY
          afil."ID_PERSONA",
          afil."DNI",
          afil."CORREO_1",
          pla."FECHA_CIERRE",
          TRIM(
              afil."PRIMER_NOMBRE" || ' ' ||
              COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
              COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
              afil."PRIMER_APELLIDO" || ' ' ||
              COALESCE(afil."SEGUNDO_APELLIDO", '')
          )
      HAVING
          SUM(COALESCE(detDs."MONTO_APLICADO", 0)) > 0
      ) deducciones
  ON deducciones."ID_PERSONA" = beneficios."ID_PERSONA"`;
  
      const result = await this.entityManager.query(query);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  } 

  /* async obtenerAfilOrdinaria(periodoInicio: string, periodoFinalizacion: string): Promise<any> {
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
            "Net_Persona" afil
      INNER JOIN
            "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
            
      LEFT JOIN
        "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado" AND
        detBA."periodoInicio" <= TO_DATE('${periodoFinalizacion}', 'DD/MM/YY') AND
        detBA."periodoFinalizacion" >= TO_DATE('${periodoInicio}', 'DD/MM/YY')
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
            "Net_Persona" afil
      INNER JOIN
            "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
      LEFT JOIN
            "net_detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
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
                FROM "net_detalle_deduccion" detD
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
      "Net_Persona" afil
  INNER JOIN
      "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
  
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
      "Net_Persona" afil
  INNER JOIN
      "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
  LEFT JOIN
      "net_detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
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
      "Net_Persona" afil
  LEFT JOIN
      "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
  LEFT JOIN
      "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
  LEFT JOIN
      "net_detalle_pago_beneficio" detBs  ON detBs."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
      
  INNER JOIN
      "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
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
      "Net_Persona" afil
  INNER JOIN
      "net_detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
  LEFT JOIN
      "net_detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
  LEFT JOIN
      "net_deduccion" ded ON detDs."id_deduccion" = ded."id_deduccion"
  WHERE
      detDs."estado_aplicacion" = 'NO COBRADA' AND
      (
          detDs."id_afiliado" NOT IN (
              SELECT detD."id_afiliado"
              FROM "net_detalle_deduccion" detD
              WHERE detD."estado_aplicacion" NOT IN ('NO COBRADA', 'INCONSISTENCIA')
          )
      ) AND
      detDs."estado_aplicacion" != 'INCONSISTENCIA' AND
      NOT EXISTS (
          SELECT 1
          FROM "net_detalle_deduccion" detD
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
      "Net_Persona" afil
  LEFT JOIN
      "net_detalle_beneficio_afiliado" detBA ON afil."id_afiliado" = detBA."id_afiliado"
  LEFT JOIN
      "net_detalle_pago_beneficio" detBs ON detBA."id_detalle_ben_afil" = detBs."id_beneficio_afiliado"
  LEFT JOIN
      "net_planilla" pla ON detBs."id_planilla" = pla."id_planilla"
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
      "Net_Persona" afil
  LEFT JOIN
      "net_detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
  LEFT JOIN
      "net_planilla" pla ON detDs."id_planilla" = pla."id_planilla"
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
  } */

  async ObtenerPreliminar(codPlanilla: string): Promise<any> {
    try {
      const query = `SELECT
        COALESCE(deducciones."ID_PERSONA", beneficios."ID_PERSONA") AS "ID_PERSONA",
        COALESCE(deducciones."DNI", beneficios."DNI") AS "DNI",
        COALESCE(deducciones."NOMBRE_COMPLETO", beneficios."NOMBRE_COMPLETO") AS "NOMBRE_COMPLETO",
        COALESCE(beneficios."Total Beneficio", 0) AS "Total Beneficio",
        COALESCE(deducciones."Total Deducciones", 0) AS "Total Deducciones",
        COALESCE(deducciones."CORREO_1", beneficios."CORREO_1") AS "CORREO_1",
        COALESCE(deducciones."FECHA_CIERRE", beneficios."FECHA_CIERRE") AS "FECHA_CIERRE"
    FROM
        (SELECT
            afil."ID_PERSONA",
            afil."DNI",
            afil."CORREO_1",
            TRIM(
                afil."PRIMER_NOMBRE" || ' ' ||
                COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
                afil."PRIMER_APELLIDO" || ' ' ||
                COALESCE(afil."SEGUNDO_APELLIDO", '')
            ) AS "NOMBRE_COMPLETO",
            SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) AS "Total Beneficio",
            pla."FECHA_CIERRE"
        FROM
            "NET_PERSONA" afil
        LEFT JOIN
            "NET_DETALLE_PERSONA" detP ON afil."ID_PERSONA" = detP."ID_PERSONA"
        INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
            detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
            detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        LEFT JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detBs ON detBA."ID_DETALLE_BEN_AFIL" = detBs."ID_BENEFICIO_PLANILLA_AFIL"
        LEFT JOIN
            "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
        WHERE
            detBs."ESTADO" = 'EN PRELIMINAR' AND
            pla."CODIGO_PLANILLA" = '${codPlanilla}'
        GROUP BY
            afil."ID_PERSONA",
            afil."DNI",
            afil."CORREO_1",
            pla."FECHA_CIERRE",
            TRIM(
                afil."PRIMER_NOMBRE" || ' ' ||
                COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
                afil."PRIMER_APELLIDO" || ' ' ||
                COALESCE(afil."SEGUNDO_APELLIDO", '')
            )
        HAVING
            SUM(COALESCE(detBs."MONTO_A_PAGAR", 0)) > 0
        ) beneficios
    FULL OUTER JOIN
        (SELECT
            afil."ID_PERSONA",
            afil."DNI",
            afil."CORREO_1",
            TRIM(
                afil."PRIMER_NOMBRE" || ' ' ||
                COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
                afil."PRIMER_APELLIDO" || ' ' ||
                COALESCE(afil."SEGUNDO_APELLIDO", '')
            ) AS "NOMBRE_COMPLETO",
            SUM(COALESCE(detDs."MONTO_APLICADO", 0)) AS "Total Deducciones",
            pla."FECHA_CIERRE"
        FROM
            "NET_PERSONA" afil
        LEFT JOIN
            "NET_DETALLE_DEDUCCION" detDs ON afil."ID_PERSONA" = detDs."ID_PERSONA"
        LEFT JOIN
            "NET_PLANILLA" pla ON detDs."ID_PLANILLA" = pla."ID_PLANILLA"
        WHERE
            detDs."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
            pla."CODIGO_PLANILLA" = '${codPlanilla}'
        GROUP BY
            afil."ID_PERSONA",
            afil."DNI",
            afil."CORREO_1",
            pla."FECHA_CIERRE",
            TRIM(
                afil."PRIMER_NOMBRE" || ' ' ||
                COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(afil."TERCER_NOMBRE", '') || ' ' ||
                afil."PRIMER_APELLIDO" || ' ' ||
                COALESCE(afil."SEGUNDO_APELLIDO", '')
            )
        HAVING
            SUM(COALESCE(detDs."MONTO_APLICADO", 0)) > 0
        ) deducciones
    ON deducciones."ID_PERSONA" = beneficios."ID_PERSONA"`;

      const result = await this.entityManager.query(query);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }
  async ObtenerTodasPlanillas(codPlanilla: string): Promise<any> {
    try {
      const query = ``;

      const result = await this.entityManager.query(query);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }

  async create(createPlanillaDto: CreatePlanillaDto) {
    const { codigo_planilla, secuencia, periodoInicio, periodoFinalizacion, nombre_planilla, } = createPlanillaDto;

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOneBy({ nombre_planilla: createPlanillaDto.nombre_planilla });

      if (tipoPlanilla && tipoPlanilla.id_tipo_planilla) {

        const planilla = this.planillaRepository.create({
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
    const queryBuilder = await this.personaRepository
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
      .leftJoin(Net_Persona, 'afil', 'afil.id_afiliado = detBen.id_afiliado')
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

  remove(id: number) {
    return `This action removes a #${id} planilla`;
  }

  private handleException(error: any): void {
    console.log(error);

    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}