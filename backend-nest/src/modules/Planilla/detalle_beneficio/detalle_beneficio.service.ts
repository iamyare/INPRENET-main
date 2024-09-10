import * as oracledb from 'oracledb';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { format, parseISO } from 'date-fns';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Detalle_Pago_Beneficio } from './entities/net_detalle_pago_beneficio.entity';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { Net_Detalle_Beneficio_Afiliado } from './entities/net_detalle_beneficio_afiliado.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';

import { Net_Tipo_Persona } from 'src/modules/Persona/entities/net_tipo_persona.entity';

import { net_estado_afiliacion } from 'src/modules/Persona/entities/net_estado_afiliacion.entity';
import { NET_PROFESIONES } from 'src/modules/transacciones/entities/net_profesiones.entity';
//import { Net_Tipo_Persona } from 'src/modules/Persona/entities/net_tipo_persona.entity';
import { Net_Beneficio_Tipo_Persona } from '../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity';
@Injectable()
export class DetalleBeneficioService {
  private readonly logger = new Logger(DetalleBeneficioService.name)

  constructor(

    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private readonly benAfilRepository: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_Detalle_Beneficio_Afiliado)
    private detalleBeneficioAfiliadoRepository: Repository<Net_Detalle_Beneficio_Afiliado>,

    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,

    @InjectRepository(net_detalle_persona)
    private detPersonaRepository: Repository<net_detalle_persona>,

    @InjectRepository(Net_Beneficio_Tipo_Persona)
    private benTipoPerRepository: Repository<Net_Beneficio_Tipo_Persona>,

    @InjectRepository(Net_Tipo_Persona)
    private tipoPersonaRepos: Repository<Net_Tipo_Persona>,

