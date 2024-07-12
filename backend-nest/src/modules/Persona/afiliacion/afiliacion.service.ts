import { Injectable, NotFoundException } from '@nestjs/common';
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
import { Net_Ref_Per_Pers } from '../entities/net_ref-per-persona.entity';
import { CrearReferenciaDto } from './dtos/crear-referencia.dto';
import { CrearBeneficiarioDto } from './dtos/crear-beneficiario.dto';
import { CrearDiscapacidadDto } from './dtos/crear-discapacidad.dto';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { Net_Persona_Discapacidad } from '../entities/net_persona_discapacidad.entity';
import { CrearFamiliaDto } from './dtos/crear-familiar.dto';
import { Net_Familia } from '../entities/net_familia.entity';

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
    @InjectRepository(net_detalle_persona)
    private readonly detallePersonaRepository: Repository<net_detalle_persona>,
    @InjectRepository(net_estado_afiliacion)
    private readonly estadoAfiliacionRepository: Repository<net_estado_afiliacion>,
    @InjectRepository(Net_Colegios_Magisteriales)
    private readonly colegiosMagisterialesRepository: Repository<Net_Colegios_Magisteriales>,
    @InjectRepository(Net_Persona_Colegios)
    private readonly personaColegiosRepository: Repository<Net_Persona_Colegios>,
    @InjectRepository(Net_Banco)
    private readonly bancoRepository: Repository<Net_Banco>,
    @InjectRepository(Net_Persona_Por_Banco)
    private readonly personaBancoRepository: Repository<Net_Persona_Por_Banco>,
    @InjectRepository(Net_Centro_Trabajo)
    private readonly centroTrabajoRepository: Repository<Net_Centro_Trabajo>,
    @InjectRepository(Net_perf_pers_cent_trab)
    private readonly personaCentroTrabajoRepository: Repository<Net_perf_pers_cent_trab>,
    @InjectRepository(net_otra_fuente_ingreso)
    private readonly otraFuenteIngresoRepository: Repository<net_otra_fuente_ingreso>,
    @InjectRepository(Net_Ref_Per_Pers)
    private readonly referenciaRepository: Repository<Net_Ref_Per_Pers>,
    @InjectRepository(Net_Discapacidad)
    private readonly discapacidadRepository: Repository<Net_Discapacidad>,
    
  ) { }

  async updateFotoPerfil(id: number, fotoPerfil: Buffer): Promise<net_persona> {
    const persona = await this.personaRepository.findOneBy({ id_persona: id });
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
    persona.foto_perfil = fotoPerfil;
    return await this.personaRepository.save(persona);
  }

  async getPersonaByn_identificacioni(n_identificacion: string): Promise<net_persona> {

    const persona = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: [
        'tipoIdentificacion',
        'pais',
        'municipio',
        'municipio_defuncion',
        'profesion',
        'detallePersona',
        'detallePersona.tipoPersona',
        'detallePersona.estadoAfiliacion',
        'referenciasPersonalPersona',
        'personasPorBanco',
        'detalleDeduccion',
        'perfPersCentTrabs',
        'cuentas',
        'detallePlanIngreso',
        'colegiosMagisteriales',
      ],
    });

    if (!persona) {
      throw new NotFoundException(`Persona with DNI ${n_identificacion} not found`);
    }

    return persona;
  }

  async getCausantesByDniBeneficiario(n_identificacion: string): Promise<net_persona[]> {
    // Obtener la persona (beneficiario) por n_identificacion
    const beneficiario = await this.personaRepository.findOne({ where: { n_identificacion }, relations: ['detallePersona'] });

    if (!beneficiario) {
      throw new Error('Beneficiario no encontrado');
    }

    // Obtener el ID del tipo de persona basado en el nombre "BENEFICIARIO"
    const tipoPersona = await this.tipoPersonaRepository.findOne({ where: { tipo_persona: 'BENEFICIARIO' } });
    if (!tipoPersona) {
      throw new Error('Tipo de persona "BENEFICIARIO" no encontrado');
    }

    // Obtener todos los detalles de la persona del beneficiario
    const detalles = beneficiario.detallePersona.filter(d => d.ID_TIPO_PERSONA === tipoPersona.id_tipo_persona);

    if (detalles.length === 0) {
      throw new Error('Detalle de beneficiario no encontrado');
    }

    // Obtener todos los causantes usando los IDs_CAUSANTE de los detalles del beneficiario
    const causantes = await this.personaRepository.findByIds(detalles.map(d => d.ID_CAUSANTE));

    if (causantes.length === 0) {
      throw new Error('Causantes no encontrados');
    }

    return causantes;
  }

  async crearPersona(crearPersonaDto: CrearPersonaDto, fotoPerfil: Express.Multer.File, entityManager: EntityManager): Promise<net_persona> {
    const tipoIdentificacion = await this.tipoIdentificacionRepository.findOne({ where: { id_identificacion: crearPersonaDto.id_tipo_identificacion } });
    if (!tipoIdentificacion) throw new NotFoundException(`El tipo de identificación con ID ${crearPersonaDto.id_tipo_identificacion} no existe`);

    const pais = await this.paisRepository.findOne({ where: { id_pais: crearPersonaDto.id_pais_nacionalidad } });
    if (!pais) throw new NotFoundException(`El país con ID ${crearPersonaDto.id_pais_nacionalidad} no existe`);

    const municipioResidencia = await this.municipioRepository.findOne({ where: { id_municipio: crearPersonaDto.id_municipio_residencia } });
    if (!municipioResidencia) throw new NotFoundException(`El municipio de residencia con ID ${crearPersonaDto.id_municipio_residencia} no existe`);

    const municipioDefuncion = crearPersonaDto.id_municipio_defuncion ? await this.municipioRepository.findOne({ where: { id_municipio: crearPersonaDto.id_municipio_defuncion } }) : null;
    if (crearPersonaDto.id_municipio_defuncion && !municipioDefuncion) throw new NotFoundException(`El municipio de defunción con ID ${crearPersonaDto.id_municipio_defuncion} no existe`);

    const profesion = crearPersonaDto.id_profesion ? await this.profesionRepository.findOne({ where: { id_profesion: crearPersonaDto.id_profesion } }) : null;
    if (crearPersonaDto.id_profesion && !profesion) throw new NotFoundException(`La profesión con ID ${crearPersonaDto.id_profesion} no existe`);

    const causaFallecimiento = crearPersonaDto.id_causa_fallecimiento ? await this.causasFallecimientosRepository.findOne({ where: { id_causa_fallecimiento: crearPersonaDto.id_causa_fallecimiento } }) : null;
    if (crearPersonaDto.id_causa_fallecimiento && !causaFallecimiento) throw new NotFoundException(`La causa de fallecimiento con ID ${crearPersonaDto.id_causa_fallecimiento} no existe`);

    const persona = entityManager.create(net_persona, {
      ...crearPersonaDto,
      fecha_vencimiento_ident: crearPersonaDto.fecha_vencimiento_ident ? new Date(crearPersonaDto.fecha_vencimiento_ident).toISOString().split('T')[0] : null,
      fecha_nacimiento: crearPersonaDto.fecha_nacimiento ? new Date(crearPersonaDto.fecha_nacimiento).toISOString().split('T')[0] : null,
      fecha_defuncion: crearPersonaDto.fecha_defuncion ? new Date(crearPersonaDto.fecha_defuncion).toISOString().split('T')[0] : null,
      foto_perfil: fotoPerfil?.buffer,
      tipoIdentificacion,
      pais,
      municipio: municipioResidencia,
      municipio_defuncion: municipioDefuncion,
      profesion,
      causa_fallecimiento: causaFallecimiento,
    });
    return await entityManager.save(net_persona, persona);
  }

  async crearDetallePersona(
    crearDetallePersonaDto: CrearDetallePersonaDto,
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<net_detalle_persona> {
    // Verificar si el tipo de persona existe
    const tipoPersona = await this.tipoPersonaRepository.findOne({ where: { id_tipo_persona: crearDetallePersonaDto.id_tipo_persona } });
    if (!tipoPersona) {
      throw new NotFoundException('Tipo de persona no encontrado');
    }

    // Verificar si el estado de afiliación existe
    const estadoAfiliacion = await this.estadoAfiliacionRepository.findOne({ where: { codigo: crearDetallePersonaDto.id_estado_afiliacion } });
    if (!estadoAfiliacion) {
      throw new NotFoundException('Estado de afiliación no encontrado');
    }

    const detallePersona = entityManager.create(net_detalle_persona, {
      ID_PERSONA: idPersona,
      ID_CAUSANTE: idPersona,
      eliminado: crearDetallePersonaDto.eliminado,
      ID_TIPO_PERSONA: crearDetallePersonaDto.id_tipo_persona,
      ID_ESTADO_AFILIACION: crearDetallePersonaDto.id_estado_afiliacion,
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

      const personaBanco = entityManager.create(Net_Persona_Por_Banco, {
        persona: { id_persona: idPersona },
        banco,
        num_cuenta: crearPersonaBancosDto.num_cuenta,
        estado: crearPersonaBancosDto.estado,
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
        cargo: crearPersonaCentrosTrabajoDto.cargo,
        numero_acuerdo: crearPersonaCentrosTrabajoDto.numero_acuerdo,
        salario_base: crearPersonaCentrosTrabajoDto.salario_base,
        fecha_ingreso: crearPersonaCentrosTrabajoDto.fecha_ingreso,
        fecha_egreso: crearPersonaCentrosTrabajoDto.fecha_egreso,
        estado: crearPersonaCentrosTrabajoDto.estado,
      });

      resultados.push(await entityManager.save(Net_perf_pers_cent_trab, personaCentroTrabajo));
    }

    return resultados;
  }

  async crearOtrasFuentesIngreso(
    crearOtrasFuentesIngresoDtos: CrearOtraFuenteIngresoDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<net_otra_fuente_ingreso[]> {
    const resultados: net_otra_fuente_ingreso[] = [];

    for (const crearOtraFuenteIngresoDto of crearOtrasFuentesIngresoDtos) {
      const otraFuenteIngreso = entityManager.create(net_otra_fuente_ingreso, {
        persona: { id_persona: idPersona },
        actividad_economica: crearOtraFuenteIngresoDto.actividad_economica,
        monto_ingreso: crearOtraFuenteIngresoDto.monto_ingreso,
        observacion: crearOtraFuenteIngresoDto.observacion,
      });

      resultados.push(await entityManager.save(net_otra_fuente_ingreso, otraFuenteIngreso));
    }

    return resultados;
  }

  async crearReferencias(
    crearReferenciasDtos: CrearReferenciaDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<Net_Ref_Per_Pers[]> {
    const resultados: Net_Ref_Per_Pers[] = [];
  
    for (const crearReferenciaDto of crearReferenciasDtos) {
      const personaReferencia = await this.crearPersona(crearReferenciaDto.persona_referencia, null, entityManager);
  
      const referencia = entityManager.create(Net_Ref_Per_Pers, {
        persona: { id_persona: idPersona },
        referenciada: personaReferencia,
        tipo_referencia: crearReferenciaDto.tipo_referencia,
        dependiente_economico: crearReferenciaDto.dependiente_economico,
        parentesco: crearReferenciaDto.parentesco,
      });
  
      resultados.push(await entityManager.save(Net_Ref_Per_Pers, referencia));
    }
  
    return resultados;
  }
  
  async crearBeneficiarios(
    crearBeneficiariosDtos: CrearBeneficiarioDto[],
    idPersona: number,
    idDetallePersona: number,
    entityManager: EntityManager,
  ): Promise<net_detalle_persona[]> {
    const resultados: net_detalle_persona[] = [];
  
    const tipoPersonaBeneficiario = await this.tipoPersonaRepository.findOne({ where: { tipo_persona: 'BENEFICIARIO' } });
    if (!tipoPersonaBeneficiario) {
      throw new NotFoundException('Tipo de persona "BENEFICIARIO" no encontrado');
    }
  
    for (const crearBeneficiarioDto of crearBeneficiariosDtos) {
      // Crear la persona beneficiaria
      const beneficiario = await this.crearPersona(crearBeneficiarioDto.persona, null, entityManager);
  
      // Crear el detalle del beneficiario
      const detalleBeneficiario = entityManager.create(net_detalle_persona, {
        ID_DETALLE_PERSONA: idDetallePersona,
        ID_PERSONA: beneficiario.id_persona,
        ID_CAUSANTE: idPersona,
        ID_CAUSANTE_PADRE: idPersona,
        ID_TIPO_PERSONA: tipoPersonaBeneficiario.id_tipo_persona,
        eliminado: 'NO',
      });
  
      resultados.push(await entityManager.save(net_detalle_persona, detalleBeneficiario));
    }
  
    return resultados;
  }
  
  async crearDiscapacidades(
    discapacidadesDto: CrearDiscapacidadDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<void> {
    for (const discapacidadDto of discapacidadesDto) {
      const discapacidad = await this.discapacidadRepository.findOne({ where: { id_discapacidad: discapacidadDto.id_discapacidad } });
      if (!discapacidad) {
        throw new NotFoundException(`Discapacidad con ID ${discapacidadDto.id_discapacidad} no encontrada`);
      }

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(Net_Persona_Discapacidad)
        .values({
          discapacidad: discapacidad,
          persona: { id_persona: idPersona },
        })
        .execute();
    }
  }

  async crearFamilia(
    familiaresDto: CrearFamiliaDto[],
    idPersona: number,
    entityManager: EntityManager,
  ): Promise<void> {
    for (const familiaDto of familiaresDto) {
      const personaReferencia = await this.crearPersona(familiaDto.persona_referencia, null, entityManager);

      const familia = entityManager.create(Net_Familia, {
        dependiente_economico: familiaDto.dependiente_economico,
        parentesco: familiaDto.parentesco,
        persona: { id_persona: idPersona },
        referenciada: { id_persona: personaReferencia.id_persona },
      });

      await entityManager.save(Net_Familia, familia);
    }
  }
  
  async crearDatos(crearDatosDto: CrearDatosDto, fotoPerfil: Express.Multer.File): Promise<any> {
    return await this.personaRepository.manager.transaction(async (transactionalEntityManager) => {
      try {
        const resultados = [];

        // Crear la persona
        const persona = await this.crearPersona(crearDatosDto.persona, fotoPerfil, transactionalEntityManager);
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
        const beneficiarios = await this.crearBeneficiarios(crearDatosDto.beneficiarios, persona.id_persona, detallePersona.ID_DETALLE_PERSONA, transactionalEntityManager);
        resultados.push(...beneficiarios);

        // Crear las discapacidades de la persona, si existen
        if (crearDatosDto.persona.discapacidades && crearDatosDto.persona.discapacidades.length > 0) {
          await this.crearDiscapacidades(crearDatosDto.persona.discapacidades, persona.id_persona, transactionalEntityManager);
        }

        // Crear la familia de la persona, si existen
        if (crearDatosDto.familiares && crearDatosDto.familiares.length > 0) {
          await this.crearFamilia(crearDatosDto.familiares, persona.id_persona, transactionalEntityManager);
        }

        return resultados;
      } catch (error) {
        throw new Error(`Error al crear los datos: ${error.message}`);
      }
    });
  }
  
  
}
