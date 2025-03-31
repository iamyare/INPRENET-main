import * as oracledb from 'oracledb';
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { format, parseISO } from 'date-fns';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Net_Beneficio } from '../beneficio/entities/net_beneficio.entity';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Detalle_Pago_Beneficio } from './entities/net_detalle_pago_beneficio.entity';
import { Net_Planilla } from '../planilla/entities/net_planilla.entity';
import { Net_Detalle_Beneficio_Afiliado } from './entities/net_detalle_beneficio_afiliado.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';
import { Net_Tipo_Persona } from 'src/modules/Persona/entities/net_tipo_persona.entity';
import { net_estado_afiliacion } from 'src/modules/Persona/entities/net_estado_afiliacion.entity';
import { NET_PROFESIONES } from 'src/modules/transacciones/entities/net_profesiones.entity';
import { Net_Beneficio_Tipo_Persona } from '../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity';
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

  async verificarPersonaConTipo(dni: string): Promise<boolean> {
    try {
      // Consulta SQL directa para verificar si la persona existe con un tipo válido
      const query = `
            SELECT COUNT(*) AS count
            FROM NET_PERSONA P
            JOIN NET_DETALLE_PERSONA DP ON P.ID_PERSONA = DP.ID_PERSONA
            WHERE P.N_IDENTIFICACION = :dni
            AND DP.ID_TIPO_PERSONA IN (1, 2, 3)
        `;

      const result = await this.personaRepository.query(query, [dni]);

      // Verificar el resultado
      if (result && result[0] && result[0].COUNT > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al verificar el tipo de persona:', error.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al verificar el tipo de persona',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verificarPagosBeneficiarios(n_identificacion: string): Promise<boolean> {
    const causante = await this.personaRepository.findOne({
      where: { n_identificacion },
    });

    if (!causante) {
      return false;
    }
    const beneficiarios = await this.detPersonaRepository.find({
      where: [
        { ID_CAUSANTE: causante.id_persona },
        { ID_CAUSANTE_PADRE: causante.id_persona }
      ],
    });
    const idsBeneficiarios = beneficiarios
      .filter(b => b.ID_PERSONA !== causante.id_persona)
      .map(b => b.ID_PERSONA);

    if (idsBeneficiarios.length === 0) {
      return false;
    }

    const pagos = await this.detPagBenRepository
      .createQueryBuilder('pago')
      .where('pago.ID_CAUSANTE = :idCausante', { idCausante: causante.id_persona })
      .andWhere('pago.ID_PERSONA != :idPersona', { idPersona: causante.id_persona })
      .andWhere('pago.estado != :estado', { estado: 'RECHAZADO' })
      .getMany();

    return pagos.length > 0;
  }

  async obtenerBeneficiosPorPersona(dni: string, incluirCostoVida: boolean): Promise<any> {
    let query = '';
    if (incluirCostoVida) {
      query = `
            SELECT
                P.N_IDENTIFICACION,
                M.NOMBRE_MUNICIPIO,
                D.NOMBRE_DEPARTAMENTO,
                MAX(B.NOMBRE_BENEFICIO) AS NOMBRE_BENEFICIO,
                B.PERIODICIDAD,
                SUM(PAGO.MONTO_POR_PERIODO) AS MONTO_POR_PERIODO,
                MAX(
                    CASE
                        WHEN PAGO.ID_BENEFICIO NOT IN (6, 27, 28) 
                        THEN TO_CHAR(PAGO.FECHA_EFECTIVIDAD, 'DD/MM/YYYY')
                        ELSE NULL
                    END
                ) AS FECHA_EFECTIVIDAD,
                MAX(PAGO.NUM_RENTAS_APROBADAS) AS NUM_RENTAS_APROBADAS,
                MAX(PAGO.PERIODO_FINALIZACION) AS PERIODO_FINALIZACION
            FROM
                NET_DETALLE_BENEFICIO_AFILIADO PAGO
            JOIN NET_PERSONA P ON P.ID_PERSONA = PAGO.ID_PERSONA
            LEFT JOIN NET_MUNICIPIO M ON P.ID_MUNICIPIO_RESIDENCIA = M.ID_MUNICIPIO
            LEFT JOIN NET_DEPARTAMENTO D ON M.ID_DEPARTAMENTO = D.ID_DEPARTAMENTO
            JOIN NET_BENEFICIO B ON B.ID_BENEFICIO = PAGO.ID_BENEFICIO
            WHERE
                P.N_IDENTIFICACION = :dni
                AND PAGO.ID_BENEFICIO NOT IN (27, 28)
            GROUP BY
                P.N_IDENTIFICACION,
                M.NOMBRE_MUNICIPIO,
                D.NOMBRE_DEPARTAMENTO,
                B.PERIODICIDAD
        `;
    } else {
      query = `
            SELECT 
                P.N_IDENTIFICACION,
                M.NOMBRE_MUNICIPIO,
                D.NOMBRE_DEPARTAMENTO,
                B.NOMBRE_BENEFICIO,
                B.PERIODICIDAD,
                PAGO.MONTO_POR_PERIODO,
                TO_CHAR(PAGO.FECHA_EFECTIVIDAD, 'DD/MM/YYYY') AS FECHA_EFECTIVIDAD,
                PAGO.NUM_RENTAS_APROBADAS,
                PAGO.PERIODO_FINALIZACION
            FROM 
                NET_DETALLE_BENEFICIO_AFILIADO PAGO
            JOIN 
                NET_PERSONA P ON P.ID_PERSONA = PAGO.ID_PERSONA
            LEFT JOIN 
                NET_MUNICIPIO M ON P.ID_MUNICIPIO_RESIDENCIA = M.ID_MUNICIPIO
            LEFT JOIN 
                NET_DEPARTAMENTO D ON M.ID_DEPARTAMENTO = D.ID_DEPARTAMENTO
            JOIN 
                NET_BENEFICIO B ON B.ID_BENEFICIO = PAGO.ID_BENEFICIO
            WHERE 
                P.N_IDENTIFICACION = :dni
                AND PAGO.ID_BENEFICIO NOT IN (6, 27, 28)
            ORDER BY 
                PAGO.FECHA_EFECTIVIDAD DESC
        `;
    }

    // ✅ Forma correcta de pasar el parámetro a la consulta
    const beneficios = await this.personaRepository.query(query, [dni]);

    if (!beneficios || beneficios.length === 0) {
      throw new NotFoundException(`No se encontraron beneficios para la persona con DNI ${dni}`);
    }

    return beneficios;
  }


  async verificarSiEsAfiliado(n_identificacion: string): Promise<any> {
    const persona = await this.personaRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.detallePersona', 'detallePersona')
      .leftJoinAndSelect('detallePersona.tipoPersona', 'tipoPersona')
      .leftJoinAndSelect('persona.familiares', 'familiares')
      .leftJoinAndSelect('persona.municipio', 'municipio')
      .leftJoinAndSelect('persona.municipio_nacimiento', 'municipioNacimiento')
      .where('persona.n_identificacion = :n_identificacion', { n_identificacion })
      .getOne();

    if (!persona) {
      return { esAfiliado: false, datosPersona: null };
    }

    const tiposPermitidos = ['AFILIADO', 'JUBILADO', 'PENSIONADO'];
    const esAfiliado = persona.detallePersona?.some(detalle =>
      tiposPermitidos.includes(detalle.tipoPersona?.tipo_persona || '')
    );

    const trabaja = persona.familiares?.some(familia => familia.trabaja === 'SÍ') ? 'SÍ' : 'NO';

    return {
      esAfiliado: !!esAfiliado,
      datosPersona: {
        primer_nombre: persona.primer_nombre || null,
        segundo_nombre: persona.segundo_nombre || null,
        tercer_nombre: persona.tercer_nombre || null,
        primer_apellido: persona.primer_apellido || null,
        segundo_apellido: persona.segundo_apellido || null,
        n_identificacion: persona.n_identificacion || null,
        fecha_nacimiento: persona.fecha_nacimiento || null,
        telefono_domicilio: persona.telefono_2 || null,
        telefono_celular: persona.telefono_1 || null,
        telefono_trabajo: persona.telefono_3 || null,
        trabaja: trabaja,
        id_municipio_residencia: persona.municipio?.id_municipio || null,
        id_municipio_nacimiento: persona.municipio_nacimiento?.id_municipio || null
      }
    };
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

    const tiposPersona = await this.tipoPersonaRepos.find({
      where: { tipo_persona: In(['BENEFICIARIO', 'BENEFICIARIO SIN CAUSANTE', 'DESIGNADO']) }
    });

    if (tiposPersona.length === 0) {
      throw new Error('Tipos de persona "BENEFICIARIO", "BENEFICIARIO SIN CAUSANTE" o "DESIGNADO" no encontrados');
    }

    const detalles = beneficiario.detallePersona.filter(d => tiposPersona.some(tp => tp.id_tipo_persona === d.ID_TIPO_PERSONA));

    if (detalles.length === 0) {
      throw new Error('Detalle de beneficiario no encontrado');
    }

    // Map para almacenar causantes y sus beneficios únicos
    const causantesMap = new Map<number, { causante: { nombres: string, apellidos: string, n_identificacion: string }, beneficios: Net_Detalle_Beneficio_Afiliado[] }>();

    for (const detalle of detalles) {
      const causante = await this.personaRepository.findOne({ where: { id_persona: detalle.ID_CAUSANTE } });

      if (!causante) {
        throw new Error(`Causante con ID ${detalle.ID_CAUSANTE} no encontrado`);
      }

      // Si el causante aún no ha sido procesado, agregarlo
      if (!causantesMap.has(causante.id_persona)) {
        const beneficios = await this.detalleBeneficioAfiliadoRepository.find({
          where: { ID_CAUSANTE: causante.id_persona },
          relations: ['beneficio']
        });

        // Eliminar beneficios duplicados dentro del mismo causante
        const beneficiosUnicos = beneficios.filter(
          (beneficio, index, self) =>
            index === self.findIndex((b) => b.ID_BENEFICIO === beneficio.ID_BENEFICIO)
        );

        causantesMap.set(causante.id_persona, {
          causante: {
            nombres: `${causante.primer_nombre || ''} ${causante.segundo_nombre || ''}`.trim(),
            apellidos: `${causante.primer_apellido || ''} ${causante.segundo_apellido || ''}`.trim(),
            n_identificacion: causante.n_identificacion || '',
          },
          beneficios: beneficiosUnicos
        });
      }
    }

    return Array.from(causantesMap.values());
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

    let num_rentas_aprobadas = datos.num_rentas_aprobadas !== '' && datos.num_rentas_aprobadas != null
      ? parseInt(datos.num_rentas_aprobadas)
      : 0;

    let ultimo_dia_ultima_renta = datos.ultimo_dia_ultima_renta !== '' && datos.ultimo_dia_ultima_renta != null
      ? parseInt(datos.ultimo_dia_ultima_renta)
      : 0;

    let num_rentas_pagar_primer_pago = datos.num_rentas_pagar_primer_pago !== '' && datos.num_rentas_pagar_primer_pago != null
      ? parseInt(datos.num_rentas_pagar_primer_pago)
      : 0;

    let monto_ultima_cuota = datos.monto_ultima_cuota !== '' && datos.monto_ultima_cuota != null
      ? parseFloat(datos.monto_ultima_cuota)
      : 0;

    let monto_por_periodo = datos.monto_por_periodo !== '' && datos.monto_por_periodo != null
      ? parseFloat(datos.monto_por_periodo)
      : 0;

    let monto_primera_cuota = datos.monto_primera_cuota !== '' && datos.monto_primera_cuota != null
      ? parseFloat(datos.monto_primera_cuota)
      : 0;

    let monto_retroactivo = datos.monto_retroactivo !== '' && datos.monto_retroactivo != null
      ? parseFloat(datos.monto_retroactivo)
      : 0;

    let monto_total = datos.monto_total !== '' && datos.monto_total != null
      ? parseFloat(datos.monto_total)
      : 0;

    let periodo_finalizacion = datos.periodo_finalizacion !== '' && datos.periodo_finalizacion != null
      ? datos.periodo_finalizacion
      : null;

    let fecha_presentacion = datos.fecha_presentacion !== '' && datos.fecha_presentacion != null
      ? this.convertirCadenaAFecha(datos.fecha_presentacion)
      : null;

    let fecha_efectividad = datos.fecha_efectividad !== '' && datos.fecha_efectividad != null
      ? this.convertirCadenaAFecha(datos.fecha_efectividad)
      : null;

    if (!datos.monto_por_periodo && !datos.monto_primera_cuota && !datos.monto_ultima_cuota) {
      if (datos.num_rentas_aprobadas == 1) {
        monto_por_periodo = 0
        monto_primera_cuota = monto_total
        monto_retroactivo = monto_total
        monto_ultima_cuota = 0
      } else {
        /* datos["monto_por_periodo"] = datos.monto_total
        datos["monto_primera_cuota"] = datos.monto_total
        datos["monto_ultima_cuota"] = datos.monto_total */
      }

    } else if (datos.monto_total) {
      if (datos.num_rentas_aprobadas) {
        monto_total = (
          (parseFloat(datos.monto_total || 0))
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

        if (!idPersonaPadre) {
          const detben = await manager.findOne(
            Net_Detalle_Beneficio_Afiliado,
            {
              where: {
                persona: { ID_CAUSANTE: idPersonaPadre, persona: { n_identificacion: datos.dni } },
                beneficio: { id_beneficio: beneficio.id_beneficio }
              },
              relations: ['persona', 'persona.persona', 'beneficio']
            }
          );

          if (!detben) {
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
                       FECHA_EFECTIVIDAD,
                       PERIODO_INICIO,
                       PERIODO_FINALIZACION,
                       MONTO_TOTAL,
                       METODO_PAGO,
                       MONTO_POR_PERIODO,
                       MONTO_PRIMERA_CUOTA,
                       MONTO_RETROACTIVO,
                       MONTO_ULTIMA_CUOTA,
                       NUM_RENTAS_APROBADAS,
                       ESTADO_SOLICITUD,
                       OBSERVACIONES,
                       ULTIMO_DIA_ULTIMA_RENTA,
                       ID_USUARIO_EMPRESA,
                       NUM_RENTAS_PAGAR_PRIMER_PAGO,
                       FECHA_PRESENTACION,
                       N_EXPEDIENTE,
                       LISTO_COMPLEMENTARIA
                     ) VALUES (
                       ${detPer.ID_DETALLE_PERSONA},
                       ${detPer.ID_CAUSANTE},
                       ${detPer.ID_PERSONA},
                       ${beneficio.id_beneficio},
                       '${fecha_efectividad}',
                       '${fecha_efectividad}',
                       ${`'${periodo_finalizacion}'`},
                       ${monto_total},
                       'TRANSFERENCIA',
                       ${monto_por_periodo},
                       ${monto_primera_cuota},
                       ${monto_retroactivo},
                       ${monto_ultima_cuota},
                       ${num_rentas_aprobadas},
                       ${datos.estado_solicitud ? `'${datos.estado_solicitud}'` : null},
                       ${datos.observacion ? `'${datos.observacion}'` : null},
                       ${ultimo_dia_ultima_renta},
                       ${estadoPP.id_usuario_empresa},
                       ${num_rentas_pagar_primer_pago},
                       ${`'${fecha_presentacion}'`},
                       ${datos.n_expediente ? `'${datos.n_expediente}'` : null},
                       'SI'
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
          } else {
            this.logger.error(`Ya existe el mismo beneficio con el mismo causante para esta persona`);
            throw new InternalServerErrorException('Ya existe el mismo beneficio con el mismo causante para esta persona');
          }
        } else if (idPersonaPadre) {
          const detben = await manager.findOne(
            Net_Detalle_Beneficio_Afiliado,
            {
              where: {
                persona: {
                  ID_CAUSANTE: itemSeleccionado.id_causante,
                  ID_PERSONA: itemSeleccionado.id_persona,
                  ID_DETALLE_PERSONA: itemSeleccionado.id_detalle_persona,
                  persona: { n_identificacion: itemSeleccionado.dni }
                },
                beneficio: { id_beneficio: beneficio.id_beneficio }
              },
              relations: ['persona', 'persona.persona', 'beneficio']
            }
          );

          if (!detben) {
            const detPer = await manager.findOne(
              net_detalle_persona,
              {
                where: {
                  ID_CAUSANTE: itemSeleccionado.id_causante,
                  ID_PERSONA: itemSeleccionado.id_persona,
                  ID_DETALLE_PERSONA: itemSeleccionado.id_detalle_persona,
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
              const queryInsDeBBenf = `
                       INSERT INTO NET_DETALLE_BENEFICIO_AFILIADO (
                         ID_DETALLE_PERSONA,
                         ID_CAUSANTE,
                         ID_PERSONA,
                         ID_BENEFICIO,
                         FECHA_EFECTIVIDAD,
                         PERIODO_INICIO,
                         PERIODO_FINALIZACION,
                         MONTO_TOTAL,
                         METODO_PAGO,
                         MONTO_POR_PERIODO,
                         MONTO_PRIMERA_CUOTA,
                         MONTO_RETROACTIVO,
                         MONTO_ULTIMA_CUOTA,
                         NUM_RENTAS_APROBADAS,
                         ESTADO_SOLICITUD,
                         OBSERVACIONES,
                         ID_USUARIO_EMPRESA,
                         ULTIMO_DIA_ULTIMA_RENTA,
                         NUM_RENTAS_PAGAR_PRIMER_PAGO,
                         FECHA_PRESENTACION,
                         N_EXPEDIENTE,
                         LISTO_COMPLEMENTARIA
                       ) VALUES (
                         ${detPer.ID_DETALLE_PERSONA},
                         ${detPer.ID_CAUSANTE},
                         ${detPer.ID_PERSONA},
                         ${beneficio.id_beneficio},
                         '${fecha_efectividad}',
                         '${fecha_efectividad}',
                         ${`'${periodo_finalizacion}'`},
                         ${monto_total},
                         'TRANSFERENCIA',
                         ${monto_por_periodo},
                         ${monto_primera_cuota},
                         ${monto_retroactivo},
                         ${monto_ultima_cuota},
                         ${num_rentas_aprobadas},
                         ${datos.estado_solicitud ? `'${datos.estado_solicitud}'` : null},
                         ${datos.observacion ? `'${datos.observacion}'` : null},
                         ${estadoPP.id_usuario_empresa},
                         ${ultimo_dia_ultima_renta},
                         ${num_rentas_pagar_primer_pago},
                         ${`'${fecha_presentacion}'`},
                         ${datos.n_expediente ? `'${datos.n_expediente}'` : null},
                         'SI'
              )`;
              const detBeneBeneficia = await this.entityManager.query(queryInsDeBBenf);
              const detPers = await this.detPersonaRepository.preload({
                ID_DETALLE_PERSONA: detPer.ID_DETALLE_PERSONA,
                ID_PERSONA: detPer.ID_PERSONA,
                ID_CAUSANTE: detPer.ID_CAUSANTE,
                ID_CAUSANTE_PADRE: detPer.ID_CAUSANTE_PADRE,
                ID_TIPO_PERSONA: estadoP.id_tipo_persona,
                ID_USUARIO_EMPRESA: estadoPP.id_usuario_empresa
              });
              await this.detPersonaRepository.save(detPers);
              return detBeneBeneficia;
            }
          }

          else {
            this.logger.error(`Ya existe el mismo beneficio con el mismo causante para esta persona`);
            throw new InternalServerErrorException('Ya existe el mismo beneficio con el mismo causante para esta persona');
          }
        }
      } catch (error) {
        this.logger.error(`Error al crear DetalleBeneficioAfiliado y DetalleBeneficio: ${error.message}`, error.stack);
        throw new InternalServerErrorException(error);
      }
    });

  }

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
        detBA."NUM_RENTAS_APROBADAS",
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
            detBA."NUM_RENTAS_APROBADAS",
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
    detBA."num_rentas_aprobadas",
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
          'detallePagBeneficio',
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
    detBA."num_rentas_aprobadas",
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
      detBenAfil."num_rentas_aprobadas",
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
          beneficio: { estado: 'HABILITADO' }
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

  private convertirCadenaAFecha(cadena: string): string | null {
    if (cadena) {
      const fecha = parseISO(cadena);
      const fechaFormateada = format(fecha, 'dd-MM-yyyy');
      return fechaFormateada
    } else {
      return null
    }
  }

  private convertirCadenaAFechaPleca(cadena: string): string | null {
    if (cadena) {
      const fecha = parseISO(cadena);
      const fechaFormateada = format(fecha, 'yyyy-MM-dd');
      return fechaFormateada
    } else {
      return null
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
        throw new BadRequestException('El beneficio ya fue asignado');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  async updateBeneficioPersona(token: string, data: any) {
    try {
      const decoded = this.jwtService.verify(token);
      const estadoPP = await this.usuarioEmpRepository.findOne({
        where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } }
      });

      if (!estadoPP) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      const id_usuario_empresa_in = estadoPP.id_usuario_empresa;

      // Función auxiliar para convertir valores numéricos de manera segura
      const parseNumber = (value: any): number | null => {
        return (!value || value === undefined || value === '' || isNaN(value)) ? null : parseFloat(value);
      };

      const dataEnv = {
        ID_DETALLE_PERSONA: data.ID_DETALLE_PERSONA,
        ID_PERSONA: data.ID_PERSONA,
        ID_CAUSANTE: data.ID_CAUSANTE,
        ID_BENEFICIO: data.ID_BENEFICIO,
        ID_USUARIO_EMPRESA: id_usuario_empresa_in,

        n_expediente: data.n_expediente,
        fecha_presentacion: this.convertirCadenaAFechaPleca(data.fecha_presentacion),
        estado_solicitud: data.estado_solicitud,

        ...(data.num_rentas_aprobadas !== undefined && { num_rentas_aprobadas: parseNumber(data.num_rentas_aprobadas) }),
        ...(data.fecha_efectividad !== undefined && { fecha_efectividad: this.convertirCadenaAFechaPleca(data.fecha_efectividad) }),
        ...(data.fecha_efectividad !== undefined && { periodo_inicio: this.convertirCadenaAFechaPleca(data.fecha_efectividad) }),
        ...(data.periodo_finalizacion !== undefined && { periodo_finalizacion: this.convertirCadenaAFechaPleca(data.periodo_finalizacion) }),

        ...(data.monto_primera_cuota !== undefined && { monto_primera_cuota: parseNumber(data.monto_primera_cuota) }),
        ...(data.monto_retroactivo !== undefined && { monto_retroactivo: parseNumber(data.monto_retroactivo) }),
        ...(data.monto_por_periodo !== undefined && { monto_por_periodo: parseNumber(data.monto_por_periodo) }),
        ...(data.monto_ultima_cuota !== undefined && { monto_ultima_cuota: parseNumber(data.monto_ultima_cuota) }),
        ...(data.monto_total !== undefined && { monto_total: parseNumber(data.monto_total) }),

        ...(data.num_rentas_pagar_primer_pago !== undefined && data.num_rentas_pagar_primer_pago !== 0 && { num_rentas_pagar_primer_pago: parseNumber(data.num_rentas_pagar_primer_pago) }),
        ...(data.ultimo_dia_ultima_renta !== undefined && data.num_rentas_pagar_primer_pago !== 0 && { ultimo_dia_ultima_renta: parseNumber(data.ultimo_dia_ultima_renta) }),

        ...(data.observaciones !== undefined && { observaciones: data.observaciones.trim() }),
        listo_complementaria: data.listo_complementaria
      };

      // Cargar y guardar en la base de datos
      const detBenAfil = await this.detalleBeneficioAfiliadoRepository.preload(dataEnv);

      if (!detBenAfil) {
        throw new NotFoundException('Registro no encontrado para actualizar.');
      }

      await this.detalleBeneficioAfiliadoRepository.save(detBenAfil);
    } catch (error) {
      this.logger.error(`Error al actualizar beneficios: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al actualizar beneficios: ${error.message}`);
    }
  }
}
