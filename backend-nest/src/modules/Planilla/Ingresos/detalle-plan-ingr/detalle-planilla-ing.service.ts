import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindOptionsWhere, LessThanOrEqual, Repository } from 'typeorm';
import { Net_Institucion } from 'src/modules/Empresarial/institucion/entities/net_institucion.entity';
import * as xlsx from 'xlsx';
import { AfiliadoService } from 'src/modules/afiliado/afiliado.service';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Net_Detalle_Afiliado } from 'src/modules/afiliado/entities/Net_detalle_persona.entity';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';
import { UpdateDetallePlanIngDto } from './dto/update-detalle-plani-Ing.dto';
import { Net_Detalle_planilla_ingreso } from './entities/net_detalle_plani_ing.entity';
import { Net_SALARIO_COTIZABLE } from './entities/net_detalle_plani_ing.entity copy';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { startOfMonth, endOfMonth, lastDayOfMonth } from 'date-fns';
import { Length } from 'class-validator';
import { DateTime } from 'luxon';
import { getManager } from 'typeorm';

@Injectable()
export class DetallePlanillaIngresoService {
  private readonly logger = new Logger(DetallePlanillaIngresoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) { }

  @InjectRepository(Net_Detalle_planilla_ingreso)
  private detallePlanillaIngr: Repository<Net_Detalle_planilla_ingreso>

  @InjectRepository(Net_Planilla)
  private planillaRepository: Repository<Net_Planilla>

  @InjectRepository(Net_SALARIO_COTIZABLE)
  private salarioCotizableRepository: Repository<Net_SALARIO_COTIZABLE>
  @InjectRepository(Net_Persona)
  private personaRepository: Repository<Net_Persona>

  @InjectRepository(Net_TipoPlanilla)
  private tipoPlanillaRepository: Repository<Net_TipoPlanilla>

