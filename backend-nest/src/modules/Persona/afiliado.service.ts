import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { NetPersonaDTO, PersonaResponse } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { validate as isUUID } from 'uuid';
import { Net_Persona } from './entities/Net_Persona.entity';
import { Net_ReferenciaPersonal } from './entities/referencia-personal.entity';
import { Net_Ref_Per_Pers } from './entities/net_ref-Per-Persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';
import { NET_DETALLE_PERSONA } from './entities/Net_detalle_persona.entity';
import { CreateDetallePersonaDto } from './dto/create-detalle.dto';
import { Net_Tipo_Persona } from './entities/net_tipo_persona.entity';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { Net_Estado_Persona } from './entities/net_estado_persona.entity';
import { AsignarReferenciasDTO } from './dto/asignarReferencia.dto';
import { CreatePersonaBancoDTO } from './dto/create-persona-banco.dto';
import { CreateDetalleBeneficiarioDto } from './dto/create-detalle-beneficiario-dto';

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

  ) { }
  

  async create(createPersonaDto: NetPersonaDTO): Promise<Net_Persona> {
    const persona = new Net_Persona();
    Object.assign(persona, createPersonaDto);
    if (createPersonaDto.fecha_nacimiento) {
      if (typeof createPersonaDto.fecha_nacimiento === 'string') {
        const fechaNacimiento = new Date(createPersonaDto.fecha_nacimiento);
        if (!isNaN(fechaNacimiento.getTime())) {
          persona.fecha_nacimiento = fechaNacimiento.toISOString().substring(0, 10);
        } else {
          throw new Error('Fecha de nacimiento no válida');
        }
      } else if (createPersonaDto.fecha_nacimiento instanceof Date) {
        persona.fecha_nacimiento = createPersonaDto.fecha_nacimiento.toISOString().substring(0, 10);
      } else {
        throw new Error('Fecha de nacimiento no es una cadena o instancia de Date');
      }
    }

    persona.tipoIdentificacion = await this.tipoIdentificacionRepository.findOne({ where: { id_identificacion: createPersonaDto.id_tipo_identificacion } });
    if (!persona.tipoIdentificacion) {
        throw new Error(`Tipo de identificación con ID ${createPersonaDto.id_tipo_identificacion} no encontrado`);
    }

    persona.pais = await this.paisRepository.findOne({ where: { id_pais: createPersonaDto.id_pais } });
    if (!persona.pais) {
        throw new Error(`País con ID ${createPersonaDto.id_pais} no encontrado`);
    }

    persona.municipio = await this.municipioRepository.findOne({ where: { id_municipio: createPersonaDto.id_municipio_residencia } });
    if (!persona.municipio) {
        throw new Error(`Municipio con ID ${createPersonaDto.id_municipio_residencia} no encontrado`);
    }

    persona.estadoPersona = await this.estadoPersonaRepository.findOne({ where: { codigo: createPersonaDto.id_estado_persona } });
    if (!persona.estadoPersona) {
        throw new Error(`Estado de la persona con código ${createPersonaDto.id_estado_persona} no encontrado`);
    }

    return await this.personaRepository.save(persona);
}

async createDetallePersona(createDetallePersonaDto: CreateDetallePersonaDto): Promise<NET_DETALLE_PERSONA> {
  const detallePersona = new NET_DETALLE_PERSONA();
  detallePersona.ID_PERSONA = createDetallePersonaDto.idPersona;
  detallePersona.ID_CAUSANTE = createDetallePersonaDto.idPersona;  // Asumiendo que ID_CAUSANTE es lo mismo que ID_PERSONA
  detallePersona.ID_TIPO_PERSONA = createDetallePersonaDto.idTipoPersona;
  detallePersona.porcentaje = createDetallePersonaDto.porcentaje;

  return this.detallePersonaRepository.save(detallePersona);
}

