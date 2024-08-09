import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Planilla } from './entities/net_planilla.entity';
import { Net_TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Pago_Beneficio } from '../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private detallePagBeneficios: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_TipoPlanilla)
    private tipoPlanillaRepository: Repository<Net_TipoPlanilla>,
    @InjectRepository(Net_Detalle_Deduccion)
    private readonly detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
  ) {
  };

  async getActivePlanillas(clasePlanilla?: string): Promise<Net_Planilla[]> {
    const query = this.planillaRepository.createQueryBuilder('planilla')
      .leftJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
      .where('planilla.estado = :estado', { estado: 'ACTIVA' });

    if (clasePlanilla) {
      query.andWhere('tipoPlanilla.clase_planilla = :clasePlanilla', { clasePlanilla });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Error al obtener planillas activas', error);
      throw new InternalServerErrorException('Error al obtener planillas activas');
    }
  }

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
      this.handleException(error);
    }
  }

  async GetBeneficiosPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        SUM(dpb."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" dpb
      INNER JOIN 
        "NET_BENEFICIO" ben 
        ON dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dpb."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de beneficios:', error);
      throw new InternalServerErrorException('Error al obtener los totales de beneficios');
    }
  }

  async GetDeduccionesInpremaPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
        AND ded."ID_CENTRO_TRABAJO" = 1  -- ID para INPREMA
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones INPREMA:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones INPREMA');
    }
  }

  async GetDeduccionesTercerosPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
        AND ded."ID_CENTRO_TRABAJO" != 1
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones Terceros:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones Terceros');
    }
  }

  async GetDeduccionesPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION", 
        ded."ID_CENTRO_TRABAJO"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones');
    }
  }

  async getTotalPorBeneficiosYDeducciones(idPlanilla: number): Promise<any> {
    try {
      const beneficios = await this.GetBeneficiosPorPlanilla(idPlanilla);
      const deduccionesInprema = await this.GetDeduccionesInpremaPorPlanilla(idPlanilla);
      const deduccionesTerceros = await this.GetDeduccionesTercerosPorPlanilla(idPlanilla);

      return { beneficios, deduccionesInprema, deduccionesTerceros };

    } catch (error) {
      console.error('Error al obtener los totales por planilla:', error);
      throw new InternalServerErrorException('Error al obtener los totales por planilla');
    }
  }
  async getBeneficiosPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
    SELECT 
      ben."ID_BENEFICIO" AS "ID_BENEFICIO",
      ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
      ben."CODIGO" AS "CODIGO_BENEFICIO",
      SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO"
    FROM 
      "NET_DETALLE_PAGO_BENEFICIO" detBs
    INNER JOIN 
      "NET_BENEFICIO" ben 
      ON detBs."ID_BENEFICIO" = ben."ID_BENEFICIO"
    INNER JOIN 
      "NET_PLANILLA" plan 
      ON detBs."ID_PLANILLA" = plan."ID_PLANILLA"
    WHERE 
      plan."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
      AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
    GROUP BY 
      ben."ID_BENEFICIO", 
      ben."NOMBRE_BENEFICIO", 
      ben."CODIGO"
  `;

    try {
      return await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
    } catch (error) {
      console.error('Error al obtener beneficios:', error);
      throw new InternalServerErrorException('Error al obtener beneficios');
    }
  }

  async getDeduccionesInpremaPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
    SELECT 
      ded."ID_DEDUCCION" AS "ID_DEDUCCION",
      ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
      SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
    FROM 
      "NET_DETALLE_DEDUCCION" dedd
    INNER JOIN 
      "NET_DEDUCCION" ded 
      ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
    INNER JOIN 
      "NET_PLANILLA" plan 
      ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
    WHERE 
      plan."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
      AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
      AND ded."ID_CENTRO_TRABAJO" = 1
    GROUP BY 
      ded."ID_DEDUCCION", 
      ded."NOMBRE_DEDUCCION"
  `;

    try {
      return await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
    } catch (error) {
      console.error('Error al obtener deducciones INPREMA:', error);
      throw new InternalServerErrorException('Error al obtener deducciones INPREMA');
    }
  }

  async getDeduccionesTercerosPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
    SELECT 
      ded."ID_DEDUCCION" AS "ID_DEDUCCION",
      ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
      SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
    FROM 
      "NET_DETALLE_DEDUCCION" dedd
    INNER JOIN 
      "NET_DEDUCCION" ded 
      ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
    INNER JOIN 
      "NET_PLANILLA" plan 
      ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
    WHERE 
      plan."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
      AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
      AND ded."ID_CENTRO_TRABAJO" != 1
    GROUP BY 
      ded."ID_DEDUCCION", 
      ded."NOMBRE_DEDUCCION"
  `;

    try {
      return await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
    } catch (error) {
      console.error('Error al obtener deducciones de terceros:', error);
      throw new InternalServerErrorException('Error al obtener deducciones de terceros');
    }
  }

  async getTotalPorBeneficiosYDeduccionesPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any> {
    try {
      const beneficios = await this.getBeneficiosPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesInprema = await this.getDeduccionesInpremaPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesTerceros = await this.getDeduccionesTercerosPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);

      return { beneficios, deduccionesInprema, deduccionesTerceros };
    } catch (error) {
      console.error('Error al obtener los totales por periodo:', error);
      throw new InternalServerErrorException('Error al obtener los totales por periodo');
    }
  }

  async getTotalPorBancoYPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const beneficiosQuery = `
      SELECT
      COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
      SUM(dpb."MONTO_A_PAGAR") AS SUMA_BENEFICIOS
  FROM
      "NET_PLANILLA" p
  JOIN
      "NET_DETALLE_PAGO_BENEFICIO" dpb ON p."ID_PLANILLA" = dpb."ID_PLANILLA"
  LEFT JOIN
      "NET_PERSONA_POR_BANCO" pb ON dpb."ID_PERSONA" = pb."ID_PERSONA"
  LEFT JOIN
      "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
  WHERE
      p."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
      AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
      AND dpb."ESTADO" = 'PAGADA'
      AND dpb.ID_AF_BANCO = pb.ID_AF_BANCO
  GROUP BY
      b."NOMBRE_BANCO"
  `;

      const deduccionesInpremaQuery = `
      SELECT
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
        SUM(dd."MONTO_APLICADO") AS SUMA_DEDUCCIONES_INPREMA
      FROM
        "NET_PLANILLA" p
      JOIN
        "NET_DETALLE_DEDUCCION" dd ON p."ID_PLANILLA" = dd."ID_PLANILLA"
      JOIN
        "NET_DEDUCCION" d ON dd."ID_DEDUCCION" = d."ID_DEDUCCION"
      LEFT JOIN
        "NET_PERSONA_POR_BANCO" pb ON dd."ID_PERSONA" = pb."ID_PERSONA"
      LEFT JOIN
        "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
      WHERE
        p."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND dd."ESTADO_APLICACION" = 'COBRADA'
        AND d."ID_CENTRO_TRABAJO" = 1
      GROUP BY
        b."NOMBRE_BANCO"
    `;
    
    const deduccionesTercerosQuery = `
      SELECT
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
        SUM(dd."MONTO_APLICADO") AS SUMA_DEDUCCIONES_TERCEROS
      FROM
        "NET_PLANILLA" p
      JOIN
        "NET_DETALLE_DEDUCCION" dd ON p."ID_PLANILLA" = dd."ID_PLANILLA"
      JOIN
        "NET_DEDUCCION" d ON dd."ID_DEDUCCION" = d."ID_DEDUCCION"
      LEFT JOIN
        "NET_PERSONA_POR_BANCO" pb ON dd."ID_PERSONA" = pb."ID_PERSONA"
      LEFT JOIN
        "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
      WHERE
        p."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND dd."ESTADO_APLICACION" = 'COBRADA'
        AND d."ID_CENTRO_TRABAJO" <> 1
      GROUP BY
        b."NOMBRE_BANCO"
    `;

    const planillasQuery = `
    SELECT
        p."ID_PLANILLA"
    FROM
        "NET_PLANILLA" p
    WHERE
        p."FECHA_APERTURA" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
  `;

    try {

      const beneficios = await this.entityManager.query(beneficiosQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [periodoInicio, periodoFinalizacion]);
      const planillas = await this.entityManager.query(planillasQuery, [periodoInicio, periodoFinalizacion]);

      // Log de las planillas encontradas
      //console.log('Planillas encontradas:', planillas.map(p => p.ID_PLANILLA));

      const result = beneficios.map(beneficio => {
        const deduccionInprema = deduccionesInprema.find(d => d.NOMBRE_BANCO === beneficio.NOMBRE_BANCO) || { SUMA_DEDUCCIONES_INPREMA: 0 };
        const deduccionTerceros = deduccionesTerceros.find(d => d.NOMBRE_BANCO === beneficio.NOMBRE_BANCO) || { SUMA_DEDUCCIONES_TERCEROS: 0 };

        return {
          NOMBRE_BANCO: beneficio.NOMBRE_BANCO,
          TOTAL_BENEFICIO: beneficio.SUMA_BENEFICIOS,
          DEDUCCIONES_INPREMA: deduccionInprema.SUMA_DEDUCCIONES_INPREMA,
          DEDUCCIONES_TERCEROS: deduccionTerceros.SUMA_DEDUCCIONES_TERCEROS,
          MONTO_NETO: beneficio.SUMA_BENEFICIOS - (deduccionInprema.SUMA_DEDUCCIONES_INPREMA + deduccionTerceros.SUMA_DEDUCCIONES_TERCEROS)
        };
      });

      // Incluir bancos que solo tienen deducciones INPREMA o Terceros y no beneficios
      const deduccionesSoloInprema = deduccionesInprema.filter(d => !beneficios.find(b => b.NOMBRE_BANCO === d.NOMBRE_BANCO)).map(d => ({
        NOMBRE_BANCO: d.NOMBRE_BANCO,
        TOTAL_BENEFICIO: 0,
        DEDUCCIONES_INPREMA: d.SUMA_DEDUCCIONES_INPREMA,
        DEDUCCIONES_TERCEROS: 0,
        MONTO_NETO: -d.SUMA_DEDUCCIONES_INPREMA
      }));

      const deduccionesSoloTerceros = deduccionesTerceros.filter(d => !beneficios.find(b => b.NOMBRE_BANCO === d.NOMBRE_BANCO)).map(d => ({
        NOMBRE_BANCO: d.NOMBRE_BANCO,
        TOTAL_BENEFICIO: 0,
        DEDUCCIONES_INPREMA: 0,
        DEDUCCIONES_TERCEROS: d.SUMA_DEDUCCIONES_TERCEROS,
        MONTO_NETO: -d.SUMA_DEDUCCIONES_TERCEROS
      }));

      return [...result, ...deduccionesSoloInprema, ...deduccionesSoloTerceros];
    } catch (error) {
      console.error('Error al obtener los totales por banco en el periodo:', error);
      throw new InternalServerErrorException('Error al obtener los totales por banco en el periodo');
    }
  }

  async generarVoucher(idPlanilla: number, dni: string): Promise<any> {
    try {

      const persona = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni, detallePersona: {
            detalleBeneficio: {
              detallePagBeneficio: {
                estado: 'PAGADA',
                planilla: { id_planilla: idPlanilla }
              },
            }
          }
        },
        relations: [
          'detallePersona',
          'detallePersona.detalleBeneficio',
          'detallePersona.padreIdPersona',
          'detallePersona.padreIdPersona.persona',
          'detallePersona.detalleBeneficio.beneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco.banco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla',
        ]
      })

      const deduccion = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni,
          detalleDeduccion: {
            planilla: {
              id_planilla: idPlanilla
            }
          }
        },
        relations: [
          'detalleDeduccion.deduccion',
          'detalleDeduccion.deduccion.centroTrabajo',
          'detalleDeduccion.planilla',
        ]
      })

      return { persona, deduccion };

    } catch (error) {
      console.log(error);

      this.logger.error('Error al obtener los totales por DNI y planilla', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getPlanillaById(id_planilla: number) {
    const planilla = await this.planillaRepository.findOne({ where: { id_planilla } });

    if (!planilla) {
      throw new NotFoundException(`Planilla con ID ${id_planilla} no encontrada`);
    }

    const totalBeneficios = await this.detallePagBeneficios
      .createQueryBuilder('detallePagoBeneficio')
      .select('SUM(detallePagoBeneficio.monto_a_pagar)', 'totalBeneficios')
      .where('detallePagoBeneficio.planilla.id_planilla = :id_planilla', { id_planilla })
      .getRawOne();

    const totalDeducciones = await this.detalleDeduccionRepository
      .createQueryBuilder('detalleDeduccion')
      .innerJoin(Net_Planilla, 'plan', 'plan.ID_PLANILLA = detalleDeduccion.ID_PLANILLA')
      .select('SUM(detalleDeduccion.monto_aplicado)', 'totalDeducciones')
      .where('plan.ID_PLANILLA = :id_planilla', { id_planilla })
      .getRawOne();


    return {
      planilla,
      totalBeneficios: totalBeneficios.totalBeneficios || 0,
      totalDeducciones: totalDeducciones.totalDeducciones || 0,
      totalPlanilla: totalBeneficios.totalBeneficios - totalDeducciones.totalDeducciones,
    };
  }

  async ObtenerPlanDefin(codPlanilla: string): Promise<any> {
    try {
      if (codPlanilla) {
        const queryBuilder = await this.planillaRepository
          .createQueryBuilder('planilla')
          .leftJoinAndSelect('planilla.tipoPlanilla', 'tipP')
          .where('planilla.CODIGO_PLANILLA = :codPlanilla', { codPlanilla })
          .andWhere('planilla.ESTADO = :estado', { estado: 'CERRADA' })
          .select([
            'planilla.id_planilla',
            'planilla.codigo_planilla',
            'planilla.fecha_apertura',
            'planilla.fecha_cierre',
            'planilla.secuencia',
            'planilla.estado',
            'planilla.periodoInicio',
            'planilla.periodoFinalizacion',
            'tipP.nombre_planilla', // Asegúrate de seleccionar el campo correcto
          ])
          .getOne();

        if (!queryBuilder) {
          throw new NotFoundException(`Planilla con código ${codPlanilla} no encontrada.`);
        }

        return queryBuilder;
      } else {
        throw new NotFoundException(`Código de planilla no proporcionado.`);
      }
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la planilla definida.');
    }
  }

  async ObtenerMontosPorBanco(codPlanilla: string): Promise<any> {
    const query = `
      SELECT
          COALESCE(deducciones.NOMBRE_BANCO, beneficios.NOMBRE_BANCO, 'SIN BANCO') AS NOMBRE_BANCO,
          COALESCE(deducciones.SUMA_DEDUCCIONES_INPREMA, 0) AS SUMA_DEDUCCIONES_INPREMA,
          COALESCE(deducciones.SUMA_DEDUCCIONES_TERCEROS, 0) AS SUMA_DEDUCCIONES_TERCEROS,
          COALESCE(beneficios.SUMA_BENEFICIOS, 0) AS SUMA_BENEFICIOS,
          COALESCE(beneficios.SUMA_BENEFICIOS, 0) - (COALESCE(deducciones.SUMA_DEDUCCIONES_INPREMA, 0) + COALESCE(deducciones.SUMA_DEDUCCIONES_TERCEROS, 0)) AS MONTO_NETO
      FROM
          (SELECT
              COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
              SUM(CASE WHEN d."ID_CENTRO_TRABAJO" = 1 THEN dd."MONTO_APLICADO" ELSE 0 END) AS SUMA_DEDUCCIONES_INPREMA,
              SUM(CASE WHEN d."ID_CENTRO_TRABAJO" <> 1 THEN dd."MONTO_APLICADO" ELSE 0 END) AS SUMA_DEDUCCIONES_TERCEROS
          FROM
              "NET_PLANILLA" p
          JOIN
              "NET_DETALLE_DEDUCCION" dd ON p."ID_PLANILLA" = dd."ID_PLANILLA"
          JOIN
              "NET_DEDUCCION" d ON dd."ID_DEDUCCION" = d."ID_DEDUCCION"
          LEFT JOIN
              "NET_PERSONA_POR_BANCO" pb ON dd."ID_PERSONA" = pb."ID_PERSONA"
          LEFT JOIN
              "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
          WHERE
              p."CODIGO_PLANILLA" = :codPlanilla
              AND dd."ESTADO_APLICACION" = 'COBRADA'
          GROUP BY
              b."NOMBRE_BANCO") deducciones
      FULL OUTER JOIN
          (SELECT
              COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
              SUM(dpb."MONTO_A_PAGAR") AS SUMA_BENEFICIOS
          FROM
              "NET_PLANILLA" p
          JOIN
              "NET_DETALLE_PAGO_BENEFICIO" dpb ON p."ID_PLANILLA" = dpb."ID_PLANILLA"
          LEFT JOIN
              "NET_PERSONA_POR_BANCO" pb ON dpb."ID_PERSONA" = pb."ID_PERSONA"
          LEFT JOIN
              "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
          WHERE
              p."CODIGO_PLANILLA" = :codPlanilla
              AND dpb."ESTADO" = 'PAGADA'
          GROUP BY
              b."NOMBRE_BANCO") beneficios
      ON deducciones."NOMBRE_BANCO" = beneficios."NOMBRE_BANCO"
    `;
  
    interface Banco {
      ID_BANCO: number;
      NOMBRE_BANCO: string;
      TOTAL_BENEFICIO: number;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
      MONTO_NETO?: number;
    }
  
    try {
      const result: any[] = await this.entityManager.query(query, [codPlanilla]);
  
      const formattedResult: Banco[] = result.map(banco => ({
        ID_BANCO: banco.ID_BANCO,
        NOMBRE_BANCO: banco.NOMBRE_BANCO,
        TOTAL_BENEFICIO: banco.SUMA_BENEFICIOS,
        DEDUCCIONES_INPREMA: banco.SUMA_DEDUCCIONES_INPREMA,
        DEDUCCIONES_TERCEROS: banco.SUMA_DEDUCCIONES_TERCEROS,
        MONTO_NETO: banco.MONTO_NETO
      }));
  
      return formattedResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por banco: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por banco.');
    }
  }
  
  async ObtenerPlanDefinPersonas(codPlanilla: string, page?: number, limit?: number): Promise<any> {
    let query = `
              SELECT DISTINCT
            per."N_IDENTIFICACION" AS "DNI",
            tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
            per."ID_PERSONA",
            perPorBan."NUM_CUENTA",
            banco."NOMBRE_BANCO",
            SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIO",
            TRIM(
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '')
            ) AS "NOMBRE_COMPLETO"
        FROM 
            "NET_DETALLE_PAGO_BENEFICIO" detBs
        
        JOIN 
            "NET_PLANILLA" plan
        ON 
            plan."ID_PLANILLA" = detBs."ID_PLANILLA"
        JOIN 
            "NET_DETALLE_BENEFICIO_AFILIADO" detBA
        ON 
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
            AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
            AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
            AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        JOIN 
            "NET_BENEFICIO" ben
        ON 
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        JOIN 
            "NET_DETALLE_PERSONA" detP
        ON 
            detBA."ID_PERSONA" = detP."ID_PERSONA"
            AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
            AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
        JOIN 
            "NET_TIPO_PERSONA" tipoP
        ON 
            detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
        JOIN 
            "NET_PERSONA" per
        ON 
            per."ID_PERSONA" = detP."ID_PERSONA"
        LEFT JOIN 
            "NET_PERSONA_POR_BANCO" perPorBan
        ON 
            detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
        LEFT JOIN 
            "NET_BANCO" banco
        ON 
            banco."ID_BANCO" = perPorBan."ID_BANCO"
        
        WHERE
                detBs."ESTADO" = 'PAGADA' AND
                plan."CODIGO_PLANILLA" = '${codPlanilla}'
                
        GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
            TRIM(
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '')
            )
    `;

    let queryI = `
            SELECT 
