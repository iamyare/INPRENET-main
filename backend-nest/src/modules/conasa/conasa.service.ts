import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Plan } from './entities/net_planes.entity';
import { Net_Categoria } from './entities/net_categorias.entity';
import { DataSource, Repository } from 'typeorm';
import { Net_Contratos_Conasa } from './entities/net_contratos_conasa.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { net_detalle_persona } from '../Persona/entities/net_detalle_persona.entity';
import { Net_Beneficiarios_Conasa } from './entities/net_beneficiarios_conasa.entity';
import { CrearBeneficiarioDto } from './dto/beneficiarios-conasa.dto';

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
  ) {}

  private generateNumeroProducto(): string {
    const prefix = 'PROD';
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
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
  ): Promise<string> {
    // Verificar si la persona existe
    const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
    if (!persona) {
      throw new NotFoundException('La persona no existe.');
    }

    // Verificar si la persona tiene al menos uno de los tipos permitidos
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

    // Verificar si el plan existe
    const plan = await this.planesRepository.findOne({ where: { id_plan: idPlan } });
    if (!plan) {
      throw new NotFoundException('El plan no existe.');
    }

    // Formatear fechas
    const formattedFechaInicio = this.formatDateToYYYYMMDD(fechaInicioContrato);
    const formattedFechaCancelacion = fechaCancelacionContrato
      ? this.formatDateToYYYYMMDD(fechaCancelacionContrato)
      : null;

    // Generar número de producto
    const numeroProducto = this.generateNumeroProducto();

    // Crear y guardar el contrato
    const contrato = this.contratosRepository.create({
      titular: persona,
      plan,
      numero_producto: numeroProducto,
      lugar_cobro: lugarCobro,
      fecha_inicio_contrato: formattedFechaInicio,
      fecha_cancelacion_contrato: formattedFechaCancelacion,
      status: 'ACTIVO',
    });

    await this.contratosRepository.save(contrato);
    return 'Contrato asignado exitosamente.';
  }

  async crearBeneficiarios(
    idContrato: number,
    beneficiarios: CrearBeneficiarioDto[],
  ): Promise<string> {
    // Verificar si el contrato existe
    const contrato = await this.contratosRepository.findOne({ where: { id_contrato: idContrato } });
    if (!contrato) {
      throw new NotFoundException('El contrato no existe.');
    }
  
    // Crear y guardar beneficiarios
    const nuevosBeneficiarios = beneficiarios.map((beneficiario) =>
      this.beneficiariosRepository.create({
        contrato, // Aquí asignamos directamente la instancia del contrato
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
      // Crear contrato
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
    // Verificar si el DNI corresponde a una persona existente
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: dni },
      relations: ['detallePersona'],
    });
    
    if (!persona) {
      throw new NotFoundException(`No se encontró ninguna persona con el DNI ${dni}`);
    }
  
    // Buscar el contrato asociado al titular
    const contrato = await this.contratosRepository.findOne({
      where: { titular: { id_persona: persona.id_persona } },
      relations: ['plan', 'beneficiarios'],
    });
  
    if (!contrato) {
      throw new NotFoundException(`No se encontró ningún contrato para la persona con DNI ${dni}`);
    }
  
    // Formatear los datos para la respuesta
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
        observaciones: beneficiario.observaciones,
      })),
    };
  
    return contratoFormateado;
  }
  
}
