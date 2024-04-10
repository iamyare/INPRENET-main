import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

/* import * as xlsx from 'xlsx';
import { Net_Institucion } from 'src/modules/Empresarial/institucion/entities/net_institucion.entity';
import { AfiliadoService } from 'src/modules/afiliado/afiliado.service';
import { Net_Detalle_Afiliado } from 'src/modules/afiliado/entities/Net_detalle_persona.entity';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';
import { UpdateDetallePlanIngDto } from './dto/update-detalle-plani-Ing.dto';
import { startOfMonth, endOfMonth, lastDayOfMonth } from 'date-fns';
import { getManager } from 'typeorm'; */

import { Net_SALARIO_COTIZABLE } from './entities/net_detalle_plani_ing.entity copy';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_planilla_ingreso } from './entities/net_detalle_plani_ing.entity';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { DateTime } from 'luxon';
import { Net_Persona } from '../../../afiliado/entities/Net_Persona';

@Injectable()
export class DetallePlanillaIngresoService {
  @InjectRepository(Net_Detalle_planilla_ingreso) private detallePlanillaIngr: Repository<Net_Detalle_planilla_ingreso>
  @InjectRepository(Net_Planilla) private planillaRepository: Repository<Net_Planilla>
  @InjectRepository(Net_SALARIO_COTIZABLE) private salarioCotizableRepository: Repository<Net_SALARIO_COTIZABLE>
  @InjectRepository(Net_Persona) private personaRepository: Repository<Net_Persona>
  @InjectRepository(Net_TipoPlanilla) private tipoPlanillaRepository: Repository<Net_TipoPlanilla>

  private readonly logger = new Logger(DetallePlanillaIngresoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) { }
  private calculoSueldoBase(salarioCotizableRepository): number {
    let sueldoBase;
    let porcAportMin;

    const accionesSalario = {
      "SUELDO BASE": (tem: any) => {
        sueldoBase = tem
      },
      "APORTACION MINIMA": (tem: any) => {
        porcAportMin = tem;
      },
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }

    return sueldoBase * porcAportMin
  }
  private calculoAportaciones(persona: Net_Persona, salarioCotizableRepository): number {
    const { salario_base, centroTrabajo } = persona.perfAfilCentTrabs[0]

    let LimiteSSL;
    let PorcAportacionSECPriv;
    let PorcAportacionSECPUB;

    const accionesSalario = {
      "APORTACION SECTOR PUBLICO": (tem: any) => {
        PorcAportacionSECPUB = tem
      },
      "IPC INTERANUAL": (tem: any) => {
      },
      "APORTACION SECTOR PRIVADO": (tem: any) => {
        PorcAportacionSECPriv = tem;
      },
      "LIMITE SSC": (tem: any) => {
        LimiteSSL = tem;
      },
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }
    const sueldoBase = this.calculoSueldoBase(salarioCotizableRepository);

    if (salario_base <= sueldoBase && salario_base <= LimiteSSL) {
      return sueldoBase;
    } else if (centroTrabajo.sector_economico == "PRIVADO" && salario_base <= LimiteSSL) {
      return salario_base * PorcAportacionSECPriv
    } else if (centroTrabajo.sector_economico == "PRIVADO" && salario_base > LimiteSSL) {
      return LimiteSSL
    } else if (centroTrabajo.sector_economico == "PUBLICO" && salario_base <= LimiteSSL) {
      /* return salarioBaseAfiliado * PorcAportacionSECPUB */
    }

  }

  private calculoCotizaciones(persona: Net_Persona, salarioCotizableRepository): number {
    const salarioBaseAfiliado = persona.perfAfilCentTrabs[0].salario_base
    const sector_economico = persona.perfAfilCentTrabs[0].centroTrabajo.sector_economico

    let limiteSSL;
    let cotizacionDoc;
    let cotizacionEsc;

    const accionesSalario = {
      "COTIZACION DOCENTE": (tem: any) => {
        cotizacionDoc = tem
      },
      "COTIZACION ESCALONADA": (tem: any) => {
        cotizacionEsc = tem
      },
      "LIMITE SSC": (tem: any) => {
        limiteSSL = tem;
      },
      "IPC INTERANUAL": (tem: any) => {
      }
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }

    if (salarioBaseAfiliado < 20000 && sector_economico == "PRIVADO") {
      return salarioBaseAfiliado * cotizacionDoc
    } else if (salarioBaseAfiliado >= 20000 && sector_economico == "PRIVADO") {
      return salarioBaseAfiliado * cotizacionEsc
    }

  }

