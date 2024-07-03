import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { NetPersonaDTO, PersonaResponse } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Connection, EntityManager, Repository, getConnection } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { validate as isUUID } from 'uuid';
import { net_persona } from './entities/net_persona.entity';
import { Net_Ref_Per_Pers } from './entities/net_ref-per-persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';
import { net_detalle_persona } from './entities/net_detalle_persona.entity';
import { CreateDetallePersonaDto } from './dto/create-detalle.dto';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
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
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { net_estado_afiliacion } from './entities/net_estado_afiliacion.entity';
@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(net_persona)
    private readonly personaRepository: Repository<net_persona>,
    @InjectRepository(Net_perf_pers_cent_trab)
    private readonly perfPersoCentTrabRepository: Repository<Net_perf_pers_cent_trab>,

    @InjectRepository(Net_Ref_Per_Pers)
    private refPerPersRepository: Repository<Net_Ref_Per_Pers>,

    @InjectRepository(Net_Tipo_Persona)
    private tipoPersonaRepository: Repository<Net_Tipo_Persona>,


    @InjectRepository(net_detalle_persona)
    private detallePersonaRepository: Repository<net_detalle_persona>,

    @InjectRepository(Net_Tipo_Identificacion)
    private tipoIdentificacionRepository: Repository<Net_Tipo_Identificacion>,

    @InjectRepository(Net_Pais)
    private paisRepository: Repository<Net_Pais>,

    @InjectRepository(Net_Municipio)
    private municipioRepository: Repository<Net_Municipio>,

    @InjectRepository(net_estado_afiliacion)
    private estadoAfiliacionRepository: Repository<net_estado_afiliacion>,

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

  async getCausanteByDniBeneficiario(n_identificacion: string): Promise<net_persona> {
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

    // Obtener el detalle de la persona del beneficiario
    const detalle = beneficiario.detallePersona.find(d => d.ID_TIPO_PERSONA === tipoPersona.id_tipo_persona);

    if (!detalle) {
      throw new Error('Detalle de beneficiario no encontrado');
    }

    // Obtener el causante usando el ID_CAUSANTE del detalle del beneficiario
    const causante = await this.personaRepository.findOne({ where: { id_persona: detalle.ID_CAUSANTE } });

    if (!causante) {
      throw new Error('Causante no encontrado');
    }

    return causante;
  }

  async createPersona(createPersonaDto: NetPersonaDTO): Promise<net_persona> {
    const persona = new net_persona();
    Object.assign(persona, createPersonaDto);

    // Convertir y formatear fechas
    if (createPersonaDto.fecha_nacimiento) {
      persona.fecha_nacimiento = this.formatDateToYYYYMMDD(createPersonaDto.fecha_nacimiento);
    }
    if (createPersonaDto.fecha_vencimiento_ident) {
      persona.fecha_vencimiento_ident = this.formatDateToYYYYMMDD(createPersonaDto.fecha_vencimiento_ident);
    }

    // Asignar otros campos relacionados
    if (createPersonaDto.id_tipo_identificacion !== undefined && createPersonaDto.id_tipo_identificacion !== null) {
      persona.tipoIdentificacion = await this.tipoIdentificacionRepository.findOne({ where: { id_identificacion: createPersonaDto.id_tipo_identificacion } });
    }
    if (createPersonaDto.id_pais !== undefined && createPersonaDto.id_pais !== null) {
      persona.pais = await this.paisRepository.findOne({ where: { id_pais: createPersonaDto.id_pais } });
    }
    if (createPersonaDto.id_municipio_residencia !== undefined && createPersonaDto.id_municipio_residencia !== null) {
      persona.municipio = await this.municipioRepository.findOne({ where: { id_municipio: createPersonaDto.id_municipio_residencia } });
    }
    if (createPersonaDto.id_profesion !== undefined && createPersonaDto.id_profesion !== null) {
      persona.profesion = await this.netProfesionesRepository.findOne({ where: { idProfesion: createPersonaDto.id_profesion } });
    }

    return await this.personaRepository.save(persona);
  }

  async createDetallePersona(createDetallePersonaDto: CreateDetallePersonaDto): Promise<net_detalle_persona> {
    const detallePersona = new net_detalle_persona();
    detallePersona.ID_PERSONA = createDetallePersonaDto.idPersona;
    detallePersona.ID_CAUSANTE = createDetallePersonaDto.idPersona;
    detallePersona.ID_TIPO_PERSONA = createDetallePersonaDto.idTipoPersona;
    detallePersona.porcentaje = createDetallePersonaDto.porcentaje;
    detallePersona.eliminado = "NO";

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

  async createAndAssignReferences(idPersona: number, dto: AsignarReferenciasDTO) {
    /* try {
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
 */
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

  async createBeneficiario(beneficiarioData: NetPersonaDTO): Promise<net_persona> {
    return this.createPersona(beneficiarioData);
  }

  async createDetalleBeneficiario(detalleDto: CreateDetalleBeneficiarioDto): Promise<net_detalle_persona> {
    const detalle = new net_detalle_persona();
    detalle.ID_PERSONA = detalleDto.idPersona;
    detalle.ID_CAUSANTE = detalleDto.idCausante;
    detalle.ID_CAUSANTE_PADRE = detalleDto.idCausantePadre;
    detalle.ID_TIPO_PERSONA = detalleDto.idTipoPersona;
    detalle.porcentaje = detalleDto.porcentaje;
    detalle.eliminado = "NO";
    detalle.ID_DETALLE_PERSONA = detalleDto.idDetallePersona;

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



  formatDateToYYYYMMDD(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  async createBenef(bene: Benef): Promise<net_persona> {
    const { detalleBenef, n_identificacion, id_pais, id_municipio_residencia, ...personaData } = bene;
    const tipoPersona = await this.tipoPersonaRepository.findOne({
      where: { tipo_persona: "BENEFICIARIO" }
    });
    let persona = await this.personaRepository.findOne({ where: { n_identificacion }, relations: ['pais', 'municipio'] });
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
        n_identificacion,
        pais,
        municipio,
        ...personaData
      });
      await this.personaRepository.save(persona);
    }
    /* interface DetallePersonaDTO {
      p_id_detalle_persona: number;
      id_persona: number;
      id_causante: number;
      porcentaje: number;
      eliminado: string;
      id_estado_afiliacion: number;
      id_tipo_persona: number;
      id_causante_padre: number;
    }

    const detalles: DetallePersonaDTO[] = [{
      p_id_detalle_persona: 1,
      id_persona:1,
      id_causante:1,
      porcentaje:100,
      eliminado:"NO",
      id_estado_afiliacion:1,
      id_tipo_persona:1,
      id_causante_padre:1,
    }]

    const t_detalle_persona_tab = detalles.map((detalle) => ({
      p_id_detalle_persona: detalle.p_id_detalle_persona,
      id_persona: detalle.id_persona,
      id_causante: detalle.id_causante,
      porcentaje: detalle.porcentaje,
      eliminado: detalle.eliminado,
      id_estado_afiliacion: detalle.id_estado_afiliacion,
      id_tipo_persona: detalle.id_tipo_persona,
      id_causante_padre: detalle.id_causante_padre,
    }));
    
    const connection = getConnection();
    // Llamar al procedimiento almacenado
    await connection.query(
      `BEGIN insertar_detalle_persona_multiple(:p_detalles); END;`,
      { p_detalles: t_detalle_persona_tab }
    ); */

    const detalle = this.detallePersonaRepository.create({
      ...detalleBenef,
      persona,
      tipoPersona
    });
    await this.detallePersonaRepository.save(detalle);
    return persona;
  }

  async updateBeneficario(id: number, updatePersonaDto: UpdateBeneficiarioDto): Promise<net_persona> {
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
      updatePersonaDto.fecha_nacimiento = this.formatDateToYYYYMMDD(updatePersonaDto.fecha_nacimiento);
    }

    Object.assign(persona, updatePersonaDto);

    if (updatePersonaDto.eliminado) {
      detallePersona.eliminado = "SI";
    }

    if (updatePersonaDto.id_estado_persona) {
      const estadoP = await this.estadoAfiliacionRepository.findOne({
        where: { codigo: updatePersonaDto.id_estado_persona }
      });
      detallePersona.estadoAfiliacion = estadoP;
    }

    if (updatePersonaDto.id_municipio_residencia) {
      persona.municipio = await this.municipioRepository.findOne({ where: { id_municipio: updatePersonaDto.id_municipio_residencia } });
    }

    if (updatePersonaDto.id_pais) {
      persona.pais = await this.paisRepository.findOne({ where: { id_pais: updatePersonaDto.id_pais } });
    }

    await this.detallePersonaRepository.save(detallePersona);
    return this.personaRepository.save(persona);
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

  async createRefPers(data: any, n_identificacion_referente: any) {
    /* try {
      // Buscar la persona referente
      const personaReferente = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacion_referente.n_identificacion_referente },
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
    } */
  }

  async createCentrosTrabPersona(data: any, n_identificacion_referente: any) {
    try {
      // Buscar la persona referente
      const personaReferente = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacion_referente.n_identificacion_referente },
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

  async getAllPersonaPBanco(n_identificacion: string) {
    try {
      const personas = await this.personaRepository.findOne({
        where: { n_identificacion: n_identificacion },
        relations: ['personasPorBanco', 'personasPorBanco.banco'], // Asegúrate de cargar la relación
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
        relations: ['colegiosMagisteriales', 'colegiosMagisteriales.colegio'], // Asegúrate de cargar la relación
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
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
    }

    /* const detallePersona = persona.detallePersona.find(detalle => detalle.tipoPersona.tipo_persona === 'AFILIADO');

    if (!detallePersona) {
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
    } */

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
      ID_PAIS: persona.pais?.id_pais,
      id_departamento_residencia: persona.municipio?.departamento.id_departamento,
      ID_IDENTIFICACION: persona.tipoIdentificacion?.id_identificacion,
      tipo_defuncion: persona.tipo_defuncion,
      fecha_defuncion: persona.fecha_defuncion,
      fecha_vencimiento_ident: persona.fecha_vencimiento_ident,
      certificado_defuncion: persona?.certificado_defuncion,
      ID_MUNICIPIO: persona.municipio?.id_municipio,
      ID_MUNICIPIO_DEFUNCION: persona?.municipio_defuncion?.id_municipio!,
      ID_DEPARTAMENTO_DEFUNCION: persona?.municipio_defuncion?.departamento?.id_departamento!,
      fallecido: persona.fallecido,
      estadoAfiliacion: persona.detallePersona[0]?.estadoAfiliacion?.codigo,
      /* CANTIDAD_DEPENDIENTES: persona.cantidad_dependientes, */
      //ESTADO: detallePersona.eliminado,
    };


    return result;
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
          ID_PROFESION: persona.profesion?.idProfesion,
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
      "estadoPers"."DESCRIPCION" = 'FALLECIDO'  AND
      "tipoP"."TIPO_PERSONA" = 'AFILIADO'
    `;

      const beneficios = await this.entityManager.query(query);

      const query1 = `
        SELECT 
        "Afil"."ID_PERSONA",
        "Afil"."N_IDENTIFICACION",
        "Afil"."PRIMER_NOMBRE",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."TERCER_NOMBRE",
        "Afil"."PRIMER_APELLIDO",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."GENERO",
        "detA"."PORCENTAJE",
        "tipoP"."TIPO_PERSONA"
      FROM
          "net_detalle_persona" "detA" INNER JOIN 
          "net_persona" "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
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
          ID_CAUSANTE_PADRE: afiliado.id_persona
        },
        relations: ['persona', 'tipoPersona', 'estadoAfiliacion'],
      });
      const beneficiariosFormatted = beneficiarios.map(beneficiario => ({
        idPersona: beneficiario.ID_PERSONA,
        nIdentificacion: beneficiario.persona?.n_identificacion || null,
        primerNombre: beneficiario.persona?.primer_nombre || null,
        segundoNombre: beneficiario.persona?.segundo_nombre || null,
        tercerNombre: beneficiario.persona?.tercer_nombre || null,
        primerApellido: beneficiario.persona?.primer_apellido || null,
        segundoApellido: beneficiario.persona?.segundo_apellido || null,
        genero: beneficiario.persona?.genero || null,
        sexo: beneficiario.persona?.sexo || null,
        fallecido: beneficiario.persona?.fallecido || null,
        /* cantidadDependientes: beneficiario.persona?.cantidad_dependientes || null, */
        representacion: beneficiario.persona?.representacion || null,
        telefono1: beneficiario.persona?.telefono_1 || null,
        fechaNacimiento: beneficiario.persona?.fecha_nacimiento || null,
        fechaVencimientoIdent: beneficiario.persona?.fecha_vencimiento_ident || null,
        direccionResidencia: beneficiario.persona?.direccion_residencia || null,
        idPaisNacionalidad: beneficiario.persona?.pais?.id_pais || null,
        idMunicipioResidencia: beneficiario.persona?.municipio?.id_municipio || null,
        idEstadoPersona: beneficiario.estadoAfiliacion?.codigo || null,
        estadoDescripcion: beneficiario.estadoAfiliacion?.nombre_estado || null,
        porcentaje: beneficiario.porcentaje || null,
        tipoPersona: beneficiario.tipoPersona?.tipo_persona || null,
      }));

      return beneficiariosFormatted;
    } catch (error) {
      this.logger.error(`Error al consultar beneficios: ${error.message}`);
      throw new Error(`Error al consultar beneficios: ${error.message}`);
    }
  }


  normalizarDatos(data: any): PersonaResponse[] {
    console.log(data);

    const newList: PersonaResponse[] = []
    data.map((el: any) => {
      const newPersona: PersonaResponse = {
        id_persona: el.ID_PERSONA,
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
        fecha_vencimiento_ident: el.fecha_vencimiento_ident,
        archivo_identificacion: el.ARCHIVO_IDENTIFICACION,
        tipoIdentificacion: el.TIPOIDENTIFICACION,
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
        .leftJoinAndSelect('persona.perfPersCentTrabs', 'perfPersCentTrabs', 'perfPersCentTrabs.estado = :estado', { estado: 'ACTIVO' })
        .leftJoinAndSelect('perfPersCentTrabs.centroTrabajo', 'centroTrabajo')
        .where('persona.n_identificacion = :n_identificacion', { n_identificacion })
        .getOne();
      if (!persona || !persona.perfPersCentTrabs.length) {
        return [];
      }
      return persona.perfPersCentTrabs;
    } catch (error) {
      console.log(error);

    }
  }

  async inactivarPersona(idPersona: number, idCausante: number): Promise<void> {
    const estadoInactivo = await this.estadoAfiliacionRepository.findOne({ where: { Descripcion: 'INACTIVO' } });
    if (!estadoInactivo) {
      throw new NotFoundException('Estado INACTIVO no encontrado');
    }
    const result = await this.detallePersonaRepository.update(
      { ID_PERSONA: idPersona, ID_CAUSANTE: idCausante },
      { eliminado: "SI" }
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

  async updateDatosGenerales(idPersona: number, datosGenerales: any): Promise<any> {
    const estadoP = await this.estadoAfiliacionRepository.findOne({ where: { Descripcion: datosGenerales.estado } });
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