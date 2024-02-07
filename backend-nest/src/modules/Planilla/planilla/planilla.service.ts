import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { Repository } from 'typeorm';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { DetalleBeneficio } from '../detalle_beneficio/entities/detalle_beneficio.entity';
import { format } from 'date-fns';
import { Planilla } from './entities/planilla.entity';
import { TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
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
    private institucionRepository: Repository<Institucion>,){};
    
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
      (TO_DATE(detB.periodoInicio, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('01-02-2024', 'DD-MM-YYYY')) AND
      (TO_DATE(detB.periodoFinalizacion, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')) OR
      (TO_DATE(CONCAT(detD.anio, LPAD(detD.mes, 2, '0')), 'YYYYMM') BETWEEN TO_DATE('01-02-2024', 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY'))
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
      (TO_DATE(detBen.periodoInicio, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('01-02-2024', 'DD-MM-YYYY')) AND
      (TO_DATE(detBen.periodoFinalizacion, 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY'))
      `, {
        periodoInicio: periodoInicio,
        periodoFinalizacion: periodoFinalizacion,
      })
      .getRawMany();

    return resultado;
  }

  async findOne(term: any) {
    let Planilla: Planilla;
    if (isUUID(term)) {
      Planilla = await this.planillaRepository.findOneBy({ id_planilla: term});
    } else {
      const queryBuilder = this.planillaRepository.createQueryBuilder('planilla');
      Planilla = await queryBuilder
        .where('"codigo_planilla" = :term AND "estado" = \'ACTIVA\'', { term } )
        .getOne();
    }
    if (!Planilla) {
      throw new NotFoundException(`planilla con ${term} no encontrado.`);
    }
    return Planilla;
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
    const createViewQuery = `
      CREATE OR REPLACE VIEW vista_planilla_ordinaria AS
      SELECT
        afil."id_afiliado",
        afil."dni",
        afil."primer_nombre",
        LISTAGG(DISTINCT ben."nombre_beneficio", ',') WITHIN GROUP (ORDER BY ben."id_beneficio") AS beneficiosNombres,
        LISTAGG(DISTINCT ded."nombre_deduccion", ',') WITHIN GROUP (ORDER BY ded."id_deduccion") AS deduccionesNombres
      FROM
        "C##TEST"."afiliado" afil
      LEFT JOIN
        "C##TEST"."detalle_deduccion" detD ON afil."id_afiliado" = detD."id_afiliado" AND detD."estado_aplicacion" = 'COBRADA'
      LEFT JOIN
        "C##TEST"."deduccion" ded ON detD."id_deduccion" = ded."id_deduccion"
      LEFT JOIN
        "C##TEST"."detalle_beneficio" detB ON afil."id_afiliado" = detB."id_afiliado" AND detB."estado" = 'NO PAGADO'
      LEFT JOIN
        "C##TEST"."beneficio" ben ON detB."id_beneficio" = ben."id_beneficio"
      WHERE
        (TO_DATE(detB."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('01-02-2024', 'DD-MM-YYYY')
        AND TO_DATE(detB."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
        AND afil."id_afiliado" = '1' AND detB."estado" = 'NO PAGADO')
        OR (TO_DATE(CONCAT(detD."anio", LPAD(detD."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('01-02-2024', 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
        AND afil."id_afiliado" = '1' AND detD."estado_aplicacion" = 'COBRADA')
      GROUP BY
        afil."id_afiliado", afil."primer_nombre", afil."dni"
    `;

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
        detBs."estado" = 'NO PAGADO' AND detDs."estado_aplicacion" = 'NO COBRADO'
        AND detBs."id_afiliado" NOT IN (
            SELECT
                detB."id_afiliado"
            FROM
                "C##TEST"."detalle_beneficio" detB
            WHERE
                detB."estado" != 'NO PAGADO'
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
          TO_DATE(detB."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('01-02-2024', 'DD-MM-YYYY')
          AND TO_DATE(detB."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
      )
      OR
      TO_DATE(CONCAT(detD."anio", LPAD(detD."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE('01-02-2024', 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
  GROUP BY
      afil."id_afiliado", afil."primer_nombre", afil."dni"
      ;
*/