    @InjectEntityManager() private readonly entityManager: EntityManager
  ) { }
  async actualizarEstadoPorPlanilla(idPlanilla: string, nuevoEstado: string): Promise<{ mensaje: string }> {
    try {
      const resultado = await this.benAfilRepository.createQueryBuilder()
        .update(Net_Detalle_Pago_Beneficio)
        .set({ estado: nuevoEstado })
        .where("planilla.id_planilla = :idPlanilla", { idPlanilla })
        .execute();

      if (resultado.affected === 0) {
        throw new NotFoundException(`No se encontraron detalles de beneficio para la planilla con ID ${idPlanilla}`);
      }

      return { mensaje: `Estado actualizado a '${nuevoEstado}' para los detalles de beneficio de la planilla con ID ${idPlanilla}` };
    } catch (error) {
      throw new InternalServerErrorException('Se produjo un error al actualizar los estados de los detalles de beneficio');
    }
  }

  async createDetalleBeneficioAfiliado(data: any, idPersonaPadre?: number): Promise<any> {
    const {datos , itemSeleccionado} = data
    return await this.entityManager.transaction(async manager => {
      try {
        const beneficio = await manager.findOne(Net_Beneficio, { where: { nombre_beneficio: datos.nombre_beneficio } });

        if (!beneficio) {
          throw new BadRequestException('Tipo de beneficio no encontrado');
        }
  
        if (!idPersonaPadre) {
          const detPer = await manager.findOne(
            net_detalle_persona,
            {
              where: {
                persona: { n_identificacion: datos.dni },
                tipoPersona: {
                  tipo_persona: In(['AFILIADO', 'JUBILADO', 'PENSIONADO']),
                },
                eliminado: "NO"
              },
              relations: ['persona']
            }
          );
          if (detPer) {
            const queryInsDeBBenf = `
                INSERT INTO NET_DETALLE_BENEFICIO_AFILIADO (
                  ID_DETALLE_PERSONA,
                  ID_CAUSANTE,
                  ID_PERSONA,
                  ID_BENEFICIO,
                  FECHA_CALCULO,
                  PERIODO_INICIO,
                  PERIODO_FINALIZACION,
                  MONTO_TOTAL,
                  METODO_PAGO,
                  MONTO_POR_PERIODO,
                  MONTO_PRIMERA_CUOTA,
                  MONTO_ULTIMA_CUOTA,
                  NUM_RENTAS_APLICADAS,
                  ESTADO_SOLICITUD,
                  OBSERVACIONES
                ) VALUES (
                  ${detPer.ID_DETALLE_PERSONA},
                  ${detPer.ID_CAUSANTE},
                  ${detPer.ID_PERSONA},
                  ${beneficio.id_beneficio},
                  '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                  ${datos.periodo && datos.periodo.start ? `'${this.convertirCadenaAFecha(datos.periodo.start)}'` : 'null'},
                  ${datos.periodo && datos.periodo.end ? `'${this.convertirCadenaAFecha(datos.periodo.end)}'` : 'null'},
                  ${parseFloat(datos.monto_total)},
                  '${datos.metodo_pago}',
                  ${parseFloat(datos.monto_por_periodo)},
                  ${parseFloat(datos.monto_primera_cuota)},
                  ${parseFloat(datos.monto_ultima_cuota)},
                  ${datos.num_rentas_aplicadas ? parseFloat(datos.num_rentas_aplicadas) : 'null'},
                  '${datos.estado_solicitud}',
                  '${datos.observacion}'
              )`;
            
            const detBeneBeneficia = await this.entityManager.query(queryInsDeBBenf);
            return detBeneBeneficia;
          }
        } else if (idPersonaPadre) {

          const detPer = await manager.findOne(
            net_detalle_persona,
            {
              where: {
                ID_CAUSANTE: idPersonaPadre,
                tipoPersona: {
                  tipo_persona: itemSeleccionado.tipo_afiliado,
                },
                eliminado: "NO"
              },
              relations: ['persona', 'padreIdPersona']
            }
          );
          
          if (detPer){
            const estadoP = await this.tipoPersonaRepos.findOne({ where: { tipo_persona: "BENEFICIARIO" } });

            const detPers = await this.detPersonaRepository.preload({
              ID_DETALLE_PERSONA: detPer.ID_DETALLE_PERSONA,
              ID_PERSONA: detPer.ID_PERSONA,
              ID_CAUSANTE: detPer.ID_CAUSANTE,
              ID_CAUSANTE_PADRE: detPer.ID_CAUSANTE_PADRE,
              ID_TIPO_PERSONA: estadoP.id_tipo_persona
            });
  
            await this.detPersonaRepository.save(detPers);   
  
            const queryInsDeBBenf = `
                  INSERT INTO NET_DETALLE_BENEFICIO_AFILIADO (
                    ID_DETALLE_PERSONA,
                    ID_CAUSANTE,
                    ID_PERSONA,
                    ID_BENEFICIO,
                    FECHA_CALCULO,
                    PERIODO_INICIO,
                    PERIODO_FINALIZACION,
                    MONTO_TOTAL,
                    METODO_PAGO,
                    MONTO_POR_PERIODO,
                    MONTO_PRIMERA_CUOTA,
                    MONTO_ULTIMA_CUOTA,
                    NUM_RENTAS_APLICADAS,
                    ESTADO_SOLICITUD,
                    OBSERVACIONES
                  ) VALUES (
                    ${detPer.ID_DETALLE_PERSONA},
                    ${detPer.ID_CAUSANTE},
                    ${detPer.ID_PERSONA},
                    ${beneficio.id_beneficio},
                    '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                    ${datos.periodo && datos.periodo.start ? `'${this.convertirCadenaAFecha(datos.periodo.start)}'` : 'null'},
                    ${datos.periodo && datos.periodo.end ? `'${this.convertirCadenaAFecha(datos.periodo.end)}'` : 'null'},
                    ${datos.monto_total},
                    '${datos.metodo_pago}',
                    ${datos.monto_por_periodo},
                    ${parseFloat(datos.monto_primera_cuota)},
                    ${parseFloat(datos.monto_ultima_cuota)},
                    ${datos.num_rentas_aplicadas ? parseFloat(datos.num_rentas_aplicadas) : 'null'},
                    '${datos.estado_solicitud}',
                    '${datos.observacion}'
                  )`;
  
            const detBeneBeneficia = await this.entityManager.query(queryInsDeBBenf);
            return detBeneBeneficia;
          }
          
      }
        //throw new BadRequestException('Detalle de persona no encontrado');
      } catch (error) {
        this.logger.error(`Error al crear DetalleBeneficioAfiliado y DetalleBeneficio: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Error al crear registros, por favor intente más tarde.');
      }
    });
  }

  /* async createBenBenefic(beneficiario: CreateDetalleBeneficioDto, idPersona: string): Promise<any> {
    try {
      const query = `
        SELECT 
            "Afil"."id_persona",
            "Afil"."dni",
            "Afil"."primer_nombre",
            "Afil"."segundo_nombre",
            "Afil"."tercer_nombre",
            "Afil"."primer_apellido",
            "Afil"."segundo_apellido",
            "Afil"."genero",
            "detA"."porcentaje",
            "detA"."tipo_persona"
        FROM
            "detalle_persona" "detA" INNER JOIN 
            "net_persona" "Afil" ON "detA"."id_persona" = "Afil"."id_persona"
        WHERE 
            "detA"."id_detalle_persona_padre" = ${idPersona} AND
            "Afil"."dni" = '${beneficiario.dni}' AND
            "detA"."tipo_persona" = 'BENEFICIARIO'
      `;

      const beneficiarios = await this.entityManager.query(query);
      return beneficiarios;
    } catch {

    }
  } */

  async cargarBenRec(): Promise<any> {
    let connection;
    try {
      // Definir los parámetros de salida
      const id_beneficio_planilla_out = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
      const cantidad_registros_insertados = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };

      let connection;
      connection = await oracledb.getConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        connectString: process.env.CONNECT_STRING
      })

      // Ejecutar el procedimiento almacenado
      const result = await connection.execute(
        `BEGIN 
          SP_INSERTAR_NET_DETALLE_PAGO_BENEFICIO(
             :id_beneficio_planilla_out, 
             :cantidad_registros_insertados
           );
         END;`,
        { id_beneficio_planilla_out, cantidad_registros_insertados }
      );

      // Manejar los valores de salida
      const cursor = result.outBinds.id_beneficio_planilla_out;
      const cantidadRegistrosInsertados = result.outBinds.cantidad_registros_insertados;

      // Leer los valores del cursor
      let idBeneficioPlanillaOut = [];
      let row;
      while ((row = await cursor.getRow())) {
        idBeneficioPlanillaOut.push(row);
      }

      return { Registros: idBeneficioPlanillaOut, cantRegistros: cantidadRegistrosInsertados };

    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Cerrar la conexión
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Error al cerrar la conexión:', error);
        }
      }
    }
  }

  async getDetalleBeneficiosPorAfiliadoYPlanilla(idPersona: string, idPlanilla: string): Promise<any> {
    const query = `
    SELECT
        ben."NOMBRE_BENEFICIO",
        detP."ID_PERSONA",
        detP."ID_CAUSANTE",
        detBA."ID_BENEFICIO",
        detBs."ID_BENEFICIO_PLANILLA",
        detBs."ESTADO",
        detBA."METODO_PAGO",
        detBs."ID_PLANILLA",
        detBs."MONTO_A_PAGAR" AS "MontoAPagar",
        detBA."NUM_RENTAS_APLICADAS",
        detBA."PERIODO_INICIO",
        detBA."PERIODO_FINALIZACION"
        FROM
            "net_persona" afil
        INNER JOIN
            "net_detalle_persona" detP ON afil."ID_PERSONA" = detP."ID_PERSONA"
        INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
            detP."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
            detP."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        INNER JOIN "NET_BENEFICIO" ben ON 
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        INNER JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detBs ON detBA."ID_DETALLE_BEN_AFIL" = detBs."ID_BENEFICIO_PLANILLA_AFIL"
        INNER JOIN
            "NET_PLANILLA" pla ON detBs."ID_PLANILLA" = pla."ID_PLANILLA"
            
          WHERE
            detBs."ESTADO" = 'EN PRELIMINAR' AND
            afil."ID_PERSONA" = ${idPersona} AND 
            pla."ID_PLANILLA" = ${idPlanilla}
    `;
    try {
      // Asegúrate de pasar los parámetros como un array en el orden en que aparecen en la consulta
      const detalleBeneficios = await this.entityManager.query(query);
      return detalleBeneficios;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de beneficio por afiliado y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de beneficio por afiliado y planilla.');
    }
  }

  async getBeneficiosDefinitiva(idPersona: string, idPlanilla: string): Promise<any> {
    const query = `
        SELECT 
            ben."CODIGO",
            ben."NOMBRE_BENEFICIO",
            detP."ID_PERSONA",
            detP."ID_CAUSANTE",
            detBA."ID_BENEFICIO",
            detBs."ESTADO",
            detBA."METODO_PAGO",
            detBs."ID_PLANILLA",
            detBs."MONTO_A_PAGAR" AS "MontoAPagar",
            detBA."NUM_RENTAS_APLICADAS",
            detBA."PERIODO_INICIO",
            detBA."PERIODO_FINALIZACION"
        FROM 
            "NET_DETALLE_PAGO_BENEFICIO" detBs
        JOIN 
            "NET_DETALLE_BENEFICIO_AFILIADO" detBA
        ON 
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
            AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
            AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
            AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        JOIN 
            "NET_BENEFICIO" ben
        ON 
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        JOIN 
            "NET_DETALLE_PERSONA" detP
        ON 
            detBA."ID_PERSONA" = detP."ID_PERSONA"
            AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
            AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
        WHERE
                detBs."ESTADO" = 'PAGADA' AND
                detBA."ID_PERSONA" = ${idPersona} AND 
                detBs."ID_PLANILLA" = ${idPlanilla}
    `;
    try {
      // Asegúrate de pasar los parámetros como un array en el orden en que aparecen en la consulta
      const detalleBeneficios = await this.entityManager.query(query);
      return detalleBeneficios;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de beneficio por afiliado y planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los detalles de beneficio por afiliado y planilla.');
    }
  }

  async getRangoDetalleBeneficios(idPersona: string, fechaInicio: string, fechaFin: string): Promise<any> {
    const query = `
    SELECT
    db."id_beneficio_planilla",
    db."estado",
    db."monto_a_pagar" as "monto",
    db."metodo_pago",
    detBA."num_rentas_aplicadas",
    detBA."periodoInicio",
    detBA."periodoFinalizacion",
    b."nombre_beneficio",
    afil."id_persona",
    TRIM(
      afil."primer_nombre" || ' ' ||
      COALESCE(afil."segundo_nombre", '') || ' ' ||
      COALESCE(afil."tercer_nombre", '') || ' ' ||
      afil."primer_apellido" || ' ' ||
      COALESCE(afil."segundo_apellido", '')
    ) AS "nombre_completo"
  FROM
    "net_detalle_pago_beneficio" db
  JOIN
    "net_detalle_beneficio_afiliado" detBA ON db."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
  JOIN
    "net_beneficio" b ON detBA."id_beneficio" = b."id_beneficio"
  JOIN
    "net_persona" afil ON detBA."id_persona" = afil."id_persona"
  WHERE
    detBA."id_persona" = :idPersona
  AND
    db."estado" = 'NO PAGADA'
  AND
    (TO_DATE(detBA."periodoInicio", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY')
     OR
     TO_DATE(detBA."periodoFinalizacion", 'DD/MM/YY') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY'))
    `;
    try {
      const parametros = { idPersona, fechaInicio, fechaFin };
      return await this.benAfilRepository.query(query, [idPersona, fechaInicio, fechaFin, fechaInicio, fechaFin]);
    } catch (error) {
      this.logger.error('Error al obtener los detalles de beneficio', error.stack);
      throw new InternalServerErrorException('Error al consultar los detalles de beneficio en la base de datos');
    }
  }

  /**modificar por cambio de estado a una tabla */
  async GetAllBeneficios(dni: string): Promise<any> {
    try {
      const persona = await this.personaRepository.createQueryBuilder('afil')
        .select([
          'afil.N_IDENTIFICACION',
          'afil.PRIMER_NOMBRE',
          'afil.SEGUNDO_NOMBRE',
          'afil.PRIMER_APELLIDO',
          'afil.SEGUNDO_APELLIDO',
          'afil.GENERO',
          'afil.DIRECCION_RESIDENCIA',
          'afil.FECHA_NACIMIENTO',
          'afil.TELEFONO_1',
          'afil.ESTADO_CIVIL',
          'afil.FALLECIDO',
          'tipPer.TIPO_PERSONA',
          'prof.DESCRIPCION',
          'estadoAfil.NOMBRE_ESTADO AS ESTADO',
        ])
        .leftJoin(NET_PROFESIONES, 'prof', 'prof.ID_PROFESION = afil.ID_PROFESION')
        .innerJoin(net_detalle_persona, 'detA', 'afil.ID_PERSONA = detA.ID_PERSONA')
        .innerJoin(Net_Tipo_Persona, 'tipPer', 'tipPer.ID_TIPO_PERSONA = detA.ID_TIPO_PERSONA')
        .innerJoin(net_estado_afiliacion, 'estadoAfil', 'estadoAfil.CODIGO = detA.ID_ESTADO_AFILIACION')
        .where(`afil.N_IDENTIFICACION = '${dni}' AND (tipPer.TIPO_PERSONA = 'AFILIADO' OR tipPer.TIPO_PERSONA = 'JUBILADO' OR tipPer.TIPO_PERSONA = 'PENSIONADO' OR tipPer.TIPO_PERSONA = 'BENEFICIARIO')`)
        .getRawMany();

      const detBen = await this.detalleBeneficioAfiliadoRepository.find({
        where: { persona: { persona: { n_identificacion: `${dni}` }, tipoPersona: { tipo_persona: In(["AFILIADO", "JUBILADO", "PENSIONADO", "BENEFICIARIO"]) } } },
        relations: [
          'persona.padreIdPersona',
          'persona.padreIdPersona.persona',
          'persona.persona',
          'persona.tipoPersona',
          'persona.estadoAfiliacion',
          'beneficio',
        ],
      });

      return { persona, detBen }
    } catch (error) {
      console.log(error);
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }

  async obtenerDetallesBeneficioComplePorAfiliado(idPersona: string): Promise<any[]> {
    try {
      const query = `
    SELECT
    detB."id_beneficio_planilla",
    detB."monto_a_pagar" as "monto",
    detB."estado",
    detB."metodo_pago",
    detBA."num_rentas_aplicadas",
    detBA."periodoInicio",
    detBA."periodoFinalizacion",
    afil."id_persona",
    afil."dni",
    TRIM(
        afil."primer_nombre" OR ' ' || 
        COALESCE(afil."segundo_nombre", '') || ' ' || 
        COALESCE(afil."tercer_nombre", '') || ' ' || 
        afil."primer_apellido" || ' ' || 
        COALESCE(afil."segundo_apellido", '')
    ) AS "nombre_completo",
    ben."nombre_beneficio",
    ben."descripcion_beneficio"
  FROM
    "net_detalle_pago_beneficio" detB
      JOIN
        "net_detalle_beneficio_afiliado" detBA ON detBA."id_detalle_ben_afil" = detB."id_beneficio_afiliado"
      JOIN
        "net_beneficio" ben ON detBA."id_beneficio" = ben."id_beneficio"
      JOIN
        "net_persona" afil ON detBA."id_persona" = afil."id_persona"
      WHERE
        afil."id_persona" = :1 AND
        detB."estado" != 'INCONSISTENCIA' AND
        detBA."id_persona" NOT IN (
          SELECT
            detD."id_persona"
          FROM
            "net_detalle_deduccion" detD
          WHERE
            detD."estado_aplicacion" = 'COBRADA'
        )
        AND detBA."id_persona" NOT IN (
          SELECT
            detBA2."id_persona"
          FROM
            "net_detalle_beneficio_afiliado" detBA2
        JOIN
            "net_detalle_pago_beneficio" detB ON detBA2."id_detalle_ben_afil" = detB."id_beneficio_afiliado"
          WHERE
            detB."estado" = 'PAGADA'
        )
      ORDER BY
        ben."id_beneficio"
    `;

      return await this.benAfilRepository.query(query, [idPersona]); // Usando un array para los parámetros
    } catch (error) {
      this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
      throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
    }
  }

  async obtenerBeneficiosDeAfil(dni: string): Promise<any[]> {
    try {
      const query = `SELECT  
      ben."id_beneficio", ben."nombre_beneficio", 
      detBenAfil."num_rentas_aplicadas",
      detBenAfil."monto_total",
      ben."numero_rentas_max" 
      FROM "net_beneficio" ben
      INNER JOIN "net_detalle_beneficio_afiliado" detBenAfil ON  
      detBenAfil."id_beneficio" = ben."id_beneficio"
      INNER JOIN "net_persona" afil ON  
      detBenAfil."id_persona" = afil."id_persona"
      WHERE 
      afil."dni" = '${dni}'`;
      return await this.benAfilRepository.query(query); // Usando un array para los parámetros
    } catch (error) {
      this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
      throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
    }
  }

  async obtenerTipoBeneficioByTipoPersona(tipoPersona: string): Promise<any[]> {
    try {
      console.log(tipoPersona);
      
      const tipoBen = await this.benTipoPerRepository.find({
        where: { tipPersona: { tipo_persona: "JUBILADO" } },
        relations: [
          'beneficio'
        ],
      });
      console.log(tipoBen);
      
      return tipoBen

    } catch (error) {
      this.logger.error('Error al obtener detalles de Tipo Beneficio por Tipo Persona', error.stack);
      throw new InternalServerErrorException('Error al obtener detalles de Tipo Beneficio por Tipo Persona');
    }
  }

  async actualizarPlanillaYEstadoDeBeneficio(detalles: { idBeneficioPlanilla: number; codigoPlanilla: string; estado: string }[], transactionalEntityManager?: EntityManager): Promise<Net_Detalle_Pago_Beneficio[]> {
    const resultados = [];
    const entityManager = transactionalEntityManager ? transactionalEntityManager : this.entityManager;

    for (const { idBeneficioPlanilla, codigoPlanilla, estado } of detalles) {
      const beneficio = await entityManager.findOne(Net_Detalle_Pago_Beneficio, { where: { id_beneficio_planilla: idBeneficioPlanilla } });
      if (!beneficio) {
        throw new NotFoundException(`DetalleBeneficio con ID "${idBeneficioPlanilla}" no encontrado`);
      }

      const planilla = await entityManager.findOne(Net_Planilla, { where: { codigo_planilla: codigoPlanilla } });
      if (!planilla) {
        throw new NotFoundException(`Planilla con código "${codigoPlanilla}" no encontrada`);
      }

      beneficio.planilla = planilla;
      beneficio.estado = estado; // Actualiza el estado

      resultados.push(await entityManager.save(beneficio));
    }
    return resultados;
  }

  /* async create(datos: any): Promise<any> {
    try {
      const afiliado = await this.afiliadoRepository.findOne({
        where: { dni: datos.dni },
      });
      if (!afiliado) {
        throw new BadRequestException('Afiliado no encontrado');
      }

      const tipoBeneficio = await this.tipoBeneficioRepository.findOne({
        where: { nombre_beneficio: datos.tipo_beneficio },
      });
      if (!tipoBeneficio) {
        throw new BadRequestException('Tipo de beneficio no encontrado');
      }

      // Conversión de las fechas
      const periodoInicio = this.convertirCadenaAFecha(datos.periodoInicio);
      const periodoFinalizacion = this.convertirCadenaAFecha(datos.periodoFinalizacion);

      // Verificar que las fechas sean válidas
      if (!periodoInicio || !periodoFinalizacion) {
        throw new BadRequestException('Formato de fecha inválido. Usa DD-MM-YYYY.');
      }

      // Creación del nuevo detalle de beneficio
      const nuevoDetalle = this.benAfilRepository.create({
        afiliado,
        beneficio: tipoBeneficio,
        periodoInicio,
        periodoFinalizacion,
        monto: datos.monto,
        estado: datos.estado || 'NO PAGADO',  // Asume un estado por defecto si no se proporciona
        modalidad_pago: datos.modalidad_pago,
        num_rentas_aplicadas: datos.num_rentas_aplicadas,
      });

      return await this.benAfilRepository.save(nuevoDetalle);
    } catch (error) {
      this.handleException(error);
    }
  } */

  private convertirCadenaAFecha(cadena: string): string | null {
    if (cadena) {
      const fecha = parseISO(cadena);
      const fechaFormateada = format(fecha, 'dd-MM-yyyy');
      return fechaFormateada
    } else {
      return null
    }
  }

  findAll() {
    return `This action returns all beneficioPlanilla`;
  }

  async findOne(term: number) {
    let benAfil: Net_Detalle_Pago_Beneficio;
    if (isUUID(term)) {
      benAfil = await this.benAfilRepository.findOneBy({ id_beneficio_planilla: term });
    } else {

      const queryBuilder = this.benAfilRepository.createQueryBuilder('afiliado');
      benAfil = await queryBuilder
        .where('"id_beneficio_planilla" = :term', { term })
        .getOne();
    }
    if (!benAfil) {
      throw new NotFoundException(`el beneficio  ${term} para el afiliado no existe no existe`);
    }
    return benAfil;
  }

  update(id: number, updateDetalleBeneficioDto: UpdateDetalleBeneficioDto) {
    return `This action updates a #${id} beneficioPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficioPlanilla`;
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
        throw new BadRequestException('El beneficio ya fue asignado');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  async findInconsistentBeneficiosByAfiliado(idPersona: string) {
    try {
      const query = `
      SELECT detB."id_beneficio_planilla",
        detBA."periodoInicio",
        detBA."periodoFinalizacion",
        ben."nombre_beneficio",
        ben."id_beneficio",
        detB."monto_a_pagar" as "monto",
        detB."estado"
      FROM "net_detalle_pago_beneficio" detB
      INNER JOIN "net_detalle_beneficio_afiliado" detBA ON detB."id_beneficio_afiliado" = detBA."id_detalle_ben_afil"
      INNER JOIN "net_beneficio" ben ON ben."id_beneficio" = detBA."id_beneficio"
      WHERE detB."estado" = 'INCONSISTENCIA'
    `;
      return await this.benAfilRepository.query(query);
    } catch (error) {
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }

}
/* 
function Net_Estado_Afiliado(qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
  throw new Error('Function not implemented.');
}
 */