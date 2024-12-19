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
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as XLSX from 'xlsx';

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
      empCentTrabajoRepository.usuarioEmpresas[0].contrasena
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
      const palabras = terminos
        .split(' ')
        .filter((palabra) => palabra.trim().length > 0)
        .map((palabra) => palabra.trim().toLowerCase());
  
      if (palabras.length !== 2) {
        throw new BadRequestException('Debe proporcionar exactamente dos términos de búsqueda.');
      }
  
      if (palabras.some((palabra) => palabra.length < 3)) {
        throw new BadRequestException('Ambos términos deben tener al menos 3 caracteres.');
      }
  
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
    // Validar credenciales del usuario
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
      const { dni } = consultaDto;
  
      try {
        // Validar longitud del DNI
        if (!dni || dni.length !== 13) {
          throw new Error('El DNI debe tener exactamente 13 caracteres.');
        }
  
        // Crear y guardar la consulta directamente
        const nuevaConsulta = this.consultaRepository.create({
          ...consultaDto,
        });
  
        await this.consultaRepository.save(nuevaConsulta);
        resultados.totalExitosos += 1;
      } catch (error) {
        resultados.fallidos.push({
          dni,
          error: error.message,
        });
      }
    }
  
    // Retornar resultados
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
      const [diaInicio, mesInicio, anoInicio] = fechaInicio.split('/');
      const [diaFin, mesFin, anoFin] = fechaFin.split('/');

      const fechaInicioISO = `${anoInicio}-${mesInicio}-${diaInicio}`;
      const fechaFinISO = `${anoFin}-${mesFin}-${diaFin}`;

      if (isNaN(new Date(fechaInicioISO).getTime()) || isNaN(new Date(fechaFinISO).getTime())) {
        throw new BadRequestException('Las fechas no son válidas.');
      }

      const afiliados = await this.contratosRepository
        .createQueryBuilder('contrato')
        .leftJoinAndSelect('contrato.titular', 'titular')
        .leftJoinAndSelect('contrato.plan', 'plan')
        .leftJoinAndSelect('plan.categoria', 'categoria')
        .where(
          `contrato.fecha_inicio_contrato BETWEEN TO_DATE(:inicio, 'YYYY-MM-DD') AND TO_DATE(:fin, 'YYYY-MM-DD')`,
          {
            inicio: fechaInicioISO,
            fin: fechaFinISO,
          },
        )
        .select([
          'contrato.fecha_inicio_contrato',
          'contrato.fecha_cancelacion_contrato',
          'contrato.observacion',
          'contrato.numero_producto',
          'contrato.status',
          'titular.n_identificacion',
          'titular.primer_nombre',
          'titular.segundo_nombre',
          'titular.primer_apellido',
          'titular.segundo_apellido',
          'titular.fecha_nacimiento',
          'titular.telefono_1',
          'titular.telefono_2',
          'titular.telefono_3',
          'titular.correo_1',
          'titular.direccion_residencia',
          'plan.nombre_plan',
          'categoria.nombre',
        ])
        .getMany();
      const afiliadosConFormato = afiliados.map((afiliado) => ({
        ...afiliado,
        fecha_inicio_contrato: afiliado.fecha_inicio_contrato
          ? new Date(afiliado.fecha_inicio_contrato).toLocaleDateString('es-ES')
          : null,
        fecha_cancelacion_contrato: afiliado.fecha_cancelacion_contrato
          ? new Date(afiliado.fecha_cancelacion_contrato).toLocaleDateString('es-ES')
          : null,
        titular: {
          ...afiliado.titular,
          fecha_nacimiento: afiliado.titular.fecha_nacimiento
            ? new Date(afiliado.titular.fecha_nacimiento).toLocaleDateString('es-ES')
            : null,
        },
      }));

      return {
        total: afiliadosConFormato.length,
        afiliados: afiliadosConFormato,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al procesar la solicitud.');
    }
  }

  async obtenerBeneficiarios(): Promise<any[]> {
    try {
      const beneficiarios = await this.beneficiariosRepository
        .createQueryBuilder('beneficiario')
        .leftJoinAndSelect('beneficiario.contrato', 'contrato')
        .leftJoinAndSelect('contrato.titular', 'titular')
        .select([
          'titular.n_identificacion AS n_identificacion_titular', // DNI del titular
          'beneficiario.primer_nombre AS primer_nombre',
          'beneficiario.segundo_nombre AS segundo_nombre',
          'beneficiario.primer_apellido AS primer_apellido',
          'beneficiario.segundo_apellido AS segundo_apellido',
          'beneficiario.parentesco AS parentesco',
          `TO_CHAR(beneficiario.fecha_nacimiento, 'DD/MM/YYYY') AS fecha_nacimiento`, // Fecha formateada
          `TRUNC(MONTHS_BETWEEN(SYSDATE, beneficiario.fecha_nacimiento) / 12) AS edad`, // Edad calculada
        ])
        .getRawMany();
  
      return beneficiarios;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al obtener los beneficiarios.',
      );
    }
  }
  
  async obtenerAfiliadosPorPeriodoExcel(
    fechaInicio: string,
    fechaFin: string,
    res: Response,
  ): Promise<void> {
    try {
      // Parsear las fechas en formato dd/MM/yyyy
      const [diaInicio, mesInicio, anoInicio] = fechaInicio.split('/');
      const [diaFin, mesFin, anoFin] = fechaFin.split('/');
  
      const fechaInicioISO = `${anoInicio}-${mesInicio}-${diaInicio}`;
      const fechaFinISO = `${anoFin}-${mesFin}-${diaFin}`;
  
      if (isNaN(new Date(fechaInicioISO).getTime()) || isNaN(new Date(fechaFinISO).getTime())) {
        throw new BadRequestException('Las fechas no son válidas.');
      }
  
      // Consultar los afiliados
      const afiliados = await this.contratosRepository
        .createQueryBuilder('contrato')
        .leftJoinAndSelect('contrato.titular', 'titular')
        .leftJoinAndSelect('contrato.plan', 'plan')
        .leftJoinAndSelect('plan.categoria', 'categoria')
        .where(
          `contrato.fecha_inicio_contrato BETWEEN TO_DATE(:inicio, 'YYYY-MM-DD') AND TO_DATE(:fin, 'YYYY-MM-DD')`,
          {
            inicio: fechaInicioISO,
            fin: fechaFinISO,
          },
        )
        .select([
          'contrato.fecha_inicio_contrato',
          'contrato.fecha_cancelacion_contrato',
          'contrato.observacion',
          'contrato.numero_producto',
          'contrato.status',
          'titular.n_identificacion',
          'titular.primer_nombre',
          'titular.segundo_nombre',
          'titular.primer_apellido',
          'titular.segundo_apellido',
          'titular.fecha_nacimiento',
          'titular.telefono_1',
          'titular.telefono_2',
          'titular.telefono_3',
          'titular.correo_1',
          'titular.direccion_residencia',
          'plan.nombre_plan',
          'categoria.nombre',
        ])
        .getMany();
  
      // Formatear los datos para el Excel
      const afiliadosConFormato = afiliados.map((afiliado) => ({
        'Número de Producto': afiliado.numero_producto,
        'Fecha de Inicio': afiliado.fecha_inicio_contrato
          ? new Date(afiliado.fecha_inicio_contrato).toLocaleDateString('es-ES')
          : null,
        'Fecha de Cancelación': afiliado.fecha_cancelacion_contrato
          ? new Date(afiliado.fecha_cancelacion_contrato).toLocaleDateString('es-ES')
          : null,
        Estado: afiliado.status,
        Observación: afiliado.observacion || '',
        'Identificación del Titular': afiliado.titular.n_identificacion,
        'Primer Nombre': afiliado.titular.primer_nombre,
        'Segundo Nombre': afiliado.titular.segundo_nombre || '',
        'Primer Apellido': afiliado.titular.primer_apellido,
        'Segundo Apellido': afiliado.titular.segundo_apellido || '',
        'Teléfono 1': afiliado.titular.telefono_1 || '',
        'Teléfono 2': afiliado.titular.telefono_2 || '',
        'Teléfono 3': afiliado.titular.telefono_3 || '',
        Correo: afiliado.titular.correo_1 || '',
        'Fecha de Nacimiento': afiliado.titular.fecha_nacimiento
          ? new Date(afiliado.titular.fecha_nacimiento).toLocaleDateString('es-ES')
          : null,
        Dirección: afiliado.titular.direccion_residencia || '',
        'Nombre del Plan': afiliado.plan.nombre_plan,
        Categoría: afiliado.plan.categoria.nombre,
      }));
  
      // Crear el archivo Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Afiliados');
  
      // Definir las columnas del archivo
      worksheet.columns = Object.keys(afiliadosConFormato[0]).map((key) => ({
        header: key,
        key,
      }));
  
      // Agregar las filas al archivo
      worksheet.addRows(afiliadosConFormato);
  
      // Configurar la respuesta HTTP
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Afiliados_Por_Periodo.xlsx"',
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
  
      // Enviar el archivo al cliente
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al generar el archivo Excel.');
    }
  }
  
  async generarExcelBeneficiarios(res: Response): Promise<void> {
    try {
      // Ejecutar la consulta existente
      const beneficiarios = await this.beneficiariosRepository
        .createQueryBuilder('beneficiario')
        .leftJoinAndSelect('beneficiario.contrato', 'contrato')
        .leftJoinAndSelect('contrato.titular', 'titular')
        .select([
          'titular.n_identificacion AS n_identificacion_titular', // DNI del titular
          'beneficiario.primer_nombre AS primer_nombre',
          'beneficiario.segundo_nombre AS segundo_nombre',
          'beneficiario.primer_apellido AS primer_apellido',
          'beneficiario.segundo_apellido AS segundo_apellido',
          'beneficiario.parentesco AS parentesco',
          `TO_CHAR(beneficiario.fecha_nacimiento, 'DD/MM/YYYY') AS fecha_nacimiento`, // Fecha formateada
          `TRUNC(MONTHS_BETWEEN(SYSDATE, beneficiario.fecha_nacimiento) / 12) AS edad`, // Edad calculada
        ])
        .getRawMany();
  
      // Crear la hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(beneficiarios);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiarios');
  
      // Configurar el archivo en formato Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      const excelFilename = `Beneficiarios_${new Date().toISOString().split('T')[0]}.xlsx`;
  
      // Enviar el archivo como respuesta
      res.setHeader('Content-Disposition', `attachment; filename=${excelFilename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al generar el archivo Excel.',
      );
    }
  }
}
