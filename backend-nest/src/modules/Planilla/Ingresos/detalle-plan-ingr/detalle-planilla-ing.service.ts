import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Net_SALARIO_COTIZABLE } from './entities/net_salario_cotizable.entity';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_planilla_ingreso } from './entities/net_detalle_plani_ing.entity';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { DateTime } from 'luxon';
import { Net_Persona } from '../../../afiliado/entities/Net_Persona.entity';
import * as oracledb from 'oracledb';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';

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
    @InjectRepository(Net_Detalle_planilla_ingreso)
    private detallePlanillaIngrRepo: Repository<Net_Detalle_planilla_ingreso>,
  ) { }

  async cambiarEstadoAEliminado(idDetallePlanilla: number): Promise<void> {
    const detalle = await this.detallePlanillaIngrRepo.findOne({ where: { id_detalle_plan_Ing: idDetallePlanilla } });

    if (!detalle) {
      throw new NotFoundException(`Detalle de planilla con ID ${idDetallePlanilla} no encontrado`);
    }

    detalle.estado = 'ELIMINADO';
    await this.detallePlanillaIngrRepo.save(detalle);
  }


  async actualizarDetallesPlanilla(dni: string, idDetallePlanIngreso: number, sueldo: number, prestamos?: number): Promise<{ message: string }> {
    const sectorEconomico = 'PRIVADO';
    const detalle = await this.detallePlanillaIngrRepo.findOne({
      where: { id_detalle_plan_Ing: idDetallePlanIngreso, persona: { dni: dni } },
      relations: ['persona']
    });

    if (!detalle) {
      this.logger.error(`Detalle Planilla de Ingreso no encontrado para el ID: ${idDetallePlanIngreso} y DNI: ${dni}`);
      throw new NotFoundException(`Detalle Planilla de Ingreso no encontrado para el ID: ${idDetallePlanIngreso} y DNI: ${dni}`);
    }
    if (prestamos !== undefined) {
      detalle.prestamos = prestamos;
    }
    const aportacionesCalculadas = await this.calcularAportaciones(sueldo, sectorEconomico);
    const cotizacionesCalculadas = await this.calcularCotizaciones(sueldo, sectorEconomico);

    detalle.aportaciones = aportacionesCalculadas;
    detalle.cotizaciones = cotizacionesCalculadas;
    detalle.sueldo = sueldo;
    detalle.deducciones = aportacionesCalculadas + cotizacionesCalculadas + (detalle.prestamos ?? 0);
    detalle.sueldo_neto = sueldo - detalle.deducciones;

    try {
      await this.detallePlanillaIngrRepo.save(detalle);
      return { message: 'Detalles de la planilla privada actualizados con éxito.' };
    } catch (error) {
      this.logger.error(`Error al actualizar detalles de la planilla privada: ${error}`);
      throw new InternalServerErrorException('Error al actualizar detalles de la planilla privada');
    }
  }

  async calcularAportaciones(salarioBase: number, sectorEconomico: string): Promise<number> {
    let connection;
    try {
      connection = await oracledb.getConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        connectString: process.env.CONNECT_STRING
      });

      const result = await connection.execute(
        `BEGIN SP_CALCULAR_APORTACIONES(:salarioBase, :sectorEconomico, :sueldoNeto); END;`,
        { salarioBase, sectorEconomico, sueldoNeto: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
      );

      return result.outBinds.sueldoNeto;
    } catch (error) {
      this.logger.error(`Error al calcular las aportaciones: ${error}`);
      throw new InternalServerErrorException('Error al calcular las aportaciones');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(`Error al cerrar la conexión: ${error}`);
        }
      }
    }
  }

  async calcularCotizaciones(salarioBase: number, sectorEconomico: string): Promise<number> {
    let connection;
    try {
      connection = await oracledb.getConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        connectString: process.env.CONNECT_STRING
      });

      const result = await connection.execute(
        `BEGIN SP_CALCULAR_COTIZACIONES(:salarioBase, :sectorEconomico, :sueldoNeto); END;`,
        { salarioBase, sectorEconomico, sueldoNeto: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
      );

      return result.outBinds.sueldoNeto;
    } catch (error) {
      this.logger.error(`Error al calcular las cotizaciones: ${error}`);
      throw new InternalServerErrorException('Error al calcular las cotizaciones');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(`Error al cerrar la conexión: ${error}`);
        }
      }
    }
  }

  async insertNetDetPlanilla(id_planilla: number, dni: string, id_centro_educativo: number, createDetPlanIngDTO: CreateDetallePlanIngDto): Promise<boolean> {
    const { prestamos } = createDetPlanIngDTO

    let persona = await this.personaRepository.findOne({
      where: { dni: dni, perfAfilCentTrabs: { centroTrabajo: { id_centro_trabajo: id_centro_educativo } } },
      relations: ["perfAfilCentTrabs", "perfAfilCentTrabs.centroTrabajo"]
    });

    if (!persona) {
      return false;
    }

    let ValoresDetalle = {
      idpersona: persona.id_persona,
      sueldo: persona.perfAfilCentTrabs[0].salario_base,
      prestamos: prestamos,
      id_centro_educativo: id_centro_educativo,
      sector_economico: persona.perfAfilCentTrabs[0].centroTrabajo.sector_economico,
      id_planilla: id_planilla
    }

    const query = `
    BEGIN
      SP_INSERTAR_NET_DET_PLANILLA_ING(${ValoresDetalle.idpersona}, ${ValoresDetalle.id_centro_educativo}, ${ValoresDetalle.sueldo}, ${ValoresDetalle.prestamos}, '${ValoresDetalle.sector_economico}', ${ValoresDetalle.id_planilla});
    END;
    `;

    await this.entityManager.query(query);
    return true
  }

  async obtPersonaPorCentTrab(dni: string, id_centro_educativo: number): Promise<any> {

    let persona = await this.personaRepository.findOne({
      where: { dni: dni, perfAfilCentTrabs: { centroTrabajo: { id_centro_trabajo: id_centro_educativo } } },
      relations: ["perfAfilCentTrabs", "perfAfilCentTrabs.centroTrabajo"]
    });

    if (!persona) {
      return [];
    }

    return persona
  }

  async obtenerPlanillaSeleccionada(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {

    try {
      const planilla = await this.planillaRepository
        .createQueryBuilder("planilla")
        .select([
          'planilla.ID_PLANILLA AS id_planilla',
        ])
        .leftJoin('planilla.detallesPlanillaIngreso', 'detalle')
        .leftJoin('planilla.tipoPlanilla', 'tipoPlanilla')
        .leftJoin('detalle.persona', 'persona')
        .leftJoin('detalle.centroTrabajo', 'centroTrabajo')
        .andWhere(`tipoPlanilla.id_tipo_planilla = ${id_tipo_planilla}`)
        .andWhere(`tipoPlanilla.id_tipo_planilla = ${id_tipo_planilla}`)
        .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
        .getRawMany();

      if (!planilla) {
        return [];
      }
      return planilla
    } catch (error) {
      console.log(error);
    }
  }

  async obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Promise<any> {
    let tipoPlanilla = await this.tipoPlanillaRepository.findOne({
      where: { id_tipo_planilla: id_tipo_planilla },
    });

    try {
      if (tipoPlanilla) {
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
                'detalle.ID_DETALLE_PLAN_INGRESO AS id_detalle_plan_ingreso',
                'detalle.sueldo AS Sueldo',
                'detalle.aportaciones AS Aportaciones',
                'detalle.prestamos AS Prestamos',
                'detalle.cotizaciones AS Cotizaciones',
                'detalle.deducciones AS Deducciones',
                'detalle.sueldo_neto AS SueldoNeto',
                'planilla.ID_PLANILLA AS id_planilla',
                'planilla.PERIODO_INICIO AS periodo_inicio',
                'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
              ])
              .innerJoin('detalle.persona', 'persona')
              .innerJoin('detalle.centroTrabajo', 'centroTrabajo')
              .innerJoin('detalle.planilla', 'planilla')
              .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
              .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
              .andWhere('tipoPlanilla.id_tipo_planilla = :id_tipo_planilla', { id_tipo_planilla })
              .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
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
              'detalle.ID_DETALLE_PLAN_INGRESO AS id_detalle_plan_ingreso',
              'detalle.sueldo AS Sueldo',
              'detalle.aportaciones AS Aportaciones',
              'detalle.prestamos AS Prestamos',
              'detalle.cotizaciones AS Cotizaciones',
              'detalle.deducciones AS Deducciones',
              'detalle.sueldo_neto AS SueldoNeto',
              'planilla.ID_PLANILLA AS id_planilla',
              'planilla.PERIODO_INICIO AS periodo_inicio',
              'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
            ])
            .where(`
          centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
          AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
          AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
              { idCentroTrabajo, id_tipo_planilla })
            .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
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
              'detalle.ID_DETALLE_PLAN_INGRESO AS id_detalle_plan_ingreso',
              'detalle.sueldo AS Sueldo',
              'detalle.aportaciones AS Aportaciones',
              'detalle.prestamos AS Prestamos',
              'detalle.cotizaciones AS Cotizaciones',
              'detalle.deducciones AS Deducciones',
              'detalle.sueldo_neto AS SueldoNeto',
              'planilla.ID_PLANILLA AS id_planilla',
              'planilla.PERIODO_INICIO AS periodo_inicio',
              'planilla.PERIODO_FINALIZACION AS periodo_finalizacion'
            ])
            .where(`
          centroTrabajo.id_centro_trabajo = :idCentroTrabajo AND tipoPlanilla.id_tipo_planilla = :id_tipo_planilla
          AND "planilla"."PERIODO_INICIO" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))
          AND "planilla"."PERIODO_FINALIZACION" BETWEEN TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY') AND LAST_DAY(TO_DATE('${fechaInicioMesAnterior}', 'DD/MM/YYYY'))`,
              { idCentroTrabajo, id_tipo_planilla })
            .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
            .getRawMany();
          if (!detalles.length) {
            return []
            this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          }
          return detalles
        }
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
      if (tipoPlanilla) {
        const { nombre_planilla } = tipoPlanilla
        const fecha = DateTime.local();
        const año = fecha.year;

        if (nombre_planilla == "PLANILLA ORDINARIA") {
          const meses: number[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
          /* MES ACTUAL */
          const mes: number = 5;

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
              .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
              .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
              .groupBy('centroTrabajo.id_centro_trabajo')
              .addGroupBy('centroTrabajo.nombre_centro_trabajo')
              .getRawMany();

            if (!detalles.length) {
              return []
              this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
              throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            }

            return detalles;
          }
        } else if (nombre_planilla == "PLANILLA DECIMO TERCERO") {
          //const fechaInicioMesAnterior = DateTime.local(año, 6, 1).toFormat('dd/MM/yyyy');

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
            .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
            .andWhere('tipoPlanilla.id_tipo_planilla = :id_tipo_planilla', { id_tipo_planilla })
            .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
            .groupBy('centroTrabajo.id_centro_trabajo')
            .addGroupBy('centroTrabajo.nombre_centro_trabajo')
            .getRawMany();

          if (!detalles.length) {
            return []
            this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          }
          return detalles

        } else if (nombre_planilla == "PLANILLA DECIMO CUARTO") {
          //const fechaInicioMesAnterior = DateTime.local(año, 12, 1).toFormat('dd/MM/yyyy');
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
            .andWhere('detalle.estado = :estado', { estado: 'CARGADO' })
            .andWhere(`planilla.FECHA_APERTURA = (SELECT MAX("NET_PLANILLA"."FECHA_APERTURA") FROM "NET_PLANILLA" WHERE "NET_PLANILLA".ID_TIPO_PLANILLA = ${id_tipo_planilla})`)
            .groupBy('centroTrabajo.id_centro_trabajo')
            .addGroupBy('centroTrabajo.nombre_centro_trabajo')
            .getRawMany();
          if (!detalles.length) {
            return []
            this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
            throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
          }
          return detalles
        }
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