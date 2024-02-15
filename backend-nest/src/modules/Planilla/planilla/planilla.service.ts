import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { DetalleBeneficio } from '../detalle_beneficio/entities/detalle_beneficio.entity';
import { Planilla } from './entities/planilla.entity';
import { TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { isUUID } from 'class-validator';
import { DetalleBeneficioService } from '../detalle_beneficio/detalle_beneficio.service';
import { DetalleDeduccionService } from '../detalle-deduccion/detalle-deduccion.service';

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
    @InjectRepository(DetalleDeduccion)
    private detalleDeduccionRepository: Repository<DetalleDeduccion>,
    @InjectRepository(Beneficio)
    private BeneficioRepository: Repository<Beneficio>,
    @InjectRepository(Deduccion)
    private DeduccionRepository: Repository<Deduccion>,
    @InjectRepository(Institucion)
    private institucionRepository: Repository<Institucion>,
    private detalleBeneficioService: DetalleBeneficioService,
    private detalleDeduccionService: DetalleDeduccionService,){};

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
            SUM(detBs."monto") AS "Total Beneficio"
      FROM
            "C##TEST"."afiliado" afil
      INNER JOIN
            "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
      LEFT JOIN
            "C##TEST"."detalle_beneficio" detBs ON afil."id_afiliado" = detBs."id_afiliado"
            AND detBs."estado" = 'NO PAGADA'
            AND TO_DATE(detBs."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
            AND TO_DATE(detBs."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
      LEFT JOIN
            "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBs."id_beneficio"
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
                SELECT detB."id_afiliado"
                FROM "C##TEST"."detalle_beneficio" detB
                WHERE detB."estado" = 'PAGADA' AND 
                detB."id_afiliado" = beneficios."id_afiliado"
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
            SUM(detBs."monto") AS "Total Beneficio"
    FROM
        "C##TEST"."afiliado" afil
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "C##TEST"."detalle_beneficio" detBs ON afil."id_afiliado" = detBs."id_afiliado"
    LEFT JOIN
        "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBs."id_beneficio" 
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
        SUM(detBs."monto") AS "Total Beneficio"
    FROM
        "C##TEST"."detalle_beneficio" detBs
    LEFT JOIN
        "C##TEST"."afiliado" afil ON afil."id_afiliado" = detBs."id_afiliado"
    INNER JOIN
        "C##TEST"."detalle_afiliado" detAf ON afil."id_afiliado" = detAf."id_afiliado"
    LEFT JOIN
        "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBs."id_beneficio"
    WHERE
        detBs."estado" = 'NO PAGADA' AND
        detBs."id_afiliado" NOT IN (
            SELECT
                detB."id_afiliado"
            FROM
                "C##TEST"."detalle_beneficio" detB
            WHERE
                detB."estado" NOT IN ('NO PAGADA', 'INCONSISTENCIA')
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
            WHERE detB."id_afiliado" = afil."id_afiliado" AND detB."estado" = 'PAGADA'
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

  findAll() {
    return `This action returns all planilla`;
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
  
  update(id: number, updatePlanillaDto: UpdatePlanillaDto) {
    return `This action updates a #${id} planilla`;
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

  async createView(): Promise<void> {
    /* const createViewQuery = `
      CREATE OR REPLACE VIEW vista_planilla_ordinaria AS
      SELECT
  afil."id_afiliado",
  afil."dni",
  afil."primer_nombre",
  LISTAGG(DISTINCT ben."nombre_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio") AS "beneficiosNombres",
  LISTAGG(DISTINCT ded."nombre_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion") AS "deduccionesNombres"
FROM
  "C##TEST"."afiliado" afil
LEFT JOIN
  "C##TEST"."detalle_beneficio" detBs ON afil."id_afiliado" = detBs."id_afiliado"
  AND detBs."estado" = 'NO PAGADA'
  AND TO_DATE(detBs."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('01-01-2025', 'DD-MM-YYYY')
  AND TO_DATE(detBs."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('01-01-2025', 'DD-MM-YYYY')
LEFT JOIN
  "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBs."id_beneficio"
LEFT JOIN
  "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
  AND detDs."estado_aplicacion" = 'NO COBRADA'
  AND TO_DATE(CONCAT(detDs."anio", LPAD(detDs."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('01-01-2025', 'DD-MM-YYYY')
LEFT JOIN
  "C##TEST"."deduccion" ded ON ded."id_deduccion" = detDs."id_deduccion"
WHERE
  afil."id_afiliado" IN (
    SELECT detB."id_afiliado"
    FROM "C##TEST"."detalle_beneficio" detB
    WHERE detB."estado" = 'PAGADA'
    UNION
    SELECT detD."id_afiliado"
    FROM "C##TEST"."detalle_deduccion" detD
    WHERE detD."estado_aplicacion" = 'COBRADA'
  )
GROUP BY
  afil."id_afiliado",
  afil."dni",
  afil."primer_nombre";
    `; */let createViewQuery:any ;
    await this.planillaRepository.query(createViewQuery);
  }

  async createComplementaryView(): Promise<void> {
    const createViewQuery = `
      CREATE OR REPLACE VIEW vista_planilla_complementaria AS
      SELECT
        afil."id_afiliado",
        afil."dni",
        afil."primer_nombre",
        LISTAGG(DISTINCT ben."nombre_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio") AS "beneficiosNombres",
        LISTAGG(DISTINCT ded."nombre_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion") AS "deduccionesNombres"
      FROM
        "C##TEST"."detalle_beneficio" detBs
      LEFT JOIN
        "C##TEST"."afiliado" afil ON afil."id_afiliado" = detBs."id_afiliado"
      LEFT JOIN
        "C##TEST"."beneficio" ben ON ben."id_beneficio" = detBs."id_beneficio"
      LEFT JOIN
        "C##TEST"."detalle_deduccion" detDs ON afil."id_afiliado" = detDs."id_afiliado"
      LEFT JOIN
        "C##TEST"."deduccion" ded ON detDs."id_deduccion" = ded."id_deduccion"
      WHERE
        detBs."estado" = 'NO PAGADA' AND detDs."estado_aplicacion" = 'NO COBRADO'
        AND detBs."id_afiliado" NOT IN (
            SELECT
                detB."id_afiliado"
            FROM
                "C##TEST"."detalle_beneficio" detB
            WHERE
                detB."estado" != 'NO PAGADA'
        ) AND (
            detDs."id_afiliado" NOT IN (
                SELECT detD."id_afiliado"
                FROM "C##TEST"."detalle_deduccion" detD
                WHERE "estado_aplicacion" != 'NO COBRADO'
            )
        )
      GROUP BY
        afil."id_afiliado",
        afil."dni",
        afil."primer_nombre"
    `;

    await this.planillaRepository.query(createViewQuery);
  }

  async createExtraOrdinariaView(): Promise<void> {
    const createViewQuery = `
      CREATE OR REPLACE VIEW vista_planilla_extraordinaria AS
          SELECT
          afil."id_afiliado",
          afil."dni",
          afil."primer_nombre",
          -- LISTAGG(DISTINCT ben."id_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio")  beneficiosIds,
          LISTAGG(DISTINCT ben."nombre_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio")  beneficiosNombres,
          -- LISTAGG(DISTINCT ded."id_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion")  deduccionesIds,
          LISTAGG(DISTINCT ded."nombre_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion")  deduccionesNombres
      FROM
          "C##TEST"."afiliado" afil
      LEFT JOIN
          "C##TEST"."detalle_deduccion" detD ON afil."id_afiliado" = detD."id_afiliado" AND detD."estado_aplicacion" = 'INCONSISTENCIA'
      LEFT JOIN
          "C##TEST"."deduccion" ded ON detD."id_deduccion" = ded."id_deduccion"
      LEFT JOIN
          "C##TEST"."detalle_beneficio" detB ON afil."id_afiliado" = detB."id_afiliado" AND detB."estado" = 'INCONSISTENCIA' 
      LEFT JOIN
          "C##TEST"."beneficio" ben ON detB."id_beneficio" = ben."id_beneficio"
      WHERE
          (
              TO_DATE(detB."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND 
              TO_DATE('01-02-2024', 'DD-MM-YYYY') AND 
              TO_DATE(detB."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND 
              TO_DATE('29-02-2024', 'DD-MM-YYYY')
              AND afil."id_afiliado" = '1'  AND detB."estado" = 'INCONSISTENCIA' 
          ) OR (
            TO_DATE(CONCAT(detD."anio", LPAD(detD."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('01-02-2024', 'DD-MM-YYYY') AND 
            TO_DATE('29-02-2024', 'DD-MM-YYYY') AND 
            afil."id_afiliado" = '1' AND
            detD."estado_aplicacion" = 'INCONSISTENCIA'
          )
      GROUP BY
          afil."id_afiliado", afil."primer_nombre", afil."dni"
    `;

    await this.planillaRepository.query(createViewQuery);
  }

}


/*
  SELECT
      afil."id_afiliado",
      afil."dni",
      afil."primer_nombre",
      LISTAGG(DISTINCT ben."id_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio")  beneficiosIds,
      LISTAGG(DISTINCT ben."nombre_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio")  beneficiosNombres,
      LISTAGG(DISTINCT ded."id_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion")  deduccionesIds,
      LISTAGG(DISTINCT ded."nombre_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion")  deduccionesNombres
  FROM
      "C##TEST"."afiliado" afil
  LEFT JOIN
      "C##TEST"."detalle_deduccion" detD ON afil."id_afiliado" = detD."id_afiliado"
  LEFT JOIN
      "C##TEST"."deduccion" ded ON detD."id_deduccion" = ded."id_deduccion"
  LEFT JOIN
      "C##TEST"."detalle_beneficio" detB ON afil."id_afiliado" = detB."id_afiliado"
  LEFT JOIN
      "C##TEST"."beneficio" ben ON detB."id_beneficio" = ben."id_beneficio"
  WHERE
      (
          TO_DATE(detB."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoInicio}', 'DD-MM-YYYY')
          AND TO_DATE(detB."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
      )
      OR
      TO_DATE(CONCAT(detD."anio", LPAD(detD."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('${periodoInicio}', 'DD-MM-YYYY') AND TO_DATE('${periodoFinalizacion}', 'DD-MM-YYYY')
  GROUP BY
      afil."id_afiliado", afil."primer_nombre", afil."dni"
      ;
*/


