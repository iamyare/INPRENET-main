import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from '../entities/net_centro_trabajo.entity';
import { Repository } from 'typeorm';
import { Net_Departamento } from '../../Regional/provincia/entities/net_departamento.entity';
import { CreatePrivateCentroTrabajoDto } from './dto/create-private-centro-trabajo.dto';
import { Net_Nivel_Educativo } from '../entities/net_nivel_educativo.entity';
import { Net_Jornada } from '../entities/net_jornada.entity';
import { Net_Centro_Trabajo_Jornada } from '../entities/Net_Centro_Trabajo_Jornada.entity';
import { Net_Centro_Trabajo_Nivel } from '../entities/Net_Centro_Trabajo_Nivel.entity';
import { Net_Municipio } from 'src/modules/Regional/municipio/entities/net_municipio.entity';
import { CreatePrivateReferenciaCentroTrabajoDto } from './dto/create-private-referencia-centro-trabajo.dto';
import { Net_Referencia_Centro_Trabajo } from '../entities/net_referencia_centro_trabajo.entity';
import { CreatePrivateCentroTrabajoCompleteDto } from './dto/create-private-centro-trabajo-complete.dto';
import { Net_Sociedad_Centro_Trabajo } from '../entities/net_sociedad_centro.entity';
import { Net_Sociedad } from '../entities/net.sociedad.entity';
import { CreatePrivateSociedadDto } from './dto/create-private-sociedad.dto';
import { Net_Socio } from '../entities/net_socio.entity';
import { Net_Sociedad_Socio } from '../entities/net_sociedad_socio.entity';
import { Net_Peps } from '../entities/Net_peps-entity';
import { CreatePrivateSociedadSocioDto } from './dto/create-private-sociedad-socio.dto';
import { CreatePrivatePepsDto } from './dto/create-private-peps.dto';
import { CreatePrivateSocioDto } from './dto/create-private-socio.dto';
@Injectable()
export class CentroTrabajoService {

  private readonly logger = new Logger(CentroTrabajoService.name)

  constructor(

    @InjectRepository(Net_Centro_Trabajo)
    private readonly centroTrabajoRepository: Repository<Net_Centro_Trabajo>,

    @InjectRepository(Net_Referencia_Centro_Trabajo)
    private readonly refcentroTrabajoRepository: Repository<Net_Referencia_Centro_Trabajo>,

    @InjectRepository(Net_Departamento)
    private readonly departamentoRepository: Repository<Net_Departamento>,
    @InjectRepository(Net_Nivel_Educativo)
    private readonly nivelEducativoRepository: Repository<Net_Nivel_Educativo>,
    @InjectRepository(Net_Jornada)
    private readonly jornadaRepository: Repository<Net_Jornada>,
    @InjectRepository(Net_Centro_Trabajo_Nivel)
    private readonly centroTrabajoNivelRepository: Repository<Net_Centro_Trabajo_Nivel>,
    @InjectRepository(Net_Centro_Trabajo_Jornada)
    private readonly centroTrabajoJornadaRepository: Repository<Net_Centro_Trabajo_Jornada>,
    @InjectRepository(Net_Municipio)
    private readonly municipioRepository: Repository<Net_Municipio>,
    @InjectRepository(Net_Referencia_Centro_Trabajo)
    private readonly referenciaCentroTrabajoRepository: Repository<Net_Referencia_Centro_Trabajo>,
    @InjectRepository(Net_Sociedad)
    private readonly sociedadRepository: Repository<Net_Sociedad>,
    @InjectRepository(Net_Sociedad_Centro_Trabajo)
    private readonly sociedadCentroTrabajoRepository: Repository<Net_Sociedad_Centro_Trabajo>,
    @InjectRepository(Net_Socio)
    private readonly socioRepository: Repository<Net_Socio>,
    @InjectRepository(Net_Sociedad_Socio)
    private readonly sociedadSocioRepository: Repository<Net_Sociedad_Socio>,
    @InjectRepository(Net_Peps)
    private readonly pepsRepository: Repository<Net_Peps>,
  ) { }

  async obtenerCentrosDeTrabajoConTipoE(): Promise<Net_Centro_Trabajo[]> {
    return await this.centroTrabajoRepository.find({
      where: {
        tipo: 'E',
      },
    });
  }

