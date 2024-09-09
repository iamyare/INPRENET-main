import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Net_Deduccion } from './entities/net_deduccion.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import * as XLSX from 'xlsx';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
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

    async uploadDeducciones(file: Express.Multer.File): Promise<{ message: string, failedRows: any[] }> {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      const failedRows: any[] = [];  // Array para almacenar las filas que fallan con su razón
    
      for (const sheetName of sheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];
    
          const [header, ...rows] = data;
    
          for (const row of rows) {
              const [anio, mes, dni, codigoDeduccion, montoTotal] = row;
    
              if (!anio || !mes || !dni || !codigoDeduccion || !montoTotal) {
                  this.logger.warn(`Fila ignorada por no tener todas las columnas llenas: ${JSON.stringify(row)}`);
                  failedRows.push([...row, 'Faltan columnas obligatorias']);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              const parsedAnio = Number(anio);
              const parsedMes = Number(mes);
              const parsedDni = dni.toString();
              const parsedCodigoDeduccion = Number(codigoDeduccion);
              const parsedMontoTotal = parseFloat(montoTotal);
    
              if (isNaN(parsedAnio) || isNaN(parsedMes) || parsedDni === '' || isNaN(parsedCodigoDeduccion) || isNaN(parsedMontoTotal)) {
                  this.logger.warn(`Datos inválidos en la fila (conversión fallida): ${JSON.stringify(row)}`);
                  failedRows.push([...row, 'Error en la conversión de datos']);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              const persona = await this.personaRepository.findOne({
                  where: { n_identificacion: parsedDni },
                  relations: ['detallePersona', 'detallePersona.tipoPersona']
              });
    
              if (!persona) {
                  this.logger.warn(`No se encontró persona con DNI: ${parsedDni}`);
                  failedRows.push([...row, `No se encontró persona con DNI: ${parsedDni}`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              const tipoPersona = persona.detallePersona[0]?.tipoPersona?.tipo_persona;
    
              const deduccion = await this.deduccionRepository.findOne({
                  where: { codigo_deduccion: parsedCodigoDeduccion },
              });
    
              if (!deduccion) {
                  this.logger.warn(`No se encontró deducción con código: ${parsedCodigoDeduccion}`);
                  failedRows.push([...row, `No se encontró deducción con código: ${parsedCodigoDeduccion}`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              // Buscar banco activo para la persona
              const bancoActivo = await this.personaPorBancoRepository.findOne({
                  where: {
                      persona: { id_persona: persona.id_persona },
                      estado: 'ACTIVO'
                  }
              });
    
              if (!bancoActivo) {
                  this.logger.warn(`No se encontró un banco activo para la persona con DNI: ${parsedDni}`);
                  failedRows.push([...row, `No se encontró un banco activo para la persona`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              let planillas;
              try {
                  planillas = await this.planillaRepository.find({
                      where: {
                          estado: 'ACTIVA',
                          secuencia: 1
                      },
                      relations: ['tipoPlanilla']
                  });
              } catch (err) {
                  this.logger.error(`Error en la consulta de planillas: ${err.message}`);
                  failedRows.push([...row, `Error en la consulta de planillas: ${err.message}`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              if (!planillas || planillas.length === 0) {
                  this.logger.warn(`No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`);
                  failedRows.push([...row, `No se encontró planilla activa para el mes: ${parsedMes}-${parsedAnio}`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              // Validación del periodo de la planilla
              const planilla = planillas.find(p => {
                  const periodoInicio = new Date(p.periodoInicio.split('/').reverse().join('-'));
                  const periodoFinalizacion = new Date(p.periodoFinalizacion.split('/').reverse().join('-'));
    
                  const fechaDeduccion = new Date(parsedAnio, parsedMes - 1);
    
                  return (
                      fechaDeduccion >= periodoInicio &&
                      fechaDeduccion <= periodoFinalizacion &&
                      ((['BENEFICIARIO', 'AFILIADO'].includes(tipoPersona) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA BENEFICIARIO') ||
                      (['JUBILADO', 'PENSIONADO'].includes(tipoPersona) && p.tipoPlanilla.nombre_planilla === 'ORDINARIA JUBILADOS Y PENSIONADOS'))
                  );
              });
    
              if (!planilla) {
                  this.logger.warn(`No se encontró planilla adecuada para el mes/año proporcionado o el tipo de persona: ${tipoPersona}`);
                  failedRows.push([...row, `No se encontró planilla adecuada para el mes/año proporcionado o el tipo de persona: ${tipoPersona}`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              const deduccionExistente = await this.detalleDeduccionRepository.findOne({
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
                  this.logger.warn(`Deducción duplicada detectada: ${JSON.stringify(row)}`);
                  failedRows.push([...row, `Deducción duplicada detectada`]);  // Guardar la fila que falla con la razón
                  continue;
              }
    
              const detalleDeduccion = this.detalleDeduccionRepository.create({
                  anio: parsedAnio,
                  mes: parsedMes,
                  monto_total: parsedMontoTotal,
                  estado_aplicacion: 'NO COBRADA',
                  persona,
                  deduccion,
                  planilla,
                  personaPorBanco: bancoActivo  // Asignar el banco activo aquí
              });
    
              await this.detalleDeduccionRepository.save(detalleDeduccion);
          }
      }
    
      // Retornar las filas que no se insertaron junto con el mensaje
      return { message: 'Deducciones procesadas correctamente', failedRows };
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

      console.log(deducciones);

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
