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

@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(Net_Deduccion)
    public deduccionRepository: Repository<Net_Deduccion>,
    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Detalle_Deduccion)
    private detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectRepository(Net_Persona_Por_Banco)
    private personaPorBancoRepository: Repository<Net_Persona_Por_Banco>
  ) { }

  async obtenerDetallesDeduccionPorCentro(idCentroTrabajo: number, codigoDeduccion: number): Promise<any[]> {
    return this.detalleDeduccionRepository.createQueryBuilder('detalle_deduccion')
      .innerJoin('detalle_deduccion.deduccion', 'deduccion')
      .innerJoin('deduccion.centroTrabajo', 'centroTrabajo')
      .innerJoin('detalle_deduccion.persona', 'persona')
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


  private async processRow(id_planilla: any, row: any, repositories: any): Promise<any> {
    // Acceder directamente a las propiedades del objeto
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
    const parsedCodigoDeduccion = Number(codigoDeduccion);
    const parsedMontoTotal = Number(montoTotal);

    if (isNaN(parsedAnio) || isNaN(parsedMes) || parsedDni === '' || isNaN(parsedCodigoDeduccion) || isNaN(parsedMontoTotal)) {
      return { error: 'Error en la conversión de datos', processed: false };
    }

    const persona = await repositories.personaRepository.findOne({
      where: {
        n_identificacion: parsedDni,
      },
    });

    if (!persona) {
      return { error: `No se encontró persona con DNI: ${parsedDni}`, processed: false };
    }

    if (persona.fallecido === 'SI') {
      return { error: `La persona está marcada como fallecida`, processed: false };
    }

    const dedPermitidasPlan = 44;
    if (dedPermitidasPlan == parsedCodigoDeduccion) {
      return { error: `La deduccion con codigo 44 no van en la ordinaria`, processed: false };
    }

    const deduccion = await repositories.deduccionRepository.findOne({
      where: { codigo_deduccion: parsedCodigoDeduccion },
    });

    if (!deduccion) {
      return { error: `No se encontró deducción con código: ${parsedCodigoDeduccion}`, processed: false };
    }

    const bancoActivo = await repositories.personaPorBancoRepository.findOne({
      where: {
        persona: { id_persona: persona.id_persona },
        estado: 'ACTIVO',
      },
    });


    if (!bancoActivo) {
      return { error: `No se encontró un banco activo para la persona`, processed: false };
    }

    let planillas;
    try {
      planillas = await repositories.planillaRepository.find({
        where: {
          id_planilla: id_planilla,
          estado: 'ACTIVA',
          secuencia: 1,
        },
        relations: ['tipoPlanilla'],
      });

    } catch (err) {
      return { error: `Error en la consulta de planillas: ${err.message}`, processed: false };
    }

    if (!planillas || planillas.length === 0) {
      return { error: `No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`, processed: false };
    }

    const detpersonaJU_PE = await repositories.personaRepository.findOne({
      where: {
        n_identificacion: persona.n_identificacion,
        detallePersona: {
          tipoPersona: { tipo_persona: In(["JUBILADO", "PENSIONADO"]) }
        }
      },
      relations: ['detallePersona', 'detallePersona.tipoPersona'],
    });

    const detpersonaB = await repositories.personaRepository.findOne({
      where: {
        n_identificacion: persona.n_identificacion,
        detallePersona: {
          tipoPersona: { tipo_persona: In(["BENEFICIARIO SIN CAUSANTE", "BENEFICIARIO", "DESIGNADO"]) }
        }
      },
      relations: ['detallePersona', 'detallePersona.tipoPersona'],
    });

    if (detpersonaJU_PE) {
      const tipoPersonaJUPE = detpersonaJU_PE.detallePersona[0]?.tipoPersona?.tipo_persona;

      const planilla = planillas.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          fechaDeduccion >= periodoInicio &&
          fechaDeduccion <= periodoFinalizacion &&
          (
            (['JUBILADO', 'PENSIONADO'].includes(tipoPersonaJUPE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA JUBILADOS Y PENSIONADOS'))
        );
      });

      if (!planilla) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaJUPE}`, processed: false };
      } else {
        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: planilla.id_planilla },
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
          planilla,
          personaPorBanco: bancoActivo,
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (detpersonaB) {
      const tipoPersonaBE = detpersonaB.detallePersona[0]?.tipoPersona?.tipo_persona;

      const planilla = planillas.find(p => {
        const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
        const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
        const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);

        return (
          fechaDeduccion >= periodoInicio &&
          fechaDeduccion <= periodoFinalizacion &&
          (
            (['BENEFICIARIO', 'BENEFICIARIO SIN CAUSANTE', 'DESIGNADO'].includes(tipoPersonaBE) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA BENEFICIARIO'))
        );
      });

      if (!planilla) {
        return { error: `No se encontró la planilla adecuada para el mes y año proporcionado o para el tipo de persona: ${tipoPersonaBE}`, processed: false };
      } else {
        const deduccionExistente = await repositories.detalleDeduccionRepository.findOne({
          where: {
            anio: parsedAnio,
            mes: parsedMes,
            monto_total: parsedMontoTotal,
            persona: { id_persona: persona.id_persona },
            deduccion: { id_deduccion: deduccion.id_deduccion },
            planilla: { id_planilla: planilla.id_planilla },
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
          planilla,
          personaPorBanco: bancoActivo,
        });

        await repositories.detalleDeduccionRepository.save(detalleDeduccion);
        return { processed: true };
      }

    } else if (!detpersonaJU_PE) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es JUBILADO NI PENSIONADO`, processed: false };
    } else if (!detpersonaB) {
      return { error: `No se encontró persona con DNI: ${persona.n_identificacion} en detalle_persona, probablemente la persona no es BENEFICIARIO`, processed: false };
    }

  }

  async uploadDeducciones(id_planilla: any, file: Express.Multer.File): Promise<{ message: string; failedRows: any[] }> {
    const failedRows: any[] = [];
    const rows: any[] = [];

    return new Promise((resolve, reject) => {
      csv
        .parseString(file.buffer.toString(), { headers: true, delimiter: ';' })  // Asegúrate de especificar el delimitador correcto
        .on('data', row => {
          // Accedemos directamente a las propiedades del objeto fila
          const { anio, mes, dni, codigoDeduccion, montoTotal } = row;

          if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
            failedRows.push({ ...row, error: 'Campos faltantes o inválidos' });
            return;
          }

          // Se agrega cada fila como un objeto con las propiedades necesarias
          rows.push({ anio, mes, dni, codigoDeduccion, montoTotal });
        })
        .on('end', async () => {
          const repositories = {
            personaRepository: this.personaRepository,
            deduccionRepository: this.deduccionRepository,
            personaPorBancoRepository: this.personaPorBancoRepository,
            planillaRepository: this.planillaRepository,
            detalleDeduccionRepository: this.detalleDeduccionRepository,
          };

          const limit = pLimit(10); // Limitar a 10 conexiones concurrentes
          const workerPromises = rows.map(row =>
            limit(() => this.processRow(id_planilla, row, repositories).then(result => {
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