per."ID_PERSONA",
        SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_INPREMA"
FROM "NET_PLANILLA" plan 
INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 


INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

WHERE
    dd."ESTADO_APLICACION" = 'COBRADA' AND
    plan."CODIGO_PLANILLA" = '${codPlanilla}' AND
    instFin."NOMBRE_CENTRO_TRABAJO" = 'INPREMA'
GROUP BY 
    per."ID_PERSONA"
    `;

    let queryT = `
   SELECT 
per."ID_PERSONA",
        SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_TERCEROS"
FROM "NET_PLANILLA" plan 
INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 


INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

WHERE
    dd."ESTADO_APLICACION" = 'COBRADA' AND
    plan."CODIGO_PLANILLA" = '${codPlanilla}' AND
    instFin."NOMBRE_CENTRO_TRABAJO" != 'INPREMA'
GROUP BY 
    per."ID_PERSONA"
    `;

    interface Persona {
      DNI: string;
      ID_PERSONA: number;
      'TOTAL_BENEFICIO': number;
      NOMBRE_COMPLETO: string;
      'DEDUCCIONES_INPREMA'?: number;
      'DEDUCCIONES_TERCEROS'?: number;
    }

    interface Deduccion {
      ID_PERSONA: number;
      'DEDUCCIONES_INPREMA'?: number;
      'DEDUCCIONES_TERCEROS'?: number;
    }

    try {
      const result: Persona[] = await this.entityManager.query(query);
      const resultI: Deduccion[] = await this.entityManager.query(queryI);
      const resultT: Deduccion[] = await this.entityManager.query(queryT);

      const newResult = result.map(persona => {
        const deduccionI = resultI.find(d => d.ID_PERSONA === persona.ID_PERSONA);
        const deduccionT = resultT.find(d => d.ID_PERSONA === persona.ID_PERSONA);

        return {
          ...persona,
          DEDUCCIONES_INPREMA: deduccionI ? deduccionI['DEDUCCIONES_INPREMA'] : null,
          DEDUCCIONES_TERCEROS: deduccionT ? deduccionT['DEDUCCIONES_TERCEROS'] : null
        };
      });

      return newResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }

  async GetDeduccionesPorPlanillaSeparadas(idPlanilla: number) {
    const deducciones = await this.detalleDeduccionRepository
      .createQueryBuilder('detalle_deduccion')
      .innerJoin('detalle_deduccion.deduccion', 'deduccion')
      .innerJoin('detalle_deduccion.planilla', 'planilla')
      .select('deduccion.id_deduccion', 'ID_DEDUCCION')
      .addSelect('deduccion.nombre_deduccion', 'NOMBRE_DEDUCCION')
      .addSelect('deduccion.codigo_deduccion', 'COD_DEDUCCION')
      .addSelect('SUM(detalle_deduccion.monto_aplicado)', 'TOTAL_MONTO_APLICADO')
      .where('planilla.id_planilla = :idPlanilla', { idPlanilla })
      .groupBy('deduccion.id_deduccion')
      .addGroupBy('deduccion.nombre_deduccion')
      .addGroupBy('deduccion.codigo_deduccion')
      .getRawMany();

    const deduccionesINPREMA = deducciones.filter(d => [1, 3, 51, 45].includes(d.ID_DEDUCCION));
    const deduccionesTerceros = deducciones.filter(d => ![1, 3, 51, 45].includes(d.ID_DEDUCCION));

    return {
      deduccionesINPREMA,
      deduccionesTerceros,
    };
  }

  async generarExcel(data: any[], response: Response): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Planilla');

    // Definir las columnas
    worksheet.columns = [
      { header: 'ID_PERSONA', key: 'ID_PERSONA', width: 15 },
      { header: 'DNI', key: 'DNI', width: 15 },
      { header: 'NOMBRE_COMPLETO', key: 'NOMBRE_COMPLETO', width: 30 },
      { header: 'TOTAL BENEFICIO', key: 'TOTAL_BENEFICIO', width: 15 },
      { header: 'DEDUCCIONES TERCEROS', key: 'DEDUCCIONES_TERCEROS', width: 15 },
      { header: 'DEDUCCIONES INPREMA', key: 'DEDUCCIONES_INPREMA', width: 15 },
      { header: 'NUMERO DE CUENTA', key: 'NUM_CUENTA', width: 25 },
      { header: 'NOMBRE BANCO', key: 'NOMBRE_BANCO', width: 15 },
    ];

    // Agregar los datos al worksheet
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Formatear el archivo como buffer y enviarlo al cliente
    const buffer = await workbook.xlsx.writeBuffer();

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=planilla.xlsx');
    response.send(buffer);
  }

  async create(createPlanillaDto: CreatePlanillaDto) {
    const { secuencia, nombre_planilla } = createPlanillaDto;

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOneBy({ nombre_planilla });

      let codPlanilla = "";
      const fechaActual: Date = new Date();

      const primerDia: Date = startOfMonth(fechaActual);
      const ultimoDia: Date = endOfMonth(fechaActual);
      const mes: number = getMonth(fechaActual) + 1; // getMonth() devuelve el mes de 0 (enero) a 11 (diciembre), por lo que sumamos 1
      const anio: number = getYear(fechaActual);

      switch (nombre_planilla) {
        case "ORDINARIA JUBILADOS Y PENSIONADOS":
          codPlanilla = `ORD-JUB-PEN-${mes}-${anio}-${secuencia}`;
          break;
        case "ORDINARIA BENEFICIARIO":
          codPlanilla = `ORD-BEN-${mes}-${anio}-${secuencia}`;
          break;
        case "COMPLEMENTARIA JUBILADO Y PENSIONADO":
          codPlanilla = `COMP-JUB-PEN-${mes}-${anio}-${secuencia}`;
          break;
        case "COMPLEMENTARIA BENEFICIARIO":
          codPlanilla = `COMP-BEN-${mes}-${anio}-${secuencia}`;
          break;
        case "COMPLEMENTARIA AFILIADO":
          codPlanilla = `COMP-AFIL-${mes}-${anio}-${secuencia}`;
          break;
        case "EXTRAORDINARIA JUBILADO Y PENSIONADO":
          codPlanilla = `EXTRA-JUB-PEN-${mes}-${anio}-${secuencia}`;
          break;
        case "EXTRAORDINARIA BENEFICIARIO":
          codPlanilla = `EXTRA-JUB-${mes}-${anio}-${secuencia}`;
          break;
        default:
          throw new Error("Tipo de planilla no reconocido");
      }

      const arregloFinal = [{
        codigo_planilla: codPlanilla,
        secuencia,
        periodoInicio: `${primerDia}`,
        periodoFinalizacion: `${ultimoDia}`,
        tipoPlanilla
      }];

      if (tipoPlanilla && tipoPlanilla.id_tipo_planilla) {
        const planilla = this.planillaRepository.create(arregloFinal);
        await this.planillaRepository.save(planilla);
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
    const { offset = 0 } = paginationDto;
    return this.planillaRepository.find({
      skip: offset,
      where: {
        tipoPlanilla: { clase_planilla: "EGRESO" }
      },
      relations: ['tipoPlanilla'], // Agrega esta línea para cargar la relación
    });
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
  }

  async getDesgloseDeducciones(idPlanilla: number, idBeneficio: number): Promise<any> {
    try {
      const result = await this.planillaRepository.query(
        `
        SELECT 
          ded."ID_DEDUCCION",
          ded."NOMBRE_DEDUCCION", 
          SUM(dd."MONTO_APLICADO") AS "TOTAL_MONTO_APLICADO",
          CASE 
            WHEN ded."ID_CENTRO_TRABAJO" = 1 THEN 'INPREMA'
            ELSE 'TERCEROS'
          END AS "TIPO_DEDUCCION"
        FROM 
          "NET_DETALLE_DEDUCCION" dd
        INNER JOIN 
          "NET_DEDUCCION" ded 
        ON 
          dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        INNER JOIN 
          "NET_DETALLE_PAGO_BENEFICIO" dpb 
        ON 
          dd."ID_DETALLE_PAGO_BENEFICIO" = dpb."ID_BENEFICIO_PLANILLA"
        WHERE 
          dpb."ID_PLANILLA" = :idPlanilla
        AND 
          dpb."ID_BENEFICIO" = :idBeneficio
        GROUP BY
          ded."ID_DEDUCCION",
          ded."NOMBRE_DEDUCCION",
          CASE 
            WHEN ded."ID_CENTRO_TRABAJO" = 1 THEN 'INPREMA'
            ELSE 'TERCEROS'
          END
        `,
        [idPlanilla, idBeneficio]
      );
      return result;
    } catch (error) {
      console.error('Error al obtener el desglose de deducciones:', error);
      throw new Error('Error al obtener el desglose de deducciones');
    }
  }

  async getTotalesBeneficiosDeducciones(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        SUM(dpb."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO",
        (
            SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
            FROM "NET_DETALLE_DEDUCCION" dedd
            INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
            ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
            WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
            AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            AND dedd."ID_DEDUCCION" IN (
                SELECT ded."ID_DEDUCCION"
                FROM "NET_DEDUCCION" ded
                WHERE ded."ID_CENTRO_TRABAJO" = 1
            )
        ) AS "DEDUCCIONES_INPREMA",
        (
            SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
            FROM "NET_DETALLE_DEDUCCION" dedd
            INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
            ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
            WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
            AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            AND dedd."ID_DEDUCCION" NOT IN (
                SELECT ded."ID_DEDUCCION"
                FROM "NET_DEDUCCION" ded
                WHERE ded."ID_CENTRO_TRABAJO" = 1
            )
        ) AS "DEDUCCIONES_DE_TERCEROS",
        (
            SUM(dpb."MONTO_A_PAGAR") - (
                SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
                FROM "NET_DETALLE_DEDUCCION" dedd
                INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
                INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
                ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
                WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
                AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            )
        ) AS "NETO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" dpb
      INNER JOIN 
        "NET_BENEFICIO" ben 
        ON dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dpb."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO", 
        plan."ID_PLANILLA"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de beneficios y deducciones:', error);
      throw new InternalServerErrorException('Error al obtener los totales de beneficios y deducciones');
    }
  }

  async generarPlanillaComplementaria(tipos_persona: string): Promise<void> {
    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaComplementaria(:tipos_persona);
         END;`,
        [tipos_persona]
      );
    } catch (error) {
      if (error.message.includes('No se encontró una planilla activa para Beneficiarios')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Beneficiarios');
      } else if (error.message.includes('No se encontró una planilla activa para Jubilados')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Jubilados');
      } else {
        throw new InternalServerErrorException('Error ejecutando el procedimiento de planilla complementaria');
      }
    }
  }

  async generarPlanillaOrdinaria(tipos_persona: string): Promise<void> {
    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaOrdinaria(:tipos_persona);
         END;`,
        [tipos_persona]
      );
    } catch (error) {
      if (error.message.includes('No se encontró una planilla activa para Beneficiarios')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Beneficiarios');
      } else if (error.message.includes('No se encontró una planilla activa para Jubilados')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Jubilados');
      } else {
        throw new InternalServerErrorException('Error ejecutando el procedimiento de planilla ordinaria');
      }
    }
  }

  async getPlanillasPreliminares(codigo_planilla: string): Promise<any[]> {
    try {
      const query = `
            SELECT 
                p.ID_PERSONA,
                p.N_IDENTIFICACION,
                p.PRIMER_NOMBRE || ' ' || NVL(p.SEGUNDO_NOMBRE, '') || ' ' || p.PRIMER_APELLIDO || ' ' || NVL(p.SEGUNDO_APELLIDO, '') AS NOMBRE_COMPLETO,
                COALESCE(SUM(dpb.MONTO_A_PAGAR), 0) AS TOTAL_BENEFICIOS,
                COALESCE(SUM(CASE WHEN d.ID_CENTRO_TRABAJO = 1 THEN dd.MONTO_APLICADO ELSE 0 END), 0) AS TOTAL_DEDUCCIONES_INPREMA,
                COALESCE(SUM(CASE WHEN d.ID_CENTRO_TRABAJO IS NULL OR d.ID_CENTRO_TRABAJO != 1 THEN dd.MONTO_APLICADO ELSE 0 END), 0) AS TOTAL_DEDUCCIONES_TERCEROS
            FROM 
                NET_PERSONA p
            LEFT JOIN 
                NET_DETALLE_PAGO_BENEFICIO dpb ON p.ID_PERSONA = dpb.ID_PERSONA AND dpb.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
            LEFT JOIN 
                NET_DETALLE_DEDUCCION dd ON p.ID_PERSONA = dd.ID_PERSONA AND dd.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
            LEFT JOIN
                NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
            WHERE 
                (dpb.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
                OR dd.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA'))
            GROUP BY 
                p.ID_PERSONA, p.N_IDENTIFICACION, p.PRIMER_NOMBRE, p.SEGUNDO_NOMBRE, p.PRIMER_APELLIDO, p.SEGUNDO_APELLIDO
        `;

      const result = await this.entityManager.query(query, [codigo_planilla]);
      return result;
    } catch (error) {
      this.logger.error('Error ejecutando la consulta', error.stack);
      throw new InternalServerErrorException('Error ejecutando la consulta');
    }
  }

  async getDesglosePorPersonaPlanilla(id_persona: string, codigo_planilla: string): Promise<any> {
    try {
      const beneficiosQuery = `
        SELECT 
          dpb.MONTO_A_PAGAR,
          b.NOMBRE_BENEFICIO
        FROM 
          NET_DETALLE_PAGO_BENEFICIO dpb
        JOIN 
          NET_BENEFICIO b ON dpb.ID_BENEFICIO = b.ID_BENEFICIO
        JOIN 
          NET_PLANILLA p ON dpb.ID_PLANILLA = p.ID_PLANILLA
        WHERE 
          dpb.ID_PERSONA = :id_persona AND p.CODIGO_PLANILLA = :codigo_planilla
      `;

      const deduccionesInpremaQuery = `
            SELECT 
                d.NOMBRE_DEDUCCION,
                SUM(dd.MONTO_APLICADO) AS MONTO_APLICADO
            FROM 
                NET_DEDUCCION d
            INNER JOIN 
                NET_DETALLE_DEDUCCION dd ON d.ID_DEDUCCION = dd.ID_DEDUCCION
            INNER JOIN 
                NET_PLANILLA p ON dd.ID_PLANILLA = p.ID_PLANILLA
            WHERE 
                dd.ID_PERSONA = :id_persona
                AND p.CODIGO_PLANILLA = :codigo_planilla
                AND d.ID_CENTRO_TRABAJO = 1
            GROUP BY 
                d.NOMBRE_DEDUCCION
        `;

      const deduccionesTercerosQuery = `
            SELECT 
                d.NOMBRE_DEDUCCION,
                SUM(dd.MONTO_APLICADO) AS MONTO_APLICADO
            FROM 
                NET_DEDUCCION d
            INNER JOIN 
                NET_DETALLE_DEDUCCION dd ON d.ID_DEDUCCION = dd.ID_DEDUCCION
            INNER JOIN 
                NET_PLANILLA p ON dd.ID_PLANILLA = p.ID_PLANILLA
            WHERE 
                dd.ID_PERSONA = :id_persona
                AND p.CODIGO_PLANILLA = :codigo_planilla
                AND (d.ID_CENTRO_TRABAJO IS NULL OR d.ID_CENTRO_TRABAJO != 1)
            GROUP BY 
                d.NOMBRE_DEDUCCION
        `;

      const beneficios = await this.entityManager.query(beneficiosQuery, [id_persona, codigo_planilla]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [id_persona, codigo_planilla]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [id_persona, codigo_planilla]);

      return {
        beneficios,
        deduccionesInprema,
        deduccionesTerceros,
      };
    } catch (error) {
      this.logger.error('Error ejecutando la consulta', error.stack);
      throw new InternalServerErrorException('Error ejecutando la consulta');
    }
  }

  async updatePlanillaACerrada(codigo_planilla: string): Promise<void> {
    const queryUpdateBeneficios = `
    UPDATE NET_DETALLE_PAGO_BENEFICIO dpb
    SET dpb.ESTADO = 'PAGADA'
    WHERE dpb.ID_PLANILLA IN (
      SELECT pl.ID_PLANILLA
      FROM NET_PLANILLA pl
      WHERE pl.CODIGO_PLANILLA = :codigo_planilla
    )
  `;

    const queryUpdateDeducciones = `
    UPDATE NET_DETALLE_DEDUCCION dd
    SET dd.ESTADO_APLICACION = 'COBRADA'
    WHERE dd.ID_PLANILLA IN (
      SELECT pl.ID_PLANILLA
      FROM NET_PLANILLA pl
      WHERE pl.CODIGO_PLANILLA = :codigo_planilla
    )
  `;

    const queryUpdatePlanilla = `
    UPDATE NET_PLANILLA pl
    SET pl.ESTADO = 'CERRADA'
    WHERE pl.CODIGO_PLANILLA = :codigo_planilla
  `;

    const queryParams: any = { codigo_planilla };

    try {
      await this.entityManager.query(queryUpdateBeneficios, queryParams);
      await this.entityManager.query(queryUpdateDeducciones, queryParams);
      await this.entityManager.query(queryUpdatePlanilla, queryParams);
    } catch (error) {
      this.logger.error('Error ejecutando la actualización', error.stack);
      throw new InternalServerErrorException('Error ejecutando la actualización');
    }
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