async assignCentrosTrabajo(idPersona: number, centrosTrabajoData: any[]): Promise<Net_perf_pers_cent_trab[]> {
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
          continue;  // Puedes optar por continuar con el siguiente centro o detener todo el proceso
      }

      const nuevoPerfil = new Net_perf_pers_cent_trab();
      nuevoPerfil.persona = persona;
      nuevoPerfil.centroTrabajo = centroTrabajo;
      nuevoPerfil.cargo = centro.cargo;
      nuevoPerfil.numero_acuerdo = centro.numeroAcuerdo;
      nuevoPerfil.salario_base = centro.salarioBase;
      nuevoPerfil.fecha_ingreso = centro.fechaIngreso;
      nuevoPerfil.fecha_egreso = centro.fechaEgreso;
      nuevoPerfil.clase_cliente = centro.claseCliente;
      nuevoPerfil.sector_economico = centro.sectorEconomico;

      asignaciones.push(await this.perfPersoCentTrabRepository.save(nuevoPerfil));
  }

  if (errores.length > 0) {
      throw new Error(`Errores en la asignación de centros de trabajo: ${errores.join(' ')}`);
  }

  return asignaciones;
}

async createAndAssignReferences(dto: AsignarReferenciasDTO): Promise<Net_Ref_Per_Pers[]> {
  const persona = await this.personaRepository.findOne({ 
      where: { id_persona: dto.idPersona }
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
}

async assignBancosToPersona(idPersona: number, bancosData: CreatePersonaBancoDTO[]): Promise<Net_Persona_Por_Banco[]> {
  const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
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
      personaBanco.estado = bancoData.estado;

      asignaciones.push(await this.personaBancoRepository.save(personaBanco));
  }

  return asignaciones;
}

async createBeneficiario(beneficiarioData: NetPersonaDTO): Promise<Net_Persona> {
  return this.create(beneficiarioData);
}

async createDetalleBeneficiario(detalleDto: CreateDetalleBeneficiarioDto): Promise<NET_DETALLE_PERSONA> {
  const detalle = new NET_DETALLE_PERSONA();
  detalle.ID_PERSONA = detalleDto.idPersona;
  detalle.ID_CAUSANTE = detalleDto.idCausante;
  detalle.ID_CAUSANTE_PADRE = detalleDto.idCausantePadre;  // Asumiendo que es el mismo que ID_CAUSANTE
  detalle.ID_TIPO_PERSONA = detalleDto.idTipoPersona;
  detalle.porcentaje = detalleDto.porcentaje;

  return this.detallePersonaRepository.save(detalle);
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

  async createTemp(createAfiliadoTempDto: CreateAfiliadoTempDto) {
    try {
      const afiliado = this.personaRepository.create(createAfiliadoTempDto)
      await this.personaRepository.save(afiliado)
      return afiliado;
    } catch (error) {
      this.handleException(error);
    }
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

  async createCentrosTrabPersona(data: any, dnireferente:any) {
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
        
        clase_cliente: item.clase_cliente,
        sector_economico: item.sector_economico,
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

  async findOne(term: number) {
    let personas: Net_Persona;
    if (isUUID(term)) {
      personas = await this.personaRepository.findOne({
        where: { id_persona: term },
        relations: ['detalleAfiliado'], // Asegúrate de cargar la relación
      });
    } else {

      const queryBuilder = this.personaRepository.createQueryBuilder('persona');
      personas = await queryBuilder
        .select('persona.DNI', 'DNI')
        .addSelect('persona.PRIMER_NOMBRE', 'PRIMER_NOMBRE')
        .addSelect('persona.SEGUNDO_NOMBRE', 'SEGUNDO_NOMBRE')
        .addSelect('persona.PRIMER_APELLIDO', 'PRIMER_APELLIDO')
        .addSelect('persona.SEGUNDO_APELLIDO', 'SEGUNDO_APELLIDO')
        .addSelect('persona.SEXO', 'SEXO')
        .addSelect('persona.DIRECCION_RESIDENCIA', 'DIRECCION_RESIDENCIA')
        .addSelect('persona.FECHA_NACIMIENTO', 'FECHA_NACIMIENTO')
        .addSelect('persona.NUMERO_CARNET', 'NUMERO_CARNET')
        .addSelect('persona.PROFESION', 'PROFESION')
        .addSelect('persona.TELEFONO_1', 'TELEFONO_1')
        .addSelect('persona.ESTADO_CIVIL', 'ESTADO_CIVIL')
        .addSelect('estadoAfil.DESCRIPCION', 'ESTADO')
        .innerJoin('persona.estadoAfiliado', 'estadoAfil')
        .leftJoin('persona.detallesAfiliado', 'detallepersona')// Join con la tabla detallepersonas
        .leftJoin('detallepersona.tipoAfiliado', 'tipoafiliado') // Join con la tabla detallepersonas
        .where('persona.dni = :term AND tipoafiliado.tipo_afiliado = :tipo_persona', { term, tipo_persona: "AFILIADO" })
        .getRawOne();

    }
    if (!personas) {
      throw new NotFoundException(`Afiliado con ${term} no existe`);
    }
    return personas;
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
      NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_AFILIADO" = "detA"."ID_TIPO_PERSONA"
      INNER JOIN
      NET_ESTADO_AFILIADO "estadoPers" ON "Afil"."ID_ESTADO_AFILIADO" = "estadoPers"."CODIGO"
    WHERE
      "Afil"."DNI" = '${dniAfil}' AND 
      "estadoPers"."DESCRIPCION" = 'FALLECIDO'  AND
      "tipoP"."TIPO_AFILIADO" = 'AFILIADO'
    `;

      const beneficios = await this.entityManager.query(query);

      const query1 = `
        SELECT 
        "Afil"."DNI",
        "Afil"."PRIMER_NOMBRE",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."TERCER_NOMBRE",
        "Afil"."PRIMER_APELLIDO",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."SEXO",
        "detA"."PORCENTAJE",
        "tipoP"."TIPO_AFILIADO"
      FROM
          "NET_DETALLE_PERSONA" "detA" INNER JOIN 
          "NET_PERSONA" "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
          INNER JOIN
        NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_AFILIADO" = "detA"."ID_TIPO_PERSONA"
      WHERE 
          "detA"."ID_CAUSANTE_PADRE" = ${beneficios[0].ID_PERSONA} AND 
          "tipoP"."TIPO_AFILIADO" = 'BENEFICIARIO' 
        `;
      const beneficios2 = await this.entityManager.query(query1);

      return this.normalizarDatos(beneficios2);
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
        tipo_afiliado: el.TIPO_AFILIADO,
        dni: el.DNI,
        estado_civil: el.ESTADO_CIVIL,
        primer_nombre: el.PRIMER_NOMBRE,
        segundo_nombre: el.SEGUNDO_NOMBRE,
        tercer_nombre: el.TERCER_NOMBRE,
        primer_apellido: el.PRIMER_APELLIDO,
        segundo_apellido: el.SEGUNDO_APELLIDO,
        sexo: el.SEXO,
        cantidad_dependientes: el.CANTIDAD_DEPENDIENTES,
        cantidad_hijos: el.CANTIDAD_HIJOS,
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
    const afiliado = await this.personaRepository.findOne({ where: { dni }, relations: ['estadoAfiliado'] });

    if (!afiliado) {
      throw new NotFoundException(`Afiliado with DNI ${dni} not found`);
    }

    switch (afiliado.estadoPersona.Descripcion) {
      case 'FALLECIDO':
        return 'El afiliado está fallecido.';
      case 'INACTIVO':
        return 'El afiliado está inactivo.';
      default:
        return afiliado;
    }
  }

  async buscarPersonaYMovimientosPorDNI(dni: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { dni },
      relations: ["cuentas", "cuentas.movimientos", "estadoPersona"] // Asegúrate de cargar las cuentas y sus movimientos
    });

    if (!persona) {
      throw new NotFoundException(`Persona con DNI ${dni} no encontrada`);
    }

    if (['FALLECIDO', 'INACTIVO'].includes(persona.estadoPersona?.Descripcion.toUpperCase())) {
      return {
        status: 'error',
        message: `La persona está ${persona.estadoPersona.Descripcion.toLowerCase()}.`,
        data: { persona: null, movimientos: [] }
      };
    }

    const movimientos = persona.cuentas.flatMap(cuenta => cuenta.movimientos); // Aplana los movimientos de todas las cuentas

    return {
      status: 'success',
      message: 'Datos y movimientos de la persona encontrados con éxito',
      data: {
        persona,
        movimientos // Devuelve los movimientos aplastados de todas las cuentas
      }
    };
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