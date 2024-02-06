import { Injectable } from '@nestjs/common';
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
/* import { Afiliado } from 'src/afiliado/entities/detalle_afiliado.entity'; */
// import { detalleBeneficio } from '../beneficio_planilla/entities/beneficio_planilla.entity';
import { format } from 'date-fns';

@Injectable()
export class PlanillaService {

  constructor(
  @InjectRepository(DetalleDeduccion)
  private detalleDeduccionRepository: Repository<DetalleDeduccion>,

  @InjectRepository(DetalleBeneficio)
  private detalleBeneficioRepository: Repository<DetalleBeneficio>,
  @InjectRepository(Beneficio)
  private BeneficioRepository: Repository<Beneficio>,
  
  @InjectRepository(Deduccion)
  private DeduccionRepository: Repository<Deduccion>,

  @InjectRepository(Afiliado)
  private afiliadoRepository: Repository<Afiliado>,
  @InjectRepository(Institucion)
  private institucionRepository: Repository<Institucion>,){
   
  }
  create(createPlanillaDto: CreatePlanillaDto) {
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

  findOne(id: number) {
    return `This action returns a #${id} planilla`;
  }

  update(id: number, updatePlanillaDto: UpdatePlanillaDto) {
    return `This action updates a #${id} planilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
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
      "C##TEST"."detalle_deduccion" detD ON "C##TEST"."afil"."id_afiliado" = detD."id_afiliado"
  LEFT JOIN
      "C##TEST"."deduccion" ded ON detD.id_deduccion = ded."id_deduccion"
  LEFT JOIN
      "C##TEST"."beneficio_planilla" detB ON "C##TEST"."afil"."id_afiliado" = detB."id_afiliado"
  LEFT JOIN
      "C##TEST"."beneficio" ben ON "C##TEST"."detB"."id_beneficio" = ben."id_beneficio"
  WHERE
      (
          TO_DATE(detB."periodoInicio", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('01-02-2024', 'DD-MM-YYYY')
          AND TO_DATE(detB."periodoFinalizacion", 'DD-MM-YYYY') BETWEEN TO_DATE(SYSDATE, 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
      )
      OR
      TO_DATE(CONCAT(detD."anio", LPAD(detD.mes, 2, '0')), 'YYYYMM') BETWEEN TO_DATE('01-02-2024', 'DD-MM-YYYY') AND TO_DATE('29-02-2024', 'DD-MM-YYYY')
  GROUP BY
      afil."id_afiliado, afil."primer_nombre, afil."dni;
*/