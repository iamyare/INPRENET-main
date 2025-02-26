import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Net_Deduccion } from './entities/net_deduccion.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import * as XLSX from 'xlsx';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Workbook } from 'exceljs';
import { Worker } from 'worker_threads';
import * as pLimit from 'p-limit';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { Net_Deduccion_Tipo_Planilla } from './entities/net_deduccion_tipo_planilla.entity';
import { Length } from 'class-validator';
import { net_deducciones_temp } from './entities/net_deducciones_temp.entity';

@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(Net_Deduccion)
    public deduccionRepository: Repository<Net_Deduccion>,

    @InjectRepository(Net_Deduccion_Tipo_Planilla)
    public deduccionTipoPlanRepository: Repository<Net_Deduccion_Tipo_Planilla>,

    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,

    @InjectRepository(Net_Detalle_Deduccion)
    private detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,

    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,

    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,

    @InjectRepository(Net_Persona_Por_Banco)
    private personaPorBancoRepository: Repository<Net_Persona_Por_Banco>,

    @InjectRepository(net_deducciones_temp)
    private tempDeduccionRepository: Repository<net_deducciones_temp>
  ) { }

  async obtenerDetallesDeduccionPorCentro(id_planilla: number, idCentroTrabajo: number, codigoDeduccion: number): Promise<any[]> {
    return this.detalleDeduccionRepository.createQueryBuilder('detalle_deduccion')
      .innerJoin('detalle_deduccion.deduccion', 'deduccion')
      .innerJoin('deduccion.centroTrabajo', 'centroTrabajo')
      .innerJoin('detalle_deduccion.persona', 'persona')
      .innerJoin('detalle_deduccion.planilla', 'planilla')
      .select([
        'detalle_deduccion.monto_total AS monto_total',
        'detalle_deduccion.monto_aplicado AS monto_aplicado',
        'detalle_deduccion.estado_aplicacion AS estado_aplicacion',
        'detalle_deduccion.anio AS anio',
        'detalle_deduccion.mes AS mes',
        'persona.n_identificacion AS n_identificacion',
        `(persona.primer_nombre || ' ' || 
          COALESCE(persona.segundo_nombre, '') || ' ' || 
          persona.primer_apellido || ' ' || 
          COALESCE(persona.segundo_apellido, '')) AS nombre_completo`,
        'deduccion.nombre_deduccion AS nombre_deduccion',
        'deduccion.codigo_deduccion AS codigo_deduccion'
      ])
      .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
      .andWhere('detalle_deduccion.estado_aplicacion = :estado', { estado: 'EN PRELIMINAR' })
      .andWhere('planilla.id_planilla = :id_planilla', { id_planilla: id_planilla })
      .andWhere('deduccion.codigo_deduccion = :codigoDeduccion', { codigoDeduccion })
      .getRawMany();
  }

  async eliminarDetallesDeduccionPorCentro(idCentroTrabajo: number, codDeduccion: number, idPlanilla: number): Promise<void> {
    await this.detalleDeduccionRepository.createQueryBuilder()
      .delete()
      .from('NET_DETALLE_DEDUCCION')
      .where('id_deduccion IN (SELECT d.id_deduccion FROM NET_DEDUCCION d WHERE d.cod_deduccion = :codDeduccion AND d.id_centro_trabajo = :idCentroTrabajo)', { codDeduccion, idCentroTrabajo })
      .andWhere('estado_aplicacion = :estado', { estado: 'EN PRELIMINAR' })
      .andWhere('id_planilla = :idPlanilla', { idPlanilla })  // Agregando la condición de id_planilla
      .execute();
  }


  /* private async processRow(planilla: any, idTipoPlanilla: number, id_planilla: number, row: any, repositories: any): Promise<any> {
    const { anio, mes, dni, codigoDeduccion, montoTotal } = row;

    if (!anio && !mes && !dni && !codigoDeduccion && !montoTotal) {
      return { error: `Fila vacía: ${JSON.stringify(row)}`, processed: false };
    }
    if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
      return { error: 'Faltan columnas obligatorias', processed: false };
    }

    const parsedAnio = Number(anio);
    const parsedMes = Number(mes);
    const parsedDni = dni.toString();
    const parsedCodigoDeduccion = parseInt(codigoDeduccion);
    const parsedMontoTotal = Number(montoTotal);

    if (isNaN(parsedAnio) || isNaN(parsedMes) || parsedDni === '' || isNaN(parsedCodigoDeduccion) || isNaN(parsedMontoTotal)) {
      return { error: 'Error en la conversión de datos', processed: false };
    }

    const [persona, deduccion, detpersonaJU_PE, detpersonaB] = await Promise.all([
      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          personasPorBanco: { estado: 'ACTIVO' }
        },
        relations: ['personasPorBanco'],
      }),
      repositories.deduccionRepository.findOne({ where: { codigo_deduccion: parsedCodigoDeduccion } }),
      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["JUBILADO", "PENSIONADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      }),
      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["BENEFICIARIO SIN CAUSANTE", "BENEFICIARIO", "DESIGNADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      })
    ]);

    if (!deduccion) {
      return { error: `No se encontró deducción con código: ${parsedCodigoDeduccion}`, processed: false };
    }

    if (planilla || planilla.length > 0) {
      if (!(planilla[0].tipoPlanilla).dedTipoPlanilla || planilla[0].tipoPlanilla.dedTipoPlanilla.length === 0) {
        return { error: `La deducción con código ${parsedCodigoDeduccion} no puede ir en este tipo de planilla `, processed: false };
      }
    } else {
      return { error: `No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`, processed: false };
    }

    if (!persona) {
      return { error: `No se encontró persona con DNI: ${parsedDni}`, processed: false };
    }

    if (!persona.personasPorBanco) {
      return { error: `No se encontró un banco activo para la persona`, processed: false };
    }

    let isComplementaria = false
    if (idTipoPlanilla == 3 || idTipoPlanilla == 4) {
      isComplementaria = true
    }

    if (persona.fallecido === 'SI' && !isComplementaria) {
      return { error: `La persona está marcada como fallecida`, processed: false };
    }


    if (detpersonaJU_PE && planilla) {
      const tipoPersonaJUPE = detpersonaJU_PE.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE JUBILADOS Y PENSIONADOS'))
          || (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS') && isComplementaria)

        );
      });

      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaJUPE}`, processed: false };
      } else {

        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });
        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const deduccionesAgrupadas = await repositories.detalleDeduccionRepository
          .createQueryBuilder('detalle')
          .select('detalle.persona.id_persona', 'id_persona')
          .addSelect('SUM(detalle.monto_total)', 'total_monto')
          .where('detalle.anio = :anio', { anio: parsedAnio })
          .andWhere('detalle.mes = :mes', { mes: parsedMes })
          .andWhere('detalle.deduccion.id_persona = :id_persona', { id_persona: deduccion.id_persona })
          .andWhere('detalle.estado_aplicacion = :estado_aplicacion', { estado_aplicacion: 'EN PRELIMINAR' })
          .andWhere('detalle.deduccion.id_deduccion = :idDeduccion', { idDeduccion: deduccion.id_deduccion })
          .andWhere('detalle.planilla.id_planilla = :idPlanilla', { idPlanilla: plan.id_planilla })
          .groupBy('detalle.persona.id_persona')
          .getRawOne();

        console.log(deduccionesAgrupadas);

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          montoTotal: deduccionesAgrupadas?.total_monto
            ? deduccionesAgrupadas.total_monto + parsedMontoTotal
            : parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          personaPorBanco: persona.personasPorBanco[0],
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (detpersonaB && planilla) {

      const tipoPersonaBE = detpersonaB.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          fechaDeduccion >= periodoInicio &&
          fechaDeduccion <= periodoFinalizacion &&
          (['BENEFICIARIO', 'BENEFICIARIO SIN CAUSANTE', 'DESIGNADO'].includes(tipoPersonaBE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE BENEFICIARIOS')
        );
      });


      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaBE}`, processed: false };
      } else {
        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });

        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        console.log(persona.personasPorBanco[0]);


        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          id_af_banco: persona.personasPorBanco[0].id_af_banco
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (!detpersonaJU_PE) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es JUBILADO NI PENSIONADO`, processed: false };
    } else if (!detpersonaB) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    }

  } */

  private async processRow(planilla: any, idTipoPlanilla: number, id_planilla: number, row: any, repositories: any): Promise<any> {
    const { anio, mes, dni, codigoDeduccion, montoTotal, N_PRESTAMO_INPREMA, TIPO_PRESTAMO_INPREMA } = row;

    if (!anio && !mes && !dni && !codigoDeduccion && !montoTotal && !N_PRESTAMO_INPREMA && TIPO_PRESTAMO_INPREMA) {
      return { error: `Fila vacía: ${JSON.stringify(row)}`, processed: false };
    }
    if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
      return { error: 'Faltan columnas obligatorias', processed: false };
    }

    const parsedAnio = Number(anio);
    const parsedMes = Number(mes);
    const parsedDni = dni.toString();
    const parsedCodigoDeduccion = parseInt(codigoDeduccion);
    const parsedMontoTotal = Number(montoTotal);

    if (isNaN(parsedAnio) || isNaN(parsedMes) || parsedDni === '' || isNaN(parsedCodigoDeduccion) || isNaN(parsedMontoTotal)) {
      return { error: 'Error en la conversión de datos', processed: false };
    }

    const [persona, deduccion, detpersonaJU_PE, detpersonaAfil, detpersonaB] = await Promise.all([
      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          //personasPorBanco: { estado: 'ACTIVO' }
        },
        relations: ['personasPorBanco'],
      }),

      repositories.deduccionRepository.findOne({ where: { codigo_deduccion: parsedCodigoDeduccion } }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["JUBILADO", "PENSIONADO",]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["AFILIADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["BENEFICIARIO SIN CAUSANTE", "BENEFICIARIO", "DESIGNADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      })
    ]);

    if (!deduccion) {
      return { error: `No se encontró deducción con código: ${parsedCodigoDeduccion}`, processed: false };
    }

    if (planilla || planilla.length > 0) {
      if (!(planilla[0].tipoPlanilla).dedTipoPlanilla || planilla[0].tipoPlanilla.dedTipoPlanilla.length === 0) {
        return { error: `La deducción con código ${parsedCodigoDeduccion} no puede ir en este tipo de planilla `, processed: false };
      }
    } else {
      return { error: `No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`, processed: false };
    }
    if (persona) {
      if (!(persona.personasPorBanco)) {
        return { error: `No se encontró un banco activo para la persona`, processed: false };
      }
    } else {
      return { error: `No se encontró persona con DNI: ${parsedDni}`, processed: false };
    }

    let isComplementaria = false
    if (idTipoPlanilla == 3 || idTipoPlanilla == 4) {
      isComplementaria = true
    }

    if (persona.fallecido === 'SI' && !isComplementaria) {
      return { error: `La persona está marcada como fallecida`, processed: false };
    }


    if (detpersonaJU_PE && planilla) {
      const tipoPersonaJUPE = detpersonaJU_PE.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));

        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));

        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        const mesAnioDeduccion = fechaDeduccion.getFullYear() * 100 + fechaDeduccion.getMonth();
        const mesAnioInicio = periodoInicio.getFullYear() * 100 + periodoInicio.getMonth();

        const mesAnioFinalizacion = periodoFinalizacion.getFullYear() * 100 + periodoFinalizacion.getMonth();

        return (
          (mesAnioDeduccion >= mesAnioInicio &&
            mesAnioDeduccion <= mesAnioFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE JUBILADOS Y PENSIONADOS'))
          || (mesAnioDeduccion >= mesAnioInicio &&
            mesAnioDeduccion <= mesAnioFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS') && isComplementaria)
        );
      });

      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaJUPE}`, processed: false };
      } else {

        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });
        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const activo = persona.personasPorBanco.find(persona => persona.estado === 'ACTIVO') || null;

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          n_prestamo_inprema: N_PRESTAMO_INPREMA === '' || N_PRESTAMO_INPREMA === undefined ? null : String(N_PRESTAMO_INPREMA).trim(),
          tipo_prestamo_inprema: TIPO_PRESTAMO_INPREMA === '' || TIPO_PRESTAMO_INPREMA === undefined ? null : String(TIPO_PRESTAMO_INPREMA).trim(),
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          personaPorBanco: activo,
        });
        console.log(
          detalleDeduccion
        );

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }
    }
    else if (detpersonaAfil && planilla) {
      const tipoPersonaAfil = detpersonaAfil.detallePersona[0]?.tipoPersona?.tipo_persona;
      const plan = planilla.find(p => {

        // Pendiente: verificar solo mes y anio en la planilla complementaria.
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO', 'AFILIADO'].includes(tipoPersonaAfil) && p.tipoPlanilla.nombre_planilla === 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS') && isComplementaria)

        );
      });

      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaAfil}`, processed: false };
      } else {

        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });
        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const activo = persona.personasPorBanco.find(persona => persona.estado === 'ACTIVO') || null;

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          n_prestamo_inprema: N_PRESTAMO_INPREMA === '' || N_PRESTAMO_INPREMA === undefined ? null : String(N_PRESTAMO_INPREMA).trim(),
          tipo_prestamo_inprema: TIPO_PRESTAMO_INPREMA === '' || TIPO_PRESTAMO_INPREMA === undefined ? null : String(TIPO_PRESTAMO_INPREMA).trim(),
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          personaPorBanco: activo,
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }


    } else if (detpersonaB && planilla) {

      const tipoPersonaBE = detpersonaB.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          fechaDeduccion >= periodoInicio &&
          fechaDeduccion <= periodoFinalizacion &&
          (['BENEFICIARIO', 'BENEFICIARIO SIN CAUSANTE', 'DESIGNADO'].includes(tipoPersonaBE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE BENEFICIARIOS')
        );
      });


      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaBE}`, processed: false };
      } else {
        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });

        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          id_af_banco: persona.personasPorBanco[0].id_af_banco
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (!detpersonaJU_PE) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es JUBILADO NI PENSIONADO`, processed: false };
    } else if (!detpersonaB) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    } else if (!detpersonaAfil) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    }

  }

  private async processRowTablaTemporal(planilla: any, idTipoPlanilla: number, id_planilla: number, row: any, repositories: any): Promise<any> {
    const { anio, mes, dni, codigoDeduccion, montoTotal } = row;

    if (!anio && !mes && !dni && !codigoDeduccion && !montoTotal) {
      return { error: `Fila vacía: ${JSON.stringify(row)}`, processed: false };
    }
    if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
      return { error: 'Faltan columnas obligatorias', processed: false };
    }


    const parsedAnio = Number(anio);
    const parsedMes = Number(mes);
    const parsedDni = `${dni}`;
    const parsedCodigoDeduccion = parseInt(codigoDeduccion);
    const parsedMontoTotal = Number(montoTotal);


    if (isNaN(parsedAnio) || isNaN(parsedMes) || parsedDni === '' || isNaN(parsedCodigoDeduccion) || isNaN(parsedMontoTotal)) {
      return { error: 'Error en la conversión de datos', processed: false };
    }
    console.log(parsedAnio);
    console.log(parsedMes);
    console.log(parsedDni);
    console.log(parsedCodigoDeduccion);
    console.log(parsedMontoTotal);

    const [persona, deduccion, detpersonaJU_PE, detpersonaAfil, detpersonaB] = await Promise.all([
      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          //personasPorBanco: { estado: 'ACTIVO' }
        },
        relations: ['personasPorBanco'],
      }),

      repositories.deduccionRepository.findOne({ where: { codigo_deduccion: parsedCodigoDeduccion } }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["JUBILADO", "PENSIONADO",]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["AFILIADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      }),

      repositories.personaRepository.findOne({
        where: {
          n_identificacion: parsedDni,
          detallePersona: {
            tipoPersona: { tipo_persona: In(["BENEFICIARIO SIN CAUSANTE", "BENEFICIARIO", "DESIGNADO"]) }
          }
        },
        relations: ['detallePersona', 'detallePersona.tipoPersona'],
      })
    ]);


    if (!deduccion) {
      return { error: `No se encontró deducción con código: ${parsedCodigoDeduccion}`, processed: false };
    }

    if (planilla || planilla.length > 0) {
      if (!(planilla[0].tipoPlanilla).dedTipoPlanilla || planilla[0].tipoPlanilla.dedTipoPlanilla.length === 0) {
        return { error: `La deducción con código ${parsedCodigoDeduccion} no puede ir en este tipo de planilla `, processed: false };
      }
    } else {
      return { error: `No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`, processed: false };
    }
    if (persona) {
      if (!(persona.personasPorBanco)) {
        return { error: `No se encontró un banco activo para la persona`, processed: false };
      }
    } else {
      return { error: `No se encontró persona con DNI: ${parsedDni}`, processed: false };
    }

    let isComplementaria = false
    if (idTipoPlanilla == 3 || idTipoPlanilla == 4) {
      isComplementaria = true
    }

    if (persona.fallecido === 'SI' && !isComplementaria) {
      return { error: `La persona está marcada como fallecida`, processed: false };
    }

    if (detpersonaJU_PE && planilla) {

      const tipoPersonaJUPE = detpersonaJU_PE.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE JUBILADOS Y PENSIONADOS'))
          || (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS') && isComplementaria)

        );
      });

      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaJUPE}`, processed: false };
      } else {

        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });
        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const activo = persona.personasPorBanco.find(persona => persona.estado === 'ACTIVO') || null;

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          personaPorBanco: activo,
        });


        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }
    }
    else if (detpersonaAfil && planilla) {
      const tipoPersonaAfil = detpersonaAfil.detallePersona[0]?.tipoPersona?.tipo_persona;
      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          (fechaDeduccion >= periodoInicio &&
            fechaDeduccion <= periodoFinalizacion &&
            (['JUBILADO', 'PENSIONADO', 'AFILIADO'].includes(tipoPersonaAfil) && p.tipoPlanilla.nombre_planilla === 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS') && isComplementaria)

        );
      });

      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaAfil}`, processed: false };
      } else {

        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });
        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const activo = persona.personasPorBanco.find(persona => persona.estado === 'ACTIVO') || null;

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          personaPorBanco: activo,
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }


    } else if (detpersonaB && planilla) {

      const tipoPersonaBE = detpersonaB.detallePersona[0]?.tipoPersona?.tipo_persona;

      const plan = planilla.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          fechaDeduccion >= periodoInicio &&
          fechaDeduccion <= periodoFinalizacion &&
          (['BENEFICIARIO', 'BENEFICIARIO SIN CAUSANTE', 'DESIGNADO'].includes(tipoPersonaBE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA DE BENEFICIARIOS')
        );
      });


      if (!plan) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaBE}`, processed: false };
      } else {
        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: plan.id_planilla },
          },
        });

        if (deduccionExistente) {
          return { error: `Deducción duplicada detectada`, processed: false };
        }

        const detalleDeduccion = repositories.detalleDeduccionRepository.create({
          anio: parsedAnio,
          mes: parsedMes,
          monto_total: parsedMontoTotal,
          monto_aplicado: parsedMontoTotal,
          estado_aplicacion: 'EN PRELIMINAR',
          persona: persona.id_persona,
          deduccion,
          planilla: { id_planilla: plan.id_planilla },
          id_af_banco: persona.personasPorBanco[0].id_af_banco
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (!detpersonaJU_PE) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es JUBILADO NI PENSIONADO`, processed: false };
    } else if (!detpersonaB) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    } else if (!detpersonaAfil) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    }
  }


  async uploadDeduccionesTemporal(
    idTipoPlanilla: number,
    id_planilla: number,
    file: Express.Multer.File
  ): Promise<{ message: string; failedRows: any[] }> {
    const failedRows: any[] = [];
    const limit = pLimit(5); // Define el número máximo de conexiones concurrentes

    try {
      // Convertir el buffer del archivo en texto y parsear el CSV
      const csvData = file.buffer.toString();

      const parsedRows = await new Promise<any[]>((resolve, reject) => {
        const result: any[] = [];

        csv.parseString(csvData, { headers: true, delimiter: ';' })
          .on('error', (error) => reject(error))
          .on('data', (row) => result.push(row))
          .on('end', () => resolve(result));
      });

      console.log(parsedRows);
      const transformedData = parsedRows.map(({ anio, mes, codigoDeduccion, montoTotal, ...rest }) => ({
        anio: Number(anio),
        mes: Number(mes),
        codigoDeduccion: Number(codigoDeduccion),
        montoTotal: Number(montoTotal),
        ...rest,
      }));

      if (transformedData.length === 0) {
        return { message: 'No se encontraron registros válidos', failedRows };
      }

      // Procesar inserciones con límite de concurrencia
      await Promise.all(
        transformedData.map((data) =>
          limit(() =>
            this.tempDeduccionRepository
              .insert(data)
              .catch((err) => failedRows.push({ data, error: err.message }))
          )
        )
      );

      this.logger.log(`Deducciones temporales registradas: ${transformedData.length - failedRows.length}`);

      // Consultar la tabla temporal después de la inserción
      try {
        const tempDeducciones = await this.tempDeduccionRepository.find();

        this.logger.log(`Deducciones temporales registradas: ${tempDeducciones.length}`);

        //resolve({ message: 'Deducciones almacenadas en tabla temporal correctamente', failedRows });
      } catch (error) {
        this.logger.error(`Error fetching from temp_deducciones: ${error}`);
        //resolve({ message: 'Error al consultar la tabla temporal', failedRows });
      }

      return { message: 'Deducciones almacenadas en tabla temporal correctamente', failedRows };
    } catch (error) {
      this.logger.error(`Error procesando CSV: ${error.message}`);
      return { message: 'Error procesando CSV', failedRows };
    }
  }

  async insertDetDed(idTipoPlanilla: number, id_planilla: number,) {
    const failedRows: any[] = [];
    const rows: any[] = [];

    const array = await this.tempDeduccionRepository.find();
    const repositories = {
      personaRepository: this.personaRepository,
      deduccionRepository: this.deduccionRepository,
      personaPorBancoRepository: this.personaPorBancoRepository,
      planillaRepository: this.planillaRepository,
      detalleDeduccionRepository: this.detalleDeduccionRepository,
      deduccionTipoPlanRepository: this.deduccionTipoPlanRepository,
    };

    const planilla = await repositories.planillaRepository.find({
      where: {
        id_planilla: id_planilla,
        estado: 'ACTIVA',
        tipoPlanilla: { id_tipo_planilla: idTipoPlanilla }
      },
      relations: ['tipoPlanilla', 'tipoPlanilla.dedTipoPlanilla'],
    });

    for (let row of array) {
      this.processRowTablaTemporal(planilla, idTipoPlanilla, id_planilla, row, repositories).then(result => {
        console.log(row);

        if (result.error) {
          failedRows.push({ ...row, error: result.error });
          this.logger.warn(`${result.error}`);
        }
        return result;
      })
    }
  }



  async uploadDeducciones(idTipoPlanilla: number, id_planilla: number, file: Express.Multer.File): Promise<{ message: string; failedRows: any[] }> {
    const failedRows: any[] = [];
    const rows: any[] = [];

    return new Promise((resolve, reject) => {
      csv
        .parseString(file.buffer.toString(), { headers: true, delimiter: ';' })  // Asegúrate de especificar el delimitador correcto
        .on('data', row => {
          // Accedemos directamente a las propiedades del objeto fila
          const { anio, mes, dni, codigoDeduccion, montoTotal, N_PRESTAMO_INPREMA, TIPO_PRESTAMO_INPREMA } = row;

          console.log(row);

          if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
            failedRows.push({ ...row, error: 'Campos faltantes o inválidos' });
            return;
          }

          // Se agrega cada fila como un objeto con las propiedades necesarias
          rows.push({ anio, mes, dni, codigoDeduccion, montoTotal, N_PRESTAMO_INPREMA, TIPO_PRESTAMO_INPREMA });
        })
        .on('end', async () => {
          const repositories = {
            personaRepository: this.personaRepository,
            deduccionRepository: this.deduccionRepository,
            personaPorBancoRepository: this.personaPorBancoRepository,
            planillaRepository: this.planillaRepository,
            detalleDeduccionRepository: this.detalleDeduccionRepository,
            deduccionTipoPlanRepository: this.deduccionTipoPlanRepository,
          };

          const planilla = await repositories.planillaRepository.find({
            where: {
              id_planilla: id_planilla,
              estado: 'ACTIVA',
              tipoPlanilla: { id_tipo_planilla: idTipoPlanilla }
            },
            relations: ['tipoPlanilla', 'tipoPlanilla.dedTipoPlanilla'],
            //secuencia: 1,
          });

          const limit = pLimit(10); // Limitar a 10 conexiones concurrentes
          const workerPromises = rows.map(row =>
            limit(() => this.processRow(planilla, idTipoPlanilla, id_planilla, row, repositories).then(result => {
              if (result.error) {
                failedRows.push({ ...row, error: result.error });
                this.logger.warn(`${result.error}`);
              }
              return result;
            }))
          );

          try {
            await Promise.all(workerPromises);
            resolve({ message: 'Deducciones procesadas correctamente', failedRows });
          } catch (error) {
            this.logger.error(`Error processing deductions: ${error}`);
            resolve({ message: 'Error', failedRows });
          }
        })
        .on('error', (error) => {
          this.logger.error(`Error parsing CSV: ${error.message}`);
          resolve({ message: 'Error', failedRows });
        });
    });
  }

  async obtenerDeduccionesPorAnioMes(dni: string, anio: number, mes: number): Promise<any> {
    try {
      const persona = await this.personaRepository.findOne({ where: { n_identificacion: dni } });
      if (!persona) {
        throw new InternalServerErrorException('Persona no encontrada');
      }

      const deducciones = await this.detalleDeduccionRepository.find({
        where: {
          persona: { id_persona: persona.id_persona },
          anio: anio,
          mes: mes,
        },
        relations: [
          'deduccion',
          'planilla',
          'deduccion.centroTrabajo',
        ],
      });

      const resultado = {
        persona: {
          n_identificacion: persona.n_identificacion,
          nombre_completo: `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim(),
          genero: persona.genero,
          fecha_nacimiento: persona.fecha_nacimiento,
          estado_civil: persona.estado_civil,
          fallecido: persona.fallecido,
          direccion_residencia: persona.direccion_residencia,
          telefono: persona.telefono_1,
        },
        deducciones: deducciones.map(d => ({
          deduccion_id: d.deduccion,
          monto_aplicado: d.monto_aplicado,
          estado_aplicacion: d.estado_aplicacion,
          anio: d.anio,
          mes: d.mes,
          fecha_aplicado: d.fecha_aplicado,
          centro_trabajo: d.deduccion.centroTrabajo ? d.deduccion.centroTrabajo.nombre_centro_trabajo : 'N/A',
          codigo_planilla: d.planilla ? d.planilla.codigo_planilla : 'N/A',
        })),
      };

      return resultado;

    } catch (error) {
      this.logger.error(`Error al obtener deducciones para el DNI ${dni}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener deducciones');
    }
  }

  async create(createDeduccionDto: CreateDeduccionDto): Promise<Net_Deduccion> {
    const existingDeduccion = await this.deduccionRepository.findOne({
      where: { codigo_deduccion: createDeduccionDto.codigo_deduccion }
    });

    if (existingDeduccion) {
      throw new BadRequestException('El código de deducción ya existe.');
    }
    const institucion = await this.centroTrabajoRepository.findOne({
      where: { nombre_centro_trabajo: createDeduccionDto.nombre_institucion }
    });

    if (!institucion && createDeduccionDto.nombre_institucion) {
      throw new NotFoundException(`Institución con nombre '${createDeduccionDto.nombre_institucion}' no encontrada.`);
    }
    const deduccion = this.deduccionRepository.create({
      ...createDeduccionDto,
      centroTrabajo: institucion
    });

    try {
      await this.deduccionRepository.save(deduccion);
      return deduccion;
    } catch (error) {
      if (error.code === 'ORA-00001') {
        throw new BadRequestException('El código de deducción ya existe.');
      } else {
        console.error('Error al guardar la deducción:', error);
        throw new InternalServerErrorException('Ha ocurrido un error al crear la deducción.');
      }
    }
  }

  async findAll(): Promise<any[]> {
    return this.deduccionRepository.find({
      relations: ['centroTrabajo'],
      select: {
        id_deduccion: true,
        nombre_deduccion: true,
        descripcion_deduccion: true,
        codigo_deduccion: true,
        prioridad: true,
        centroTrabajo: {
          id_centro_trabajo: true,
          nombre_centro_trabajo: true,
        }
      }
    }).then(deducciones => {
      return deducciones.map(deduccion => ({
        id_deduccion: deduccion.id_deduccion,
        nombre_deduccion: deduccion.nombre_deduccion,
        descripcion_deduccion: deduccion.descripcion_deduccion,
        codigo_deduccion: deduccion.codigo_deduccion,
        prioridad: deduccion.prioridad,
        nombre_centro_trabajo: deduccion.centroTrabajo ? deduccion.centroTrabajo.nombre_centro_trabajo : null,
      }));
    });
  }

  async findOneByNombInst(nombre_centro_trabajo: string) {
    if (nombre_centro_trabajo) {
      const queryBuilder = await this.deduccionRepository
        .createQueryBuilder('NET_DEDUCCION')
        .addSelect('NET_DEDUCCION.ID_DEDUCCION', 'ID_DEDUCCION')
        .addSelect('NET_DEDUCCION.NOMBRE_DEDUCCION', 'NOMBRE_DEDUCCION')
        .innerJoin(Net_Centro_Trabajo, 'INSTITUCION', 'NET_DEDUCCION.ID_INSTITUCION = INSTITUCION.ID_INSTITUCION')
        .where(`CENTROTRABAJO.NOMBRE_CENTRO_TRABAJO = '${nombre_centro_trabajo}'`)
        .getRawMany();
      return queryBuilder;
    } else {
      throw new NotFoundException(`la deduccion para la empresa ${nombre_centro_trabajo} no fue encontrada.`);
    }
  }

  async findOne(id: number) {
    const deduccion = await this.deduccionRepository.findOne({ where: { id_deduccion: id } });
    if (!deduccion) {
      throw new BadRequestException(`deduccion con ID ${id} no encontrado.`);
    }
    return deduccion;
  }

  async update(id_deduccion: number, updateDeduccionDto: UpdateDeduccionDto) {
    const deduccion = await this.deduccionRepository.preload({
      id_deduccion: id_deduccion,
      ...updateDeduccionDto
    });

    if (!deduccion) {
      throw new BadRequestException(`deduccion con ID ${id_deduccion} no encontrado.`);
    }

    try {
      await this.deduccionRepository.save(deduccion);
      return deduccion;
    } catch (error) {
      this.handleException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} deduccion`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('La deduccion ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
