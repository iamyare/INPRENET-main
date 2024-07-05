import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from './entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { isUUID } from 'class-validator';
import { Net_Deduccion } from '../deduccion/entities/net_deduccion.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';

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
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) { }

  async insertarDetalles(data: any[]): Promise<void> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of data) {
        const centrotrabajo = await this.centroTrabajoRepository.findOne({ where: { nombre_centro_trabajo: item.nombre_centro_trabajo } });
        if (!centrotrabajo) throw new NotFoundException(`Institucion ${item.nombre_centro_trabajo} no encontrada`);

        const persona = await this.personaRepository.findOne({ where: { n_identificacion: item.n_identificacion } });
        if (!persona) throw new NotFoundException(`Pfiliado con DNI ${item.n_identificacion} no encontrado`);

        /* const deduccion = await this.deduccionRepository.findOne({ where: { codigo_deduccion: item.codigo_deduccion, centroTrabajo } });
        if (!deduccion) throw new NotFoundException(`Deducción con código ${item.codigo_deduccion} no encontrada en la institución ${item.nombre_centro_trabajo}`); */

        const detalleDeduccion = new Net_Detalle_Deduccion();
        //detalleDeduccion.persona = persona;
        //detalleDeduccion.deduccion = deduccion;
        detalleDeduccion.anio = parseInt(item.año);
        detalleDeduccion.mes = parseInt(item.mes);
        detalleDeduccion.monto_total = parseFloat(item.monto_motal);


        await queryRunner.manager.save(detalleDeduccion);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      /* this.logger.error(`Error al insertar detalles de deducción: ${error.message}`);
      throw new InternalServerErrorException(`Error al insertar detalles de deducción: ${error.message}`); */
    } finally {
      await queryRunner.release();
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

  async getDetallesDeduccioDefinitiva(idPersona: string, idPlanilla: string): Promise<any> {
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
        dd."ESTADO_APLICACION" = 'COBRADA' AND
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

  /* async obtenerDetallesDeduccionPorPersona(idPersona: string): Promise<any[]> {
    try {
      const query = `
      SELECT
      detD."id_ded_deduccion",
      detD."monto_total",
      detD."monto_aplicado",
      detD."estado_aplicacion",
      detD."anio",
      detD."mes",
      afil."id_persona",
      afil."dni",
      TRIM(
          afil."primer_nombre" || ' ' || 
          COALESCE(afil."segundo_nombre", '') || ' ' || 
          COALESCE(afil."tercer_nombre", '') || ' ' || 
          afil."primer_apellido" || ' ' || 
          COALESCE(afil."segundo_apellido", '')
      ) AS "nombre_completo",
      ded."nombre_deduccion",
      ded."descripcion_deduccion",
      inst."tipo_institucion",
      ded."codigo_deduccion"
    FROM
      "net_detalle_deduccion" detD
    JOIN
      "net_deduccion" ded ON detD."id_deduccion" = ded."id_deduccion"
    JOIN
      "net_persona" afil ON detD."id_persona" = afil."id_persona"
      JOIN
      "net_institucion" inst ON inst."id_institucion" = ded."id_institucion"
    WHERE
      detD."id_persona" = :1 AND
      detD."estado_aplicacion" != 'INCONSISTENCIA' AND
      detD."id_persona" NOT IN (
          SELECT detD2."id_persona"
          FROM "net_detalle_deduccion" detD2
          WHERE detD2."estado_aplicacion" = 'COBRADA'
      )
      AND detD."id_persona" NOT IN (
          SELECT dedBA."id_persona"
          FROM "net_detalle_pago_beneficio" detB
          JOIN
              "net_detalle_beneficio_afiliado" dedBA ON detB."id_beneficio_afiliado" = dedBA."id_detalle_ben_afil"
          WHERE detB."estado" = 'PAGADA'
      )
    ORDER BY
      afil."id_persona",
      ded."id_deduccion"
  `;

      return await this.detalleDeduccionRepository.query(query, [idPersona]);
    } catch (error) {
      this.logger.error('Error al obtener detalles de deduccion por afiliado', error.stack);
      throw new InternalServerErrorException('Error al obtener detalles de deduccion por afiliado');
    }
  } */

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



  async create(createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    const { n_identificacion, nombre_deduccion, nombre_centro_trabajo, monto_total, monto_aplicado, estado_aplicacion, anio, mes } = createDetalleDeduccionDto;

    // Buscar el afiliado por DNI
    const persona = await this.personaRepository.findOne({ where: { n_identificacion } });
    if (!persona) {
      throw new NotFoundException(`Afiliado con DNI '${n_identificacion}' no encontrado.`);
    }
    // Buscar la deducción por nombre
    const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion: nombre_deduccion } });
    if (!deduccion) {
      throw new NotFoundException(`Deducción con nombre '${nombre_deduccion}' no encontrada.`);
    }

    // Buscar la institución por nombre
    const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { nombre_centro_trabajo } });
    if (!centroTrabajo) {
      throw new NotFoundException(`Institución con nombre '${nombre_centro_trabajo}' no encontrada.`);
    }

    // Guardar el nuevo DetalleDeduccion en la base de datos
    try {
      const nuevoDetalleDeduccion = this.detalleDeduccionRepository.create({
        persona: persona,
        deduccion: deduccion,
        //centroTrabajo: centroTrabajo,
        monto_total: monto_total,
        monto_aplicado: monto_aplicado,
        estado_aplicacion: estado_aplicacion,
        anio: anio,
        mes: mes
      });
      await this.detalleDeduccionRepository.save(nuevoDetalleDeduccion);
      return nuevoDetalleDeduccion;
    } catch (error) {
      this.handleException(error);
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

  async update(id_ded_deduccion: number, updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    // Buscar el DetalleDeduccion existente por ID
    const detalleDeduccion = await this.detalleDeduccionRepository.findOne({ where: { id_ded_deduccion } });
    if (!detalleDeduccion) {
      throw new NotFoundException(`DetalleDeduccion con ID '${id_ded_deduccion}' no encontrado.`);
    }

    const { n_identificacion, nombre_deduccion, nombre_centro_trabajo, monto_total, monto_aplicado, estado_aplicacion, anio, mes } = updateDetalleDeduccionDto;

    // Buscar el afiliado por DNI
    if (n_identificacion) {
      const afiliado = await this.personaRepository.findOne({ where: { n_identificacion } });
      if (!afiliado) {
        throw new NotFoundException(`Afiliado con DNI '${n_identificacion}' no encontrado.`);
      }
      //detalleDeduccion.afiliado = afiliado;
    }

    // Buscar la deducción por nombre
    if (nombre_deduccion) {
      const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion } });
      if (!deduccion) {
        throw new NotFoundException(`Deducción con nombre '${nombre_deduccion}' no encontrada.`);
      }
      detalleDeduccion.deduccion = deduccion;
    }

    // Buscar la institución por nombre
    if (nombre_centro_trabajo) {
      const institucion = await this.centroTrabajoRepository.findOne({ where: { nombre_centro_trabajo } });
      if (!institucion) {
        throw new NotFoundException(`Institución con nombre '${nombre_centro_trabajo}' no encontrada.`);
      }
      /* detalleDeduccion.institucion = institucion; */
    }

    // Actualizar los campos del DetalleDeduccion existente
    detalleDeduccion.monto_total = monto_total ?? detalleDeduccion.monto_total;
    detalleDeduccion.monto_aplicado = monto_aplicado ?? detalleDeduccion.monto_aplicado;
    detalleDeduccion.estado_aplicacion = estado_aplicacion ?? detalleDeduccion.estado_aplicacion;
    detalleDeduccion.anio = anio ?? detalleDeduccion.anio;
    detalleDeduccion.mes = mes ?? detalleDeduccion.mes;

    // Guardar el DetalleDeduccion actualizado en la base de datos
    try {
      await this.detalleDeduccionRepository.save(detalleDeduccion);
      return detalleDeduccion;
    } catch (error) {
      this.handleException(error);
    }
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