  async create(createCentroTrabajoDto: CreateCentroTrabajoDto) {
    try {
      const departamento = await this.departamentoRepository.findOneBy({ nombre_departamento: createCentroTrabajoDto.nombre_departamento });
      if (!departamento) {
        throw new BadRequestException('departamento not found');
      }

      return await this.centroTrabajoRepository.save({
        ...createCentroTrabajoDto,
        departamento
      })
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(): Promise<Net_Centro_Trabajo[]> {
    try {
      return await this.centroTrabajoRepository.find();
    } catch (error) {
      this.handleException(error);
    }
  }

  async getAllReferenciasByCentro(idCentroTrabajo: number): Promise<any> {
    try {
      return await this.refcentroTrabajoRepository.find({ where: { centroTrabajo: { id_centro_trabajo: idCentroTrabajo } } });
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAllPriv(): Promise<Net_Centro_Trabajo[]> {
    try {
      return await this.centroTrabajoRepository.find({ where: { sector_economico: "PRIVADO" }, order: { nombre_centro_trabajo: "ASC" } });
    } catch (error) {
      this.handleException(error);
    }
  }

  async findBy(content: string): Promise<Net_Centro_Trabajo> {
    try {

      return await this.centroTrabajoRepository.findOne(
        {
          where: { nombre_centro_trabajo: content },
          relations: ['centroTrabajoNiveles.nivel', 'centroTrabajoJornadas.jornada', 'municipio.departamento']
        }
      );

    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(id: number): Promise<Net_Centro_Trabajo> {
    const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo: id } });
    if (!centroTrabajo) {
      throw new NotFoundException(`Centro de Trabajo con ID ${id} no encontrado`);
    }
    return centroTrabajo;
  }

  update(id: number, updateCentroTrabajoDto: UpdateCentroTrabajoDto) {
    return `This action updates a #${id} centroTrabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} centroTrabajo`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  async createPrivateCentroTrabajo(createPrivateCentroTrabajoDto: CreatePrivateCentroTrabajoDto): Promise<Net_Centro_Trabajo> {
    const {
      nombre_centro_trabajo,
      rtn,
      objetivo_social,
      numero_empleados,
      telefono_1,
      telefono_2,
      celular_1,
      celular_2,
      correo_1,
      correo_2,
      colonia_localidad,
      barrio_avenida,
      grupo_calle,
      numero_casa,
      direccion_2,
      numero_acuerdo,
      fecha_emision,
      fecha_inicio_operaciones,
      monto_activos_totales,
      modalidad_ensenanza,
      tipo_jornada,
      municipio,
    } = createPrivateCentroTrabajoDto;

    const foundMunicipio = await this.municipioRepository.findOne({ where: { id_municipio: municipio } });
    if (!foundMunicipio) {
      throw new NotFoundException(`Municipio with ID ${municipio} not found`);
    }

    const direccion_1 = [
      colonia_localidad ? `Colonia/Localidad: ${colonia_localidad}` : '',
      barrio_avenida ? `Barrio/Avenida: ${barrio_avenida}` : '',
      grupo_calle ? `Grupo/Calle: ${grupo_calle}` : '',
      numero_casa ? `Número de Casa: ${numero_casa}` : ''
    ].filter(Boolean).join(', ');

    const newCentroTrabajo = this.centroTrabajoRepository.create({
      nombre_centro_trabajo,
      rtn,
      objetivo_social,
      numero_empleados,
      telefono_1,
      telefono_2,
      celular_1,
      celular_2,
      correo_1,
      correo_2,
      direccion_1,
      direccion_2,
      numero_acuerdo,
      fecha_emision,
      fecha_inicio_operaciones,
      monto_activos_totales,
      municipio: foundMunicipio
    });

    const centroTrabajo = await this.centroTrabajoRepository.save(newCentroTrabajo);

    // Insertar los niveles educativos
    if (modalidad_ensenanza && modalidad_ensenanza.length > 0) {
      for (const nivelNombre of modalidad_ensenanza) {
        const nivel = await this.nivelEducativoRepository.findOne({ where: { nombre: nivelNombre } });
        if (nivel) {
          const centroTrabajoNivel = this.centroTrabajoNivelRepository.create({
            centroTrabajo,
            nivel,
          });
          await this.centroTrabajoNivelRepository.save(centroTrabajoNivel);
        }
      }
    }

    // Insertar las jornadas
    if (tipo_jornada && tipo_jornada.length > 0) {
      for (const jornadaNombre of tipo_jornada) {
        const jornada = await this.jornadaRepository.findOne({ where: { nombre: jornadaNombre } });
        if (jornada) {
          const centroTrabajoJornada = this.centroTrabajoJornadaRepository.create({
            centroTrabajo,
            jornada,
          });
          await this.centroTrabajoJornadaRepository.save(centroTrabajoJornada);
        }
      }
    }

    return centroTrabajo;
  }

  async addPrivateReferenciaCentroTrabajo(id_centro_trabajo: number, referencias: CreatePrivateReferenciaCentroTrabajoDto[]): Promise<void> {
    const centroTrabajo = await this.centroTrabajoRepository.findOne({ where: { id_centro_trabajo } });
    if (!centroTrabajo) {
      throw new NotFoundException(`Centro de Trabajo with ID ${id_centro_trabajo} not found`);
    }

    for (const referenciaDto of referencias) {
      const referencia = this.referenciaCentroTrabajoRepository.create({
        tipoReferencia: referenciaDto.tipoReferencia,
        nombre: referenciaDto.nombre,
        centroTrabajo: centroTrabajo
      });
      await this.referenciaCentroTrabajoRepository.save(referencia);
    }
  }

  async createPrivateSociedad(createPrivateSociedadDto: CreatePrivateSociedadDto): Promise<Net_Sociedad> {
    const { nombre, rtn, telefono, correo_electronico } = createPrivateSociedadDto;

    const newSociedad = this.sociedadRepository.create({
      nombre,
      rtn,
      telefono,
      correo_electronico,
    });

    return await this.sociedadRepository.save(newSociedad);
  }

  async addSociedadCentroTrabajo(sociedad: Net_Sociedad, centroTrabajo: Net_Centro_Trabajo): Promise<void> {
    const newSociedadCentroTrabajo = this.sociedadCentroTrabajoRepository.create({
      sociedad,
      centroTrabajo,
    });
    await this.sociedadCentroTrabajoRepository.save(newSociedadCentroTrabajo);
  }

  async createPrivateSocio(createPrivateSocioDto: CreatePrivateSocioDto): Promise<Net_Socio> {
    const { nombre, apellido, dni, direccion_1, direccion_2, telefono, email, municipio } = createPrivateSocioDto;

    const foundMunicipio = await this.municipioRepository.findOne({ where: { id_municipio: municipio } });
    if (!foundMunicipio) {
      throw new NotFoundException(`Municipio with ID ${municipio} not found`);
    }

    const newSocio = this.socioRepository.create({
      nombre,
      apellido,
      dni,
      direccion_1,
      direccion_2,
      telefono,
      email,
      municipio: foundMunicipio,
    });

    return await this.socioRepository.save(newSocio);
  }

  async createPrivateSociedadSocio(sociedad: Net_Sociedad, socio: Net_Socio, createPrivateSociedadSocioDto: CreatePrivateSociedadSocioDto): Promise<Net_Sociedad_Socio> {
    const { porcentajeParticipacion, fechaIngreso, fechaSalida } = createPrivateSociedadSocioDto;

    const newSociedadSocio = this.sociedadSocioRepository.create({
      sociedad,
      socio,
      porcentajeParticipacion,
      fechaIngreso,
      fechaSalida,
    });

    return await this.sociedadSocioRepository.save(newSociedadSocio);
  }

  async createPrivatePeps(socio: Net_Socio, createPrivatePepsDto: CreatePrivatePepsDto): Promise<Net_Peps> {
    const { cargo, fecha_inicio, fecha_fin, referencias } = createPrivatePepsDto;

    const newPeps = this.pepsRepository.create({
      cargo,
      fecha_inicio,
      fecha_fin,
      referencias,
      socio,
    });

    return await this.pepsRepository.save(newPeps);
  }

  async createPrivateCentroTrabajoComplete(createPrivateCentroTrabajoCompleteDto: CreatePrivateCentroTrabajoCompleteDto): Promise<Net_Centro_Trabajo> {
    const { centroTrabajo, referencias, sociedad, socio, sociedadSocio, peps } = createPrivateCentroTrabajoCompleteDto;

    const newCentroTrabajo = await this.createPrivateCentroTrabajo(centroTrabajo);
    await this.addPrivateReferenciaCentroTrabajo(newCentroTrabajo.id_centro_trabajo, referencias);

    const newSociedad = await this.createPrivateSociedad(sociedad);
    await this.addSociedadCentroTrabajo(newSociedad, newCentroTrabajo);

    const newSocio = await this.createPrivateSocio(socio);
    await this.createPrivateSociedadSocio(newSociedad, newSocio, sociedadSocio);

    if (peps) {
      await this.createPrivatePeps(newSocio, peps);
    }

    return newCentroTrabajo;
  }

}
