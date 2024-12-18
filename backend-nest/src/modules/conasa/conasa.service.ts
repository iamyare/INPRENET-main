import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Plan } from './entities/net_planes.entity';
import { Net_Categoria } from './entities/net_categorias.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Net_Contratos_Conasa } from './entities/net_contratos_conasa.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { Net_Beneficiarios_Conasa } from './entities/net_beneficiarios_conasa.entity';
import { CrearBeneficiarioDto } from './dto/beneficiarios-conasa.dto';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { AsignarContratoDto } from './dto/asignar-contrato.dto';
import { ManejarTransaccionDto } from './dto/crear-contrato.dto';
import { Net_Consultas_Medicas } from './entities/net_consultas_medicas.entity';
import { CrearConsultaDto } from './dto/create-consulta-medica.dto';
import { CancelarContratoDto } from './dto/cancelar-contrato.dto';
const bcrypt = require('bcrypt');

@Injectable()
export class ConasaService {
  constructor(
    @InjectRepository(Net_Categoria)
    private readonly categoriaRepository: Repository<Net_Categoria>,
    @InjectRepository(Net_Plan)
    private readonly planRepository: Repository<Net_Plan>,
    @InjectRepository(Net_Contratos_Conasa)
    private contratosRepository: Repository<Net_Contratos_Conasa>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Plan)
    private planesRepository: Repository<Net_Plan>,
    @InjectRepository(Net_Beneficiarios_Conasa)
    private beneficiariosRepository: Repository<Net_Beneficiarios_Conasa>,
    private readonly dataSource: DataSource,
    @InjectRepository(Net_Empleado_Centro_Trabajo)
    private empCentTrabajoRepository: Repository<Net_Empleado_Centro_Trabajo>,
    @InjectRepository(Net_Consultas_Medicas)
    private readonly consultaRepository: Repository<Net_Consultas_Medicas>,
  ) {}

  private generateNumeroProducto(): string {
    const prefix = 'PROD';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  getCategorias(): Promise<Net_Categoria[]> {
    return this.categoriaRepository.find({ relations: ['planes'] });
  }

  getPlanes(): Promise<Net_Plan[]> {
    return this.planRepository.find({ relations: ['categoria'] });
  }

  async crearBeneficiarios(
    idContrato: number,
    beneficiarios: CrearBeneficiarioDto[],
  ): Promise<string> {
    const contrato = await this.contratosRepository.findOne({ where: { id_contrato: idContrato } });
    if (!contrato) {
      throw new NotFoundException('El contrato no existe.');
    }
    const nuevosBeneficiarios = beneficiarios.map((beneficiario) =>
      this.beneficiariosRepository.create({
        contrato,
        ...beneficiario,
      }),
    );
  
    await this.beneficiariosRepository.save(nuevosBeneficiarios);
    return 'Beneficiarios creados exitosamente.';
  }

  async verificarPersona(idPersona: number, manager?: any): Promise<net_persona> {
    const repo = manager ? manager.getRepository(net_persona) : this.personaRepository;
    const persona = await repo.findOne({ where: { id_persona: idPersona } });
    if (!persona) {
      throw new NotFoundException(`La persona con ID ${idPersona} no existe.`);
    }
    return persona;
  }
  
  async verificarPlan(idPlan: number, manager?: any): Promise<Net_Plan> {
    const repo = manager ? manager.getRepository(Net_Plan) : this.planesRepository;
    const plan = await repo.findOne({ where: { id_plan: idPlan } });
    if (!plan) {
      throw new NotFoundException(`El plan con ID ${idPlan} no existe.`);
    }
    return plan;
  }
  
  async verificarContratoExistente(idPersona: number, manager?: any): Promise<boolean> {
    const repo = manager ? manager.getRepository(Net_Contratos_Conasa) : this.contratosRepository;
    const contratoExistente = await repo.findOne({
      where: { titular: { id_persona: idPersona }, status: 'ACTIVO' },
    });
    return !!contratoExistente;
  }
  
  async asignarContrato(contratoData: AsignarContratoDto): Promise<string> {
    const persona = await this.verificarPersona(contratoData.idPersona);
    const plan = await this.verificarPlan(contratoData.idPlan);
    const existeContrato = await this.verificarContratoExistente(contratoData.idPersona);
  
    if (existeContrato) {
      throw new BadRequestException('La persona ya tiene un contrato activo.');
    }
  
    const numeroProducto = this.generateNumeroProducto();
  
    const contrato = this.contratosRepository.create({
      titular: persona,
      plan,
      numero_producto: numeroProducto,
      lugar_cobro: contratoData.lugarCobro,
      fecha_inicio_contrato: this.formatDateToYYYYMMDD(contratoData.fechaInicioContrato),
      fecha_cancelacion_contrato: contratoData.fechaCancelacionContrato
        ? this.formatDateToYYYYMMDD(contratoData.fechaCancelacionContrato)
        : null,
      status: 'ACTIVO',
      observacion: contratoData.observacion,
    });
  
    await this.contratosRepository.save(contrato);
    return 'Contrato asignado exitosamente.';
  }
  
  async manejarTransaccion(payload: ManejarTransaccionDto): Promise<string> {
    const { contrato, beneficiarios } = payload;
  
    return await this.dataSource.transaction(async (manager) => {
      // Verificar la persona
      const persona = await this.verificarPersona(contrato.idPersona, manager);
      const plan = await this.verificarPlan(contrato.idPlan, manager);
      const existeContrato = await this.verificarContratoExistente(contrato.idPersona, manager);
  
      if (existeContrato) {
        throw new BadRequestException(
          `La persona con ID ${contrato.idPersona} ya tiene un contrato activo.`,
        );
      }
  
      // Crear el contrato
      const nuevoContrato = manager.create(Net_Contratos_Conasa, {
        titular: persona,
        plan,
        numero_producto: this.generateNumeroProducto(),
        lugar_cobro: contrato.lugarCobro,
        fecha_inicio_contrato: this.formatDateToYYYYMMDD(contrato.fechaInicioContrato),
        fecha_cancelacion_contrato: contrato.fechaCancelacionContrato
          ? this.formatDateToYYYYMMDD(contrato.fechaCancelacionContrato)
          : null,
        status: 'ACTIVO',
        observacion: contrato.observacion,
      });
  
      const savedContrato = await manager.save(nuevoContrato);
  
      // Crear beneficiarios si existen
      if (beneficiarios && beneficiarios.length > 0) {
        const beneficiariosRepo = manager.getRepository(Net_Beneficiarios_Conasa);
        const nuevosBeneficiarios = beneficiarios.map((beneficiario) =>
          beneficiariosRepo.create({
            contrato: savedContrato,
            ...beneficiario,
          }),
        );
        await beneficiariosRepo.save(nuevosBeneficiarios);
      }
  
      return 'Contrato y beneficiarios procesados exitosamente.';
    });
  }
  
  formatDateToYYYYMMDD(dateString: string): string {
    if (!dateString) return null;
    const date = new Date(dateString);
    const utcDay = ('0' + date.getUTCDate()).slice(-2);
    const utcMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const utcYear = date.getUTCFullYear();
    return `${utcYear}-${utcMonth}-${utcDay}`;
  }

  async obtenerContratoYBeneficiariosPorDNI(dni: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: dni },
      relations: ['detallePersona'],
    });
    
    if (!persona) {
      throw new NotFoundException(`No se encontró ninguna persona con el DNI ${dni}`);
    }
    const contrato = await this.contratosRepository.findOne({
      where: { titular: { id_persona: persona.id_persona } },
      relations: ['plan', 'beneficiarios'],
    });
  
    if (!contrato) {
      throw new NotFoundException(`No se encontró ningún contrato para la persona con DNI ${dni}`);
    }
    const contratoFormateado = {
      idContrato: contrato.id_contrato,
      numeroProducto: contrato.numero_producto,
      lugarCobro: contrato.lugar_cobro,
      fechaInicioContrato: contrato.fecha_inicio_contrato,
      fechaCancelacionContrato: contrato.fecha_cancelacion_contrato,
      status: contrato.status,
      plan: {
        idPlan: contrato.plan.id_plan,
        nombrePlan: contrato.plan.nombre_plan,
        precio: contrato.plan.precio,
        descripcion: contrato.plan.descripcion,
        proteccionPara: contrato.plan.proteccion_para,
      },
      beneficiarios: contrato.beneficiarios.map((beneficiario) => ({
        idBeneficiario: beneficiario.id_beneficiario,
        primerNombre: beneficiario.primer_nombre,
        segundoNombre: beneficiario.segundo_nombre,
        primerApellido: beneficiario.primer_apellido,
        segundoApellido: beneficiario.segundo_apellido,
        parentesco: beneficiario.parentesco,
        fechaNacimiento: beneficiario.fecha_nacimiento,
      })),
    };
    return contratoFormateado;
  }

  async obtenerPlanillaContratosActivos(email: string, password: string): Promise<any[]> {
    // Validar credenciales
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['CONSULTA', 'TODO']) },
          },
        },
      },
      relations: [
        'usuarioEmpresas',
        'usuarioEmpresas.usuarioModulos',
        'usuarioEmpresas.usuarioModulos.rolModulo',
      ],
    });
  
    if (!empCentTrabajoRepository) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
  
    const isPasswordValid = await bcrypt.compare(
      password,
      empCentTrabajoRepository.usuarioEmpresas[0].contrasena,
    );
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
  
    // Consulta para obtener los contratos activos con la información solicitada
    const query = this.dataSource
      .createQueryBuilder()
      .select([
        'contrato.numero_producto AS numero_producto',
        "persona.PRIMER_NOMBRE || ' ' || persona.PRIMER_APELLIDO AS nombre_completo",
        'persona.N_IDENTIFICACION AS dni',
        'categoria.nombre AS categoria',
        'plan.nombre_plan AS nombre_plan',
        'plan.precio AS monto_a_pagar'
      ])
      .from(Net_Contratos_Conasa, 'contrato')
      .innerJoin('contrato.titular', 'persona')
      .innerJoin('contrato.plan', 'plan')
      .innerJoin('plan.categoria', 'categoria')
      .where('contrato.status = :status', { status: 'ACTIVO' });
  
    const result = await query.getRawMany();
    return result;
  }
  
  async consultaUnificada(
    tipo: number,
    terminos: string,
    email: string,
    password: string
  ): Promise<any> {
    // Validar credenciales
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['CONSULTA', 'TODO']) },
          },
        },
      },
      relations: [
        'usuarioEmpresas',
        'usuarioEmpresas.usuarioModulos',
        'usuarioEmpresas.usuarioModulos.rolModulo',
      ],
    });

    if (!empCentTrabajoRepository) {
      throw new UnauthorizedException('User not found or unauthorized');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      empCentTrabajoRepository.usuarioEmpresas[0].contrasena,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Consulta por tipo
    if (tipo === 1) {
      // Consulta por DNI
      const persona = await this.personaRepository.findOne({
        where: { n_identificacion: terminos },
        relations: [
          'detallePersona',
          'detallePersona.tipoPersona',
          'pais',
          'municipio.departamento',
          'tipoIdentificacion',
          'municipio',
          'municipio_nacimiento',
          'municipio_nacimiento.departamento',
        ],
      });

      if (!persona) {
        throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${terminos} no existe`);
      }

      const tiposPersona = persona.detallePersona
        .map(detalle => detalle.tipoPersona?.tipo_persona)
        .filter(Boolean);

      return {
        N_IDENTIFICACION: persona.n_identificacion,
        PRIMER_NOMBRE: persona.primer_nombre,
        SEGUNDO_NOMBRE: persona.segundo_nombre,
        TERCER_NOMBRE: persona.tercer_nombre,
        PRIMER_APELLIDO: persona.primer_apellido,
        SEGUNDO_APELLIDO: persona.segundo_apellido,
        SEXO: persona.sexo,
        DIRECCION_RESIDENCIA: persona.direccion_residencia,
        FECHA_NACIMIENTO: persona.fecha_nacimiento,
        TELEFONO_1: persona.telefono_1,
        TELEFONO_2: persona.telefono_2,
        CORREO_1: persona.correo_1,
        DEPARTAMENTO_RESIDENCIA: persona.municipio?.departamento?.nombre_departamento || null,
        MUNICIPIO_RESIDENCIA: persona.municipio?.nombre_municipio || null,
        ESTADO: persona.fallecido === 'SI' ? 'FALLECIDO' : 'VIVO',
        TIPOS_PERSONA: tiposPersona,
      };
    } else if (tipo === 2) {
      // Validar términos
      const palabras = terminos.split(' ').filter((palabra) => palabra.trim().length > 0);
      if (palabras.length !== 2) {
        throw new BadRequestException('Debe proporcionar exactamente dos términos de búsqueda.');
      }

      // Construir consulta por nombres o apellidos
      const query = this.personaRepository.createQueryBuilder('persona')
        .leftJoinAndSelect('persona.detallePersona', 'detallePersona')
        .leftJoinAndSelect('detallePersona.tipoPersona', 'tipoPersona')
        .leftJoinAndSelect('persona.pais', 'pais')
        .leftJoinAndSelect('persona.municipio', 'municipio')
        .leftJoinAndSelect('municipio.departamento', 'departamento')
        .leftJoinAndSelect('persona.municipio_nacimiento', 'municipio_nacimiento')
        .leftJoinAndSelect('municipio_nacimiento.departamento', 'departamento_nacimiento')
        .leftJoinAndSelect('persona.tipoIdentificacion', 'tipoIdentificacion');

      let whereClause = '';
      const parametros: Record<string, string> = {};

      palabras.forEach((palabra, index) => {
        const marcador = `palabra${index}`;
        const condiciones = [
          `LOWER(persona.primer_nombre) LIKE :${marcador}_primer_nombre`,
          `LOWER(persona.segundo_nombre) LIKE :${marcador}_segundo_nombre`,
          `LOWER(persona.tercer_nombre) LIKE :${marcador}_tercer_nombre`,
          `LOWER(persona.primer_apellido) LIKE :${marcador}_primer_apellido`,
          `LOWER(persona.segundo_apellido) LIKE :${marcador}_segundo_apellido`,
        ];
        whereClause += whereClause ? ' AND ' : '';
        whereClause += `(${condiciones.join(' OR ')})`;

        parametros[`${marcador}_primer_nombre`] = `%${palabra}%`;
        parametros[`${marcador}_segundo_nombre`] = `%${palabra}%`;
        parametros[`${marcador}_tercer_nombre`] = `%${palabra}%`;
        parametros[`${marcador}_primer_apellido`] = `%${palabra}%`;
        parametros[`${marcador}_segundo_apellido`] = `%${palabra}%`;
      });

      const personas = await query.where(whereClause).setParameters(parametros).getMany();

      if (personas.length === 0) {
        throw new NotFoundException(`No persons found with terms: ${terminos}`);
      }

      // Mapear y devolver la información completa
      return personas.map((persona) => {
        const tiposPersona = persona.detallePersona
          .map((detalle) => detalle.tipoPersona?.tipo_persona)
          .filter(Boolean);

        return {
          N_IDENTIFICACION: persona.n_identificacion,
          PRIMER_NOMBRE: persona.primer_nombre,
          SEGUNDO_NOMBRE: persona.segundo_nombre,
          TERCER_NOMBRE: persona.tercer_nombre,
          PRIMER_APELLIDO: persona.primer_apellido,
          SEGUNDO_APELLIDO: persona.segundo_apellido,
          SEXO: persona.sexo,
          DIRECCION_RESIDENCIA: persona.direccion_residencia,
          FECHA_NACIMIENTO: persona.fecha_nacimiento,
          TELEFONO_1: persona.telefono_1,
          TELEFONO_2: persona.telefono_2,
          CORREO_1: persona.correo_1,
          DEPARTAMENTO_RESIDENCIA: persona.municipio?.departamento?.nombre_departamento || null,
          MUNICIPIO_RESIDENCIA: persona.municipio?.nombre_municipio || null,
          MUNICIPIO_NACIMIENTO: persona.municipio_nacimiento?.nombre_municipio || null,
          DEPARTAMENTO_NACIMIENTO: persona.municipio_nacimiento?.departamento?.nombre_departamento || null,
          ESTADO: persona.fallecido === 'SI' ? 'FALLECIDO' : 'VIVO',
          TIPOS_PERSONA: tiposPersona,
        };
      });
    } else {
      throw new BadRequestException('Tipo de consulta no válido. Debe ser 1 (DNI) o 2 (Nombres/Apellidos).');
    }
  }
  
  async crearConsultasMedicas(
    crearConsultasDto: CrearConsultaDto[],
    email: string,
    password: string
  ): Promise<object> {
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['CONSULTA', 'TODO']) },
          },
        },
      },
      relations: [
        'usuarioEmpresas',
        'usuarioEmpresas.usuarioModulos',
        'usuarioEmpresas.usuarioModulos.rolModulo',
      ],
    });
  
    if (!empCentTrabajoRepository) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
  
    const isPasswordValid = await bcrypt.compare(
      password,
      empCentTrabajoRepository.usuarioEmpresas[0].contrasena
    );
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const resultados = {
      totalExitosos: 0,
      fallidos: [],
    };
  
    for (const consultaDto of crearConsultasDto) {
      const { n_identificacion } = consultaDto;
      try {
        const persona = await this.personaRepository.findOne({
          where: { n_identificacion },
        });
  
        if (!persona) {
          throw new NotFoundException(`Persona con identificación ${n_identificacion} no encontrada.`);
        }
  
        const contrato = await this.contratosRepository
          .createQueryBuilder('contrato')
          .leftJoinAndSelect('contrato.plan', 'plan')
          .leftJoinAndSelect('plan.categoria', 'categoria')
          .where('contrato.titular = :personaId', { personaId: persona.id_persona })
          .andWhere('contrato.status = :status', { status: 'ACTIVO' })
          .andWhere('categoria.nombre = :categoria', { categoria: 'ASISTENCIA MÉDICA' })
          .getOne();
  
        if (!contrato) {
          throw new NotFoundException(
            `La persona con identificación ${n_identificacion} no tiene un contrato activo en la categoría ASISTENCIA MÉDICA.`,
          );
        }
  
        const nuevaConsulta = this.consultaRepository.create({
          ...consultaDto,
          contrato,
        });
  
        await this.consultaRepository.save(nuevaConsulta);
        resultados.totalExitosos += 1;
      } catch (error) {
        resultados.fallidos.push({
          n_identificacion,
          error: error.message,
        });
      }
    }
  
    return {
      message: 'Proceso de registro de asistencias médicas completado.',
      totalExitosos: resultados.totalExitosos,
      fallidos: resultados.fallidos,
    };
  }
  
  async cancelarContrato(dto: CancelarContratoDto): Promise<string> {
    let contrato: Net_Contratos_Conasa | undefined;

    // Buscar contrato por ID o por n_identificacion
    if (dto.id_contrato) {
        contrato = await this.contratosRepository.findOne({
            where: { id_contrato: dto.id_contrato, status: 'ACTIVO' },
        });
    } else if (dto.n_identificacion) {
        const persona = await this.personaRepository.findOne({
            where: { n_identificacion: dto.n_identificacion },
        });

        if (!persona) {
            throw new NotFoundException(
                `No se encontró una persona con identificación ${dto.n_identificacion}`,
            );
        }

        contrato = await this.contratosRepository.findOne({
            where: { titular: { id_persona: persona.id_persona }, status: 'ACTIVO' },
            relations: ['titular'],
        });
    }

    if (!contrato) {
        throw new NotFoundException('No se encontró un contrato activo para cancelar.');
    }

    contrato.status = 'CANCELADO';
    contrato.observacion = dto.motivo_cancelacion;
    contrato.fecha_cancelacion_contrato = new Date(); // Cambiado a un valor de tipo Date

    await this.contratosRepository.save(contrato);

    return `Contrato con ID ${contrato.id_contrato} ha sido cancelado exitosamente.`;
}
  
  async obtenerAfiliadosPorPeriodo(fechaInicio: string, fechaFin: string) {
    try {
      // Convertir fechas del formato dd/MM/yy al formato ISO
      const [diaInicio, mesInicio, anoInicio] = fechaInicio.split('/');
      const [diaFin, mesFin, anoFin] = fechaFin.split('/');

      const fechaInicioISO = new Date(`20${anoInicio}-${mesInicio}-${diaInicio}`);
      const fechaFinISO = new Date(`20${anoFin}-${mesFin}-${diaFin}`);

      if (isNaN(fechaInicioISO.getTime()) || isNaN(fechaFinISO.getTime())) {
        throw new BadRequestException('Las fechas no son válidas.');
      }

      // Consulta a la base de datos
      const afiliados = await this.contratosRepository
        .createQueryBuilder('contrato')
        .leftJoinAndSelect('contrato.titular', 'titular')
        .where('contrato.fecha_inicio_contrato BETWEEN :inicio AND :fin', {
          inicio: fechaInicioISO.toISOString().split('T')[0],
          fin: fechaFinISO.toISOString().split('T')[0],
        })
        .select([
          'contrato.id_contrato',
          'contrato.fecha_inicio_contrato',
          'titular.primer_nombre',
          'titular.segundo_nombre',
          'titular.primer_apellido',
          'titular.segundo_apellido',
          'titular.n_identificacion',
        ])
        .getMany();

      return { total: afiliados.length, afiliados };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al procesar la solicitud.');
    }
  }
  
}
