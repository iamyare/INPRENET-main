import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from './entities/detalle-deduccion.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { isUUID } from 'class-validator';
import { Net_Deduccion } from '../deduccion/entities/net_deduccion.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DetalleDeduccionService {

  private readonly logger = new Logger(DetalleDeduccionService.name)

  constructor(
    @InjectRepository(Net_Detalle_Deduccion)
    private detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Deduccion)
    private deduccionRepository: Repository<Net_Deduccion>,
    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectDataSource() private readonly dataSource: DataSource,

  ) { }

  async obtenerDetallePorDeduccionPorCodigoYGenerarExcel(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
    codDeduccion: number
  ): Promise<Buffer> {
    const detallesQuery = `
      SELECT 
          dd."ANIO" AS "anio",
          dd."MES" AS "mes",
          ded."COD_DEDUCCION" AS "cod_deduccion",
          SUM(dd.MONTO_APLICADO) AS "monto_aplicado",
          persona."PRIMER_APELLIDO" || ' ' || NVL(persona."SEGUNDO_APELLIDO", '') || ' ' || persona."PRIMER_NOMBRE" || ' ' || NVL(persona."SEGUNDO_NOMBRE", '') AS "nombre_completo",
          persona."N_IDENTIFICACION" AS "n_identificacion"
      FROM 
          "NET_PLANILLA" planilla
      LEFT JOIN 
          "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
      LEFT JOIN 
          "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      LEFT JOIN 
          "NET_PERSONA" persona ON dd."ID_PERSONA" = persona."ID_PERSONA"
      WHERE 
          TO_DATE(planilla."PERIODO_INICIO", 'DD/MM/YYYY') >= TO_DATE(:1, 'DD/MM/YYYY')
          AND TO_DATE(planilla."PERIODO_FINALIZACION", 'DD/MM/YYYY') <= TO_DATE(:2, 'DD/MM/YYYY')
          AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
          AND dd."ESTADO_APLICACION" = 'COBRADA'
          AND ded."COD_DEDUCCION" = :3
      GROUP BY 
          dd."ANIO",
          dd."MES",
          ded."COD_DEDUCCION",
          persona."PRIMER_APELLIDO",
          persona."SEGUNDO_APELLIDO",
          persona."PRIMER_NOMBRE",
          persona."SEGUNDO_NOMBRE",
          persona."N_IDENTIFICACION"
      ORDER BY 
          dd."ANIO",
          dd."MES",
          persona."PRIMER_APELLIDO",
          persona."SEGUNDO_APELLIDO",
          persona."PRIMER_NOMBRE",
          persona."SEGUNDO_NOMBRE"
    `;

    try {
      const detalles = await this.dataSource.query(detallesQuery, [periodoInicio, periodoFinalizacion, codDeduccion]);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Deducciones');
      worksheet.columns = [
        { header: 'N. Identificación', key: 'n_identificacion', width: 20 },
        { header: 'Nombre Completo', key: 'nombre_completo', width: 30 },
        { header: 'Monto Aplicado', key: 'monto_aplicado', width: 15 },
        { header: 'Código Deducción', key: 'cod_deduccion', width: 15 },
        { header: 'Año', key: 'anio', width: 10 },
        { header: 'Mes', key: 'mes', width: 10 },
      ];
      detalles.forEach(detalle => {
        worksheet.addRow({
          anio: detalle.anio,
          mes: detalle.mes,
          cod_deduccion: detalle.cod_deduccion,
          monto_aplicado: detalle.monto_aplicado,
          nombre_completo: detalle.nombre_completo,
          n_identificacion: detalle.n_identificacion,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error al obtener los detalles por deducción y generar el Excel:', error);
      throw new InternalServerErrorException('Error al generar el Excel.');
    }
  }

  async actualizarEstadoAplicacionPorPlanilla(idPlanilla: string, nuevoEstado: string): Promise<{ mensaje: string }> {
    try {
      const resultado = await this.detalleDeduccionRepository.createQueryBuilder()
        .update(Net_Detalle_Deduccion)
        .set({ estado_aplicacion: nuevoEstado })
        .where("planilla.id_planilla = :idPlanilla", { idPlanilla })
        .execute();

      if (resultado.affected === 0) {
        throw new NotFoundException(`No se encontraron detalles de deducción para la planilla con ID ${idPlanilla}`);
      }

      const mensaje = `Estado de aplicación actualizado a '${nuevoEstado}' para los detalles de deducción de la planilla con ID ${idPlanilla}`;
      return { mensaje };
    } catch (error) {
      this.logger.error(`Error al actualizar el estado de aplicación para la planilla con ID ${idPlanilla}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al actualizar los estados de aplicación de los detalles de deducción');
    }
  }

  async getTotalDeduccionesPorPlanilla(idPlanilla: string): Promise<any> {
    if (!isUUID(idPlanilla)) {
      throw new BadRequestException('El ID de la planilla no es válido');
    }

    try {
      const resultado = await this.entityManager.query(
        `SELECT
          ded."id_deduccion",
          ded."nombre_deduccion",
          SUM(COALESCE(detDed."monto_aplicado", 0)) AS "Total Monto Aplicado"
        FROM
          "net_detalle_deduccion" detDed
        INNER JOIN
          "net_deduccion" ded ON detDed."id_deduccion" = ded."id_deduccion"
        WHERE
          detDed."id_planilla" = '${idPlanilla}'
        GROUP BY
          ded."id_deduccion", ded."nombre_deduccion"`
      );

      return resultado;
    } catch (error) {
      this.logger.error('Error al obtener el total de deducciones por planilla', error.stack);
      throw new InternalServerErrorException();
    }
  }


  async getDetallesDeduccionPorPersonaYPlanilla(idPersona: string, idPlanilla: string): Promise<any> {
    const query = `
    SELECT
        dd."ID_DED_DEDUCCION",
        ded."NOMBRE_DEDUCCION",
        dd."ID_PERSONA",
        dd."ID_DEDUCCION",
        ded."ID_CENTRO_TRABAJO",
        dd."MONTO_TOTAL",
        dd."MONTO_APLICADO" AS "MontoAplicado",
        dd."ESTADO_APLICACION",
        dd."ANIO",
        dd."MES",
        dd."FECHA_APLICADO",
        dd."ID_PLANILLA"
      FROM
        "NET_DETALLE_DEDUCCION" dd
      INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION" 
      WHERE
        dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
        dd."ID_PERSONA" = '${idPersona}' AND 
        dd."ID_PLANILLA" = '${idPlanilla}'
    `;

    try {
      // Usar un objeto para pasar los parámetros con nombre
      //const parameters: any = { idPersona: idPersona, idPlanilla: idPlanilla };
      const detalleDeducciones = await this.entityManager.query(query);
      return detalleDeducciones;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de deducción por persona y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de deducción por persona y planilla.');
    }
  }

  async getDetallesDeduccioDefinitiva(idPlanilla: string, idPersona: string): Promise<any> {
    const query = `
    SELECT
        dd."ID_DED_DEDUCCION",
        ded."NOMBRE_DEDUCCION",
        dd."ID_PERSONA",
        dd."ID_DEDUCCION",
        ded."ID_CENTRO_TRABAJO",
        dd."MONTO_TOTAL",
        dd."MONTO_APLICADO" AS "MontoAplicado",
        dd."ESTADO_APLICACION",
        dd."ANIO",
        dd."MES",
        dd."FECHA_APLICADO",
        detPagB."ID_PLANILLA"
      FROM
        "NET_DETALLE_DEDUCCION" dd
      INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
      INNER JOIN
        NET_DETALLE_PAGO_BENEFICIO detPagB ON 
        DD."ID_DETALLE_PAGO_BENEFICIO" = detPagB."ID_BENEFICIO_PLANILLA"
      WHERE
        dd."ESTADO_APLICACION" = 'COBRADA' AND
        dd."ID_PERSONA" = ${idPersona} AND 
        detPagB."ID_PLANILLA" = ${idPlanilla}

    `;
    try {
      // Usar un objeto para pasar los parámetros con nombre
      //const parameters: any = { idPersona: idPersona, idPlanilla: idPlanilla };
      const detalleDeducciones = await this.entityManager.query(query);
      return detalleDeducciones;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de deducción por persona y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de deducción por persona y planilla.');
    }
  }

  async getDeduccionesByPersonaAndBenef(idPersona: number, idPlanilla: number): Promise<any> {
    const query = `
      SELECT
        dedd."ID_DED_DEDUCCION",
        dd."ID_DEDUCCION",
        dd."NOMBRE_DEDUCCION",
        inst."NOMBRE_CENTRO_TRABAJO" AS "NOMBRE_INSTITUCION",
        dedd."MONTO_APLICADO" AS "MontoAplicado"
      FROM "NET_DEDUCCION" dd
      INNER JOIN "NET_DETALLE_DEDUCCION" dedd ON dd.ID_DEDUCCION = dedd."ID_DEDUCCION"
      INNER JOIN "NET_PLANILLA" plan ON plan.ID_PLANILLA = dedd."ID_PLANILLA"
      INNER JOIN "NET_CENTRO_TRABAJO" inst ON inst."ID_CENTRO_TRABAJO" = dd."ID_CENTRO_TRABAJO"
      WHERE
        dedd.ESTADO_APLICACION != 'NO COBRADA' AND
        dedd."ID_PERSONA" = ${idPersona} AND
        plan."ID_PLANILLA" = ${idPlanilla}
      ORDER BY dedd."MONTO_APLICADO" DESC
    `;
    try {
      const detalleDeducciones = await this.entityManager.query(query);
      return detalleDeducciones;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de deducción por persona y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de deducción por persona y planilla.');
    }
  }


  /*           
SELECT 
            afil."ID_PERSONA",
            dedd."ID_DEDUCCION",
            ded."NOMBRE_DEDUCCION"
        FROM
            "NET_DETALLE_PAGO_BENEFICIO" detBs
        FULL OUTER JOIN "NET_DETALLE_DEDUCCION" dedd ON detBs.ID_BENEFICIO_PLANILLA = dedd."ID_DETALLE_PAGO_BENEFICIO"
        INNER JOIN
            "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dedd."ID_DEDUCCION"
        INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON
            detBs."ID_PERSONA" = detBA."ID_PERSONA" AND
            detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE" AND
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" AND
            detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        LEFT JOIN
            "NET_DETALLE_PERSONA" detP ON
            detBs."ID_PERSONA" = detP."ID_PERSONA" AND
            detBs."ID_CAUSANTE" = detP."ID_CAUSANTE" AND
            detBs."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
        LEFT JOIN
            "NET_PERSONA" afil ON
            afil."ID_PERSONA" = detP."ID_PERSONA"
        LEFT JOIN
            "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
        WHERE
            detBs."ESTADO" = 'PAGADA' AND
            pla."CODIGO_PLANILLA" = 'ORD-JUB-PEN-01-2024' AND
            detBs."ID_BENEFICIO" = 2;    */

  async getRangoDetalleDeducciones(idPersona: string, fechaInicio: string, fechaFin: string): Promise<any> {
    const query = `
      SELECT
        dd."ID_DED_DEDUCCION",
        dd."MONTO_TOTAL",
        dd."MONTO_APLICADO",
        dd."ESTADO_APLICACION",
        dd."ANIO",
        dd."MES",
        d."NOMBRE_DEDUCCION",
        afil."ID_PERSONA",
        TRIM(
          afil."PRIMER_NOMBRE" || ' ' || 
          COALESCE(afil."SEGUNDO_NOMBRE", '') || ' ' || 
          COALESCE(afil."TERCER_NOMBRE", '') || ' ' || 
          afil."PRIMER_APELLIDO" || ' ' || 
          COALESCE(afil."SEGUNDO_APELLIDO", '')
        ) AS "nombre_completo"
      FROM
        "NET_DETALLE_DEDUCCION" dd
      JOIN
        "NET_DEDUCCION" d ON dd."ID_DEDUCCION" = d."ID_DEDUCCION"
      JOIN
        "net_persona" afil ON dd."ID_PERSONA" = afil."ID_PERSONA"
      WHERE
        dd."ID_PERSONA" = :idPersona
      AND
        TO_DATE(CONCAT(dd."ANIO", LPAD(dd."MES", 2, '0')), 'YYYYMM') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY')
      AND
        dd."ESTADO_APLICACION" = 'NO COBRADA'
    `;

    try {
      const parametros: any = {
        idPersona: idPersona,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
      return await this.detalleDeduccionRepository.query(query, parametros);
    } catch (error) {
      this.logger.error('Error al obtener los detalles de deducción', error.stack);
      throw new InternalServerErrorException('Error al consultar los detalles de deducción en la base de datos');
    }
  }


  async findInconsistentDeduccionesByAfiliado(idPersona: string) {
    try {
      const query = `
    SELECT  
      ded."nombre_deduccion",
      detD."id_ded_deduccion",
      detD."monto_total",
      detD."monto_aplicado",
      detD."estado_aplicacion",
      detD."anio",
      detD."mes" 
    FROM 
      "net_deduccion" ded
    INNER JOIN  
      "net_detalle_deduccion" detD ON ded."id_deduccion" = detD."id_deduccion"
    WHERE 
      detD."estado_aplicacion" = 'INCONSISTENCIA' AND detD."id_persona" = '${idPersona}'
    `;

      return await this.detalleDeduccionRepository.query(query);
    } catch (error) {
      this.logger.error(`Error al buscar deducciones inconsistentes por persona: ${error.message}`);
      throw new InternalServerErrorException('Error al buscar deducciones inconsistentes por persona');
    }
  }


  async actualizarPlanillasYEstadosDeDeducciones(detalles: { idDedDeduccion: number; codigoPlanilla: string; estadoAplicacion: string }[], transactionalEntityManager?: EntityManager): Promise<Net_Detalle_Deduccion[]> {
    const resultados = [];
    const entityManager = transactionalEntityManager ? transactionalEntityManager : this.entityManager;

    for (const { idDedDeduccion, codigoPlanilla, estadoAplicacion } of detalles) {
      const deduccion = await entityManager.findOne(Net_Detalle_Deduccion, { where: { id_ded_deduccion: idDedDeduccion } });
      if (!deduccion) {
        throw new NotFoundException(`DetalleDeduccion con ID "${idDedDeduccion}" no encontrado`);
      }

      const planilla = await entityManager.findOne(Net_Planilla, { where: { codigo_planilla: codigoPlanilla } });
      if (!planilla) {
        throw new NotFoundException(`Planilla con código "${codigoPlanilla}" no encontrada`);
      }

      /* deduccion.planilla = planilla; */
      deduccion.estado_aplicacion = estadoAplicacion; // Actualiza el estado de aplicación

      resultados.push(await entityManager.save(deduccion));
    }
    return resultados;
  }

  async createDetalleDeduccion(createDetalleDeduccionDto: CreateDetalleDeduccionDto): Promise<Net_Detalle_Deduccion> {
    // Buscar la deducción existente usando el código de deducción
    const deduccion = await this.deduccionRepository.findOne({
      where: { codigo_deduccion: createDetalleDeduccionDto.codigo_deduccion },
    });

    if (!deduccion) {
      throw new NotFoundException('Deducción no encontrada con el código proporcionado.');
    }

    // Buscar a la persona usando el n_identificacion
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: createDetalleDeduccionDto.n_identificacion },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con n_identificacion '${createDetalleDeduccionDto.n_identificacion}' no encontrada.`);
    }

    // Verificar si la persona está fallecida
    if (persona.fallecido === 'SI') {
      throw new BadRequestException(`La persona con n_identificacion '${createDetalleDeduccionDto.n_identificacion}' está marcada como fallecida.`);
    }

    // Buscar la planilla usando el id_planilla
    const planilla = await this.planillaRepository.findOne({
      where: { id_planilla: createDetalleDeduccionDto.id_planilla },
    });

    if (!planilla) {
      throw new NotFoundException(`Planilla con id '${createDetalleDeduccionDto.id_planilla}' no encontrada.`);
    }

    // Verificar si ya existe un detalle de deducción con el mismo ID_PLANILLA, ID_DEDUCCION, MONTO_TOTAL, ANIO y MES
    const detalleExistente = await this.detalleDeduccionRepository.findOne({
      where: {
        monto_total: createDetalleDeduccionDto.monto_total,
        anio: createDetalleDeduccionDto.anio,
        mes: createDetalleDeduccionDto.mes,
        planilla: { id_planilla: createDetalleDeduccionDto.id_planilla },
        deduccion: { id_deduccion: deduccion.id_deduccion },
        persona: { id_persona: persona.id_persona },
      },
    });

    if (detalleExistente) {
      throw new ConflictException(
        'Ya existe un detalle de deducción para esta persona con el mismo monto, año, mes, planilla, y deducción.'
      );
    }

    // Crear el detalle de deducción
    const detalleDeduccion = this.detalleDeduccionRepository.create({
      persona: persona,
      deduccion: deduccion,
      planilla: planilla,
      anio: createDetalleDeduccionDto.anio,
      mes: createDetalleDeduccionDto.mes,
      monto_total: createDetalleDeduccionDto.monto_total,
      estado_aplicacion: 'EN PRELIMINAR',
      monto_aplicado: createDetalleDeduccionDto.monto_total,
      fecha_aplicado: new Date().toISOString(), // Asegurando que la fecha esté en el formato correcto
    });

    try {
      await this.detalleDeduccionRepository.save(detalleDeduccion);
      return detalleDeduccion;
    } catch (error) {
      console.error('Error al guardar el detalle de deducción:', error);
      throw new InternalServerErrorException('Ha ocurrido un error al crear el detalle de deducción.');
    }
  }

  findAll() {
    const detalleDeduccion = this.detalleDeduccionRepository.find()
    return detalleDeduccion;
  }

  async findAllDetailed(): Promise<any[]> {
    const queryBuilder = this.detalleDeduccionRepository.createQueryBuilder('detalleDeduccion');

    queryBuilder
      .leftJoinAndSelect('detalleDeduccion.deduccion', 'deduccion')
      .leftJoinAndSelect('detalleDeduccion.afiliado', 'afiliado')
      .leftJoinAndSelect('deduccion.centroTrabajo', 'centroTrabajo')
      .leftJoinAndSelect('afiliado.detalleAfiliado', 'detalleAfiliado'); // Asume que existe una relación desde Afiliado a DetalleAfiliado

    const result = await queryBuilder.getMany();
    return result; // Devuelve el resultado directamente
  }


  findOne(id: number) {
    return `This action returns a #${id} detalleDeduccion`;
  }

  async findDeduccionesByDni(dni: string): Promise<Net_Detalle_Deduccion[]> {
    return this.detalleDeduccionRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.deduccion', 'deduccion')
      .leftJoinAndSelect('deduccion.centroTrabajo', 'centroTrabajo')
      .leftJoinAndSelect('detalle.planilla', 'planilla') // Agrega esta línea para hacer join con Net_Planilla
      .innerJoinAndSelect('detalle.afiliado', 'afiliado', 'afiliado.dni = :dni', { dni })
      .select([
        'detalle',
        'deduccion.nombre_deduccion',
        'centroTrabajo.nombre_centro_trabajoy',
        'planilla.codigo_planilla', // Selecciona el código de la planilla
        'afiliado.dni',
      ])
      .getMany();
  }

  async deleteDetalleDeduccion(id: number): Promise<void> {
    const detalleDeduccion = await this.detalleDeduccionRepository.findOne({
      where: { id_ded_deduccion: id },
    });
    if (!detalleDeduccion) {
      throw new NotFoundException(`El detalle de deducción con id ${id} no fue encontrado.`);
    }
    await this.detalleDeduccionRepository.remove(detalleDeduccion);
  }


  remove(id: number) {
    return `This action removes a #${id} detalleDeduccion`;
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
        throw new BadRequestException('La deduccion ya existe');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  readExcel(buffer: Buffer): any {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  }

}


/*  // Función para calcular el salario neto para un arreglo de deducciones
 agruparDeduccionesPorAfiliado(arrayTemp, valorMinimo) {
  const resultados = {};
  
  
  arrayTemp.forEach((item) => {
    const idPersona = item.idPersona;
    const deduccion = item.deduccion;
    const salarioBase = Math.max(item.salario_base - valorMinimo, valorMinimo);
    
    const deduccions = item.deduccion.montoDeduccion;
    
    if (!resultados[idPersona]) {
      resultados[idPersona] = {
        salarioBase: salarioBase,
        salarioRestante: salarioBase,
        deducciones: {},
      };
    }
    
    let salarioRestante = resultados[idPersona].salarioRestante;
    const deducciones = resultados[idPersona].deducciones;
    
    // Buscar si la deducción ya existe en las deducciones
    // const nombreInstitucion = deduccion.nombre_institucion; //
    
    if (!deducciones[deduccion.id_deduccion]) {
      deducciones[deduccion.id_deduccion] = {
        anio: deduccion.anio,
        mes: deduccion.mes,
        montoDeduccion: deduccions,
        institucion: deduccion.id_institucion,
        nombre_institucion: deduccion.nombre_institucion,
        valor_utilizado: 0,
        valor_no_utilizado: 0,
      };
    } else {
      // Si la deducción ya existe, sumar los montos
      deducciones[deduccion.id_deduccion].montoDeduccion += deduccions;
    }
    
    let montoDeduccion;
    if (salarioRestante >= valorMinimo) {
      montoDeduccion = Math.min(salarioRestante, deducciones[deduccion.id_deduccion].montoDeduccion);
    } else {
      montoDeduccion = deducciones[deduccion.id_deduccion].montoDeduccion - item.deduccionFinal;
    }
    
    salarioRestante -= montoDeduccion;
    deducciones[deduccion.id_deduccion].montoDeduccion = montoDeduccion;
    
    deducciones[deduccion.id_deduccion].valor_utilizado = montoDeduccion;
    deducciones[deduccion.id_deduccion].valor_no_utilizado = Math.abs(deducciones[deduccion.id_deduccion].montoDeduccion - deducciones[deduccion.id_deduccion].valor_utilizado) ;
    
    resultados[idPersona].salarioBase = salarioBase;
    resultados[idPersona].deducciones = deducciones;
  });
  
  Object.values(resultados).forEach((afiliado:any) => {
    let deduccionFinal = 0;
    
    Object.values(afiliado.deducciones).forEach((asignacion:any) => {
      deduccionFinal += asignacion.valor_utilizado;
    });
    afiliado.deduccionFinal = deduccionFinal;
    afiliado.salarioRestante = afiliado.salarioBase - afiliado.deduccionFinal;
  });
  
  console.log(JSON.stringify(resultados,null,2));
  return resultados;
}
 */