  private async insertNetDetPlanilla(id_planilla, persona, salarioCotizableRepository, createDetPlanIngDTO): Promise<number> {
    const { idInstitucion, prestamos } = createDetPlanIngDTO
    let ValoresDetalle = {
      idpersona: persona.id_persona,
      idInstitucion: idInstitucion,
      sueldo: persona.perfAfilCentTrabs[0].salario_base,
      prestamos: prestamos,
      aportaciones: this.calculoAportaciones(persona, salarioCotizableRepository),
      cotizaciones: this.calculoCotizaciones(persona, salarioCotizableRepository),
      deducciones: this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + prestamos,
      sueldo_neto: persona.perfAfilCentTrabs[0].salario_base - (this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + createDetPlanIngDTO.prestamos)
    }
    const queryInsDeBBenf = `INSERT INTO NET_DETALLE_PLANILLA_ING (
        SUELDO,
        PRESTAMOS,
        APORTACIONES,
        COTIZACIONES,
        DEDUCCIONES,
        SUELDO_NETO,
        ID_PERSONA,
        ID_CENTRO_TRABAJO,
        ID_PLANILLA
      ) VALUES (
        ${ValoresDetalle.sueldo},
        ${ValoresDetalle.prestamos},
        ${ValoresDetalle.aportaciones},
        ${ValoresDetalle.cotizaciones},
        '${ValoresDetalle.deducciones}',
        '${ValoresDetalle.sueldo_neto}',
        ${ValoresDetalle.idpersona},
        ${ValoresDetalle.idInstitucion},
        ${id_planilla}
      )`

    const detPlanillaIng = await this.entityManager.query(queryInsDeBBenf);
    return detPlanillaIng;
  }



