import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { NetPersonaDTO, PersonaResponse } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Connection, EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { validate as isUUID } from 'uuid';
import { Net_Persona } from './entities/Net_Persona.entity';
import { Net_ReferenciaPersonal } from './entities/referencia-personal.entity';
import { Net_Ref_Per_Pers } from './entities/net_ref-Per-Persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';
import { NET_DETALLE_PERSONA } from './entities/Net_detalle_persona.entity';
import { CreateDetallePersonaDto } from './dto/create-detalle.dto';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { Net_Estado_Persona } from './entities/net_estado_persona.entity';
import { AsignarReferenciasDTO } from './dto/asignarReferencia.dto';
import { CreatePersonaBancoDTO } from './dto/create-persona-banco.dto';
import { CreateDetalleBeneficiarioDto } from './dto/create-detalle-beneficiario-dto';
import { Net_Colegios_Magisteriales } from '../transacciones/entities/net_colegios_magisteriales.entity';
import { Net_Persona_Colegios } from '../transacciones/entities/net_persona_colegios.entity';
import { NET_PROFESIONES } from '../transacciones/entities/net_profesiones.entity';
import { UpdatePerfCentTrabDto } from './dto/update.perfAfilCentTrab.dto';
import { UpdateReferenciaPersonalDTO } from './dto/update-referencia-personal.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { Benef } from './dto/pruebaBeneficiario.dto';
import * as moment from 'moment';
import { Net_Tipo_Persona } from './entities/net_tipo_persona.entity';
@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(Net_Persona)
    private readonly personaRepository: Repository<Net_Persona>,
    @InjectRepository(Net_perf_pers_cent_trab)
    private readonly perfPersoCentTrabRepository: Repository<Net_perf_pers_cent_trab>,

    @InjectRepository(Net_ReferenciaPersonal)
    private referenciaPersonalRepository: Repository<Net_ReferenciaPersonal>,

    @InjectRepository(Net_Ref_Per_Pers)
    private refPerPersRepository: Repository<Net_Ref_Per_Pers>,

    @InjectRepository(Net_Tipo_Persona)
    private tipoPersonaRepository: Repository<Net_Tipo_Persona>,


    @InjectRepository(NET_DETALLE_PERSONA)
    private detallePersonaRepository: Repository<NET_DETALLE_PERSONA>,

    @InjectRepository(Net_TipoIdentificacion)
    private tipoIdentificacionRepository: Repository<Net_TipoIdentificacion>,

    @InjectRepository(Net_Pais)
    private paisRepository: Repository<Net_Pais>,

    @InjectRepository(Net_Municipio)
    private municipioRepository: Repository<Net_Municipio>,

    @InjectRepository(Net_Estado_Persona)
    private estadoPersonaRepository: Repository<Net_Estado_Persona>,

    @InjectRepository(Net_Centro_Trabajo)
    private centroTrabajoRepository: Repository<Net_Centro_Trabajo>,

    @InjectRepository(Net_Persona_Por_Banco)
    private personaBancoRepository: Repository<Net_Persona_Por_Banco>,

    @InjectRepository(Net_Banco)
    private bancoRepository: Repository<Net_Banco>,

    @InjectRepository(Net_Persona_Colegios)
    private readonly netPersonaColegiosRepository: Repository<Net_Persona_Colegios>,

    @InjectRepository(Net_Colegios_Magisteriales)
    private readonly netColegiosMagisterialesRepository: Repository<Net_Colegios_Magisteriales>,

    @InjectRepository(NET_PROFESIONES)
    private readonly netProfesionesRepository: Repository<NET_PROFESIONES>,

    @InjectRepository(Net_Persona_Por_Banco)
    private readonly BancosToPersonaRepository: Repository<Net_Persona_Por_Banco>,
    private readonly connection: Connection
  ) { }


  async createPersona(createPersonaDto: NetPersonaDTO): Promise<Net_Persona> {
    const persona = new Net_Persona();
    Object.assign(persona, createPersonaDto);

    if (createPersonaDto.fecha_nacimiento) {
      if (typeof createPersonaDto.fecha_nacimiento === 'string') {
        const fechaNacimiento = Date.parse(createPersonaDto.fecha_nacimiento);
        if (!isNaN(fechaNacimiento)) {
          persona.fecha_nacimiento = new Date(fechaNacimiento).toISOString().substring(0, 10);
        } else {
          throw new Error('Fecha de nacimiento no válida');
        }
      } else {
        throw new Error('Fecha de nacimiento no es una cadena válida');
      }
    }

    if (createPersonaDto.id_tipo_identificacion !== undefined && createPersonaDto.id_tipo_identificacion !== null) {
      persona.tipoIdentificacion = await this.tipoIdentificacionRepository.findOne({ where: { id_identificacion: createPersonaDto.id_tipo_identificacion } });
      if (!persona.tipoIdentificacion) {
        throw new Error(`Tipo de identificación con ID ${createPersonaDto.id_tipo_identificacion} no encontrado`);
      }
    } else {
      persona.tipoIdentificacion = null;
    }

    if (createPersonaDto.id_pais !== undefined && createPersonaDto.id_pais !== null) {
      persona.pais = await this.paisRepository.findOne({ where: { id_pais: createPersonaDto.id_pais } });
      if (!persona.pais) {
        throw new Error(`País con ID ${createPersonaDto.id_pais} no encontrado`);
      }
    } else {
      persona.pais = null;
    }

    if (createPersonaDto.id_municipio_residencia !== undefined && createPersonaDto.id_municipio_residencia !== null) {
      persona.municipio = await this.municipioRepository.findOne({ where: { id_municipio: createPersonaDto.id_municipio_residencia } });
      if (!persona.municipio) {
        throw new Error(`Municipio con ID ${createPersonaDto.id_municipio_residencia} no encontrado`);
      }
    } else {
      persona.municipio = null;
    }

    if (createPersonaDto.id_profesion !== undefined && createPersonaDto.id_profesion !== null) {
      persona.profesion = await this.netProfesionesRepository.findOne({ where: { idProfesion: createPersonaDto.id_profesion } });
      if (!persona.profesion) {
        throw new Error(`Profesion con código ${createPersonaDto.id_profesion} no encontrado`);
      }
    } else {
      persona.profesion = null;
    }

    return await this.personaRepository.save(persona);
  }


  async createDetallePersona(createDetallePersonaDto: CreateDetallePersonaDto): Promise<NET_DETALLE_PERSONA> {
    const detallePersona = new NET_DETALLE_PERSONA();
    detallePersona.ID_PERSONA = createDetallePersonaDto.idPersona;
    detallePersona.ID_CAUSANTE = createDetallePersonaDto.idPersona;
    detallePersona.ID_TIPO_PERSONA = createDetallePersonaDto.idTipoPersona;
    detallePersona.porcentaje = createDetallePersonaDto.porcentaje;
    detallePersona.eliminado = 0;

    return this.detallePersonaRepository.save(detallePersona);
  }

  async assignCentrosTrabajo(idPersona: number, centrosTrabajoData: any[]): Promise<Net_perf_pers_cent_trab[]> {

    try {
      const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
      if (!persona) {
        throw new Error('Persona no encontrada');
      }

      const asignaciones = [];
      const errores = [];

      for (const centro of centrosTrabajoData) {
        const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo: centro.idCentroTrabajo } });
        if (!centroTrabajo) {
          errores.push(`Centro de trabajo con ID ${centro.idCentroTrabajo} no encontrado.`);
          continue;
        }

        const nuevoPerfil = new Net_perf_pers_cent_trab();
        nuevoPerfil.persona = persona;
        nuevoPerfil.centroTrabajo = centroTrabajo;
        nuevoPerfil.cargo = centro.cargo;
        nuevoPerfil.numero_acuerdo = centro.numeroAcuerdo;
        nuevoPerfil.salario_base = centro.salarioBase;
        nuevoPerfil.fecha_ingreso = centro.fechaIngreso ? moment(centro.fechaIngreso, centro.fechaIngreso.includes('/') ? 'DD/MM/YYYY' : 'YYYY-MM-DD').format('YYYY-MM-DD') : null;
        nuevoPerfil.fecha_egreso = centro.fechaEgreso ? moment(centro.fechaEgreso, centro.fechaEgreso.includes('/') ? 'DD/MM/YYYY' : 'YYYY-MM-DD').format('YYYY-MM-DD') : null;

        if (!nuevoPerfil.fecha_ingreso) {
          errores.push(`La fecha de ingreso es requerida para el centro de trabajo con ID ${centro.idCentroTrabajo}.`);
          continue;
        }

        asignaciones.push(await this.perfPersoCentTrabRepository.save(nuevoPerfil));
      }

      if (errores.length > 0) {
        throw new Error(`Errores en la asignación de centros de trabajo: ${errores.join(' ')}`);
      }

      return asignaciones;
    } catch (error) {
      console.log(error);
      throw new Error('Error en la asignación de centros de trabajo');
    }
  }

  async createAndAssignReferences(idPersona: number, dto: AsignarReferenciasDTO): Promise<Net_Ref_Per_Pers[]> {
    try {
      const persona = await this.personaRepository.findOne({
        where: { id_persona: idPersona }
      });
      if (!persona) {
        throw new Error('Persona no encontrada');
      }

      const resultados = await Promise.all(dto.referencias.map(async referenciaDto => {
        const referencia = this.referenciaPersonalRepository.create(referenciaDto);
        await this.referenciaPersonalRepository.save(referencia);

        const refPerPers = this.refPerPersRepository.create({
          persona: persona,
          referenciaPersonal: referencia
        });

        return this.refPerPersRepository.save(refPerPers);
      }));
      return resultados;

    } catch (error) {
      console.log(error);

    }

  }

  async assignBancosToPersona(idPersona: number, bancosData: CreatePersonaBancoDTO[]): Promise<Net_Persona_Por_Banco[]> {
    try {
      const persona = await this.personaRepository.findOne({
        where: { id_persona: idPersona }
      }
      );

      if (!persona) {
        throw new Error('Persona no encontrada');
      }

      const asignaciones = [];
      for (const bancoData of bancosData) {
        const banco = await this.bancoRepository.findOne({ where: { id_banco: bancoData.idBanco } });
        if (!banco) {
          throw new Error(`Banco con ID ${bancoData.idBanco} no encontrado`);
        }

        const personaBanco = new Net_Persona_Por_Banco();
        personaBanco.persona = persona;
        personaBanco.banco = banco;
        personaBanco.num_cuenta = bancoData.numCuenta;

        asignaciones.push(await this.personaBancoRepository.save(personaBanco));
      }

      return asignaciones;
    } catch (error) {
      console.log(error);
    }
  }

  async createBeneficiario(beneficiarioData: NetPersonaDTO): Promise<Net_Persona> {
    return this.createPersona(beneficiarioData);
  }

  async createDetalleBeneficiario(detalleDto: CreateDetalleBeneficiarioDto): Promise<NET_DETALLE_PERSONA> {
    const detalle = new NET_DETALLE_PERSONA();
    detalle.ID_PERSONA = detalleDto.idPersona;
    detalle.ID_CAUSANTE = detalleDto.idCausante;
    detalle.ID_CAUSANTE_PADRE = detalleDto.idCausantePadre;
    detalle.ID_TIPO_PERSONA = detalleDto.idTipoPersona;
    detalle.porcentaje = detalleDto.porcentaje;
    detalle.eliminado = 0;

    return this.detallePersonaRepository.save(detalle);
  }


  async assignColegiosMagisteriales(idPersona: number, colegiosMagisterialesData: any[]): Promise<Net_Persona_Colegios[]> {
    try {
      const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
      if (!persona) {
        throw new Error('Persona no encontrada');
      }

      const asignaciones = [];
      for (const colegioData of colegiosMagisterialesData) {
        const colegio = await this.netColegiosMagisterialesRepository.findOne({ where: { idColegio: colegioData.idColegio } });
        if (!colegio) {
          throw new Error(`Colegio magisterial con ID ${colegioData.idColegio} no encontrado`);
        }

        const nuevoPersonaColegio = new Net_Persona_Colegios();
        nuevoPersonaColegio.persona = persona;
        nuevoPersonaColegio.colegio = colegio;

        asignaciones.push(await this.netPersonaColegiosRepository.save(nuevoPersonaColegio));
      }
      return asignaciones;
    } catch (error) {
      console.log(error);
    }
  }

  async createBenef(bene: Benef): Promise<Net_Persona> {
    const { detalleBenef, dni, id_pais, id_municipio_residencia, ...personaData } = bene;
    const tipoPersona = await this.tipoPersonaRepository.findOne({
      where: { tipo_persona: "BENEFICIARIO" }
    });
    let persona = await this.personaRepository.findOne({ where: { dni }, relations: ['pais', 'municipio'] });
    if (!persona) {
      const pais = await this.paisRepository.findOne({ where: { id_pais } });
      const municipio = await this.municipioRepository.findOne({ where: { id_municipio: id_municipio_residencia } });
      if (!pais) {
        throw new Error(`País con ID ${id_pais} no encontrado`);
      }
      if (!municipio) {
        throw new Error(`Municipio con ID ${id_municipio_residencia} no encontrado`);
      }
      persona = this.personaRepository.create({
        dni,
        pais,
        municipio,
        ...personaData
      });
      await this.personaRepository.save(persona);
    }
    const detalle = this.detallePersonaRepository.create({
      ...detalleBenef,
      persona,
      tipoPersona
    });
    await this.detallePersonaRepository.save(detalle);
    return persona;
  }



  async updateBeneficario(id: number, updatePersonaDto: UpdateBeneficiarioDto): Promise<Net_Persona> {
    console.log(updatePersonaDto);


    const persona = await this.personaRepository.findOne({
      where: { id_persona: id },
      relations: ['detallePersona'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
    const detallePersona = await this.detallePersonaRepository.findOne({
      where: { ID_PERSONA: id },
    });

    if (!detallePersona) {
      throw new NotFoundException(`Detalle persona with ID ${id} not found`);
    }
    if (updatePersonaDto.fecha_nacimiento) {
      console.log(updatePersonaDto.fecha_nacimiento)
    }
    Object.assign(persona, updatePersonaDto);
    if (updatePersonaDto.eliminado) {
      detallePersona.eliminado = 1
    }
    if (updatePersonaDto.id_estado_persona) {
      const estadoP = await this.estadoPersonaRepository.findOne({
        where: { codigo: updatePersonaDto.id_estado_persona }
      });
      detallePersona.estadoAfiliacion = estadoP
    }
    if (updatePersonaDto.id_municipio_residencia) {
      persona.municipio = await this.municipioRepository.findOne({ where: { id_municipio: updatePersonaDto.id_municipio_residencia } });
    }
    if (updatePersonaDto.id_pais) {
      persona.pais = await this.paisRepository.findOne({ where: { id_pais: updatePersonaDto.id_pais } });
    }
    if (updatePersonaDto.id_pais) {
      persona.pais = await this.paisRepository.findOne({ where: { id_pais: updatePersonaDto.id_pais } });
    }

    await this.detallePersonaRepository.save(detallePersona);
    return this.personaRepository.save(persona);
  }



  async updateSalarioBase(dni: string, idCentroTrabajo: number, salarioBase: number): Promise<void> {

    const perfil = await this.perfPersoCentTrabRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.persona', 'persona')
      .where('persona.DNI = :dni', { dni })
      .andWhere('perfil.centroTrabajo = :idCentroTrabajo', { idCentroTrabajo })
      .getOne();

    if (!perfil) {
      throw new NotFoundException(`El perfil con DNI ${dni} y centro de trabajo ID ${idCentroTrabajo} no fue encontrado.`);
    }

    perfil.salario_base = salarioBase;
    await this.perfPersoCentTrabRepository.save(perfil);
  }

  async createRefPers(data: any, dnireferente: any) {
    try {
      // Buscar la persona referente
      const personaReferente = await this.personaRepository.findOne({
        where: { dni: dnireferente.dnireferente },
      });

      // Verificar si se encontró la persona referente
      if (!personaReferente) {
        throw new Error('No se encontró la persona referente.');
      }

      const refPersonales = this.referenciaPersonalRepository.create(data);
      const savedRefPersonales = await this.referenciaPersonalRepository.save(refPersonales);

      const idsRefPersonal = savedRefPersonales.map(objeto => objeto.id_ref_personal);
      const idPersona = personaReferente.id_persona;
      const arregloFinal = idsRefPersonal.map(id_ref_personal => ({ id_ref_personal, idPersona }));

      const arregloRenombrado = arregloFinal.map(objeto => ({
        afiliado: objeto.idPersona,
        referenciaPersonal: objeto.id_ref_personal
      }));

      const asigPersonales = this.refPerPersRepository.create(arregloRenombrado);
      const savedasigPersonales = await this.refPerPersRepository.save(asigPersonales);

      return savedasigPersonales;
    } catch (error) {
      // Manejar errores
      console.error('Error en createRefPers:', error);
      throw error; // Re-lanzar el error para que sea manejado en un nivel superior si es necesario
    }
  }

  async createCentrosTrabPersona(data: any, dnireferente: any) {
    try {
      // Buscar la persona referente
      const personaReferente = await this.personaRepository.findOne({
        where: { dni: dnireferente.dnireferente },
      });

      // Verificar si se encontró la persona referente
      if (!personaReferente) {
        throw new Error('No se encontró la persona referente.');
      }

      const arregloFinal = data.map((item) => ({
        centroTrabajo: item.id_centro_trabajo,
        afiliado: personaReferente.id_persona,
        cargo: item.cargo,
        numero_acuerdo: item.numero_acuerdo,
        salario_base: item.salario_base,
        fecha_ingreso: new Date(item.fecha_ingreso),
      }));

      const perfCentrTrab = this.perfPersoCentTrabRepository.create(arregloFinal);
      const savedperfCentrTrab = await this.perfPersoCentTrabRepository.save(perfCentrTrab);
      return savedperfCentrTrab;

      /* const centrosTrabajo = this.perfAfiliCentTrabRepository.create(data)
      await this.perfAfiliCentTrabRepository.save(centrosTrabajo)
      return centrosTrabajo; */
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    const afiliado = this.personaRepository.find()
    return afiliado;
  }

  async getAllPersonaPBanco(dni: string) {
    try {
      const personas = await this.personaRepository.findOne({
        where: { dni: dni },
        relations: ['personasPorBanco', 'personasPorBanco.banco'], // Asegúrate de cargar la relación
      });
      return personas.personasPorBanco;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllColMagPPersona(dni: string) {
    try {
      const personas = await this.personaRepository.findOne({
        where: { dni: dni },
        relations: ['colegiosMagisteriales', 'colegiosMagisteriales.colegio'], // Asegúrate de cargar la relación
      });
      return personas.colegiosMagisteriales;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(term: string) {
    const persona = await this.personaRepository.findOne({
      where: { dni: term },
      relations: [
        'detallePersona',
        'detallePersona.tipoPersona',
        'detallePersona.estadoAfiliacion',
        'pais',
        'municipio.departamento',
        'tipoIdentificacion',
        'profesion',
        'municipio',
        'municipio_defuncion',
        'municipio_defuncion.departamento',
      ],
    });

    if (!persona) {
      throw new NotFoundException(`Afiliado con DNI ${term} no existe`);
    }

    const detallePersona = persona.detallePersona.find(detalle => detalle.tipoPersona.tipo_persona === 'AFILIADO');

    if (!detallePersona) {
      throw new NotFoundException(`Afiliado con DNI ${term} no existe`);
    }

    const result = {
      DNI: persona.dni,
      ID_PERSONA: persona.id_persona,
      PRIMER_NOMBRE: persona.primer_nombre,
      SEGUNDO_NOMBRE: persona.segundo_nombre,
      TERCER_NOMBRE: persona.tercer_nombre,
      PRIMER_APELLIDO: persona.primer_apellido,
      SEGUNDO_APELLIDO: persona.segundo_apellido,
      GENERO: persona.genero,
      SEXO: persona.sexo,
      CANTIDAD_DEPENDIENTES: persona.cantidad_dependientes,
      CANTIDAD_HIJOS: persona.cantidad_hijos,
      REPRESENTACION: persona.representacion,
      DIRECCION_RESIDENCIA: persona.direccion_residencia,
      RTN: persona.rtn,
      FECHA_NACIMIENTO: persona.fecha_nacimiento,
      FOTO_PERFIL: persona.foto_perfil ? Buffer.from(persona.foto_perfil).toString('base64') : null,
      DESCRIPCION: persona.profesion?.descripcion,
      ID_PROFESION: persona.profesion?.idProfesion,
      TELEFONO_1: persona.telefono_1,
      TELEFONO_2: persona.telefono_2,
      CORREO_1: persona.correo_1,
      CORREO_2: persona.correo_2,
      ESTADO_CIVIL: persona.estado_civil,
      ESTADO: detallePersona.eliminado,
      ID_PAIS: persona.pais?.id_pais,
      id_departamento_residencia: persona.municipio?.departamento.id_departamento,
      ID_IDENTIFICACION: persona.tipoIdentificacion?.id_identificacion,
      tipo_defuncion: persona.tipo_defuncion,
      fecha_defuncion: persona.fecha_defuncion,
      motivo_fallecimiento: persona.motivo_fallecimiento,
      certificado_defuncion: persona?.certificado_defuncion,
      ID_MUNICIPIO: persona.municipio?.id_municipio,
      ID_MUNICIPIO_DEFUNCION: persona?.municipio_defuncion?.id_municipio!,
      ID_DEPARTAMENTO_DEFUNCION: persona?.municipio_defuncion?.departamento?.id_departamento!,
      fallecido: persona.fallecido,
      estadoAfiliacion: persona.detallePersona[0]?.estadoAfiliacion?.codigo,
    };


    return result;
  }

  async findOnePersona(term: string) {
    let persona: Net_Persona | null = null;

    if (isUUID(term)) {
      persona = await this.personaRepository.findOne({
        where: { dni: term },
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
        where: { dni: term },
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
          throw new NotFoundException(`Afiliado con DNI ${term} no existe`);
        }

        return {
          DNI: persona.dni,
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
          ID_PROFESION: persona.profesion?.idProfesion,
          TELEFONO_1: persona.telefono_1,
          ESTADO_CIVIL: persona.estado_civil,
          ESTADO: detallePersona?.estadoAfiliacion?.Descripcion!,
        };
      }
    }

    if (!persona) {
      throw new NotFoundException(`Afiliado con DNI ${term} no existe`);
    }
    const detallePersona = persona.detallePersona.find(
      (detalle) => detalle.tipoPersona.tipo_persona === 'AFILIADO',
    );

    if (!detallePersona) {
      throw new NotFoundException(`Afiliado con DNI ${term} no existe`);
    }

    return {
      DNI: persona.dni,
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
      ID_PROFESION: persona.profesion?.idProfesion,
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
  async obtenerBenDeAfil(dniAfil: string): Promise<any> {

    try {
      const query = `
      SELECT DISTINCT
      "detA"."ID_PERSONA"
      FROM NET_PERSONA "Afil"
      FULL OUTER JOIN
        NET_DETALLE_PERSONA "detA" ON "Afil"."ID_PERSONA" = "detA"."ID_PERSONA" 
      INNER JOIN
      NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
      INNER JOIN
      NET_ESTADO_AFILIACION "estadoPers" ON "detA"."ID_ESTADO_AFILIACION" = "estadoPers"."CODIGO"
    WHERE
      "Afil"."DNI" = '${dniAfil}' AND 
      "estadoPers"."DESCRIPCION" = 'FALLECIDO'  AND
      "tipoP"."TIPO_PERSONA" = 'AFILIADO'
    `;

      const beneficios = await this.entityManager.query(query);

      const query1 = `
        SELECT 
        "Afil"."ID_PERSONA",
        "Afil"."DNI",
        "Afil"."PRIMER_NOMBRE",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."TERCER_NOMBRE",
        "Afil"."PRIMER_APELLIDO",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."GENERO",
        "detA"."PORCENTAJE",
        "tipoP"."TIPO_PERSONA"
      FROM
          "NET_DETALLE_PERSONA" "detA" INNER JOIN 
          "NET_PERSONA" "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
          INNER JOIN
        NET_TIPO_PERSONA "tipoP" ON "Afil"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
      WHERE 
          "detA"."ID_CAUSANTE_PADRE" = ${beneficios[0].ID_PERSONA} AND 
          "tipoP"."TIPO_PERSONA" = 'BENEFICIARIO' 
        `;
      const beneficios2 = await this.entityManager.query(query1);

      return this.normalizarDatos(beneficios2);
    } catch (error) {
      this.logger.error(`Error al consultar beneficios: ${error.message}`);
      throw new Error(`Error al consultar beneficios: ${error.message}`);
    }
  }

  async getAllBenDeAfil(dniAfil: string): Promise<any> {
    try {
      const query = `
        SELECT DISTINCT
        "detA"."ID_PERSONA"
        FROM NET_PERSONA "Afil"
        FULL OUTER JOIN
          NET_DETALLE_PERSONA "detA" ON "Afil"."ID_PERSONA" = "detA"."ID_PERSONA" 
        INNER JOIN
        NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
        INNER JOIN
        NET_ESTADO_AFILIACION "estadoPers" ON "detA"."ID_ESTADO_AFILIACION" = "estadoPers"."CODIGO"
      WHERE
        "Afil"."DNI" = '${dniAfil}' AND
        "tipoP"."TIPO_PERSONA" = 'AFILIADO'
      `;


      const beneficios = await this.entityManager.query(query);

      if (!beneficios || beneficios.length === 0) {
        throw new Error(`No se encontraron beneficios para el DNI: ${dniAfil}`);
      }

      const query1 = `
        SELECT 
        "detA"."ID_PERSONA",
        "Afil"."DNI",
        "Afil"."PRIMER_NOMBRE" AS "primerNombre",
        "Afil"."SEGUNDO_NOMBRE" AS "segundoNombre",
        "Afil"."TERCER_NOMBRE" AS "tercerNombre",
        "Afil"."PRIMER_APELLIDO" AS "primerApellido",
        "Afil"."SEGUNDO_APELLIDO" AS "segundoApellido",
        "Afil"."GENERO" AS "genero",
        "Afil"."SEXO" AS "sexo",
        "Afil"."FALLECIDO" AS "FALLECIDO",
        "Afil"."CANTIDAD_DEPENDIENTES" AS "cantidadDependientes",
        "Afil"."REPRESENTACION" AS "representacion",
        "Afil"."TELEFONO_1" AS "telefono1",
        "Afil"."FECHA_NACIMIENTO" AS "fechaNacimiento",
        "Afil"."DIRECCION_RESIDENCIA" AS "direccionResidencia",
        "Afil"."ID_PAIS_NACIONALIDAD" AS "idPaisNacionalidad",
        "Afil"."ID_MUNICIPIO_RESIDENCIA" AS "idMunicipioResidencia",
        "detA"."ID_ESTADO_AFILIACION" AS "idEstadoPersona",
        "estadoPers"."DESCRIPCION" AS "estadoDescripcion",  -- Descripción del estado
        "detA"."PORCENTAJE" AS "porcentaje",
        "tipoP"."TIPO_PERSONA" AS "tipoPersona"
        FROM
          "NET_DETALLE_PERSONA" "detA"
        LEFT JOIN 
          "NET_PERSONA" "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
        LEFT JOIN
          NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_PERSONA" = "detA"."ID_TIPO_PERSONA"
        LEFT JOIN
          NET_ESTADO_AFILIACION "estadoPers" ON "detA"."ID_ESTADO_AFILIACION" = "estadoPers"."CODIGO"
        WHERE 
          "detA"."ID_CAUSANTE_PADRE" = ${beneficios[0].ID_PERSONA} AND 
          "tipoP"."TIPO_PERSONA" = 'BENEFICIARIO'
      `;


      const beneficios2 = await this.entityManager.query(query1);
      return beneficios2;
    } catch (error) {
      this.logger.error(`Error al consultar beneficios: ${error.message}`);
      throw new Error(`Error al consultar beneficios: ${error.message}`);
    }
  }


  normalizarDatos(data: any): PersonaResponse[] {
    const newList: PersonaResponse[] = []
    data.map((el: any) => {
      const newPersona: PersonaResponse = {
        id_persona: el.ID_PERSONA,
        porcentaje: el.PORCENTAJE,
        tipo_persona: el.TIPO_PERSONA,
        dni: el.DNI,
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
      }
      newList.push(newPersona)
    })
    return newList;
  }

  async findByDni(dni: string): Promise<Net_Persona | string> {
    const persona = await this.personaRepository.findOne({ where: { dni }, relations: ['estadoPersona'], },);

    if (!persona) {
      throw new NotFoundException(`Afiliado with DNI ${dni} not found`);
    }
    /* const detallePersona = await this.personaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      
    });

    if (!detallePersona || !detallePersona.estadoPersona) {
      throw new NotFoundException(`Estado for persona with DNI ${dni} not found`);
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

  async buscarPersonaYMovimientosPorDNI(dni: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { dni },
      relations: ['cuentas', 'cuentas.movimientos', 'estadoPersona'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con DNI ${dni} no encontrada`);
    }
    /* const detallePersona = await this.detallePersonaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      relations: ['estadoPersona'],
    });

    if (!detallePersona || !detallePersona.estadoPersona) {
      throw new NotFoundException(`Estado para persona con DNI ${dni} no encontrado`);
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

  async buscarCuentasPorDNI(dni: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { dni },
      relations: ['cuentas', 'cuentas.movimientos', 'cuentas.tipoCuenta', 'estadoPersona'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con DNI ${dni} no encontrada`);
    }
    /* const detallePersona = await this.detallePersonaRepository.findOne({
      where: { ID_PERSONA: persona.id_persona },
      relations: ['estadoPersona'],
    });

    if (!detallePersona || !detallePersona.estadoPersona) {
      throw new NotFoundException(`Estado para persona con DNI ${dni} no encontrado`);
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

  async getAllReferenciasPersonales(dni: string): Promise<any> {
    const personas = await this.personaRepository.find({
      where: { dni: dni },
      relations: ["referenciasPersonalPersona", "referenciasPersonalPersona.referenciaPersonal"]
    });
    if (personas.length === 0) {
      throw new NotFoundException(`No se encontró ninguna referencia personal para la persona con el DNI ${dni}`);
    }
    const referencias = personas[0].referenciasPersonalPersona.map(relacion => relacion.referenciaPersonal);
    return referencias;
  }


  async getAllPerfCentroTrabajo(dni: string): Promise<any[]> {
    const persona = await this.personaRepository.createQueryBuilder('persona')
      .leftJoinAndSelect('persona.perfPersCentTrabs', 'perfPersCentTrabs', 'perfPersCentTrabs.estado = :estado', { estado: 'ACTIVO' })
      .leftJoinAndSelect('perfPersCentTrabs.centroTrabajo', 'centroTrabajo')
      .where('persona.dni = :dni', { dni })
      .getOne();
    if (!persona || !persona.perfPersCentTrabs.length) {
      return [];
    }
    return persona.perfPersCentTrabs;
  }


  async updateReferenciaPersonal(id: number, updateDto: UpdateReferenciaPersonalDTO): Promise<Net_ReferenciaPersonal> {
    const refPersonal = await this.referenciaPersonalRepository.preload({
      id_ref_personal: id,
      ...updateDto
    });
    if (!refPersonal) {
      throw new NotFoundException(`La referencia personal con ID ${id} no fue encontrada`);
    }
    const temp = this.referenciaPersonalRepository.save(refPersonal);
    return temp
  }

  async inactivarPersona(idPersona: number, idCausante: number): Promise<void> {
    const estadoInactivo = await this.estadoPersonaRepository.findOne({ where: { Descripcion: 'INACTIVO' } });
    if (!estadoInactivo) {
      throw new NotFoundException('Estado INACTIVO no encontrado');
    }
    const result = await this.detallePersonaRepository.update(
      { ID_PERSONA: idPersona, ID_CAUSANTE: idCausante },
      { eliminado: 1 }
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Registro con ID_PERSONA ${idPersona} y ID_CAUSANTE ${idCausante} no encontrado`);
    }
  }

  async deleteReferenciaPersonal(id: number): Promise<void> {
    const referencia = await this.referenciaPersonalRepository.findOne({ where: { id_ref_personal: id } });
    if (!referencia) {
      throw new NotFoundException(`La referencia personal con ID ${id} no fue encontrada`);
    }
    await this.referenciaPersonalRepository.remove(referencia);
  }

  async eliminarColegioMagisterialPersona(id: number): Promise<void> {
    const referencia = await this.netPersonaColegiosRepository.findOne({ where: { id: id } });
    if (!referencia) {
      throw new NotFoundException(`El colegio magisterial para la persona no fue encontrado`);
    }
    await this.netPersonaColegiosRepository.remove(referencia);
  }

  async updateDatosGenerales(idPersona: number, datosGenerales: any): Promise<any> {
    const estadoP = await this.estadoPersonaRepository.findOne({ where: { Descripcion: datosGenerales.estado } });
    try {
      const afiliado = await this.personaRepository.preload({
        id_persona: idPersona,
        tipo_defuncion: datosGenerales.tipo_defuncion,
        motivo_fallecimiento: datosGenerales.motivo_fallecimiento,
        estadoPersona: estadoP.codigo,
        municipio_defuncion: datosGenerales.id_municipio_defuncion,
        certificado_defuncion: datosGenerales.certificado_defuncion,
        ...datosGenerales
      });
      if (!afiliado) throw new NotFoundException(`la persona con: ${idPersona} no se ha encontrado`);

      await this.personaRepository.save(afiliado);

      return afiliado;
    } catch (error) {
      this.handleException(error); // Asegúrate de tener un método para manejar las excepciones
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

    perfil1.forEach((val) => val.estado = 'INACTIVO');

    perfil.estado = 'ACTIVO';

    await this.BancosToPersonaRepository.save(perfil1);
    await this.BancosToPersonaRepository.save(perfil);
  }


  async getAllEstados(): Promise<Net_Estado_Persona[]> {
    return this.estadoPersonaRepository.find();
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