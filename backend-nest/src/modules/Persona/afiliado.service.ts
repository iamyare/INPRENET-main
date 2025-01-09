import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
const bcrypt = require('bcrypt');
import { PersonaResponse } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { EntityManager, In, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { validate as isUUID } from 'uuid';
import { net_persona } from './entities/net_persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';
import { net_detalle_persona } from './entities/net_detalle_persona.entity';
import { Net_Persona_Colegios } from '../transacciones/entities/net_persona_colegios.entity';
import { UpdatePerfCentTrabDto } from './dto/update.perfAfilCentTrab.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { net_estado_afiliacion } from './entities/net_estado_afiliacion.entity';
import { Net_Discapacidad } from './entities/net_discapacidad.entity';
import { Net_Persona_Discapacidad } from './entities/net_persona_discapacidad.entity';
import { NET_MOVIMIENTO_CUENTA } from '../transacciones/entities/net_movimiento_cuenta.entity';
import { net_causas_fallecimientos } from './entities/net_causas_fallecimientos.entity';
import { NET_PROFESIONES } from '../transacciones/entities/net_profesiones.entity';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { format } from 'date-fns';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import axios from 'axios';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(net_persona)
    private readonly personaRepository: Repository<net_persona>,
    @InjectRepository(Net_perf_pers_cent_trab)
    private readonly perfPersoCentTrabRepository: Repository<Net_perf_pers_cent_trab>,
    @InjectRepository(net_detalle_persona)
    private detallePersonaRepository: Repository<net_detalle_persona>,
    @InjectRepository(net_estado_afiliacion)
    private estadoAfiliacionRepository: Repository<net_estado_afiliacion>,
    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Empleado_Centro_Trabajo)
    private empCentTrabajoRepository: Repository<Net_Empleado_Centro_Trabajo>,
    @InjectRepository(Net_Persona_Colegios)
    private readonly netPersonaColegiosRepository: Repository<Net_Persona_Colegios>,
    @InjectRepository(Net_Persona_Por_Banco)
    private readonly BancosToPersonaRepository: Repository<Net_Persona_Por_Banco>,
    @InjectRepository(Net_Discapacidad)
    private readonly discapacidadRepository: Repository<Net_Discapacidad>,
    @InjectRepository(Net_Persona_Discapacidad)
    private readonly perDiscapacidadRepository: Repository<Net_Persona_Discapacidad>,
    @InjectRepository(NET_MOVIMIENTO_CUENTA)
    private readonly movimientoCuentaRepository: Repository<NET_MOVIMIENTO_CUENTA>,
    @InjectRepository(net_causas_fallecimientos)
    private readonly causasFallecimientoRepository: Repository<net_causas_fallecimientos>,
    @InjectRepository(NET_PROFESIONES)
    private readonly profesionRepository: Repository<NET_PROFESIONES>,
    @InjectRepository(Net_Municipio)
    private readonly municipioRepository: Repository<Net_Municipio>,
    @InjectRepository(Net_Tipo_Identificacion)
    private readonly TipoIdentificacionRepository: Repository<Net_Tipo_Identificacion>,
    @InjectRepository(Net_Pais)
    private readonly paisRepository: Repository<Net_Pais>

  ) { }

  async obtenerUbicacion(ip: string): Promise<any> {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la ubicación:', error.message);
      return null;
    }
  }

  obtenerMunicipio(ciudad: string): string {
    const municipios = {
      Tegucigalpa: 'Distrito Central',
      'San Pedro Sula': 'San Pedro Sula',
      'La Ceiba': 'La Ceiba',
      // Agrega más ciudades y municipios aquí
    };

    return municipios[ciudad] || 'Municipio desconocido';
  }

  async getMovimientosOrdenados(id_persona: number, id_tipo_cuenta: number): Promise<any> {
    try {
      const movimientos = await this.movimientoCuentaRepository.find({
        where: {
          cuentaPersona: {
            persona: { id_persona },
            tipoCuenta: { ID_TIPO_CUENTA: id_tipo_cuenta }
          }
        },
        order: { ANO: 'ASC', MES: 'ASC' },
        relations: ['cuentaPersona', 'cuentaPersona.tipoCuenta', 'tipoMovimiento'],
      });

      const tipoCuenta = movimientos.length > 0 ? movimientos[0].cuentaPersona.tipoCuenta.DESCRIPCION : null;
      const numeroCuenta = movimientos.length > 0 ? movimientos[0].cuentaPersona.NUMERO_CUENTA : null;

      const movimientosOrdenados = movimientos.reduce((acc, movimiento) => {
        const { ANO: year, MES: month } = movimiento;

        if (!acc[year]) {
          acc[year] = {};
        }

        if (!acc[year][month]) {
          acc[year][month] = [];
        }

        acc[year][month].push({
          ID_MOVIMIENTO_CUENTA: movimiento.ID_MOVIMIENTO_CUENTA,
          MONTO: movimiento.MONTO,
          FECHA_MOVIMIENTO: format(new Date(movimiento.FECHA_MOVIMIENTO), 'dd/MM/yyyy'),
          DESCRIPCION: movimiento.DESCRIPCION,
          CREADA_POR: movimiento.CREADA_POR,
          tipoMovimiento: movimiento.tipoMovimiento.DESCRIPCION,
          ANO: movimiento.ANO,
          MES: movimiento.MES,
        });

        return acc;
      }, {});

      return {
        tipoCuenta,
        numeroCuenta,
        movimientos: movimientosOrdenados
      };
    } catch (error) {
      console.error('Error al obtener los movimientos ordenados:', error);
      throw new InternalServerErrorException('Error al obtener los movimientos ordenados');
    }
  }

  async updateBeneficiario(id: number, updatePersonaDto: UpdateBeneficiarioDto): Promise<net_detalle_persona> {
    const detallePersona = await this.detallePersonaRepository.findOne({
      where: {
        ID_DETALLE_PERSONA: id,
        ID_PERSONA: updatePersonaDto.id_persona,
        ID_CAUSANTE_PADRE: updatePersonaDto.id_causante_padre
      },
    });
    if (!detallePersona) {
      throw new NotFoundException(`Detalle persona with ID ${id} not found`);
    }
    if (updatePersonaDto.porcentaje !== undefined) {
      detallePersona.porcentaje = updatePersonaDto.porcentaje;
    }
    await this.detallePersonaRepository.save(detallePersona);
    return detallePersona;
  }


  async updateSalarioBase(n_identificacion: string, idCentroTrabajo: number, salarioBase: number): Promise<void> {
    const perfil = await this.perfPersoCentTrabRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.persona', 'persona')
      .where('persona.N_IDENTIFICACION = :n_identificacion', { n_identificacion })
      .andWhere('perfil.centroTrabajo = :idCentroTrabajo', { idCentroTrabajo })
      .getOne();
    if (!perfil) {
      throw new NotFoundException(`El perfil con N_IDENTIFICACION ${n_identificacion} y centro de trabajo ID ${idCentroTrabajo} no fue encontrado.`);
    }
    perfil.salario_base = salarioBase;
    await this.perfPersoCentTrabRepository.save(perfil);
  }

  findAll() {
    const afiliado = this.personaRepository.find()
    return afiliado;
  }

  async getAllPersonaPBanco(n_identificacion: string) {
    try {
      const personas = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacion },
        relations: ['personasPorBanco', 'personasPorBanco.banco'],
      });
      return personas.personasPorBanco;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllColMagPPersona(n_identificacion: string) {
    try {
      const personas = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacion },
        relations: ['colegiosMagisteriales', 'colegiosMagisteriales.colegio'],
      });
      return personas.colegiosMagisteriales;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(term: string) {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: term },
      relations: [
        'detallePersona',
        'causa_fallecimiento',
        'detallePersona.tipoPersona',
        'detallePersona.estadoAfiliacion',
        'pais',
        'municipio.departamento',
        'tipoIdentificacion',
        'profesion',
        'municipio',
        'municipio_defuncion',
        'municipio_defuncion.departamento',
        'municipio_nacimiento',
        'municipio_nacimiento.departamento',
        'personaDiscapacidades',
        'personaDiscapacidades.discapacidad',
        'peps',
        'peps.socio',
        'peps.cargo_publico',
      ],
    });

    if (!persona) {
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
    }

    // Verifica el detalle de la persona donde coincida ID_PERSONA e ID_CAUSANTE, si existe `detallePersona`
    const detalleRelevante = persona.detallePersona
      ? persona.detallePersona.find((detalle) =>
        detalle.ID_PERSONA === persona.id_persona && detalle.ID_CAUSANTE === persona.id_persona
      )
      : null;

    // Mapeo de discapacidades
    const discapacidades = persona.personaDiscapacidades.map((discapacidad) => ({
      id_discapacidad: discapacidad.discapacidad.id_discapacidad,
      tipo: discapacidad.discapacidad.tipo_discapacidad,
      descripcion: discapacidad.discapacidad.descripcion,
    }));

    // Convierte archivos de identificación y defunción a base64 si existen
    const archivoIdentificacionBase64 = persona.archivo_identificacion
      ? Buffer.from(persona.archivo_identificacion).toString('base64')
      : null;
    const certificadoDefuncionBase64 = persona.certificado_defuncion
      ? Buffer.from(persona.certificado_defuncion).toString('base64')
      : null;

    // Mapeo de tipos de persona
    const tiposPersona = persona.detallePersona
      ? persona.detallePersona.map((detalle) => detalle.tipoPersona?.tipo_persona).filter(Boolean)
      : [];

    // Construye el resultado con valores por defecto en caso de que no haya `detallePersona`
    const result = {
      N_IDENTIFICACION: persona.n_identificacion,
      ID_PERSONA: persona.id_persona,
      PRIMER_NOMBRE: persona.primer_nombre,
      SEGUNDO_NOMBRE: persona.segundo_nombre,
      TERCER_NOMBRE: persona.tercer_nombre,
      PRIMER_APELLIDO: persona.primer_apellido,
      SEGUNDO_APELLIDO: persona.segundo_apellido,
      GENERO: persona.genero,
      SEXO: persona.sexo,
      GRADO_ACADEMICO: persona.grado_academico,
      GRUPO_ETNICO: persona.grupo_etnico,
      CANTIDAD_HIJOS: persona.cantidad_hijos,
      REPRESENTACION: persona.representacion,
      DIRECCION_RESIDENCIA: persona.direccion_residencia,
      DIRECCION_RESIDENCIA_ESTRUCTURADA: persona.direccion_residencia_estructurada,
      RTN: persona.rtn,
      FECHA_NACIMIENTO: persona.fecha_nacimiento,
      FOTO_PERFIL: persona.foto_perfil ? Buffer.from(persona.foto_perfil).toString('base64') : null,
      DESCRIPCION: persona.profesion?.descripcion,
      ID_PROFESION: persona.profesion?.id_profesion,
      TELEFONO_1: persona.telefono_1,
      TELEFONO_2: persona.telefono_2,
      CORREO_1: persona.correo_1,
      CORREO_2: persona.correo_2,
      ESTADO_CIVIL: persona.estado_civil,
      ID_PAIS: persona.pais?.id_pais,
      id_departamento_residencia: persona.municipio?.departamento.id_departamento,
      ID_MUNICIPIO: persona.municipio?.id_municipio,
      id_departamento_nacimiento: persona.municipio_nacimiento?.departamento.id_departamento,
      ID_MUNICIPIO_NACIMIENTO: persona.municipio_nacimiento?.id_municipio,
      fecha_defuncion: persona.fecha_defuncion,
      certificado_defuncion: certificadoDefuncionBase64,
      archivo_identificacion: archivoIdentificacionBase64,
      ID_MUNICIPIO_DEFUNCION: persona?.municipio_defuncion?.id_municipio,
      MUNICIPIO_DEFUNCION: persona?.municipio_defuncion?.nombre_municipio,
      ID_DEPARTAMENTO_DEFUNCION: persona?.municipio_defuncion?.departamento?.id_departamento,
      DEPARTAMENTO_DEFUNCION: persona?.municipio_defuncion?.departamento?.nombre_departamento,
      ID_CAUSA_FALLECIMIENTO: persona?.causa_fallecimiento?.id_causa_fallecimiento,
      CAUSA_FALLECIMIENTO: persona?.causa_fallecimiento?.nombre,
      fallecido: persona.fallecido,
      estadoAfiliacion: {
        codigo: detalleRelevante?.estadoAfiliacion?.codigo || null,
        nombre_estado: detalleRelevante?.estadoAfiliacion?.nombre_estado || null,
      },
      CANTIDAD_DEPENDIENTES: persona.cantidad_dependientes,
      discapacidades: discapacidades,
      ID_TIPO_PERSONA: detalleRelevante?.tipoPersona?.id_tipo_persona || null,
      TIPO_PERSONA: detalleRelevante?.tipoPersona?.tipo_persona || null,
      VOLUNTARIO: detalleRelevante?.voluntario || 'NO',
      TIPOS_PERSONA: tiposPersona,
      OBSERVACION: persona.detallePersona
    };

    return result;
  }

  async findOnePersonaParaDeduccion(term: string) {
    try {
      const detallePer = await this.detallePersonaRepository.findOne({
        where: {
          tipoPersona: {
            tipo_persona: In(["AFILIADO", "BENEFICIARIO", "JUBILADO", "PENSIONADO"])
          },
          persona: {
            n_identificacion: term
          }
        },
        relations: [
          'persona',
          'estadoAfiliacion',
          'tipoPersona',
          'persona.pais',
          'persona.profesion',
          'persona.municipio_nacimiento',
          'persona.municipio',
          'persona.tipoIdentificacion',
          'persona.municipio_defuncion'
        ]
      });

      if (!detallePer) {
        throw new HttpException(
          { message: `Afiliado con N_IDENTIFICACION ${term} no existe.` },
          HttpStatus.NOT_FOUND
        );
      }

      if (detallePer.persona.fallecido === 'SI') {
        throw new HttpException(
          { message: `La persona con N_IDENTIFICACION ${term} está fallecida.` },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = {
        N_IDENTIFICACION: detallePer.persona.n_identificacion,
        ID_PERSONA: detallePer.persona.id_persona,
        FALLECIDO: detallePer.persona.fallecido,
        PRIMER_NOMBRE: detallePer.persona.primer_nombre,
        SEGUNDO_NOMBRE: detallePer.persona.segundo_nombre,
        TERCER_NOMBRE: detallePer.persona.tercer_nombre,
        PRIMER_APELLIDO: detallePer.persona.primer_apellido,
        SEGUNDO_APELLIDO: detallePer.persona.segundo_apellido,
        GENERO: detallePer.persona.genero,
        SEXO: detallePer.persona.sexo,
        TELEFONO_1: detallePer.persona.telefono_1,
        ESTADO_CIVIL: detallePer.persona.estado_civil,
        DIRECCION_RESIDENCIA: detallePer.persona.direccion_residencia,
        FECHA_NACIMIENTO: detallePer.persona.fecha_nacimiento,
        TIPO_PERSONA: detallePer.tipoPersona.tipo_persona
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findOneAFiliado(term: string) {
    try {
      const detallePer = await this.detallePersonaRepository.findOne({
        where: {
          tipoPersona: {
            tipo_persona: In(["AFILIADO", "JUBILADO", "PENSIONADO", "VOLUNTARIO"])
          }, persona: { n_identificacion: term }
        },
        relations: [
          'persona',
          'detalleBeneficio',
          'estadoAfiliacion',
          'tipoPersona',
          'persona.pais',
          'persona.profesion',
          'persona.municipio_nacimiento',
          'persona.municipio',
          'persona.tipoIdentificacion',
          'persona.municipio_defuncion'
        ]
      });

      if (!detallePer) {
        throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
      }

      /* const beneficios = await this.detBenAfilRepository.find({
        where: {
          ID_CAUSANTE: detallePer.ID_CAUSANTE,
          ID_DETALLE_PERSONA: detallePer.ID_DETALLE_PERSONA,
          ID_PERSONA: detallePer.ID_PERSONA
        },
      }); */

      //const detallePersona = persona.detallePersona.find(detalle => detalle.tipoPersona.tipo_persona === 'AFILIADO');

      //console.log(detallePer);

      const result = {
        N_IDENTIFICACION: detallePer.persona.n_identificacion,
        ID_PERSONA: detallePer.persona.id_persona,
        FALLECIDO: detallePer.persona.fallecido,
        PRIMER_NOMBRE: detallePer.persona.primer_nombre,
        SEGUNDO_NOMBRE: detallePer.persona.segundo_nombre,
        TERCER_NOMBRE: detallePer.persona.tercer_nombre,
        PRIMER_APELLIDO: detallePer.persona.primer_apellido,
        SEGUNDO_APELLIDO: detallePer.persona.segundo_apellido,
        GENERO: detallePer.persona.genero,
        SEXO: detallePer.persona.sexo,
        TELEFONO_1: detallePer.persona.telefono_1,
        ESTADO_CIVIL: detallePer.persona.estado_civil,
        DIRECCION_RESIDENCIA: detallePer.persona.direccion_residencia,
        FECHA_NACIMIENTO: detallePer.persona.fecha_nacimiento,
        TIPO_PERSONA: detallePer.tipoPersona.tipo_persona,
        ESTADO_PERSONA: detallePer?.estadoAfiliacion?.nombre_estado,
        BENEFICIOS: detallePer.detalleBeneficio,
        VOLUNTARIO: detallePer.voluntario,
        OBSERVACION: detallePer.observacion


        //fallecido: detallePer.persona.fallecido,
        //TIPO_PERSONA: detallePer.persona.detallePersona[0].tipoPersona.tipo_persona,
        //GRADO_ACADEMICO: detallePer.persona.grado_academico,
        //GRUPO_ETNICO: detallePer.persona.grupo_etnico,
        //CANTIDAD_HIJOS: detallePer.persona.cantidad_hijos,
        //REPRESENTACION: detallePer.persona.representacion,
        //RTN: detallePer.persona.rtn,
        //FOTO_PERFIL: detallePer.persona.foto_perfil ? Buffer.from(persona.foto_perfil).toString('base64') : null,
        //DESCRIPCION: detallePer.persona.profesion?.descripcion,
        //ID_PROFESION: detallePer.persona.profesion?.id_profesion,
        //TELEFONO_2: detallePer.persona.telefono_2,
        //CORREO_1: detallePer.persona.correo_1,
        //CORREO_2: detallePer.persona.correo_2,
        //ID_PAIS: detallePer.persona.pais?.id_pais,
        //id_departamento_residencia: detallePer.persona.municipio?.departamento.id_departamento,
        //ID_IDENTIFICACION: detallePer.persona.tipoIdentificacion?.id_identificacion,
        //tipo_defuncion: detallePer.persona.tipo_defuncion,
        //fecha_defuncion: detallePer.persona.fecha_defuncion,
        //certificado_defuncion: detallePer.persona?.certificado_defuncion,
        //ID_MUNICIPIO: detallePer.persona.municipio?.id_municipio,
        //ID_MUNICIPIO_DEFUNCION: detallePer.persona?.municipio_defuncion?.id_municipio!,
        //ID_DEPARTAMENTO_DEFUNCION: detallePer.persona?.municipio_defuncion?.departamento?.id_departamento!,
        //estadoAfiliacion: detallePer.persona.detallePersona[0]?.estadoAfiliacion?.codigo,
        //motivo_fallecimiento: detallePer.persona.causa_fallecimiento.nombre,
        //CANTIDAD_DEPENDIENTES: detallePer.persona.cantidad_dependientes, 
        //ESTADO: detallePersona.eliminado,
      };

      return result
    } catch (error) {
      console.log(error);
    }
  }

  async findTipoPersonaByN_ident(term: string) {
    try {
      const detallePer = await this.detallePersonaRepository.find({
        where: {
          tipoPersona: {
          }, persona: { n_identificacion: term }
        },
        relations: [
          'persona',
          'padreIdPersona.persona',
          'estadoAfiliacion',
          'tipoPersona',
        ]
      });

      if (!detallePer) {
        throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
      }

      return detallePer;
    } catch (error) {
      console.log(error);
    }

  }

  async findOnePersona(term: string) {
    let persona: net_persona | null = null;

    if (isUUID(term)) {
      persona = await this.personaRepository.findOne({
        where: { n_identificacion: term },
        relations: [
          'detallePersona',
          'detallePersona.tipoPersona',
          'municipio',
          'pais',
          'tipoIdentificacion',
          'profesion',
        ],
      });
    } else {
      persona = await this.personaRepository.findOne({
        where: { n_identificacion: term },
        relations: [
          'detallePersona',
          'detallePersona.tipoPersona',
          'municipio',
          'pais',
          'tipoIdentificacion',
          'profesion',
        ],
      });

      if (persona) {
        const detallePersona = persona.detallePersona.find(
          (detalle) => detalle.tipoPersona.tipo_persona === 'AFILIADO',
        );

        if (!detallePersona) {
          throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
        }

        return {
          N_IDENTIFICACION: persona.n_identificacion,
          ID_PERSONA: persona.id_persona,
          PRIMER_NOMBRE: persona.primer_nombre,
          SEGUNDO_NOMBRE: persona.segundo_nombre,
          PRIMER_APELLIDO: persona.primer_apellido,
          SEGUNDO_APELLIDO: persona.segundo_apellido,
          GENERO: persona.genero,
          SEXO: persona.sexo,
          DIRECCION_RESIDENCIA: persona.direccion_residencia,
          FECHA_NACIMIENTO: persona.fecha_nacimiento,
          RTN: persona.rtn,
          ID_PROFESION: persona.profesion?.id_profesion,
          TELEFONO_1: persona.telefono_1,
          ESTADO_CIVIL: persona.estado_civil,
          ESTADO: detallePersona?.estadoAfiliacion?.Descripcion!,
        };
      }
    }

    if (!persona) {
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
    }
    const detallePersona = persona.detallePersona.find(
      (detalle) => detalle.tipoPersona.tipo_persona === 'AFILIADO',
    );

    if (!detallePersona) {
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
    }

    return {
      N_IDENTIFICACION: persona.n_identificacion,
      ID_PERSONA: persona.id_persona,
      PRIMER_NOMBRE: persona.primer_nombre,
      SEGUNDO_NOMBRE: persona.segundo_nombre,
      PRIMER_APELLIDO: persona.primer_apellido,
      SEGUNDO_APELLIDO: persona.segundo_apellido,
      GENERO: persona.genero,
      SEXO: persona.sexo,
      DIRECCION_RESIDENCIA: persona.direccion_residencia,
      FECHA_NACIMIENTO: persona.fecha_nacimiento,
      RTN: persona.rtn,
      ID_PROFESION: persona.profesion?.id_profesion,
      TELEFONO_1: persona.telefono_1,
      ESTADO_CIVIL: persona.estado_civil,
      ESTADO: detallePersona.estadoAfiliacion.Descripcion,
    };
  }

  update(id: number, updateAfiliadoDto: UpdatePersonaDto) {
    return `This action updates a #${id} afiliado`;
  }

  remove(id: number) {
    return `This action removes a #${id} afiliado`;
  }

  /**modificar por cambio de estado a una tabla */
  async obtenerBenDeAfil(n_identificacionAfil: string): Promise<any> {

    try {
      const query = `
      SELECT DISTINCT
      "detA"."ID_PERSONA"
      FROM net_persona "Afil"
      FULL OUTER JOIN
        net_detalle_persona "detA" ON "Afil"."ID_PERSONA" = "detA"."ID_PERSONA" 
      INNER JOIN
      NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
      INNER JOIN
      net_estado_afiliacion "estadoPers" ON "detA"."ID_ESTADO_AFILIACION" = "estadoPers"."CODIGO"
    WHERE
      "Afil"."N_IDENTIFICACION" = '${n_identificacionAfil}' AND 
      "Afil"."FALLECIDO" = 'SI'  AND
      ("tipoP"."TIPO_PERSONA" = 'AFILIADO' OR 
      "tipoP"."TIPO_PERSONA" = 'JUBILADO' OR 
      "tipoP"."TIPO_PERSONA" = 'PENSIONADO' OR 
      "tipoP"."TIPO_PERSONA" = 'BENEFICIARIO' OR
      "tipoP"."TIPO_PERSONA" = 'DESIGNADO'
    )
    `;

      const beneficios = await this.entityManager.query(query);

      const query1 = `
      SELECT 
        "Afil"."ID_PERSONA",
        "Afil"."N_IDENTIFICACION",
        "Afil"."PRIMER_NOMBRE",
        "Afil"."SEGUNDO_NOMBRE",
        "Afil"."TERCER_NOMBRE",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."PRIMER_APELLIDO",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."GENERO",
        "detA"."ID_CAUSANTE",
        "detA"."ID_DETALLE_PERSONA",
        "detA"."PORCENTAJE",
        "detA"."PORCENTAJE",
        "tipoP"."TIPO_PERSONA",
        "detA"."OBSERVACION",
        "estadoAfil"."NOMBRE_ESTADO"
        FROM NET_DETALLE_PERSONA "detA" 
        INNER JOIN 
          NET_PERSONA "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
        INNER JOIN
          NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
        FULL OUTER JOIN
          NET_ESTADO_AFILIACION "estadoAfil" ON "estadoAfil"."CODIGO" = "detA"."ID_ESTADO_AFILIACION"
        WHERE 
        "detA"."ID_CAUSANTE_PADRE" = ${beneficios[0].ID_PERSONA} AND (
          "tipoP"."TIPO_PERSONA" = 'BENEFICIARIO' OR 
          "tipoP"."TIPO_PERSONA" = 'DESIGNADO'
        )
        `;

      const beneficios2 = await this.entityManager.query(query1);

      return this.normalizarDatos(beneficios2);
    } catch (error) {
      this.logger.error(`Error al consultar beneficios: ${error.message}`);
      throw new Error(`Error al consultar beneficios: ${error.message}`);
    }
  }

  async getAllBenDeAfil(n_identificacionAfil: string): Promise<any> {
    try {
      const afiliado = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacionAfil },
        relations: ['detallePersona'],
      });
      if (!afiliado) {
        throw new Error(`No se encontró el afiliado con N_IDENTIFICACION: ${n_identificacionAfil}`);
      }
      const beneficiarios = await this.detallePersonaRepository.find({
        where: {
          ID_CAUSANTE: afiliado.id_persona,
          ID_CAUSANTE_PADRE: afiliado.id_persona,
          eliminado: "NO"
        },
        relations: [
          'persona',
          'tipoPersona',
          'estadoAfiliacion',
          'persona.personaDiscapacidades',
          'persona.personaDiscapacidades.discapacidad'
        ],
      });
      const beneficiariosFormatted = beneficiarios.map(beneficiario => ({
        idDetallePersona: beneficiario.ID_DETALLE_PERSONA,
        idPersona: beneficiario.ID_PERSONA,
        ID_CAUSANTE_PADRE: beneficiario.ID_CAUSANTE_PADRE,
        nIdentificacion: beneficiario.persona?.n_identificacion || null,
        primerNombre: beneficiario.persona?.primer_nombre || null,
        segundoNombre: beneficiario.persona?.segundo_nombre || null,
        tercerNombre: beneficiario.persona?.tercer_nombre || null,
        primerApellido: beneficiario.persona?.primer_apellido || null,
        segundoApellido: beneficiario.persona?.segundo_apellido || null,
        genero: beneficiario.persona?.genero || null,
        sexo: beneficiario.persona?.sexo || null,
        fallecido: beneficiario.persona?.fallecido || null,
        representacion: beneficiario.persona?.representacion || null,
        telefono1: beneficiario.persona?.telefono_1 || null,
        fechaNacimiento: beneficiario.persona?.fecha_nacimiento || null,
        direccionResidencia: beneficiario.persona?.direccion_residencia || null,
        idPaisNacionalidad: beneficiario.persona?.pais?.id_pais || null,
        idMunicipioResidencia: beneficiario.persona?.municipio?.id_municipio || null,
        idEstadoPersona: beneficiario.estadoAfiliacion?.codigo || null,
        estadoDescripcion: beneficiario.estadoAfiliacion?.nombre_estado || null,
        porcentaje: beneficiario.porcentaje || null,
        tipoPersona: beneficiario.tipoPersona?.tipo_persona || null,
        discapacidades: beneficiario.persona?.personaDiscapacidades
          ?.filter(discapacidad => discapacidad.discapacidad?.id_discapacidad)
          .map(discapacidad => ({
            idDiscapacidad: discapacidad.discapacidad?.id_discapacidad || null,
            tipoDiscapacidad: discapacidad.discapacidad?.tipo_discapacidad || null,
            descripcion: discapacidad.discapacidad?.descripcion || null,
          })) || []
      }));
      return beneficiariosFormatted;
    } catch (error) {
      this.logger.error(`Error al consultar beneficios: ${error.message}`);
      throw new Error(`Error al consultar beneficios: ${error.message}`);
    }
  }

  normalizarDatos(data: any): PersonaResponse[] {
    const newList: PersonaResponse[] = []
    data.map((el: any) => {
      const newPersona: any = {
        id_persona: el.ID_PERSONA,
        id_causante: el.ID_CAUSANTE,
        id_detalle_persona: el.ID_DETALLE_PERSONA,
        porcentaje: el.PORCENTAJE,
        tipo_persona: el.TIPO_PERSONA,
        n_identificacion: el.N_IDENTIFICACION,
        estado_civil: el.ESTADO_CIVIL,
        primer_nombre: el.PRIMER_NOMBRE,
        segundo_nombre: el.SEGUNDO_NOMBRE,
        tercer_nombre: el.TERCER_NOMBRE,
        primer_apellido: el.PRIMER_APELLIDO,
        segundo_apellido: el.SEGUNDO_APELLIDO,
        genero: el.GENERO,
        cantidad_dependientes: el.CANTIDAD_DEPENDIENTES,
        profesion: el.PROFESION,
        representacion: el.REPRESENTACION,
        telefono_1: el.TELEFONO_1,
        telefono_2: el.TELEFONO_2,
        correo_1: el.CORREO_1,
        correo_2: el.CORREO_2,
        colegio_magisterial: el.COLEGIO_MAGISTERIAL,
        numero_carnet: el.NUMERO_CARNET,
        direccion_residencia: el.DIRECCION_RESIDENCIA,
        estado: el.ESTADO,
        fecha_nacimiento: el.FECHA_NACIMIENTO,
        archivo_identificacion: el.ARCHIVO_IDENTIFICACION,
        tipoIdentificacion: el.TIPOIDENTIFICACION,
        observacion_detalle_persona: el.OBSERVACION,
        estado_afil_detalle_persona: el.NOMBRE_ESTADO,
      }
      newList.push(newPersona)
    })
    return newList;
  }

  async findByDni(n_identificacion: string): Promise<net_persona | string> {
    const persona = await this.personaRepository.findOne({ where: { n_identificacion }, relations: ['estadoPersona'], },);

    if (!persona) {
      throw new NotFoundException(`Afiliado with N_IDENTIFICACION ${n_identificacion} not found`);
    }
    /* const detallePersona = await this.personaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      
    });

    if (!detallePersona || !detallePersona.estadoPersona) {
      throw new NotFoundException(`Estado for persona with N_IDENTIFICACION ${n_identificacion} not found`);
    } */

    // Verifica el estado de la persona
    switch (persona.fallecido) {
      case 'SI':
        return 'El afiliado está fallecido.';
      case 'NO':
        return 'El afiliado está inactivo.';
      default:
        return persona;
    }
  }

  async buscarPersonaYMovimientosPorN_IDENTIFICACION(n_identificacion: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: ['cuentas', 'cuentas.movimientos', 'estadoPersona'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con N_IDENTIFICACION ${n_identificacion} no encontrada`);
    }
    /* const detallePersona = await this.detallePersonaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      relations: ['estadoPersona'],
    });

    if (!detallePersona || !detallePersona.estadoPersona) {
      throw new NotFoundException(`Estado para persona con N_IDENTIFICACION ${n_identificacion} no encontrado`);
    } */
    if (['SI'].includes(persona.fallecido.toUpperCase())) {
      return {
        status: 'error',
        message: `La persona está ${persona.fallecido.toLowerCase()}.`,
        data: { persona: null, movimientos: [] },
      };
    }

    const movimientos = persona.cuentas.flatMap(cuenta => cuenta.movimientos);

    return {
      status: 'success',
      message: 'Datos y movimientos de la persona encontrados con éxito',
      data: {
        persona,
        movimientos,
      },
    };
  }

  async buscarCuentasPorN_IDENTIFICACION(n_identificacion: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: ['cuentas', 'cuentas.movimientos', 'cuentas.tipoCuenta', 'detallePersona.estadoAfiliacion'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con N_IDENTIFICACION ${n_identificacion} no encontrada`);
    }
    const detallePersona = await this.detallePersonaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      relations: ['estadoAfiliacion'],
    });

    if (!detallePersona || !detallePersona.estadoAfiliacion) {
      throw new NotFoundException(`Estado para persona con N_IDENTIFICACION ${n_identificacion} no encontrado`);
    }
    if (['SI'].includes(persona.fallecido.toUpperCase())) {
      return {
        status: 'error',
        message: `La persona está ${persona.fallecido.toLowerCase()}.`,
        data: { persona: null, movimientos: [] },
      };
    }

    const movimientos = persona.cuentas.flatMap(cuenta => cuenta.movimientos);

    return {
      status: 'success',
      message: 'Datos y movimientos de la persona encontrados con éxito',
      data: {
        persona,
        movimientos,
      },
    };
  }

  async getAllPerfCentroTrabajo(n_identificacion: string): Promise<any[]> {
    try {
      const persona = await this.personaRepository.createQueryBuilder('persona')
        .leftJoinAndSelect('persona.perfPersCentTrabs', 'perfPersCentTrabs')
        .leftJoinAndSelect('perfPersCentTrabs.centroTrabajo', 'centroTrabajo')
        .where('persona.n_identificacion = :n_identificacion', { n_identificacion })
        .andWhere('perfPersCentTrabs.estado = :estado', { estado: 'ACTIVO' })
        .getOne();

      if (!persona || !persona.perfPersCentTrabs) {
        return [];
      }
      return persona.perfPersCentTrabs;
    } catch (error) {
      console.error('Error al obtener los perfiles de la persona:', error);
      throw new Error('Error al obtener los perfiles de la persona');
    }
  }

  async getAllCargoPublicPeps(n_identificacion: string): Promise<any> {
    try {
      const persona = await this.personaRepository.createQueryBuilder('persona')
        .leftJoinAndSelect('persona.peps', 'peps')
        .leftJoinAndSelect('peps.cargo_publico', 'cargo_publico')
        .addSelect("TO_CHAR(cargo_publico.fecha_inicio, 'DD/MM/YYYY')", 'cargo_publico.fecha_inicio')
        .addSelect("TO_CHAR(cargo_publico.fecha_fin, 'DD/MM/YYYY')", 'cargo_publico.fecha_fin')
        .where('persona.n_identificacion = :n_identificacion', { n_identificacion })
        .getOne();
      if (!persona || !persona.peps) {
        return [];
      }
      return persona.peps;
    } catch (error) {
      console.error('Error al obtener los perfiles de la persona:', error);
      throw new Error('Error al obtener los perfiles de la persona');
    }
  }

  async getAllOtrasFuentesIngres(n_identificacion: string): Promise<any[]> {
    try {
      const persona = await this.personaRepository.createQueryBuilder('persona')
        .leftJoinAndSelect('persona.otra_fuente_ingreso', 'otra_fuente_ingreso')
        .where('persona.n_identificacion = :n_identificacion', { n_identificacion })
        .getOne();
      if (!persona || !persona.otra_fuente_ingreso.length) {
        return [];
      }
      return persona.otra_fuente_ingreso;
    } catch (error) {
      console.log(error);

    }
  }

  async inactivarPersona(idPersona: number, idCausante: number): Promise<void> {
    const result = await this.detallePersonaRepository.update(
      { ID_PERSONA: idPersona, ID_CAUSANTE: idCausante },
      {
        eliminado: "SI",
        porcentaje: 0
      }
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Registro con ID_PERSONA ${idPersona} y ID_CAUSANTE ${idCausante} no encontrado`);
    }
  }

  async eliminarColegioMagisterialPersona(id: number): Promise<void> {
    const referencia = await this.netPersonaColegiosRepository.findOne({ where: { id: id } });
    if (!referencia) {
      throw new NotFoundException(`El colegio magisterial para la persona no fue encontrado`);
    }
    await this.netPersonaColegiosRepository.remove(referencia);
  }

  async updateDatosGenerales(
    idPersona: number,
    datosGenerales: any,
    fileIdent: any,
    arch_cert_def: any,
    fotoPerfil: any
  ): Promise<any> {
    try {
      // Manejo de discapacidades
      if (datosGenerales.dato?.discapacidades) {
        const keysWithTrueValues = Object.entries(datosGenerales.dato.discapacidades)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);

        await this.perDiscapacidadRepository.delete({ persona: { id_persona: idPersona } });
        if (keysWithTrueValues.length > 0) {
          const discapacidades = await this.discapacidadRepository.find({
            where: { tipo_discapacidad: In(keysWithTrueValues) },
          });
          const nuevosRegistros = discapacidades.map((discapacidad) => ({
            persona: { id_persona: idPersona },
            discapacidad: discapacidad,
          }));
          await this.perDiscapacidadRepository.save(nuevosRegistros);
        }
      }

      // Obtención del estado de afiliación
      const estadoP = await this.estadoAfiliacionRepository.findOne({
        where: { codigo: datosGenerales.estado },
      });
      if (!estadoP) {
        throw new NotFoundException(`No se ha encontrado el estado de afiliación con el código ${datosGenerales.estado}`);
      }

      // Obtención de la causa de fallecimiento (solo si no es null)
      const causaFallecimiento = datosGenerales.causa_fallecimiento
        ? await this.causasFallecimientoRepository.findOne({
          where: { id_causa_fallecimiento: datosGenerales.causa_fallecimiento },
        })
        : null;

      if (datosGenerales.causa_fallecimiento && !causaFallecimiento) {
        throw new NotFoundException(
          `No se encontró la causa de fallecimiento con el ID ${datosGenerales.causa_fallecimiento}`
        );
      }

      // Obtención de la profesión (solo si no es null)
      const profesion = datosGenerales.dato?.id_profesion
        ? await this.profesionRepository.findOne({
          where: { id_profesion: datosGenerales.dato?.id_profesion },
        })
        : null;

      if (datosGenerales.dato?.id_profesion && !profesion) {
        throw new NotFoundException(`No se encontró la profesión con el ID ${datosGenerales.dato?.id_profesion}`);
      }

      // Obtención de municipios de residencia y nacimiento
      const municipioResidencia = datosGenerales.dato?.id_municipio_residencia
        ? await this.municipioRepository.findOne({
          where: { id_municipio: datosGenerales.dato?.id_municipio_residencia },
        })
        : null;

      const municipioNacimiento = datosGenerales.dato?.id_municipio_nacimiento
        ? await this.municipioRepository.findOne({
          where: { id_municipio: datosGenerales.dato?.id_municipio_nacimiento },
        })
        : null;

      const temp = datosGenerales.dato || {};

      const direccionParts = {
        "BARRIO_COLONIA": temp.barrio_colonia,
        "AVENIDA": temp.avenida,
        "CALLE": temp.calle,
        "SECTOR": temp.sector,
        "BLOQUE": temp.bloque,
        "N° DE CASA": temp.numero_casa,
        "COLOR CASA": temp.color_casa,
        "ALDEA": temp.aldea,
        "CASERIO": temp.caserio,
      };

      temp.direccion_residencia_estructurada = Object.entries(direccionParts)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(',');

      const pais = datosGenerales.dato?.id_pais

        ? await this.paisRepository.findOne({ where: { id_pais: datosGenerales.dato?.id_pais } })
        : null;

      const tipoIdentificacion = datosGenerales.dato?.id_tipo_identificacion
        ? await this.TipoIdentificacionRepository.findOne({
          where: { id_identificacion: datosGenerales.dato?.id_tipo_identificacion },
        })
        : null;

      if (datosGenerales.dato?.id_pais && !pais) {
        throw new NotFoundException(`No se encontró el país con el ID ${datosGenerales.dato?.id_pais}`);
      }

      if (datosGenerales.dato?.id_tipo_identificacion && !tipoIdentificacion) {
        throw new NotFoundException(
          `No se encontró el tipo de identificación con el ID ${datosGenerales.dato?.id_tipo_identificacion}`
        );
      }

      const data: any = {
        ...temp,
        id_persona: idPersona,
        fallecido: datosGenerales.fallecido ? datosGenerales.fallecido : 'NO',
        municipio: municipioResidencia,
        municipio_nacimiento: municipioNacimiento,
        municipio_defuncion: datosGenerales.id_municipio_defuncion || null,
        causa_fallecimiento: causaFallecimiento,
        profesion: profesion,
        fecha_defuncion: datosGenerales.fecha_defuncion ?? temp.fecha_defuncion, pais: pais, // Relación ManyToOne con Net_Pais
        tipoIdentificacion: tipoIdentificacion,
      };

      if (fileIdent?.buffer) {
        data.archivo_identificacion = Buffer.from(fileIdent.buffer);
      }
      if (arch_cert_def?.buffer) {
        data.certificado_defuncion = Buffer.from(arch_cert_def.buffer);
      }
      if (fotoPerfil?.buffer) {
        data.foto_perfil = Buffer.from(fotoPerfil.buffer);
      }

      const afiliado = await this.personaRepository.preload(data);
      if (!afiliado) throw new NotFoundException(`La persona con ID ${idPersona} no se ha encontrado`);
      await this.personaRepository.save(afiliado);

      // Actualización o inserción en NET_DETALLE_PERSONA
      const existingDetalle = await this.detallePersonaRepository.findOne({
        where: { ID_PERSONA: idPersona, ID_CAUSANTE: idPersona },
      });

      const voluntario = datosGenerales?.voluntario ?? 'NO';

      if (existingDetalle) {
        await this.detallePersonaRepository.update(
          { ID_PERSONA: idPersona, ID_CAUSANTE: idPersona },
          {
            ID_ESTADO_AFILIACION: estadoP.codigo,
            ID_TIPO_PERSONA: datosGenerales.tipo_persona || null,
            voluntario: voluntario,
          }
        );
      } else {
        await this.detallePersonaRepository.save({
          ID_PERSONA: idPersona,
          ID_CAUSANTE: idPersona,
          ID_ESTADO_AFILIACION: estadoP.codigo,
          ID_TIPO_PERSONA: datosGenerales.tipo_persona || null,
          VOLUNTARIO: voluntario,
        });
      }
      return afiliado;
    } catch (error) {
      this.handleException(error);
    }
  }


  async updatePerfCentroTrabajo(id: number, updateDto: UpdatePerfCentTrabDto): Promise<Net_perf_pers_cent_trab> {
    const existingPerf = await this.perfPersoCentTrabRepository.findOne({ where: { id_perf_pers_centro_trab: id } });
    if (!existingPerf) {
      throw new NotFoundException(`Perfil centro trabajo con ID ${id} no encontrado`);
    }
    if (updateDto.idCentroTrabajo) {
      const centroTrabajoExistente = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo: updateDto.idCentroTrabajo } });

      if (!centroTrabajoExistente) {
        throw new NotFoundException(`El centro de trabajo con ID ${updateDto.idCentroTrabajo} no existe`);
      }
      existingPerf.centroTrabajo = centroTrabajoExistente;
    }
    const updatedPerf = { ...existingPerf, ...updateDto };
    return this.perfPersoCentTrabRepository.save(updatedPerf);
  }

  async desactivarPerfCentroTrabajo(id: number): Promise<void> {
    const perfil = await this.perfPersoCentTrabRepository.findOne({ where: { id_perf_pers_centro_trab: id } });

    if (!perfil) {
      throw new NotFoundException(`Perfil centro trabajo con ID ${id} no encontrado`);
    }
    perfil.estado = 'INACTIVO';
    await this.perfPersoCentTrabRepository.save(perfil);
  }
  async desactivarCuentaBancaria(id: number): Promise<void> {
    const perfil = await this.BancosToPersonaRepository.findOne({ where: { id_af_banco: id } });

    if (!perfil) {
      throw new NotFoundException(`Cuenta Bancaria con ID ${id} no encontrado`);
    }
    perfil.estado = 'INACTIVO';
    await this.BancosToPersonaRepository.save(perfil);
  }


  async activarCuentaBancaria(id: number, id_persona: number): Promise<void> {
    const perfil1 = await this.BancosToPersonaRepository.find({ where: { persona: { id_persona: id_persona } } });
    const perfil = await this.BancosToPersonaRepository.findOne({ where: { persona: { id_persona: id_persona }, id_af_banco: id } });
    if (!perfil) {
      throw new NotFoundException(`Cuenta Bancaria con ID ${id} no encontrado`);
    }
    perfil1.forEach((val) => {
      if (val.estado === 'ACTIVO') {
        val.estado = 'INACTIVO';
        val.fecha_inactivacion = new Date();
      }
    });
    perfil.estado = 'ACTIVO';
    perfil.fecha_activacion = new Date();
    perfil.fecha_inactivacion = null;
    await this.BancosToPersonaRepository.save(perfil1);
    await this.BancosToPersonaRepository.save(perfil);
  }

  async getAllEstados(): Promise<net_estado_afiliacion[]> {
    return this.estadoAfiliacionRepository.find();
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}