  async obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {
    let tipoPlanilla = await this.tipoPlanillaRepository.findOne({
      where: { id_tipo_planilla: id_tipo_planilla },
    });

    try {

      const { nombre_planilla } = tipoPlanilla
      const fecha = DateTime.local();
      const año = fecha.year;

      if (nombre_planilla == "PLANILLA ORDINARIA") {
        const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
        /* MES ACTUAL */
        const mes: number = 7;
        if (meses.includes(mes)) {
          const detalles = await this.detallePlanillaIngr
            .createQueryBuilder("detalle")
            .select([
              'persona.dni AS Identidad',
              'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
              'detalle.sueldo AS Sueldo',
              'detalle.aportaciones AS Aportaciones',
              'detalle.prestamos AS Prestamos',
              'detalle.cotizaciones AS Cotizaciones',
              'detalle.deducciones AS Deducciones',
              'detalle.sueldo_neto AS SueldoNeto',
              'planilla.PERIODO_INICIO AS periodo_inicio',
              'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
            ])
            .innerJoin('detalle.persona', 'persona')
            .innerJoin('detalle.centroTrabajo', 'centroTrabajo')
            .innerJoin('detalle.planilla', 'planilla')
            .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
            .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
            .andWhere('tipoPlanilla.id_tipo_planilla = :id_tipo_planilla', { id_tipo_planilla })
            .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
            .getRawMany();

          if (!detalles.length) {
            return []
            this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          }

          return detalles;
        }
      } else if (nombre_planilla == "PLANILLA DECIMO TERCERO") {
        const fechaInicioMesAnterior = DateTime.local(año, 6, 1).toFormat('dd/MM/yyyy');

        const detalles = await this.detallePlanillaIngr
          .createQueryBuilder('detalle')
          .innerJoinAndSelect('detalle.persona', 'persona')
          .innerJoinAndSelect('detalle.centroTrabajo', 'centroTrabajo')
          .innerJoinAndSelect('detalle.planilla', 'planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .select([
            'persona.dni AS Identidad',
            'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
            'detalle.sueldo AS Sueldo',
            'detalle.aportaciones AS Aportaciones',
            'detalle.prestamos AS Prestamos',
            'detalle.cotizaciones AS Cotizaciones',
            'detalle.deducciones AS Deducciones',
            'detalle.sueldo_neto AS SueldoNeto',
            'planilla.PERIODO_INICIO AS periodo_inicio',
            'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
          ])
          .where(`
        centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
        AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
        AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
            { idCentroTrabajo, id_tipo_planilla })
          .getRawMany();

        if (!detalles.length) {
          return []
          this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
        }
        return detalles

      } else if (nombre_planilla == "PLANILLA DECIMO CUARTO") {
        const fechaInicioMesAnterior = DateTime.local(año, 12, 1).toFormat('dd/MM/yyyy');

        const detalles = await this.detallePlanillaIngr
          .createQueryBuilder('detalle')
          .innerJoinAndSelect('detalle.persona', 'persona')
          .innerJoinAndSelect('detalle.centroTrabajo', 'centroTrabajo')
          .innerJoinAndSelect('detalle.planilla', 'planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .select([
            'persona.dni AS Identidad',
            'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
            'detalle.sueldo AS Sueldo',
            'detalle.aportaciones AS Aportaciones',
            'detalle.prestamos AS Prestamos',
            'detalle.cotizaciones AS Cotizaciones',
            'detalle.deducciones AS Deducciones',
            'detalle.sueldo_neto AS SueldoNeto',
            'planilla.PERIODO_INICIO AS periodo_inicio',
            'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
          ])
          .where(`
        centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
        AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
        AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
            { idCentroTrabajo, id_tipo_planilla })
          .getRawMany();
        if (!detalles.length) {
          return []
          this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
        }
        return detalles
      }
    } catch (Error) {
      console.log(Error);

    }
  }

  async obtenerDetalleIngresosAgrupCent(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {
    let tipoPlanilla = await this.tipoPlanillaRepository.findOne({
      where: { id_tipo_planilla: id_tipo_planilla },
    });

    try {
      const { nombre_planilla } = tipoPlanilla
      const fecha = DateTime.local();
      const año = fecha.year;

      if (nombre_planilla == "PLANILLA ORDINARIA") {
        const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
        /* MES ACTUAL */
        const mes: number = 7;

        if (meses.includes(mes)) {
          const detalles = await this.detallePlanillaIngr
            .createQueryBuilder("detalle")
            .select([
              'centroTrabajo.id_centro_trabajo AS id_centro_trabajo',
              'centroTrabajo.nombre_centro_trabajo AS nombre_centro_trabajo',
              'SUM(detalle.sueldo) AS Sueldo',
              'SUM(detalle.aportaciones) AS Aportaciones',
              'SUM(detalle.prestamos) AS Prestamos',
              'SUM(detalle.cotizaciones) AS Cotizaciones',
              'SUM(detalle.deducciones) AS Deducciones'
            ])
            .innerJoin('detalle.persona', 'persona')
            .innerJoin('detalle.centroTrabajo', 'centroTrabajo')
            .innerJoin('detalle.planilla', 'planilla')
            .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
            .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
            .andWhere('tipoPlanilla.id_tipo_planilla = :id_tipo_planilla', { id_tipo_planilla })
            .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
            .groupBy('centroTrabajo.id_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('centroTrabajo.id_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('centroTrabajo.nombre_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.sueldo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.aportaciones') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.prestamos') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.cotizaciones') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.deducciones') // Agrupamos por el id del centro de trabajo
            .getRawMany();

          if (!detalles.length) {
            return []
            this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          }

          return detalles;
        }
      } else if (nombre_planilla == "PLANILLA DECIMO TERCERO") {
        const fechaInicioMesAnterior = DateTime.local(año, 6, 1).toFormat('dd/MM/yyyy');

        /* const detalles = await this.detallePlanillaIngr
        .createQueryBuilder("detalle")
            .select([
              'centroTrabajo.id_centro_trabajo AS id_centro_trabajo',
              'centroTrabajo.nombre_centro_trabajo AS nombre_centro_trabajo',
              'SUM(detalle.sueldo) AS Sueldo',
              'SUM(detalle.aportaciones) AS Aportaciones',
              'SUM(detalle.prestamos) AS Prestamos',
              'SUM(detalle.cotizaciones) AS Cotizaciones',
              'SUM(detalle.deducciones) AS Deducciones'
            ])
            .innerJoin('detalle.persona', 'persona')
            .innerJoin('detalle.centroTrabajo', 'centroTrabajo')
            .innerJoin('detalle.planilla', 'planilla')
            .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
            .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
            .andWhere('tipoPlanilla.id_tipo_planilla = :id_tipo_planilla', { id_tipo_planilla })
            .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
            .groupBy('centroTrabajo.id_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('centroTrabajo.id_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('centroTrabajo.nombre_centro_trabajo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.sueldo') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.aportaciones') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.prestamos') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.cotizaciones') // Agrupamos por el id del centro de trabajo
            .addGroupBy('detalle.deducciones') // Agrupamos por el id del centro de trabajo
            .getRawMany(); */

        const detalles = await this.detallePlanillaIngr
          .createQueryBuilder('detalle')
          .innerJoinAndSelect('detalle.persona', 'persona')
          .innerJoinAndSelect('detalle.centroTrabajo', 'centroTrabajo')
          .innerJoinAndSelect('detalle.planilla', 'planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .select([
            'persona.dni AS Identidad',
            'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
            'detalle.sueldo AS Sueldo',
            'detalle.aportaciones AS Aportaciones',
            'detalle.prestamos AS Prestamos',
            'detalle.cotizaciones AS Cotizaciones',
            'detalle.deducciones AS Deducciones',
            'detalle.sueldo_neto AS SueldoNeto',
            'planilla.PERIODO_INICIO AS periodo_inicio',
            'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
          ])
          .where(`
        centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
        AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
        AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
            { idCentroTrabajo, id_tipo_planilla })
          .getRawMany();

        if (!detalles.length) {
          return []
          this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
        }
        return detalles

      } else if (nombre_planilla == "PLANILLA DECIMO CUARTO") {
        const fechaInicioMesAnterior = DateTime.local(año, 12, 1).toFormat('dd/MM/yyyy');

        const detalles = await this.detallePlanillaIngr
          .createQueryBuilder('detalle')
          .innerJoinAndSelect('detalle.persona', 'persona')
          .innerJoinAndSelect('detalle.centroTrabajo', 'centroTrabajo')
          .innerJoinAndSelect('detalle.planilla', 'planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .select([
            'persona.dni AS Identidad',
            'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
            'detalle.sueldo AS Sueldo',
            'detalle.aportaciones AS Aportaciones',
            'detalle.prestamos AS Prestamos',
            'detalle.cotizaciones AS Cotizaciones',
            'detalle.deducciones AS Deducciones',
            'detalle.sueldo_neto AS SueldoNeto',
            'planilla.PERIODO_INICIO AS periodo_inicio',
            'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
          ])
          .where(`
        centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
        AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
        AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
            { idCentroTrabajo, id_tipo_planilla })
          .getRawMany();
        if (!detalles.length) {
          return []
          this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
        }
        return detalles
      }
    } catch (Error) {
      console.log(Error);

    }
  }

  /* Retorna registros de la ultima planilla segun centro de trabajo  */
  async buscarUltimaPlanCarg(idCentroTrabajo: number): Promise<any> {
    try {
      const detalles = await this.detallePlanillaIngr
        .createQueryBuilder("detalle")
        .select([
          'detalle.ID_PERSONA AS id_persona',
          'detalle.ID_CENTRO_TRABAJO AS id_centro_trabajo',
          'detalle.sueldo AS Sueldo',
          'detalle.prestamos AS Prestamos',
          'detalle.aportaciones AS Aportaciones',
          'detalle.cotizaciones AS Cotizaciones',
          'detalle.deducciones AS Deducciones',
          'detalle.sueldo_neto AS SueldoNeto',
          'detalle.ID_PLANILLA AS id_planilla',
          'detalle.estado AS estado'
        ])
        .innerJoin('detalle.persona', 'persona')
        .innerJoin('detalle.centroTrabajo', 'centroTrabajo')
        .innerJoin('detalle.planilla', 'planilla')
        .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
        .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
        .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA")`)
        .getRawMany();

      if (!detalles) {
        return {}
      } else if (detalles) {
        return detalles;
      }

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async insertPlanilla(codigo_planilla: string, id_tipo_planillaR: number, mes, año): Promise<any> {
    const currentDate = DateTime.now();
    const periodoInicio = DateTime.local(año, mes, currentDate.startOf('month').day).toFormat('dd/MM/yyyy');
    const periodoFinalizacion = DateTime.local(año, mes, currentDate.endOf('month').day).toFormat('dd/MM/yyyy');

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOne({
        where: { id_tipo_planilla: id_tipo_planillaR },
      });

      if (tipoPlanilla && tipoPlanilla.id_tipo_planilla) {
        const planilla = this.planillaRepository.create({
          "codigo_planilla": codigo_planilla,
          "secuencia": 1,
          "periodoInicio": periodoInicio,
          "periodoFinalizacion": periodoFinalizacion,
          "tipoPlanilla": tipoPlanilla
        })

        await this.planillaRepository.save(planilla)
        return planilla;

      } else {
        return []
        throw new Error("No se encontró ningún tipo de planilla con el nombre proporcionado");
      }

    } catch (error) {
      console.log(error);
    }
  }

  async obtIdPlanillaSeleccionada(mesActual): Promise<number> {
    const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
    const mesActualesDT: number[] = [6];
    const mesActualesDC: number[] = [12];
    let id_tipoPlanilla;

    if (meses.includes(mesActual)) {
      let planillaSel = await this.tipoPlanillaRepository.findOne({
        where: { nombre_planilla: "PLANILLA ORDINARIA" },
      });
      id_tipoPlanilla = planillaSel.id_tipo_planilla

    } else if (mesActualesDT.includes(mesActual)) {
      let planillaSel = await this.tipoPlanillaRepository.findOne({
        where: { nombre_planilla: "PLANILLA DECIMO TERCERO" },
      });
      id_tipoPlanilla = planillaSel.id_tipo_planilla

    } else if (mesActualesDC.includes(mesActual)) {
      let planillaSel = await this.tipoPlanillaRepository.findOne({
        where: { nombre_planilla: "PLANILLA DECIMO CUARTO" },
      });
      id_tipoPlanilla = planillaSel.id_tipo_planilla

    }

    return id_tipoPlanilla
  }

  async create(idCentroEducativo: number) {
    const fechaActual: Date = new Date();
    const mes = 7
    const año: number = fechaActual.getFullYear();

    const codPlan: string = "PLAN-ING-" + mes + "-" + año;

    try {
      let id_tipoPlanilla = await this.obtIdPlanillaSeleccionada(mes);

      /*       let planillaSel = await this.tipoPlanillaRepository.findOne({
              where: { nombre_planilla: "PLANILLA ORDINARIA" },
            });
      
            id_tipoPlanilla = planillaSel.id_tipo_planilla */

      let planilla = await this.planillaRepository.findOne({
        where: { codigo_planilla: codPlan },
      });

      const DetPlanIng = await this.buscarUltimaPlanCarg(idCentroEducativo).then((val) => {
        return val
      });

      if (planilla == null) {
        if (DetPlanIng && DetPlanIng.length > 0) {
          const planillaId = this.insertPlanilla(codPlan, id_tipoPlanilla, mes, año);

          planillaId.then((val) => {
            if (val) {
              return this.insertNetDetPlanillaMesAnt(val.id_planilla, DetPlanIng);
            }
          })
        }
      } else {
        if (DetPlanIng && DetPlanIng.length > 0) {
          return this.insertNetDetPlanillaMesAnt(planilla.id_planilla, DetPlanIng);
        }
      }

    } catch (error) {
      this.handleException(error);
    }
  }

  private async insertNetDetPlanillaMesAnt(id_planilla, DetPlanIng): Promise<any> {
    try {
      // Mapea los datos a instancias de la entidad
      const detalles = DetPlanIng.map(detalle => {

        const netDetalle = new Net_Detalle_planilla_ingreso();
        netDetalle.sueldo = detalle.SUELDO;
        netDetalle.prestamos = detalle.prestamos;
        netDetalle.aportaciones = detalle.APORTACIONES;
        netDetalle.cotizaciones = detalle.COTIZACIONES;
        netDetalle.deducciones = detalle.DEDUCCIONES;
        netDetalle.sueldo_neto = detalle.SUELDONETO;
        netDetalle.persona = detalle.ID_PERSONA;
        netDetalle.planilla = id_planilla;
        netDetalle.centroTrabajo = detalle.ID_CENTRO_TRABAJO;
        return netDetalle;
      });

      // Inserta las instancias en la base de datos
      const result = await this.detallePlanillaIngr.save(detalles);

      // Actualiza el estado a 'CARGADO' para los registros apropiados
      await this.detallePlanillaIngr.createQueryBuilder()
        .update(new Net_Detalle_planilla_ingreso)
        .set({ estado: 'CARGADO' })
        .where('id_detalle_plan_Ing IN (:...ids)', { ids: DetPlanIng.map(detalle => detalle.id_detalle_plan_Ing) })
        .execute();

      return result;
    } catch (error) {
      console.log(error);
    }
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
        throw new BadRequestException('La Planilla ya existe');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

}