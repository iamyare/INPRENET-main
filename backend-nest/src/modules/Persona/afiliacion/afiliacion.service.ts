import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Net_Tipo_Persona } from '../entities/net_tipo_persona.entity';
import { net_persona } from '../entities/net_persona.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CrearPersonaDto } from './dtos/crear-persona.dto';
import { CrearDatosDto } from './dtos/crear-datos.dto';
import { Net_Tipo_Identificacion } from 'src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { Net_Municipio } from 'src/modules/Regional/municipio/entities/net_municipio.entity';
import { NET_PROFESIONES } from 'src/modules/transacciones/entities/net_profesiones.entity';
import { net_causas_fallecimientos } from '../entities/net_causas_fallecimientos.entity';
import { net_detalle_persona } from '../entities/net_detalle_persona.entity';
import { CrearDetallePersonaDto } from './dtos/crear-net_detalle_persona.dto';
import { net_estado_afiliacion } from '../entities/net_estado_afiliacion.entity';
import { CrearPersonaColegiosDto } from './dtos/crear-persona_colegios.dto';
import { Net_Colegios_Magisteriales } from 'src/modules/transacciones/entities/net_colegios_magisteriales.entity';
import { Net_Persona_Colegios } from 'src/modules/transacciones/entities/net_persona_colegios.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { CrearPersonaBancoDto } from './dtos/crear-persona_por_banco.dto';
import { Net_perf_pers_cent_trab } from '../entities/net_perf_pers_cent_trab.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { CrearPersonaCentroTrabajoDto } from './dtos/crear-perf_pers_cent_trab.dto';
import { net_otra_fuente_ingreso } from '../entities/net_otra_fuente_ingreso.entity';
import { CrearOtraFuenteIngresoDto } from './dtos/crear-otra_fuente_ingreso.dto';
import { CrearBeneficiarioDto } from './dtos/crear-beneficiario.dto';
import { CrearDiscapacidadDto } from './dtos/crear-discapacidad.dto';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { Net_Persona_Discapacidad } from '../entities/net_persona_discapacidad.entity';
import { CrearFamiliaDto } from './dtos/crear-familiar.dto';
import { Net_Familia } from '../entities/net_familia.entity';
import { Net_Peps } from 'src/modules/Empresarial/entities/net_peps.entity';
import { CrearPepsDto } from './dtos/crear-peps.dto';
import { Net_Cargo_Publico } from 'src/modules/Empresarial/entities/net_cargo_publico.entity';
import { Net_Referencias } from '../entities/net_referencias.entity';
import { CrearReferenciaDto } from './dtos/crear-referencia.dto';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class AfiliacionService {
  constructor(
    @InjectRepository(net_persona)
    private readonly personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Tipo_Persona)
    private readonly tipoPersonaRepository: Repository<Net_Tipo_Persona>,
    @InjectRepository(Net_Tipo_Identificacion)
    private readonly tipoIdentificacionRepository: Repository<Net_Tipo_Identificacion>,
    @InjectRepository(Net_Pais)
    private readonly paisRepository: Repository<Net_Pais>,
    @InjectRepository(Net_Municipio)
    private readonly municipioRepository: Repository<Net_Municipio>,
    @InjectRepository(NET_PROFESIONES)
    private readonly profesionRepository: Repository<NET_PROFESIONES>,
    @InjectRepository(net_causas_fallecimientos)
    private readonly causasFallecimientosRepository: Repository<net_causas_fallecimientos>,
    @InjectRepository(net_estado_afiliacion)
    private readonly estadoAfiliacionRepository: Repository<net_estado_afiliacion>,
    @InjectRepository(Net_Colegios_Magisteriales)
    private readonly colegiosMagisterialesRepository: Repository<Net_Colegios_Magisteriales>,
    @InjectRepository(Net_Banco)
    private readonly bancoRepository: Repository<Net_Banco>,
    @InjectRepository(Net_Centro_Trabajo)
    private readonly centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_Referencias)
    private readonly referenciaRepository: Repository<Net_Referencias>,
    @InjectRepository(Net_Discapacidad)
    private readonly discapacidadRepository: Repository<Net_Discapacidad>,
    @InjectRepository(net_detalle_persona)
    private readonly detallePersonaRepository: Repository<net_detalle_persona>,
    @InjectRepository(Net_Familia)
    private readonly familiaRepository: Repository<Net_Familia>,
    @InjectRepository(net_otra_fuente_ingreso)
    private readonly otraFuenteIngresoRepository: Repository<net_otra_fuente_ingreso>,
    private readonly entityManager: EntityManager,
  ) { }

  async updateFotoPerfil(id: number, fotoPerfil: Buffer): Promise<net_persona> {
    const persona = await this.personaRepository.findOneBy({ id_persona: id });
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
    persona.foto_perfil = fotoPerfil;
    return await this.personaRepository.save(persona);
  }

  async getPersonaByn_identificacioni(n_identificacion: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: [
        'tipoIdentificacion',
        'pais',
        'municipio',
        'municipio_defuncion',
        'profesion',
        'detallePersona',
        'peps',
        'peps.cargo_publico',
        'detallePersona.tipoPersona',
        'detallePersona.estadoAfiliacion',
        'referencias',
        'personasPorBanco',
        'personasPorBanco.banco',
        'detalleDeduccion',
        'perfPersCentTrabs',
        'perfPersCentTrabs.centroTrabajo',
        'perfPersCentTrabs.centroTrabajo.municipio',
        'perfPersCentTrabs.centroTrabajo.municipio.departamento',
        'cuentas',
        'detallePlanIngreso',
        'colegiosMagisteriales',
      ],
    });

    const conyuge = await this.familiaRepository.findOne({
      where: { persona: { id_persona: persona.id_persona }, parentesco: 'CONYUGE' },
      relations: ['persona'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona with DNI ${n_identificacion} not found`);
    }

    return { persona, conyuge };
  }

  async getCausantesByDniBeneficiario(n_identificacion: string): Promise<net_persona[]> {
    const beneficiario = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: ['detallePersona']
    });
    if (!beneficiario) {
      throw new Error('Beneficiario no encontrado');
    }
    const tiposPersona = await this.tipoPersonaRepository.find({
      where: [
        { tipo_persona: 'BENEFICIARIO' },
        { tipo_persona: 'DESIGNADO' }
      ]
    });
    if (tiposPersona.length === 0) {
      throw new Error('Tipos de persona "BENEFICIARIO" o "DESIGNADO" no encontrados');
    }
    const tipoPersonaIds = tiposPersona.map(tipo => tipo.id_tipo_persona);
    const detalles = beneficiario.detallePersona.filter(d => tipoPersonaIds.includes(d.ID_TIPO_PERSONA));

    if (detalles.length === 0) {
      throw new Error('Detalle de beneficiario no encontrado');
    }
    const causantes = await this.personaRepository.findByIds(detalles.map(d => d.ID_CAUSANTE));

    if (causantes.length === 0) {
      throw new Error('Causantes no encontrados');
    }

    return causantes;
  }


  async getAllDiscapacidades(): Promise<Net_Discapacidad[]> {
    return this.discapacidadRepository.find();
  }

  async crearPersona(crearPersonaDto: CrearPersonaDto, fotoPerfil: Express.Multer.File, fileIdent: Express.Multer.File, entityManager: EntityManager): Promise<net_persona> {
    // Verificar si la persona ya existe
    let persona = await this.personaRepository.findOne({ where: { n_identificacion: crearPersonaDto.n_identificacion } });

    if (persona) {
      const detalleExistente = await this.detallePersonaRepository.findOne({
        where: { ID_PERSONA: persona.id_persona, tipoPersona: { tipo_persona: 'AFILIADO' } }
      });

      if (detalleExistente) {
        throw new ConflictException('La persona ya existe como AFILIADO.');
      }

      // No se crea una nueva persona, pero se continúa con la función
    } else {

      const [tipoIdentificacion, pais, municipioResidencia, municipioNacimiento, municipioDefuncion, profesion, causaFallecimiento] = await Promise.all([
        this.tipoIdentificacionRepository.findOne({ where: { id_identificacion: crearPersonaDto.id_tipo_identificacion } }),
        this.paisRepository.findOne({ where: { id_pais: crearPersonaDto.id_pais_nacionalidad } }),
        this.municipioRepository.findOne({ where: { id_municipio: crearPersonaDto.id_municipio_residencia } }),
        this.municipioRepository.findOne({ where: { id_municipio: crearPersonaDto.id_municipio_nacimiento } }),
        crearPersonaDto.id_municipio_defuncion ? this.municipioRepository.findOne({ where: { id_municipio: crearPersonaDto.id_municipio_defuncion } }) : null,
        crearPersonaDto.id_profesion ? this.profesionRepository.findOne({ where: { id_profesion: crearPersonaDto.id_profesion } }) : null,
        crearPersonaDto.id_causa_fallecimiento ? this.causasFallecimientosRepository.findOne({ where: { id_causa_fallecimiento: crearPersonaDto.id_causa_fallecimiento } }) : null
      ]);

      if (!tipoIdentificacion) throw new NotFoundException(`El tipo de identificación con ID ${crearPersonaDto.id_tipo_identificacion} no existe`);
      if (!pais) throw new NotFoundException(`El país con ID ${crearPersonaDto.id_pais_nacionalidad} no existe`);
      if (!municipioResidencia) throw new NotFoundException(`El municipio de residencia con ID ${crearPersonaDto.id_municipio_residencia} no existe`);
      if (!municipioNacimiento) throw new NotFoundException(`El municipio de nacimiento con ID ${crearPersonaDto.id_municipio_nacimiento} no existe`);

      persona = entityManager.create(net_persona, {
        ...crearPersonaDto,
        fecha_vencimiento_ident: this.formatDateToYYYYMMDD(crearPersonaDto.fecha_vencimiento_ident),
        fecha_nacimiento: this.formatDateToYYYYMMDD(crearPersonaDto.fecha_nacimiento),
        fecha_defuncion: this.formatDateToYYYYMMDD(crearPersonaDto.fecha_defuncion),
        fecha_afiliacion: this.formatDateToYYYYMMDD(crearPersonaDto.fecha_afiliacion),
        foto_perfil: fotoPerfil?.buffer,
        archivo_identificacion: fileIdent?.buffer,
        tipoIdentificacion,
        pais,
        municipio: municipioResidencia,
        municipio_nacimiento: municipioNacimiento,
        municipio_defuncion: municipioDefuncion,
        profesion,
        causa_fallecimiento: causaFallecimiento,
      });
      await entityManager.save(net_persona, persona);
    }

    return persona;
  }

  async crearDetallePersona(
    crearDetallePersonaDto: CrearDetallePersonaDto,
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<net_detalle_persona> {
    const tipoPersona = await this.tipoPersonaRepository.findOne({ where: { tipo_persona: crearDetallePersonaDto.tipo_persona } });
    if (!tipoPersona) {
      throw new NotFoundException('Tipo de persona no encontrado');
    }
    const estadoAfiliacion = await this.estadoAfiliacionRepository.findOne({ where: { nombre_estado: crearDetallePersonaDto.nombre_estado } });
    if (!estadoAfiliacion) {
      throw new NotFoundException('Estado de afiliación no encontrado');
    }

    const detallePersona = entityManager.create(net_detalle_persona, {
      ID_PERSONA: idPersona,
      ID_CAUSANTE: idPersona,
      eliminado: crearDetallePersonaDto.eliminado,
      tipoPersona,
      estadoAfiliacion,
      ID_TIPO_PERSONA: tipoPersona.id_tipo_persona,
      ID_ESTADO_AFILIACION: estadoAfiliacion.codigo,
      voluntario: crearDetallePersonaDto.voluntario || 'NO',
    });

    return await entityManager.save(net_detalle_persona, detallePersona);
  }

  async crearPersonaColegios(
    crearPersonaColegiosDtos: CrearPersonaColegiosDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<Net_Persona_Colegios[]> {
    const resultados: Net_Persona_Colegios[] = [];

    for (const crearPersonaColegiosDto of crearPersonaColegiosDtos) {
      const colegio = await this.colegiosMagisterialesRepository.findOne({ where: { id_colegio: crearPersonaColegiosDto.id_colegio } });
      if (!colegio) {
        throw new NotFoundException(`Colegio magisterial con ID ${crearPersonaColegiosDto.id_colegio} no encontrado`);
      }

      const personaColegio = entityManager.create(Net_Persona_Colegios, {
        persona: { id_persona: idPersona },
        colegio,
      });

      resultados.push(await entityManager.save(Net_Persona_Colegios, personaColegio));
    }

    return resultados;
  }

  async crearPersonaBancos(
    crearPersonaBancosDtos: CrearPersonaBancoDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<Net_Persona_Por_Banco[]> {
    const resultados: Net_Persona_Por_Banco[] = [];
    for (const crearPersonaBancosDto of crearPersonaBancosDtos) {
      const banco = await this.bancoRepository.findOne({ where: { id_banco: crearPersonaBancosDto.id_banco } });
      if (!banco) {
        throw new NotFoundException(`Banco con ID ${crearPersonaBancosDto.id_banco} no encontrado`);
      }
      if (crearPersonaBancosDto.estado === 'ACTIVO') {
        await entityManager.update(
          Net_Persona_Por_Banco,
          { persona: { id_persona: idPersona }, estado: 'ACTIVO' },
          { estado: 'INACTIVO', fecha_inactivacion: new Date() }
        );
      }
      const personaBanco = entityManager.create(Net_Persona_Por_Banco, {
        persona: { id_persona: idPersona },
        banco,
        num_cuenta: crearPersonaBancosDto.num_cuenta,
        estado: crearPersonaBancosDto.estado,
        fecha_activacion: crearPersonaBancosDto.estado === 'ACTIVO' ? new Date() : null,
        fecha_inactivacion: crearPersonaBancosDto.estado === 'INACTIVO' ? new Date() : null,
      });

      resultados.push(await entityManager.save(Net_Persona_Por_Banco, personaBanco));
    }

    return resultados;
  }

  async crearPersonaCentrosTrabajo(
    crearPersonaCentrosTrabajoDtos: CrearPersonaCentroTrabajoDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<Net_perf_pers_cent_trab[]> {
    const resultados: Net_perf_pers_cent_trab[] = [];

    for (const crearPersonaCentrosTrabajoDto of crearPersonaCentrosTrabajoDtos) {
      const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo: crearPersonaCentrosTrabajoDto.id_centro_trabajo } });
      if (!centroTrabajo) {
        throw new NotFoundException(`Centro de trabajo con ID ${crearPersonaCentrosTrabajoDto.id_centro_trabajo} no encontrado`);
      }
      const personaCentroTrabajo = entityManager.create(Net_perf_pers_cent_trab, {
        persona: { id_persona: idPersona },
        centroTrabajo,
        jornada: crearPersonaCentrosTrabajoDto.jornada,
        tipo_jornada: crearPersonaCentrosTrabajoDto.tipo_jornada,
        cargo: crearPersonaCentrosTrabajoDto.cargo,
        numero_acuerdo: crearPersonaCentrosTrabajoDto.numero_acuerdo,
        salario_base: crearPersonaCentrosTrabajoDto.salario_base,
        fecha_ingreso: this.formatDateToYYYYMMDD(crearPersonaCentrosTrabajoDto.fecha_ingreso),
        fecha_egreso: this.formatDateToYYYYMMDD(crearPersonaCentrosTrabajoDto.fecha_egreso),
        estado: "ACTIVO",
      });
      resultados.push(await entityManager.save(Net_perf_pers_cent_trab, personaCentroTrabajo));
    }
    return resultados;
  }

  async crearOtrasFuentesIngreso(
    crearOtrasFuentesIngresoDtos: CrearOtraFuenteIngresoDto[] | undefined,
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<net_otra_fuente_ingreso[]> {
    const resultados: net_otra_fuente_ingreso[] = [];

    if (crearOtrasFuentesIngresoDtos && crearOtrasFuentesIngresoDtos.length > 0) {
      for (const crearOtraFuenteIngresoDto of crearOtrasFuentesIngresoDtos) {
        const otraFuenteIngreso = entityManager.create(net_otra_fuente_ingreso, {
          persona: { id_persona: idPersona },
          actividad_economica: crearOtraFuenteIngresoDto.actividad_economica,
          monto_ingreso: crearOtraFuenteIngresoDto.monto_ingreso,
          observacion: crearOtraFuenteIngresoDto.observacion,
        });

        resultados.push(await entityManager.save(net_otra_fuente_ingreso, otraFuenteIngreso));
      }
    }

    return resultados;
  }

  async crearReferencias(
    crearReferenciasDtos: CrearReferenciaDto[],
    idPersona: number,
    entityManager: EntityManager
  ): Promise<Net_Referencias[]> {
    const resultados: Net_Referencias[] = [];

    for (const crearReferenciaDto of crearReferenciasDtos) {
      const nuevaReferencia = entityManager.create(Net_Referencias, {
        tipo_referencia: crearReferenciaDto.tipo_referencia,
        primer_nombre: crearReferenciaDto.primer_nombre,
        segundo_nombre: crearReferenciaDto.segundo_nombre,
        tercer_nombre: crearReferenciaDto.tercer_nombre,
        primer_apellido: crearReferenciaDto.primer_apellido,
        segundo_apellido: crearReferenciaDto.segundo_apellido,
        parentesco: crearReferenciaDto.parentesco,
        direccion: crearReferenciaDto.direccion,
        telefono_domicilio: crearReferenciaDto.telefono_domicilio,
        telefono_trabajo: crearReferenciaDto.telefono_trabajo,
        telefono_personal: crearReferenciaDto.telefono_personal,
        n_identificacion: crearReferenciaDto.n_identificacion,
        persona: { id_persona: idPersona },
      });

      resultados.push(await entityManager.save(Net_Referencias, nuevaReferencia));
    }

    return resultados;
  }

  async crearBeneficiarios(
    crearBeneficiariosDtos: CrearBeneficiarioDto[],
    idPersona: number,
    idDetallePersona: number,
    entityManager: EntityManager,
    files?: any,
    personasCreadasMap?: Map<string, net_persona>
  ): Promise<net_detalle_persona[]> {
    const resultados: net_detalle_persona[] = [];
    const personasMap = personasCreadasMap || new Map<string, net_persona>();

    const tipoPersonaBeneficiario = await this.tipoPersonaRepository.findOne({ where: { tipo_persona: 'DESIGNADO' } });
    if (!tipoPersonaBeneficiario) {
      throw new NotFoundException('Tipo de persona "DESIGNADO" no encontrado');
    }
    for (const crearBeneficiarioDto of crearBeneficiariosDtos) {
      const fileIdent = files?.find(file => file.fieldname === `file_identB[${crearBeneficiarioDto.persona.n_identificacion}]`);
      const beneficiario = await this.crearOObtenerPersona(crearBeneficiarioDto.persona, fileIdent, entityManager, personasMap);
      const detalleBeneficiario = entityManager.create(net_detalle_persona, {
        ID_DETALLE_PERSONA: idDetallePersona,
        ID_PERSONA: beneficiario.id_persona,
        ID_CAUSANTE: idPersona,
        ID_CAUSANTE_PADRE: idPersona,
        ID_TIPO_PERSONA: tipoPersonaBeneficiario.id_tipo_persona,
        eliminado: 'NO',
        porcentaje: crearBeneficiarioDto.porcentaje,
      });
      const detalleGuardado = await entityManager.save(net_detalle_persona, detalleBeneficiario);
      resultados.push(detalleGuardado);
      if (crearBeneficiarioDto.discapacidades && crearBeneficiarioDto.discapacidades.length > 0) {
        await this.crearDiscapacidades(crearBeneficiarioDto.discapacidades, beneficiario.id_persona, entityManager);
      }
    }
    return resultados;
  }

  async crearFamilia(
    familiaresDto: CrearFamiliaDto[],
    idPersona: number,
    entityManager: EntityManager,
    personasCreadasMap?: Map<string, net_persona>
  ): Promise<void> {
    //console.log(familiaresDto);

    const personasMap = personasCreadasMap || new Map<string, net_persona>();
    const familiaSinDuplicados = familiaresDto.filter((familia, index, self) => {
      return (
        familia.parentesco !== 'CÓNYUGE' ||
        index === self.findIndex(f => f.parentesco === 'CÓNYUGE')
      );
    });

    for (const familiaDto of familiaSinDuplicados) {
      const personaReferencia = await this.crearOObtenerPersona(familiaDto.persona_referencia, null, entityManager, personasMap);

      const familia = entityManager.create(Net_Familia, {
        parentesco: familiaDto.parentesco,
        persona: { id_persona: idPersona },
        referenciada: { id_persona: personaReferencia.id_persona },
      });

      await entityManager.save(Net_Familia, familia);
    }
  }

  async crearDiscapacidades(
    discapacidadesDto: CrearDiscapacidadDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<void> {
    for (const discapacidadDto of discapacidadesDto) {
      const discapacidad = await this.discapacidadRepository.findOne({
        where: { tipo_discapacidad: discapacidadDto.tipo_discapacidad }
      });
      if (!discapacidad) {
        throw new NotFoundException(`Discapacidad con tipo ${discapacidadDto.tipo_discapacidad} no encontrada`);
      }
      const nuevaDiscapacidad = entityManager.create(Net_Persona_Discapacidad, {
        discapacidad: discapacidad,
        persona: { id_persona: idPersona },
      });
      await entityManager.save(Net_Persona_Discapacidad, nuevaDiscapacidad);
    }
  }

  async crearPeps(pepsDto: CrearPepsDto[], idPersona: number, entityManager: EntityManager): Promise<Net_Peps[]> {
    const resultados: Net_Peps[] = [];
    for (const pepsData of pepsDto) {
      const nuevoPeps = entityManager.create(Net_Peps, {
        estado: 'HABILITADO',
        persona: { id_persona: idPersona },
      });
      const pepsGuardado = await entityManager.save(Net_Peps, nuevoPeps);
      if (pepsData.cargosPublicos && pepsData.cargosPublicos.length > 0) {
        for (const cargo of pepsData.cargosPublicos) {
          const nuevoCargoPublico = entityManager.create(Net_Cargo_Publico, {
            cargo: cargo.cargo,
            fecha_inicio: this.formatDateToYYYYMMDD(cargo.fecha_inicio),
            fecha_fin: this.formatDateToYYYYMMDD(cargo.fecha_fin),
            referencias: cargo.referencias,
            peps: pepsGuardado,
          });
          await entityManager.save(Net_Cargo_Publico, nuevoCargoPublico);
        }
      }
      resultados.push(pepsGuardado);
    }
    return resultados;
  }



  async crearDatos(
    crearDatosDto: CrearDatosDto,
    fotoPerfil: Express.Multer.File,
    fileIdent: Express.Multer.File,
    files: any
  ): Promise<any> {
    return await this.personaRepository.manager.transaction(async (transactionalEntityManager) => {
      try {
        const resultados = [];
        const personasCreadasMap = new Map<string, net_persona>();

        // Crear la persona
        const persona = await this.crearPersona(crearDatosDto.persona, fotoPerfil, fileIdent, transactionalEntityManager);
        resultados.push(persona);

        // Crear el detalle de la persona
        const detallePersona = await this.crearDetallePersona(crearDatosDto.detallePersona, persona.id_persona, transactionalEntityManager);
        resultados.push(detallePersona);

        // Crear las relaciones de la persona con los colegios magisteriales
        const personaColegios = await this.crearPersonaColegios(crearDatosDto.colegiosMagisteriales, persona.id_persona, transactionalEntityManager);
        resultados.push(...personaColegios);

        // Crear las relaciones de la persona con los bancos
        const personaBancos = await this.crearPersonaBancos(crearDatosDto.bancos, persona.id_persona, transactionalEntityManager);
        resultados.push(...personaBancos);

        // Crear las relaciones de la persona con los centros de trabajo
        const personaCentrosTrabajo = await this.crearPersonaCentrosTrabajo(crearDatosDto.centrosTrabajo, persona.id_persona, transactionalEntityManager);
        resultados.push(...personaCentrosTrabajo);

        // Crear las relaciones de la persona con las otras fuentes de ingreso
        const otrasFuentesIngreso = await this.crearOtrasFuentesIngreso(crearDatosDto.otrasFuentesIngreso, persona.id_persona, transactionalEntityManager);
        resultados.push(...otrasFuentesIngreso);

        // Crear las referencias de la persona
        const referencias = await this.crearReferencias(crearDatosDto.referencias, persona.id_persona, transactionalEntityManager);
        resultados.push(...referencias);

        // Crear los beneficiarios de la persona
        const beneficiarios = await this.crearBeneficiarios(crearDatosDto.beneficiarios, persona.id_persona, detallePersona.ID_DETALLE_PERSONA, transactionalEntityManager, files, personasCreadasMap);
        resultados.push(...beneficiarios);

        // Crear las discapacidades de la persona, si existen
        if (crearDatosDto.persona.discapacidades && crearDatosDto.persona.discapacidades.length > 0) {
          await this.crearDiscapacidades(crearDatosDto.persona.discapacidades, persona.id_persona, transactionalEntityManager);
        }

        // Crear la familia de la persona, si existen
        if (crearDatosDto.familiares && crearDatosDto.familiares.length > 0) {
          await this.crearFamilia(crearDatosDto.familiares, persona.id_persona, transactionalEntityManager, personasCreadasMap);
        }

        // Crear los registros PEPs de la persona, si existen
        if (crearDatosDto.peps && crearDatosDto.peps.length > 0) {
          const peps = await this.crearPeps(crearDatosDto.peps, persona.id_persona, transactionalEntityManager);
          resultados.push(...peps);
        }

        return resultados;
      } catch (error) {
        console.error('Error al crear los datos:', error);
        throw new Error(`Error al crear los datos: ${error.message}`);
      }
    });
  }


  async crearOObtenerPersona(
    crearPersonaDto: CrearPersonaDto,
    fileIdent: Express.Multer.File,
    entityManager: EntityManager,
    personasCreadasMap: Map<string, net_persona>
  ): Promise<net_persona> {
    // Verificar si ya hemos creado a esta persona en esta transacción
    if (personasCreadasMap.has(crearPersonaDto.n_identificacion)) {
      return personasCreadasMap.get(crearPersonaDto.n_identificacion);
    }

    // Verificar si la persona ya existe en la base de datos
    let persona = await this.personaRepository.findOne({
      where: { n_identificacion: crearPersonaDto.n_identificacion }
    });

    if (!persona) {
      // Crear la persona si no existe
      persona = await this.crearPersona(crearPersonaDto, null, fileIdent, entityManager);
    }

    // Guardar la persona en el mapa para futuras referencias
    personasCreadasMap.set(crearPersonaDto.n_identificacion, persona);

    return persona;
  }


  formatDateToYYYYMMDD(dateString: string): string {
    if (!dateString) return null;
    const date = new Date(dateString);
    const utcDay = ('0' + date.getUTCDate()).slice(-2);
    const utcMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const utcYear = date.getUTCFullYear();
    return `${utcYear}-${utcMonth}-${utcDay}`;
  }

  async obtenerReferenciasPorIdentificacion(nIdentificacion: string) {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: nIdentificacion },
    });
    if (!persona) {
      throw new NotFoundException(`Persona con identificación ${nIdentificacion} no encontrada`);
    }

    const referencias = await this.referenciaRepository.find({
      where: { persona: { id_persona: persona.id_persona } },
      relations: ['persona'],
    });

    return referencias.map(ref => ({
      id_referencia: ref.id_referencia,
      id_persona: ref.persona.id_persona,
      tipo_referencia: ref.tipo_referencia,
      parentesco: ref.parentesco,
      primer_nombre: ref.primer_nombre,
      segundo_nombre: ref.segundo_nombre,
      tercer_nombre: ref.tercer_nombre,
      primer_apellido: ref.primer_apellido,
      segundo_apellido: ref.segundo_apellido,
      direccion: ref.direccion,
      telefono_domicilio: ref.telefono_domicilio,
      telefono_trabajo: ref.telefono_trabajo,
      telefono_personal: ref.telefono_personal,
      n_identificacion: ref.n_identificacion,
      estado: ref.estado,
    }));
  }

  async eliminarReferencia(idReferencia: number): Promise<void> {
    const referencia = await this.referenciaRepository.findOne({
      where: { id_referencia: idReferencia },
    });
    if (!referencia) {
      throw new NotFoundException(`Referencia con ID ${idReferencia} no encontrada`);
    }
    referencia.estado = 'INACTIVO';
    await this.referenciaRepository.save(referencia);
  }

  async actualizarReferencia(idReferencia: number, datosActualizados: CrearReferenciaDto): Promise<void> {
    const validationErrors: ValidationError[] = await validate(datosActualizados);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new BadRequestException(`Datos inválidos: ${errorMessages}`);
    }

    const referencia = await this.referenciaRepository.findOne({
      where: { id_referencia: idReferencia },
    });
    if (!referencia) {
      throw new NotFoundException(`Referencia con ID ${idReferencia} no encontrada`);
    }

    await this.referenciaRepository.update(idReferencia, {
      tipo_referencia: datosActualizados.tipo_referencia ?? referencia.tipo_referencia,
      primer_nombre: datosActualizados.primer_nombre ?? referencia.primer_nombre,
      segundo_nombre: datosActualizados.segundo_nombre ?? referencia.segundo_nombre,
      tercer_nombre: datosActualizados.tercer_nombre ?? referencia.tercer_nombre,
      primer_apellido: datosActualizados.primer_apellido ?? referencia.primer_apellido,
      segundo_apellido: datosActualizados.segundo_apellido ?? referencia.segundo_apellido,
      parentesco: datosActualizados.parentesco ?? referencia.parentesco,
      direccion: datosActualizados.direccion ?? referencia.direccion,
      telefono_domicilio: datosActualizados.telefono_domicilio ?? referencia.telefono_domicilio,
      telefono_trabajo: datosActualizados.telefono_trabajo ?? referencia.telefono_trabajo,
      telefono_personal: datosActualizados.telefono_personal ?? referencia.telefono_personal,
      n_identificacion: datosActualizados.n_identificacion ?? referencia.n_identificacion,
      estado: datosActualizados.estado ?? referencia.estado,
    });
  }


  async editarOtraFuenteIngreso(id: number, dto: CrearOtraFuenteIngresoDto): Promise<net_otra_fuente_ingreso> {
    const otraFuenteIngreso = await this.otraFuenteIngresoRepository.findOne({ where: { id_otra_fuente_ingreso: id } });
    if (!otraFuenteIngreso) {
      throw new NotFoundException(`La fuente de ingreso con ID ${id} no fue encontrada`);
    }
    otraFuenteIngreso.actividad_economica = dto.actividad_economica;
    if (dto.monto_ingreso) {
      otraFuenteIngreso.monto_ingreso = dto.monto_ingreso;
    }
    if (dto.observacion) {
      otraFuenteIngreso.observacion = dto.observacion;
    }
    return await this.otraFuenteIngresoRepository.save(otraFuenteIngreso);
  }

  async eliminarOtraFuenteIngreso(id: number): Promise<void> {
    const fuenteIngreso = await this.otraFuenteIngresoRepository.findOne({ where: { id_otra_fuente_ingreso: id } });
    if (!fuenteIngreso) {
      throw new NotFoundException(`La fuente de ingreso con ID ${id} no fue encontrada`);
    }
    await this.otraFuenteIngresoRepository.remove(fuenteIngreso);
  }

  async obtenerConyugePorIdentificacion(n_identificacion: string): Promise<any> {
    const persona = await this.personaRepository.createQueryBuilder("persona")
      .where("persona.n_identificacion = :n_identificacion", { n_identificacion })
      .getOne();
    if (!persona) {
      throw new NotFoundException(`No se encontró la persona con identificación ${n_identificacion}`);
    }
    const conyuge = await this.familiaRepository.createQueryBuilder("familia")
      .leftJoinAndSelect("familia.referenciada", "referenciada")
      .where("familia.persona.id_persona = :id_persona", { id_persona: persona.id_persona })
      .andWhere("familia.parentesco = :parentesco", { parentesco: 'CÓNYUGE' })
      .getOne();
    const detallePersona = await this.detallePersonaRepository.createQueryBuilder("detallePersona")
      .where("detallePersona.ID_PERSONA = :id_persona", { id_persona: conyuge.referenciada.id_persona })
      .andWhere("detallePersona.ID_TIPO_PERSONA = :id_tipo_persona", { id_tipo_persona: 1 })
      .getOne();

    const esAfiliado = detallePersona ? 'SI' : 'NO';
    return {
      id_familia: conyuge.id_familia,
      primer_nombre: conyuge.referenciada.primer_nombre,
      segundo_nombre: conyuge.referenciada.segundo_nombre,
      tercer_nombre: conyuge.referenciada.tercer_nombre,
      primer_apellido: conyuge.referenciada.primer_apellido,
      segundo_apellido: conyuge.referenciada.segundo_apellido,
      n_identificacion: conyuge.referenciada.n_identificacion,
      fecha_nacimiento: conyuge.referenciada.fecha_nacimiento,
      telefono_1: conyuge.referenciada.telefono_1,
      telefono_2: conyuge.referenciada.telefono_2,
      telefono_3: conyuge.referenciada.telefono_3,
      trabaja: conyuge.trabaja,
      esAfiliado
    };
  }


  async actualizarConyuge(n_identificacion: string, body: any): Promise<any> {
    const persona = await this.personaRepository.createQueryBuilder("persona")
      .where("persona.n_identificacion = :n_identificacion", { n_identificacion })
      .getOne();
    if (!persona) {
      throw new NotFoundException(`No se encontró la persona con identificación ${n_identificacion}`);
    }
    const conyuge = await this.familiaRepository.createQueryBuilder("familia")
      .leftJoinAndSelect("familia.referenciada", "referenciada")
      .where("familia.persona.id_persona = :id_persona", { id_persona: persona.id_persona })
      .andWhere("familia.parentesco = :parentesco", { parentesco: 'CÓNYUGE' })
      .getOne();
    if (!conyuge || !conyuge.referenciada) {
      throw new NotFoundException(`No se encontró cónyuge para la persona con identificación ${n_identificacion}`);
    }
    //console.log(body);

    conyuge.referenciada.primer_nombre = body.primer_nombre ?? conyuge.referenciada.primer_nombre;
    conyuge.referenciada.segundo_nombre = body.segundo_nombre ?? conyuge.referenciada.segundo_nombre;
    conyuge.referenciada.tercer_nombre = body.tercer_nombre ?? conyuge.referenciada.tercer_nombre;
    conyuge.referenciada.primer_apellido = body.primer_apellido ?? conyuge.referenciada.primer_apellido;
    conyuge.referenciada.segundo_apellido = body.segundo_apellido ?? conyuge.referenciada.segundo_apellido;
    conyuge.referenciada.n_identificacion = body.n_identificacion ?? conyuge.referenciada.n_identificacion;
    conyuge.referenciada.fecha_nacimiento = body.fecha_nacimiento ? this.formatDateToYYYYMMDD(body.fecha_nacimiento) : conyuge.referenciada.fecha_nacimiento;
    conyuge.referenciada.telefono_3 = body.telefono_domicilio ?? conyuge.referenciada.telefono_3;
    conyuge.referenciada.telefono_1 = body.telefono_celular ?? conyuge.referenciada.telefono_1;
    conyuge.referenciada.telefono_2 = body.telefono_trabajo ?? conyuge.referenciada.telefono_2;
    conyuge.trabaja = body.trabaja ?? conyuge.trabaja;
    await this.personaRepository.save(conyuge.referenciada);
    await this.familiaRepository.save(conyuge);
    return { message: 'Cónyuge actualizado correctamente' };
  }

  async obtenerFamiliaresPorPersona(idPersona: number): Promise<any[]> {
    return this.familiaRepository
      .createQueryBuilder('familia')
      .leftJoinAndSelect('familia.referenciada', 'referenciada')
      .select([
        'familia.id_familia',
        'referenciada.id_persona',
        'referenciada.primer_nombre',
        'referenciada.segundo_nombre',
        'referenciada.primer_apellido',
        'referenciada.segundo_apellido',
        'referenciada.n_identificacion',
        'familia.parentesco',
      ])
      .where('familia.persona = :idPersona', { idPersona })
      .getMany();
  }

  async eliminarCargoPublico(id_cargo_publico: number): Promise<void> {
    const cargo = await this.entityManager.findOne(Net_Cargo_Publico, {
      where: { id_cargo_publico },
    });

    if (!cargo) {
      throw new NotFoundException(`El cargo público con ID ${id_cargo_publico} no fue encontrado.`);
    }

    await this.entityManager.delete(Net_Cargo_Publico, id_cargo_publico);
  }

  async eliminarFamiliar(idPersona: number, idFamiliar: number): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { id_persona: idPersona },
      relations: ['familiares'],
    });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada.');
    }
    const familiar = await this.familiaRepository.findOne({
      where: { id_familia: idFamiliar, persona: { id_persona: idPersona } },
    });
    await this.familiaRepository.remove(familiar);
    return { message: 'Familiar eliminado exitosamente.' };
  }

  async actualizarPeps(pepsData: any, entityManager: EntityManager): Promise<Net_Cargo_Publico> {
    if (Array.isArray(pepsData)) {
      pepsData = pepsData[0];
    }
    const cargoExistente = await entityManager.findOne(Net_Cargo_Publico, {
      where: { id_cargo_publico: pepsData.id_cargo_publico }
    });
    if (!cargoExistente) {
      throw new Error('Cargo público no encontrado');
    }
    if (!pepsData.fecha_inicio || !pepsData.fecha_fin) {
      throw new Error('Fecha de inicio o fin no puede ser null o undefined');
    }
    cargoExistente.cargo = pepsData.cargo;
    cargoExistente.fecha_inicio = this.formatDateToYYYYMMDD(pepsData.fecha_inicio);
    cargoExistente.fecha_fin = this.formatDateToYYYYMMDD(pepsData.fecha_fin);
    return await entityManager.save(Net_Cargo_Publico, cargoExistente);
  }


  async eliminarDiscapacidad(idPersona: number, tipoDiscapacidad: string): Promise<void> {
    const discapacidadRelacion = await this.entityManager.findOne(Net_Persona_Discapacidad, {
      where: {
        persona: { id_persona: idPersona },
        discapacidad: { tipo_discapacidad: tipoDiscapacidad },
      },
      relations: ['persona', 'discapacidad'],
    });
    if (!discapacidadRelacion) {
      throw new NotFoundException(`Discapacidad de tipo ${tipoDiscapacidad} no encontrada para la persona con ID ${idPersona}`);
    }
    await this.entityManager.remove(Net_Persona_Discapacidad, discapacidadRelacion);
  }

}