  private calculoAportaciones(persona: Net_Persona, salarioCotizableRepository): number {
    const salarioBaseAfiliado = persona.perfAfilCentTrabs[0].salario_base
    const sector_economico = persona.perfAfilCentTrabs[0].centroTrabajo.sector_economico
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

    if (salarioBaseAfiliado <= sueldoBase && salarioBaseAfiliado <= LimiteSSL) {
      return sueldoBase;
    } else if (sector_economico == "PRIVADO" && salarioBaseAfiliado <= LimiteSSL) {
      return salarioBaseAfiliado * PorcAportacionSECPriv
    } else if (sector_economico == "PRIVADO" && salarioBaseAfiliado > LimiteSSL) {
      return LimiteSSL
    } else if (sector_economico == "PUBLICO" && salarioBaseAfiliado <= LimiteSSL) {
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

  async obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {
    console.log(id_tipo_planilla);
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

  async create() {
    const fechaActual: Date = new Date();
    // const currentDate = DateTime.now()
    // mes actual
    // mes = fechaActual.getMonth()

    const idCentroEducativo: number = 6;
    const mes = 7

    const año: number = fechaActual.getFullYear();
    const codPlan: string = "PLAN-ING-" + mes + "-" + año;

    try {
      let planilla = await this.planillaRepository.findOne({
        where: { codigo_planilla: codPlan },
      });

      /* Busca registros del mes anterior */
      const DetPlanIng = await this.buscarPorMesAct(mes).then((val) => {
        return val
      });

      const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
      const mesesDT: number[] = [6];
      const mesesDC: number[] = [12];

      /* MES ACTUAL */
      let id_tipoPlanilla
      if (meses.includes(mes)) {
        let planillaSel = await this.tipoPlanillaRepository.findOne({
          where: { nombre_planilla: "PLANILLA ORDINARIA" },
        });
        id_tipoPlanilla = planillaSel.id_tipo_planilla
      } else if (mesesDT.includes(mes)) {
        let planillaSel = await this.tipoPlanillaRepository.findOne({
          where: { nombre_planilla: "PLANILLA DECIMO TERCERO" },
        });
        id_tipoPlanilla = planillaSel.id_tipo_planilla
      } else if (mesesDC.includes(mes)) {
        let planillaSel = await this.tipoPlanillaRepository.findOne({
          where: { nombre_planilla: "PLANILLA DECIMO CUARTO" },
        });
        id_tipoPlanilla = planillaSel.id_tipo_planilla
      }

      if (planilla == null) {
        if (DetPlanIng) {
          if (DetPlanIng.detallePlanIngreso.length > 0) {
            const planillaId = this.insertPlanilla(codPlan, id_tipoPlanilla, mes, año);
            planillaId.then((val) => {
              if (val) {
                return this.insertNetDetPlanillaMesAnt(val.id_planilla, DetPlanIng.detallePlanIngreso, DetPlanIng.id_persona, idCentroEducativo);
              }
            })
          }

        }
      } else {
        if (DetPlanIng) {
          if (DetPlanIng.detallePlanIngreso.length > 0) {
            return this.insertNetDetPlanillaMesAnt(planilla.id_planilla, DetPlanIng.detallePlanIngreso, DetPlanIng.id_persona, idCentroEducativo);
          }
        }
      }

    } catch (error) {
      this.handleException(error);
    }
  }

  /* Retorna registros del mes anterior  */
  async buscarPorMesAct(mes: number): Promise<any> {
    const fechaActual: Date = new Date();
    const año: number = fechaActual.getFullYear();
    const codPlanMesAnt: string = `PLAN-ING-${mes - 1}-${año}`;

    try {
      const año = new Date().getFullYear();
      const fechaInicioMesAnterior = new Date(año, mes - 2, 1);
      const fechaFinMesAnterior = new Date(año, mes - 1, 0);

      const persona = await this.personaRepository.findOne({
        where: {
          estadoAfiliado: { Descripcion: 'ACTIVO' },
          detallePlanIngreso: {
            planilla:
              { codigo_planilla: codPlanMesAnt },
            estado: "NO CARGADO"
          }
        },
        relations: ['detallePlanIngreso', 'detallePlanIngreso.planilla', "estadoAfiliado"],
      });

      if (!persona) {
        throw new NotFoundException(`No se encontró ningún registro`);
      } else if (persona) {
        const planillaEnMesAnterior = persona.detallePlanIngreso.some(detalle => {

          if (detalle.planilla) {
            const [diaInicio, mesInicio, añoInicio] = detalle.planilla.periodoInicio.split('/').map(Number);
            const [diaFin, mesFin, añoFin] = detalle.planilla.periodoFinalizacion.split('/').map(Number);

            const periodoInicio = new Date(añoInicio, mesInicio - 1, diaInicio);
            const periodoFinalizacion = new Date(añoFin, mesFin - 1, diaFin);

            return (
              periodoInicio >= fechaInicioMesAnterior && periodoFinalizacion <= fechaFinMesAnterior
            );
          }
        });

        if (!planillaEnMesAnterior) {
          return undefined
          /* throw new NotFoundException(`La persona con DNI ${dni} no estuvo registrada en una planilla en el mes ${mes - 1}`); */
        }
        return persona;
      }

    } catch (error) {
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
      /* this.handleException(error); */
    }
  }

  private async insertNetDetPlanillaMesAnt(id_planilla, DetPlanIng, id_persona, id_centro_trabajo): Promise<any> {
    try {
      // Mapea los datos a instancias de la entidad
      const detalles = DetPlanIng.map(detalle => {
        const netDetalle = new Net_Detalle_planilla_ingreso();
        netDetalle.sueldo = detalle.sueldo;
        netDetalle.prestamos = detalle.prestamos;
        netDetalle.aportaciones = detalle.aportaciones;
        netDetalle.cotizaciones = detalle.cotizaciones;
        netDetalle.deducciones = detalle.deducciones;
        netDetalle.sueldo_neto = detalle.sueldo_neto;
        netDetalle.persona = id_persona;
        netDetalle.planilla = id_planilla;
        netDetalle.centroTrabajo = id_centro_trabajo;
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