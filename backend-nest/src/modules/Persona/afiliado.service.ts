import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto, PersonaResponse } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Connection, EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { validate as isUUID } from 'uuid';
import { Net_Persona } from './entities/Net_Persona.entity';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_ReferenciaPersonal } from './entities/referencia-personal.entity';
import { Net_Ref_Per_Pers } from './entities/net_ref-Per-Persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(Net_Persona)
    private readonly afiliadoRepository: Repository<Net_Persona>,
    @InjectRepository(Net_perf_pers_cent_trab)
    private readonly perfPersoCentTrabRepository: Repository<Net_perf_pers_cent_trab>,

    @InjectRepository(Net_Ref_Per_Pers)
    private readonly RefPersRepositoryPersona: Repository<Net_Ref_Per_Pers>,

    @InjectRepository(Net_ReferenciaPersonal)
    private readonly RefPersRepository: Repository<Net_ReferenciaPersonal>,

    private connection: Connection,
  ) { }

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
      const afiliado = this.afiliadoRepository.create(createAfiliadoTempDto)
      await this.afiliadoRepository.save(afiliado)
      return afiliado;
    } catch (error) {
      this.handleException(error);
    }
  }

  async createRefPers(data: any, dnireferente: any) {
    try {
      // Buscar la persona referente
      const personaReferente = await this.afiliadoRepository.findOne({
        where: { dni: dnireferente.dnireferente },
      });
  
      // Verificar si se encontró la persona referente
      if (!personaReferente) {
        throw new Error('No se encontró la persona referente.');
      }
  
      const refPersonales = this.RefPersRepository.create(data);
      const savedRefPersonales = await this.RefPersRepository.save(refPersonales);

      const idsRefPersonal = savedRefPersonales.map(objeto => objeto.id_ref_personal);
      const idPersona = personaReferente.id_persona;
      const arregloFinal = idsRefPersonal.map(id_ref_personal => ({ id_ref_personal, idPersona }));

      const arregloRenombrado = arregloFinal.map(objeto => ({
        afiliado: objeto.idPersona,
        referenciaPersonal: objeto.id_ref_personal
      }));

      const asigPersonales = this.RefPersRepositoryPersona.create(arregloRenombrado);
      const savedasigPersonales = await this.RefPersRepositoryPersona.save(asigPersonales);

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
      const personaReferente = await this.afiliadoRepository.findOne({
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
    const afiliado = this.afiliadoRepository.find()
    return afiliado;
  }

  async findOne(term: number) {
    let personas: Net_Persona;
    if (isUUID(term)) {
      personas = await this.afiliadoRepository.findOne({
        where: { id_persona: term },
        relations: ['detalleAfiliado'], // Asegúrate de cargar la relación
      });
    } else {

      const queryBuilder = this.afiliadoRepository.createQueryBuilder('persona');
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
    const afiliado = await this.afiliadoRepository.findOne({ where: { dni }, relations: ['estadoAfiliado'] });

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
    const persona = await this.afiliadoRepository.findOne({
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