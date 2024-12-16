import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Plan } from './entities/net_planes.entity';
import { Net_Categoria } from './entities/net_categorias.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Net_Contratos_Conasa } from './entities/net_contratos_conasa.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { net_detalle_persona } from '../Persona/entities/net_detalle_persona.entity';
import { Net_Beneficiarios_Conasa } from './entities/net_beneficiarios_conasa.entity';
import { CrearBeneficiarioDto } from './dto/beneficiarios-conasa.dto';
import { Net_Usuario_Empresa } from '../usuario/entities/net_usuario_empresa.entity';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
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
    @InjectRepository(net_detalle_persona)
    private detallePersonaRepository: Repository<net_detalle_persona>,
    @InjectRepository(Net_Plan)
    private planesRepository: Repository<Net_Plan>,
    @InjectRepository(Net_Beneficiarios_Conasa)
    private beneficiariosRepository: Repository<Net_Beneficiarios_Conasa>,
    private readonly dataSource: DataSource,
    @InjectRepository(Net_Empleado_Centro_Trabajo)
    private empCentTrabajoRepository: Repository<Net_Empleado_Centro_Trabajo>,
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

  async asignarContrato(
    idPersona: number,
    idPlan: number,
    lugarCobro: string,
    fechaInicioContrato: string,
    fechaCancelacionContrato?: string,
    observacion?: string
  ): Promise<string> {
    const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
    if (!persona) {
      throw new NotFoundException('La persona no existe.');
    }
    const tiposPermitidos = ['AFILIADO', 'JUBILADO', 'PENSIONADO'];
    const tieneTipoPermitido = await this.detallePersonaRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.tipoPersona', 'tipoPersona')
      .where('detalle.ID_PERSONA = :idPersona', { idPersona })
      .andWhere('tipoPersona.tipo_persona IN (:...tiposPermitidos)', { tiposPermitidos })
      .getCount();

    if (tieneTipoPermitido === 0) {
      throw new BadRequestException('La persona no tiene un tipo permitido para asignar un contrato.');
    }
    const plan = await this.planesRepository.findOne({ where: { id_plan: idPlan } });
    if (!plan) {
      throw new NotFoundException('El plan no existe.');
    }
    const formattedFechaInicio = this.formatDateToYYYYMMDD(fechaInicioContrato);
    const formattedFechaCancelacion = fechaCancelacionContrato
      ? this.formatDateToYYYYMMDD(fechaCancelacionContrato)
      : null;
    const numeroProducto = this.generateNumeroProducto();

    const contrato = this.contratosRepository.create({
      titular: persona,
      plan,
      numero_producto: numeroProducto,
      lugar_cobro: lugarCobro,
      fecha_inicio_contrato: formattedFechaInicio,
      fecha_cancelacion_contrato: formattedFechaCancelacion,
      status: 'ACTIVO',
      observacion: observacion,
    });

    await this.contratosRepository.save(contrato);
    return 'Contrato asignado exitosamente.';
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
  

  async manejarTransaccion(
    contratoData: {
      idPersona: number;
      idPlan: number;
      lugarCobro: string;
      fechaInicioContrato: string;
      fechaCancelacionContrato?: string;
    },
    beneficiariosData?: CrearBeneficiarioDto[],
  ): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const contrato = this.contratosRepository.create({
        titular: await this.personaRepository.findOne({ where: { id_persona: contratoData.idPersona } }),
        plan: await this.planesRepository.findOne({ where: { id_plan: contratoData.idPlan } }),
        numero_producto: this.generateNumeroProducto(),
        lugar_cobro: contratoData.lugarCobro,
        fecha_inicio_contrato: this.formatDateToYYYYMMDD(contratoData.fechaInicioContrato),
        fecha_cancelacion_contrato: contratoData.fechaCancelacionContrato
          ? this.formatDateToYYYYMMDD(contratoData.fechaCancelacionContrato)
          : null,
        status: 'ACTIVO',
      });
      const savedContrato = await manager.save(contrato);
      if (beneficiariosData && beneficiariosData.length > 0) {
        const beneficiariosRepo = manager.getRepository(Net_Beneficiarios_Conasa);
        const nuevosBeneficiarios = beneficiariosData.map((beneficiario) =>
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

  async buscarPersonaPorNombresYApellidos(
    terminos: string,
    email: string,
    password: string,
  ): Promise<{ nombre_completo: string; dni: string }[]> {
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
  
    if (!terminos) {
      throw new NotFoundException('Search term cannot be empty');
    }
  
    const palabras = terminos.split(' ').map((palabra) => palabra.trim().toLowerCase());
    if (palabras.length === 0) {
      throw new NotFoundException('No valid search terms provided');
    }
  
    const query = this.personaRepository.createQueryBuilder('persona').select([
      'persona.primer_nombre',
      'persona.segundo_nombre',
      'persona.tercer_nombre',
      'persona.primer_apellido',
      'persona.segundo_apellido',
      'persona.n_identificacion',
    ]);
  
    const parametros: Record<string, string> = {};
    let whereClause = '';
  
    palabras.forEach((palabra, palabraIndex) => {
      const marcadorBase = `palabra${palabraIndex}`;
      const condiciones = [
        `LOWER(persona.primer_nombre) LIKE :${marcadorBase}_primer_nombre`,
        `LOWER(persona.segundo_nombre) LIKE :${marcadorBase}_segundo_nombre`,
        `LOWER(persona.tercer_nombre) LIKE :${marcadorBase}_tercer_nombre`,
        `LOWER(persona.primer_apellido) LIKE :${marcadorBase}_primer_apellido`,
        `LOWER(persona.segundo_apellido) LIKE :${marcadorBase}_segundo_apellido`,
      ];
      if (whereClause) {
        whereClause += ' AND ';
      }
      whereClause += `(${condiciones.join(' OR ')})`;
      parametros[`${marcadorBase}_primer_nombre`] = `%${palabra}%`;
      parametros[`${marcadorBase}_segundo_nombre`] = `%${palabra}%`;
      parametros[`${marcadorBase}_tercer_nombre`] = `%${palabra}%`;
      parametros[`${marcadorBase}_primer_apellido`] = `%${palabra}%`;
      parametros[`${marcadorBase}_segundo_apellido`] = `%${palabra}%`;
    });
  
    const personas = await query.where(whereClause).setParameters(parametros).getMany();
  
    if (personas.length === 0) {
      throw new NotFoundException(`No persons found with terms: ${terminos}`);
    }
  
    return personas.map((persona) => ({
      nombre_completo: `${persona.primer_nombre || ''} ${persona.segundo_nombre || ''} ${persona.tercer_nombre || ''} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim(),
      dni: persona.n_identificacion,
    }));
  }
  
  async findOneConasa(term: string, email: string, password: string) {
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(["CONSULTA", "TODO"]) },
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

    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: term },
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
      throw new NotFoundException(`Afiliado con N_IDENTIFICACION ${term} no existe`);
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
  }
  
}
