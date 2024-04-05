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
import { startOfMonth, endOfMonth } from 'date-fns';
import { Length } from 'class-validator';
import { DateTime } from 'luxon';
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

  async obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {
    try {
      let tipo_planilla = "PLANILLA ORDINARIA";

      const fecha = DateTime.local();
      const año = fecha.year;

      if (tipo_planilla == "PLANILLA ORDINARIA") {
        const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
        const mes: number = fecha.month;

        if (meses.includes(mes)) {
          const fechaInicioMesAnterior = DateTime.local(año, mes, 1).toFormat('dd/MM/yyyy');

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
              'detalle.sueldo_neto AS SueldoNeto'
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

          return detalles;
        }
      } else if (tipo_planilla == "PLANILLA DECIMO TERCERO") {
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
            'detalle.sueldo_neto AS SueldoNeto'
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

      } else if (tipo_planilla == "PLANILLA DECIMO CUARTO") {
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
            'detalle.sueldo_neto AS SueldoNeto'
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

    }
  }

  async create(createDetPlanIngDTO: CreateDetallePlanIngDto, id_tipoPlanilla: number) {
    const { idTipoPlanilla, mes, dni, idInstitucion, prestamos } = createDetPlanIngDTO

    try {
      let personas = await this.personaRepository.findOne({
        where: { dni: dni, perfAfilCentTrabs: { centroTrabajo: { id_centro_trabajo: idInstitucion } } },
        relations: ['perfAfilCentTrabs', 'perfAfilCentTrabs.centroTrabajo'],
      });

      let salarioCotizableRepository = await this.salarioCotizableRepository.find()

      const fechaActual: Date = new Date();
      const mes: string = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
      const año: number = fechaActual.getFullYear();
      const codPlan: string = "PLAN-ING-" + mes + "-" + año;

      let planilla = await this.planillaRepository.findOne({
        where: { codigo_planilla: codPlan },
      });

      const DetPlanIng = await this.buscarPorMesYDni(createDetPlanIngDTO.mes, dni, id_tipoPlanilla).then((val) => {
        return val
      });

      if (!planilla) {
        let planillaId;
        const Planilla = this.insertPlanilla(codPlan, createDetPlanIngDTO);
        planillaId = Planilla.then((val) => {
          if (val.id_planilla) {
            return val.id_planilla
          }
        });

        if (DetPlanIng.detallePlanIngreso.length > 0) {
          planillaId.then((val) => {
            if (val) {
              return this.insertNetDetPlanillaMesAnt(val, DetPlanIng.detallePlanIngreso, DetPlanIng.id_persona, 6);
            }
          })
        } else {
          return this.insertNetDetPlanilla(planillaId, personas, salarioCotizableRepository, createDetPlanIngDTO);
        }

      } else {
        if (DetPlanIng.detallePlanIngreso.length > 0) {
          return this.insertNetDetPlanillaMesAnt(planilla.id_planilla, DetPlanIng.detallePlanIngreso, DetPlanIng.id_persona, 6);
        } else {
          return this.insertNetDetPlanilla(planilla.id_planilla, personas, salarioCotizableRepository, createDetPlanIngDTO);
        }
      }


    } catch (error) {
      this.handleException(error);
    }
  }

  private calculoAportaciones(persona, salarioCotizableRepository): number {
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

  private calculoCotizaciones(persona, salarioCotizableRepository): number {
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

  async buscarPorMesYDni(mes: number, dni: string, id_tipoPlanilla: number): Promise<any> {
    try {
      const año = new Date().getFullYear();
      const fechaInicioMesAnterior = new Date(año, mes - 2, 1);
      const fechaFinMesAnterior = new Date(año, mes - 1, 0);
      const persona = await this.personaRepository.findOne({
        where: { dni, estadoAfiliado: { Descripcion: 'ACTIVO' }, detallePlanIngreso: { planilla: { tipoPlanilla: { id_tipo_planilla: id_tipoPlanilla } } } },
        relations: ['detallePlanIngreso', 'detallePlanIngreso.planilla', "estadoAfiliado"],
      });

      if (!persona) {
        throw new NotFoundException(`No se encontró una persona activa con el DNI ${dni}`);
      }
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
        return []
        throw new NotFoundException(`La persona con DNI ${dni} no estuvo registrada en una planilla en el mes ${mes - 1}`);
      }

      return persona;
    } catch (error) {
      this.logger.error(`Error buscando por mes ${mes} y DNI ${dni}: ${error.message}`);
      throw error;
    }
  }

  async insertPlanilla(codigo_planilla, createPlanillaDto): Promise<any> {
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const periodoInicio = new Date(firstDayOfMonth).toLocaleString();
    const periodoFinalizacion = new Date(lastDayOfMonth).toLocaleString();

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOneBy({ nombre_planilla: createPlanillaDto.nombre_planilla });

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
        throw new Error("No se encontró ningún tipo de planilla con el nombre proporcionado");
      }


    } catch (error) {
      this.handleException(error);
    }

  }

  private async insertNetDetPlanillaMesAnt(id_planilla, DetPlanIng, id_persona, id_centro_trabajo): Promise<void> {
    let values = DetPlanIng.map(detalle => `SELECT
      ${detalle.sueldo} AS SUELDO,
      ${detalle.prestamos} AS PRESTAMOS,
      ${detalle.aportaciones} AS APORTACIONES,
      ${detalle.cotizaciones} AS COTIZACIONES,
      ${detalle.deducciones} AS DEDUCCIONES,
      ${detalle.sueldo_neto} AS SUELDO_NETO,
      ${id_persona} AS ID_PERSONA,
      ${id_planilla} AS ID_PLANILLA,
      ${id_centro_trabajo} AS ID_CENTRO_TRABAJO
    FROM DUAL`).join('\nUNION ALL\n');

    const queryInsDeBBenf = `INSERT INTO NET_DETALLE_PLANILLA_ING (
      SUELDO,
      PRESTAMOS,
      APORTACIONES,
      COTIZACIONES,
      DEDUCCIONES,
      SUELDO_NETO,
      ID_PERSONA,
      ID_PLANILLA,
      ID_CENTRO_TRABAJO
    )\n${values}`;

    const detPlanillaIng = await this.entityManager.query(queryInsDeBBenf);
    return detPlanillaIng;
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