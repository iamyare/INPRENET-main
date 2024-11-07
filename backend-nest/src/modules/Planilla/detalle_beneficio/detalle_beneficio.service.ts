import * as oracledb from 'oracledb';
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { addDays, format, parseISO } from 'date-fns';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Detalle_Pago_Beneficio } from './entities/net_detalle_pago_beneficio.entity';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { Net_Detalle_Beneficio_Afiliado } from './entities/net_detalle_beneficio_afiliado.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';
import { Net_Tipo_Persona } from 'src/modules/Persona/entities/net_tipo_persona.entity';
import { net_estado_afiliacion } from 'src/modules/Persona/entities/net_estado_afiliacion.entity';
import { NET_PROFESIONES } from 'src/modules/transacciones/entities/net_profesiones.entity';
import { Net_Beneficio_Tipo_Persona } from '../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity';

import { addMonths } from 'date-fns';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class DetalleBeneficioService {

  private readonly logger = new Logger(DetalleBeneficioService.name)

  constructor(
    @InjectRepository(Net_Detalle_Deduccion)
    private readonly detDedRepository: Repository<Net_Detalle_Deduccion>,

    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioEmpRepository: Repository<Net_Usuario_Empresa>,
    private jwtService: JwtService,

    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private readonly detPagBenRepository: Repository<Net_Detalle_Pago_Beneficio>,
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

    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,

    @InjectRepository(Net_Persona_Por_Banco)
    private readonly personaPorBancoRepository: Repository<Net_Persona_Por_Banco>,

    @InjectRepository(net_estado_afiliacion)
    private readonly estadoAfilRepository: Repository<net_estado_afiliacion>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) { }

  async verificarSiEsAfiliado(dni: string): Promise<boolean> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: dni },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con DNI ${dni} no encontrada`);
    }
    const detallePersona = await this.detPersonaRepository.findOne({
      where: {
        persona: { id_persona: persona.id_persona },
        tipoPersona: { tipo_persona: 'AFILIADO' },
      },
      relations: ['tipoPersona'],
    });
    return !!detallePersona;
  }

  async insertarDetallePagoBeneficio(
    id_persona: number,
    id_causante: number,
    id_detalle_persona: number,
    id_beneficio: number,
    id_planilla: number,
    monto_a_pagar: number
  ): Promise<Net_Detalle_Pago_Beneficio> {
    const detalleBeneficioAfiliado = await this.detalleBeneficioAfiliadoRepository.findOne({
      where: {
        ID_PERSONA: id_persona,
        ID_CAUSANTE: id_causante,
        ID_DETALLE_PERSONA: id_detalle_persona,
        ID_BENEFICIO: id_beneficio,
      },
    });
    if (!detalleBeneficioAfiliado) {
      throw new NotFoundException('No se encontró el detalle del beneficio afiliado.');
    }

    // Buscamos la cuenta bancaria activa de la persona
    const personaBancoActivo = await this.personaPorBancoRepository.findOne({
      where: {
        persona: { id_persona },
        estado: 'ACTIVO',
      },
    });

    if (!personaBancoActivo) {
      throw new NotFoundException('No se encontró una cuenta bancaria activa para esta persona.');
    }

    // Creamos un nuevo registro de pago de beneficio
    const nuevoDetallePagoBeneficio = this.detPagBenRepository.create({
      estado: 'EN PRELIMINAR',
      monto_a_pagar,
      personaporbanco: personaBancoActivo,
      detalleBeneficioAfiliado: [detalleBeneficioAfiliado], // Convertimos el objeto en un arreglo
      planilla: { id_planilla },
    });

    // Guardamos el registro en la base de datos
    return await this.detPagBenRepository.save(nuevoDetallePagoBeneficio);
  }



  async obtenerDetallePagoConPlanilla(n_identificacion: string, causante_identificacion: string, id_beneficio: number) {
    const persona = await this.personaRepository.findOne({ where: { n_identificacion } });
    if (!persona) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Persona beneficiaria no encontrada',
      }, HttpStatus.NOT_FOUND);
    }
    const causante = await this.personaRepository.findOne({ where: { n_identificacion: causante_identificacion } });
    if (!causante) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Causante no encontrado',
      }, HttpStatus.NOT_FOUND);
    }
    const detallePagoBeneficio = await this.detPagBenRepository.find({
      where: {
        detalleBeneficioAfiliado: {
          ID_PERSONA: persona.id_persona,
          ID_CAUSANTE: causante.id_persona,
          ID_BENEFICIO: id_beneficio
        }
      },
      relations: ['planilla']
    });
    if (!detallePagoBeneficio || detallePagoBeneficio.length === 0) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'No se encontraron detalles de pago para este beneficio.',
      }, HttpStatus.NOT_FOUND);
    }
    return detallePagoBeneficio;
  }

  async getCausanteByDniBeneficiario(n_identificacion: string): Promise<{ causante: { nombres: string, apellidos: string, n_identificacion: string }, beneficios: Net_Detalle_Beneficio_Afiliado[] }[]> {
    const beneficiario = await this.personaRepository.findOne({ where: { n_identificacion }, relations: ['detallePersona'] });

    if (!beneficiario) {
      throw new Error('Beneficiario no encontrado');
    }
    const tipoPersona = await this.tipoPersonaRepos.findOne({ where: { tipo_persona: 'BENEFICIARIO' } });
    if (!tipoPersona) {
      throw new Error('Tipo de persona "BENEFICIARIO" no encontrado');
    }
    const detalles = beneficiario.detallePersona.filter(d => d.ID_TIPO_PERSONA === tipoPersona.id_tipo_persona);

    if (detalles.length === 0) {
      throw new Error('Detalle de beneficiario no encontrado');
    }
    const beneficiosPorCausante = await Promise.all(detalles.map(async (detalle) => {
      const causante = await this.personaRepository.findOne({ where: { id_persona: detalle.ID_CAUSANTE } });

      if (!causante) {
        throw new Error(`Causante con ID ${detalle.ID_CAUSANTE} no encontrado`);
      }
      const beneficios = await this.detalleBeneficioAfiliadoRepository.find({
        where: { ID_CAUSANTE: causante.id_persona },
        relations: ['beneficio']
      });

      return {
        causante: {
          nombres: `${causante.primer_nombre || ''} ${causante.segundo_nombre || ''}`.trim(),
          apellidos: `${causante.primer_apellido || ''} ${causante.segundo_apellido || ''}`.trim(),
          n_identificacion: causante.n_identificacion || ''
        },
        beneficios
      };
    }));

    return beneficiosPorCausante;
  }

  async actualizarEstadoPorPlanilla(idPlanilla: string, nuevoEstado: string): Promise<{ mensaje: string }> {
    try {
      const resultado = await this.detPagBenRepository.createQueryBuilder()
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

  async eliminarBenPlan(token: string, data: any): Promise<any> {
    const { idBenPlanilla, ID_DETALLE_PERSONA, ID_PERSONA, ID_CAUSANTE, ID_BENEFICIO, observacion, cod_planilla } = data

    try {
      const decoded = this.jwtService.verify(token);

      const estadoPP = await this.usuarioEmpRepository.findOne({ where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } } });


      try {
        const resultado2 = await this.detalleBeneficioAfiliadoRepository.findOne({
          where: {
            ID_DETALLE_PERSONA: ID_DETALLE_PERSONA,
            ID_PERSONA: ID_PERSONA,
            ID_CAUSANTE: ID_CAUSANTE,
            ID_BENEFICIO: ID_BENEFICIO
          }
        });

        const detalleBeneficioAfiliadoRepository = await this.detalleBeneficioAfiliadoRepository.update(
          {
            ID_DETALLE_PERSONA: resultado2.ID_DETALLE_PERSONA,
            ID_PERSONA: resultado2.ID_PERSONA,
            ID_CAUSANTE: resultado2.ID_CAUSANTE,
            ID_BENEFICIO: resultado2.ID_BENEFICIO,

          },
          {
            ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa,
            estado_solicitud: "RECHAZADO",
            observaciones: observacion
          }
        );

        const detPagBenRepository = await this.detPagBenRepository.update(
          {
            id_beneficio_planilla: idBenPlanilla,
          },
          {
            estado: "NO PAGADA",
            observacion: observacion,
            ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
          }
        );

        const resultado3 = await this.detalleBeneficioAfiliadoRepository.findOne({
          where: {
            ID_DETALLE_PERSONA: ID_DETALLE_PERSONA,
            ID_PERSONA: ID_PERSONA,
            ID_CAUSANTE: ID_CAUSANTE,
            ID_BENEFICIO: ID_BENEFICIO,
            estado_solicitud: "APROBADO",
            detallePagBeneficio: {
              id_beneficio_planilla: idBenPlanilla,
            }
          },
          relations: ["detallePagBeneficio"]
        });

        if (!resultado3) {
          const planillaRespository = await this.planillaRepository.findOne({
            where: {
              codigo_planilla: cod_planilla
            }
          });

          const detDedRepository = await this.detDedRepository.update(
            {
              persona: { id_persona: ID_PERSONA },
              planilla: planillaRespository
            },
            {
              estado_aplicacion: "NO COBRADA",
              ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
            }
          );
        }

        /*
          return { mensaje: `Estado actualizado a '${nuevoEstado}' para los detalles de beneficio de la planilla con ID ${idPlanilla}` }; 
        */
      } catch (error) {
        console.log(error);

        throw new InternalServerErrorException('Se produjo un error al actualizar los estados de los detalles de beneficio');
      }

    } catch (error) {
      throw new InternalServerErrorException(error.message);
      console.log(error);
      return error.name === "TokenExpiredError";  // True si está vencido
    }



  }

  async createDetalleBeneficioAfiliado(token: string, data: any, idPersonaPadre?: number): Promise<any> {
    const { datos, itemSeleccionado } = data

    //CALCULO DE MONTO_TOTAL
    if (!datos.monto_por_periodo && !datos.monto_primera_cuota && !datos.monto_ultima_cuota) {
      datos["monto_por_periodo"] = datos.monto_total
      datos["monto_primera_cuota"] = datos.monto_total
      datos["monto_ultima_cuota"] = datos.monto_total
    } else if (datos.monto_total) {
      if (datos.num_rentas_aplicadas) {
        datos["monto_total"] = (
          (parseFloat(datos.monto_total || 0) +
            parseFloat(datos.monto_ultima_cuota || 0))
        )
      }
    }

    const decoded = this.jwtService.verify(token);
    const estadoPP = await this.usuarioEmpRepository.findOne({ where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } } });
    const fechaActual = new Date();
    const startDateFormatted = format(fechaActual, 'dd-MM-yyyy');

    return await this.entityManager.transaction(async manager => {
      try {
        const beneficio = await manager.findOne(Net_Beneficio, { where: { nombre_beneficio: datos.nombre_beneficio } });

        if (!beneficio) {
          throw new BadRequestException('Tipo de beneficio no encontrado');
        }

        const detben = await manager.findOne(
          Net_Detalle_Beneficio_Afiliado,
          {
            where: {
              persona: { persona: { n_identificacion: datos.dni } },
              beneficio: { id_beneficio: beneficio.id_beneficio }
            },
            relations: ['persona', 'persona.persona', 'beneficio']
          }
        );

        if (!detben) {
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
                     OBSERVACIONES,
                     ULTIMO_DIA_ULTIMA_RENTA,
                     ID_USUARIO_EMPRESA
                   ) VALUES (
                     ${detPer.ID_DETALLE_PERSONA},
                     ${detPer.ID_CAUSANTE},
                     ${detPer.ID_PERSONA},
                     ${beneficio.id_beneficio},
                     '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                     '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                     ${datos.periodo_finalizacion ? `'${datos.periodo_finalizacion}'` : null},
                     ${parseFloat(datos.monto_total) ? parseFloat(datos.monto_total) : null},
                     'TRANSFERENCIA',
                     ${parseFloat(datos.monto_por_periodo) ? parseFloat(datos.monto_por_periodo) : null},
                     ${parseFloat(datos.monto_primera_cuota) ? parseFloat(datos.monto_primera_cuota) : null},
                     ${parseFloat(datos.monto_ultima_cuota) ? parseFloat(datos.monto_ultima_cuota) : null},
                     ${datos.num_rentas_aplicadas ? parseFloat(datos.num_rentas_aplicadas) : null},
                     '${datos.estado_solicitud}',
                     '${datos.observacion}',
                      ${datos.ultimo_dia_ultima_renta ? parseFloat(datos.ultimo_dia_ultima_renta) : null},
                     ${estadoPP.id_usuario_empresa}
               )`;

              const detBeneBeneficia = await this.entityManager.query(queryInsDeBBenf);

              const tipoP = await this.tipoPersonaRepos.findOne({ where: { tipo_persona: datos.tipo_persona } });
              const detPers = await this.detPersonaRepository.preload({
                ID_DETALLE_PERSONA: detPer.ID_DETALLE_PERSONA,
                ID_PERSONA: detPer.ID_PERSONA,
                ID_CAUSANTE: detPer.ID_CAUSANTE,
                ID_CAUSANTE_PADRE: detPer.ID_CAUSANTE_PADRE,
                ID_TIPO_PERSONA: tipoP.id_tipo_persona,
                ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
              });
              await this.detPersonaRepository.save(detPers);

              //ACTUALIZAR A INHABILITADO solo si se le otorga el beneficio de separacion del sistema.
              if (datos.nombre_beneficio == "SEPARACION DEL SISTEMA VOLUNTARIO" ||
                datos.nombre_beneficio == "SEPARACION DEL SISTEMA DE OFICIO" ||
                datos.nombre_beneficio == "SEPARACION DE JUBILACION POR OFICIO" ||
                datos.nombre_beneficio == "SEPARACION DE JUBILACION POR OFICIO" ||
                datos.nombre_beneficio == "SEGURO DE VIDA Y SEPARACION"
              ) {
                const estadoP = await this.estadoAfilRepository.findOne({ where: { nombre_estado: "INACTIVO" } });
                const detPers = await this.detPersonaRepository.preload({
                  ID_DETALLE_PERSONA: detPer.ID_DETALLE_PERSONA,
                  ID_PERSONA: detPer.ID_PERSONA,
                  ID_CAUSANTE: detPer.ID_CAUSANTE,
                  ID_CAUSANTE_PADRE: detPer.ID_CAUSANTE_PADRE,
                  ID_ESTADO_AFILIACION: estadoP.codigo,
                  ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
                });
                await this.detPersonaRepository.save(detPers);
              }

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

            if (detPer) {
              const estadoP = await this.tipoPersonaRepos.findOne({ where: { tipo_persona: "BENEFICIARIO" } });

              const detPers = await this.detPersonaRepository.preload({
                ID_DETALLE_PERSONA: detPer.ID_DETALLE_PERSONA,
                ID_PERSONA: detPer.ID_PERSONA,
                ID_CAUSANTE: detPer.ID_CAUSANTE,
                ID_CAUSANTE_PADRE: detPer.ID_CAUSANTE_PADRE,
                ID_TIPO_PERSONA: estadoP.id_tipo_persona,
                ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
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
                       OBSERVACIONES,
                       ID_USUARIO_EMPRESA,
                       ULTIMO_DIA_ULTIMA_RENTA
                     ) VALUES (
                       ${detPer.ID_DETALLE_PERSONA},
                       ${detPer.ID_CAUSANTE},
                       ${detPer.ID_PERSONA},
                       ${beneficio.id_beneficio},
                       '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                       '${this.convertirCadenaAFecha(datos.fecha_calculo)}',
                       ${datos.periodo_finalizacion ? `'${datos.periodo_finalizacion}'` : null},
                       ${parseFloat(datos.monto_total) ? parseFloat(datos.monto_total) : null},
                       'TRANSFERENCIA',
                       ${parseFloat(datos.monto_por_periodo) ? parseFloat(datos.monto_por_periodo) : null},
                       ${parseFloat(datos.monto_primera_cuota) ? parseFloat(datos.monto_primera_cuota) : null},
                       ${parseFloat(datos.monto_ultima_cuota) ? parseFloat(datos.monto_ultima_cuota) : null},
                       ${datos.num_rentas_aplicadas ? parseFloat(datos.num_rentas_aplicadas) : null},
                       '${datos.estado_solicitud}',
                       '${datos.observacion}',
                       ${estadoPP.id_usuario_empresa},
                      ${datos.ultimo_dia_ultima_renta ? parseFloat(datos.ultimo_dia_ultima_renta) : null}
               )`;

              const detBeneBeneficia = await this.entityManager.query(queryInsDeBBenf);
              return detBeneBeneficia;
            }

          }
        } else {
          this.logger.error(`Ya existe el mismo beneficio para esta persona`);
          throw new InternalServerErrorException('Ya existe el mismo beneficio para esta persona');
        }

      } catch (error) {
        this.logger.error(`Error al crear DetalleBeneficioAfiliado y DetalleBeneficio: ${error.message}`, error.stack);
        throw new InternalServerErrorException(error);
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
      return await this.detPagBenRepository.query(query, [idPersona, fechaInicio, fechaFin, fechaInicio, fechaFin]);
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
          'detA.VOLUNTARIO',
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
        where: { persona: { persona: { n_identificacion: `${dni}` }, tipoPersona: { tipo_persona: In(["AFILIADO", "JUBILADO", "PENSIONADO", "BENEFICIARIO", "BENEFICIARIO SIN CAUSANTE", "DESIGNADO"]) } } },
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

      return await this.detPagBenRepository.query(query, [idPersona]); // Usando un array para los parámetros
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
      return await this.detPagBenRepository.query(query); // Usando un array para los parámetros
    } catch (error) {
      this.logger.error('Error al obtener detalles de beneficio por afiliado', error.stack);
      throw new InternalServerErrorException('Error al obtener detalles de beneficio por afiliado');
    }
  }

  async obtenerTipoBeneficioByTipoPersona(tipoPersona: string): Promise<any[]> {
    try {
      const tipoBen = await this.benTipoPerRepository.find({
        where: {
          tipPersona: { tipo_persona: tipoPersona },
          beneficio: { nombre_beneficio: Not('PENSION POR VIUDEZ Y ORFANDAD') }
        },
        relations: [
          'beneficio',
          'beneficio.regimen'
        ],
      });

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
      const nuevoDetalle = this.detPagBenRepository.create({
        afiliado,
        beneficio: tipoBeneficio,
        periodoInicio,
        periodoFinalizacion,
        monto: datos.monto,
        estado: datos.estado || 'NO PAGADO',  // Asume un estado por defecto si no se proporciona
        modalidad_pago: datos.modalidad_pago,
        num_rentas_aplicadas: datos.num_rentas_aplicadas,
      });

      return await this.detPagBenRepository.save(nuevoDetalle);
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
      benAfil = await this.detPagBenRepository.findOneBy({ id_beneficio_planilla: term });
    } else {

      const queryBuilder = this.detPagBenRepository.createQueryBuilder('afiliado');
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
      return await this.detPagBenRepository.query(query);
    } catch (error) {
      this.logger.error(`Error al buscar beneficios inconsistentes por afiliado: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al buscar beneficios inconsistentes por afiliado');
    }
  }

  async updateBeneficioPersona(token: string, data: any) {
    const decoded = this.jwtService.verify(token);

    const estadoPP = await this.usuarioEmpRepository.findOne({ where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } } });
    const id_usuario_empresa_in = estadoPP.id_usuario_empresa

    try {
      const dataEnv = {
        ID_DETALLE_PERSONA: data.ID_DETALLE_PERSONA,
        ID_PERSONA: data.ID_PERSONA,
        ID_CAUSANTE: data.ID_CAUSANTE,
        ID_BENEFICIO: data.ID_BENEFICIO,
        estado_solicitud: data.estado_solicitud,
        ID_USUARIO_EMPRESA: id_usuario_empresa_in,
        monto_total: data.monto_total === '' ? null : parseFloat(data.monto_total),
        monto_ultima_cuota: data.monto_ultima_cuota === '' ? null : parseFloat(data.monto_ultima_cuota),
        monto_por_periodo: data.monto_por_periodo === '' ? null : parseFloat(data.monto_por_periodo),
        monto_primera_cuota: data.monto_primera_cuota === '' ? null : parseFloat(data.monto_primera_cuota),
        num_rentas_aplicadas: data.num_rentas_aplicadas === undefined || data.num_rentas_aplicadas === '' ? null : parseInt(data.num_rentas_aplicadas),
        ultimo_dia_ultima_renta: data.ultimo_dia_ultima_renta === undefined || data.ultimo_dia_ultima_renta === '' ? null : parseInt(data.num_rentas_aplicadas),
        observaciones: data.observaciones,
        prestamo: data.prestamo === undefined || data.prestamo === '' ? null : data.prestamo,
      };

      const detBenAfil = await this.detalleBeneficioAfiliadoRepository.preload(dataEnv);
      await this.detalleBeneficioAfiliadoRepository.save(detBenAfil);

    } catch (error) {
      this.logger.error(`Error al actualizar beneficios: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al actualizar beneficios. ${error}}`);
    }
  }
}

/* 
function Net_Estado_Afiliado(qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
  throw new Error('Function not implemented.');
}
 */