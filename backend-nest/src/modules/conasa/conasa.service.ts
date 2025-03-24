import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Net_Plan } from './entities/net_planes.entity';
import { Net_Categoria } from './entities/net_categorias.entity';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
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
import { Net_Facturas_Conasa } from './entities/net_facturas_conasa.entity';

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
    @InjectRepository(Net_Facturas_Conasa)
    private readonly facturasRepository: Repository<Net_Facturas_Conasa>,
  ) { }

  async obtenerConsultasConNombre(): Promise<any[]> {
    const consultas = await this.consultaRepository
      .createQueryBuilder('c')
      .leftJoin(net_persona, 'p', 'p.n_identificacion = c.dni')
      .select([
        'c.dni AS dni',
        'c.fecha_consulta AS fecha_consulta',
        'c.motivo_consulta AS motivo_consulta',
        'c.tiempo_sintomas AS tiempo_sintomas',
        'c.tipo_atencion AS tipo_atencion',
        'c.triage AS triage',
        'c.diagnostico_presuntivo AS diagnostico_presuntivo',
        'c.detalle_atencion AS detalle_atencion',
        'c.fecha_cierre AS fecha_cierre',
        'p.primer_nombre AS primer_nombre',
        'p.segundo_nombre AS segundo_nombre',
        'p.primer_apellido AS primer_apellido',
        'p.segundo_apellido AS segundo_apellido',
      ])
      .orderBy('c.fecha_consulta', 'DESC')
      .getRawMany();

    return consultas.map((row) => ({
      dni: row.DNI ? row.DNI : '',
      fecha_consulta: row.FECHA_CONSULTA ? row.FECHA_CONSULTA : '',
      motivo_consulta: row.MOTIVO_CONSULTA ? row.MOTIVO_CONSULTA.toUpperCase() : '',
      tiempo_sintomas: row.TIEMPO_SINTOMAS ? row.TIEMPO_SINTOMAS.toUpperCase() : '',
      tipo_atencion: row.TIPO_ATENCION ? row.TIPO_ATENCION : '',
      triage: row.TRIAGE ? row.TRIAGE.toUpperCase() : '',
      diagnostico_presuntivo: row.DIAGNOSTICO_PRESUNTIVO ? row.DIAGNOSTICO_PRESUNTIVO.toUpperCase() : '',
      detalle_atencion: row.DETALLE_ATENCION ? row.DETALLE_ATENCION.toUpperCase() : '',
      fecha_cierre: row.FECHA_CIERRE ? row.FECHA_CIERRE : '',
      nombre_completo: row.PRIMER_NOMBRE
        ? `${row.PRIMER_NOMBRE || ''} ${row.SEGUNDO_NOMBRE || ''} ${row.PRIMER_APELLIDO || ''} ${row.SEGUNDO_APELLIDO || ''}`.trim().toUpperCase()
        : '',
    }));
  }

  async obtenerAfiliadosMesAnterior() {
    return this.dataSource.query(`
      WITH planillas_filtradas AS (
          SELECT
              dpb.id_persona,
              p.id_planilla,
              tp.nombre_planilla,
              p.periodo_inicio,
              p.fecha_cierre
          FROM
              net_detalle_pago_beneficio dpb
          INNER JOIN
              net_planilla p ON dpb.id_planilla = p.id_planilla
          INNER JOIN
              net_tipo_planilla tp ON p.id_tipo_planilla = tp.id_tipo_planilla
          INNER JOIN
              net_persona_por_banco ppb ON dpb.id_persona = ppb.id_persona

          LEFT JOIN NET_BANCO_PLANILLA BB ON
              BB.ID_PERSONA = dpb.ID_PERSONA
              AND BB.ID_CAUSANTE = dpb.ID_CAUSANTE
              AND BB.ID_DETALLE_PERSONA = dpb.ID_DETALLE_PERSONA
              AND BB.ID_BENEFICIO = dpb.ID_BENEFICIO
              AND BB.ID_PLANILLA = dpb.ID_PLANILLA

            LEFT JOIN NET_PERSONA_POR_BANCO perPorBan
                ON perPorBan.ID_PERSONA = BB.ID_PERSONA
                AND perPorBan.ID_AF_BANCO = BB.ID_AF_BANCO

            LEFT JOIN NET_BANCO banco
                ON perPorBan.ID_BANCO = banco.ID_BANCO
          
          WHERE
              tp.nombre_planilla IN ('ORDINARIA DE JUBILADOS Y PENSIONADOS')
              AND perPorBan.id_af_banco IS NOT NULL
              AND dpb.estado = 'PAGADA'
      ),
      mes_anterior_1 AS (
          SELECT DISTINCT id_persona
          FROM planillas_filtradas
          WHERE TRUNC(periodo_inicio, 'MM') = ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -1)
      )
      SELECT 
          np.n_identificacion,
          REGEXP_REPLACE(
              TRIM(
                  COALESCE(np.primer_nombre, '') || ' ' ||
                  COALESCE(np.segundo_nombre, '') || ' ' ||
                  COALESCE(np.tercer_nombre, '') || ' ' ||
                  COALESCE(np.primer_apellido, '') || ' ' ||
                  COALESCE(np.segundo_apellido, '')
              ),
              '\\s+', ' '
          ) AS nombre_completo
      FROM mes_anterior_1 ma
      INNER JOIN net_persona np ON ma.id_persona = np.id_persona
    `);
  }

  async guardarFactura(data: {
    tipo_factura: number;
    periodo_factura: string;
    archivo_pdf: Buffer;
  }): Promise<Net_Facturas_Conasa> {
    if (data.tipo_factura !== 1 && data.tipo_factura !== 2) {
      throw new BadRequestException(
        'El tipo de factura debe ser 1 o 2 (Asistencia Médica o Contratos Funerarios).',
      );
    }
    const nuevaFactura = this.facturasRepository.create({
      tipo_factura: data.tipo_factura,
      periodo_factura: data.periodo_factura,
      archivo_pdf: data.archivo_pdf,
    });

    return this.facturasRepository.save(nuevaFactura);
  }

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

  async procesarContrato(payload: ManejarTransaccionDto): Promise<string> {
    const { contrato, beneficiarios } = payload;
    try {
        const resultadoActualizacion = await this.actualizarDatosPersona(contrato);

        if (resultadoActualizacion.affected === 0) {
            throw new Error('No se pudo actualizar la información de la persona.');
        }
        const resultadoContrato = await this.crearContratoConBeneficiarios(contrato, beneficiarios);
        return resultadoContrato;
    } catch (error) {
        console.error('Error en procesarContrato:', error.message);
        throw new BadRequestException('Error al procesar el contrato.');
    }
}

private async actualizarDatosPersona(contrato: AsignarContratoDto): Promise<UpdateResult> {
    try {
        const resultado = await this.dataSource
            .createQueryBuilder()
            .update(net_persona)
            .set({
                telefono_1: contrato.telefono_1 || null,
                telefono_2: contrato.telefono_2 || null,
                telefono_3: contrato.telefono_3 || null,
                correo_1: contrato.correo_1 || null,
            })
            .where('id_persona = :idPersona', { idPersona: contrato.idPersona })
            .execute();
        return resultado;
    } catch (error) {
        console.error('Error al actualizar datos de la persona:', error.message);
        throw new Error('Error al actualizar datos de la persona.');
    }
}

private async crearContratoConBeneficiarios(contrato: AsignarContratoDto, beneficiarios: CrearBeneficiarioDto[]): Promise<string> {
    try {
        const persona = await this.verificarPersona(contrato.idPersona);
        const plan = await this.verificarPlan(contrato.idPlan);
        const existeContrato = await this.verificarContratoExistente(contrato.idPersona);

        if (existeContrato) {
            throw new BadRequestException(`La persona con ID ${contrato.idPersona} ya tiene un contrato activo.`);
        }

        const nuevoContrato = this.contratosRepository.create({
            titular: persona,
            plan,
            numero_producto: this.generateNumeroProducto(),
            lugar_cobro: contrato.lugarCobro,
            fecha_inicio_contrato: this.formatDateToYYYYMMDD(contrato.fechaInicioContrato),
            fecha_cancelacion_contrato: contrato.fechaCancelacionContrato ? this.formatDateToYYYYMMDD(contrato.fechaCancelacionContrato) : null,
            status: 'ACTIVO',
            direccion_trabajo: contrato.direccionTrabajo || null,
            empresa: contrato.empresa || null,
            observacion: contrato.observacion || '',
        });

        const savedContrato = await this.contratosRepository.save(nuevoContrato);

        if (beneficiarios && beneficiarios.length > 0) {
            const beneficiariosRepo = this.dataSource.getRepository(Net_Beneficiarios_Conasa);
            const nuevosBeneficiarios = beneficiarios.map((beneficiario) =>
                beneficiariosRepo.create({
                    contrato: savedContrato,
                    ...beneficiario,
                }),
            );
            await beneficiariosRepo.save(nuevosBeneficiarios);
        }
        return 'Contrato y beneficiarios creados exitosamente.';
    } catch (error) {
        console.error('Error al crear contrato y beneficiarios:', error.message);
        throw new Error('Error al crear contrato y beneficiarios.');
    }
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
    // Obtener la persona por su DNI
    const persona = await this.personaRepository.findOne({
        where: { n_identificacion: dni },
        relations: ['detallePersona'],
    });

    if (!persona) {
        throw new NotFoundException(`No se encontró ninguna persona con el DNI ${dni}`);
    }

    // Obtener todos los contratos asociados a la persona
    const contratos = await this.contratosRepository.find({
        where: { titular: { id_persona: persona.id_persona } },
        relations: ['plan', 'plan.categoria', 'beneficiarios'],
    });

    if (!contratos || contratos.length === 0) {
        throw new NotFoundException(`No se encontró ningún contrato para la persona con DNI ${dni}`);
    }

    // Formatear los contratos
    const contratosFormateados = contratos.map((contrato) => ({
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
            categoria: contrato.plan.categoria
                ? {
                    idCategoria: contrato.plan.categoria.id_categoria,
                    nombre: contrato.plan.categoria.nombre,
                }
                : null,
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
    }));

    return contratosFormateados;
}


  async obtenerPlanillaContratosActivos(email: string, password: string): Promise<any[]> {
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['ADMINISTRADOR', 'CONSULTA', 'TODO']) },
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
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['ADMINISTRADOR', 'CONSULTA', 'TODO']) },
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
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['ADMINISTRADOR', 'CONSULTA', 'TODO']) },
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
      const {
        dni,
        corrcaso,
        fecha_consulta,
        motivo_consulta,
        tiempo_sintomas,
        tipo_atencion,
        triage,
        diagnostico_presuntivo,
        detalle_atencion,
        fecha_cierre,
      } = consultaDto;

      try {
        if (!dni || dni.length !== 13) {
          throw new Error('El campo "dni" es obligatorio y debe tener exactamente 13 caracteres.');
        }

        if (!fecha_consulta) {
          throw new Error('El campo "fecha_consulta" es obligatorio.');
        }

        if (!motivo_consulta) {
          throw new Error('El campo "motivo_consulta" es obligatorio.');
        }

        if (!tiempo_sintomas) {
          throw new Error('El campo "tiempo_sintomas" es obligatorio.');
        }

        if (!tipo_atencion) {
          throw new Error('El campo "tipo_atencion" es obligatorio.');
        }

        if (!triage) {
          throw new Error('El campo "triage" es obligatorio.');
        }

        if (!diagnostico_presuntivo) {
          throw new Error('El campo "diagnostico_presuntivo" es obligatorio.');
        }

        if (detalle_atencion && detalle_atencion.length > 1000) {
          throw new Error('El campo "detalle_atencion" no debe exceder los 500 caracteres.');
        }

        if (fecha_cierre && isNaN(Date.parse(fecha_cierre))) {
          throw new Error('El campo "fecha_cierre" debe tener un formato de fecha válido.');
        }

        const nuevaConsulta = this.consultaRepository.create({
          ...consultaDto,
          usuario_creacion: email,
        });

        await this.consultaRepository.save(nuevaConsulta);
        resultados.totalExitosos += 1;
      } catch (error) {
        resultados.fallidos.push({
          corrcaso,
          error: error.message,
        });
      }
    }
    return {
      message: 'Proceso de registro de asistencias médicas completado.',
      totalExitosos: resultados.totalExitosos,
      fallidos: resultados.fallidos
    };
  }

  async obtenerDatos(email: string, password: string, tipo: number): Promise<any> {
    const empCentTrabajoRepository = await this.empCentTrabajoRepository.findOne({
      where: {
        correo_1: email,
        usuarioEmpresas: {
          usuarioModulos: {
            rolModulo: { nombre: In(['ADMINISTRADOR', 'CONSULTA', 'TODO']) },
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

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    if (tipo === 1) {
      const currentDate = new Date();
      const formattedCurrentDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const previousDate1 = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const formattedPreviousDate1 = `${previousDate1.getFullYear()}-${String(previousDate1.getMonth() + 1).padStart(2, '0')}`;
      const previousDate2 = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
      const formattedPreviousDate2 = `${previousDate2.getFullYear()}-${String(previousDate2.getMonth() + 1).padStart(2, '0')}`;

      // Validar si alguna planilla se ha pagado en el mes actual
      const planillaPagadaQuery = `
        SELECT COUNT(*) AS pagadas
        FROM net_planilla p
        INNER JOIN net_tipo_planilla tp ON p.id_tipo_planilla = tp.id_tipo_planilla
        WHERE tp.nombre_planilla IN ('ORDINARIA DE JUBILADOS Y PENSIONADOS', 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS')
          AND TRUNC(p.periodo_inicio, 'MM') = TRUNC(SYSDATE, 'MM')
          AND p.estado = 'CERRADA'
      `;
      const planillaPagadaResult = await this.dataSource.query(planillaPagadaQuery);
      const planillasPagadas = planillaPagadaResult[0]?.PAGADAS || 0;
      const query = `
        WITH planillas_filtradas AS (
        SELECT
            dpb.id_persona,
            p.id_planilla,
            tp.nombre_planilla,
            p.periodo_inicio,
            p.fecha_cierre
        FROM
            net_detalle_pago_beneficio dpb
        INNER JOIN
            net_planilla p ON dpb.id_planilla = p.id_planilla
        INNER JOIN
            net_tipo_planilla tp ON p.id_tipo_planilla = tp.id_tipo_planilla
        INNER JOIN
            net_persona_por_banco ppb ON dpb.id_persona = ppb.id_persona
        
         LEFT JOIN NET_BANCO_PLANILLA BB ON
              BB.ID_PERSONA = dpb.ID_PERSONA
              AND BB.ID_CAUSANTE = dpb.ID_CAUSANTE
              AND BB.ID_DETALLE_PERSONA = dpb.ID_DETALLE_PERSONA
              AND BB.ID_BENEFICIO = dpb.ID_BENEFICIO
              AND BB.ID_PLANILLA = dpb.ID_PLANILLA

            LEFT JOIN NET_PERSONA_POR_BANCO perPorBan
                ON perPorBan.ID_PERSONA = BB.ID_PERSONA
                AND perPorBan.ID_AF_BANCO = BB.ID_AF_BANCO

            LEFT JOIN NET_BANCO banco
                ON perPorBan.ID_BANCO = banco.ID_BANCO
        
        WHERE
            tp.nombre_planilla IN ('ORDINARIA DE JUBILADOS Y PENSIONADOS', 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS')
            AND perPorBan.id_af_banco IS NOT NULL
            AND dpb.estado = 'PAGADA'
            AND p.generar_voucher = 'SI'
    ),
    mes_actual AS (
        SELECT DISTINCT id_persona
        FROM planillas_filtradas
        WHERE TRUNC(periodo_inicio, 'MM') = TRUNC(SYSDATE, 'MM')
    ),
    mes_anterior_1 AS (
        SELECT DISTINCT id_persona
        FROM planillas_filtradas
        WHERE TRUNC(periodo_inicio, 'MM') = ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -1)
    ),
    mes_anterior_2 AS (
        SELECT DISTINCT id_persona
        FROM planillas_filtradas
        WHERE TRUNC(periodo_inicio, 'MM') = ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -2)
    ),
    mes_anterior_3 AS (
        SELECT DISTINCT id_persona
        FROM planillas_filtradas
        WHERE TRUNC(periodo_inicio, 'MM') = ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3)
    )
    SELECT
        (SELECT COUNT(*) FROM mes_actual) AS total_mes_actual,
        (SELECT COUNT(*) FROM mes_anterior_1) AS total_mes_anterior_1,
        (SELECT COUNT(*) FROM mes_anterior_2) AS total_mes_anterior_2,
        (SELECT COUNT(*) FROM mes_anterior_3) AS total_mes_anterior_3,
        (SELECT COUNT(*) FROM mes_actual WHERE id_persona NOT IN (SELECT id_persona FROM mes_anterior_1)) AS altas_mes_actual,
        (SELECT COUNT(*) FROM mes_anterior_1 WHERE id_persona NOT IN (SELECT id_persona FROM mes_actual)) AS bajas_mes_actual,
        (SELECT COUNT(*) FROM mes_anterior_1 WHERE id_persona NOT IN (SELECT id_persona FROM mes_anterior_2)) AS altas_mes_anterior_1,
        (SELECT COUNT(*) FROM mes_anterior_2 WHERE id_persona NOT IN (SELECT id_persona FROM mes_anterior_1)) AS bajas_mes_anterior_1,
        (SELECT COUNT(*) FROM mes_anterior_2 WHERE id_persona NOT IN (SELECT id_persona FROM mes_anterior_3)) AS altas_mes_anterior_2,
        (SELECT COUNT(*) FROM mes_anterior_3 WHERE id_persona NOT IN (SELECT id_persona FROM mes_anterior_2)) AS bajas_mes_anterior_2
    FROM DUAL
      `;
      const result = await this.dataSource.query(query);
      const {
        TOTAL_MES_ACTUAL,
        TOTAL_MES_ANTERIOR_1,
        TOTAL_MES_ANTERIOR_2,
        ALTAS_MES_ACTUAL,
        BAJAS_MES_ACTUAL,
        ALTAS_MES_ANTERIOR_1,
        BAJAS_MES_ANTERIOR_1,
        ALTAS_MES_ANTERIOR_2,
        BAJAS_MES_ANTERIOR_2,
      } = result[0] || {};

      const response = [];
      if (planillasPagadas === 0) {
        response.push({
          mes: formattedCurrentDate,
          tot_no_pensionados_activos: 0,
          altas: 0,
          bajas: 0,
        });
      } else {
        response.push({
          mes: formattedCurrentDate,
          tot_no_pensionados_activos: TOTAL_MES_ACTUAL ? Number(TOTAL_MES_ACTUAL) : 0,
          altas: ALTAS_MES_ACTUAL ? Number(ALTAS_MES_ACTUAL) : 0,
          bajas: BAJAS_MES_ACTUAL ? Number(BAJAS_MES_ACTUAL) : 0,
        });
      }
      response.push(
        {
          mes: formattedPreviousDate1,
          tot_no_pensionados_activos: TOTAL_MES_ANTERIOR_1 ? Number(TOTAL_MES_ANTERIOR_1) : 0,
          altas: ALTAS_MES_ANTERIOR_1 ? Number(ALTAS_MES_ANTERIOR_1) : 0,
          bajas: BAJAS_MES_ANTERIOR_1 ? Number(BAJAS_MES_ANTERIOR_1) : 0,
        },
        {
          mes: formattedPreviousDate2,
          tot_no_pensionados_activos: TOTAL_MES_ANTERIOR_2 ? Number(TOTAL_MES_ANTERIOR_2) : 0,
          altas: ALTAS_MES_ANTERIOR_2 ? Number(ALTAS_MES_ANTERIOR_2) : 0,
          bajas: BAJAS_MES_ANTERIOR_2 ? Number(BAJAS_MES_ANTERIOR_2) : 0,
        }
      );
      return response;
    }
    else if (tipo === 2) {
      const contratosActivos = await this.contratosRepository.find({
        where: { status: 'ACTIVO' },
        relations: ['plan', 'plan.categoria'],
      });

      const contratosCancelados = await this.contratosRepository.find({
        where: { status: 'CANCELADO' },
        relations: ['plan', 'plan.categoria'],
      });

      const categoriaMap = new Map<
        string,
        {
          nombre_categoria: string;
          tot_no_contratos_activos: number;
          total_valor_contratos: number;
          altas: number;
          cancelaciones: number;
          planes: Map<
            string,
            {
              tot_no_contratos_activos: number;
              total_valor_contratos: number;
            }
          >;
        }
      >();

      contratosActivos.forEach((contrato) => {
        const categoria = contrato.plan.categoria.nombre;
        const plan = contrato.plan.nombre_plan;
        const valorContrato = contrato.plan.precio;

        if (!categoriaMap.has(categoria)) {
          categoriaMap.set(categoria, {
            nombre_categoria: categoria,
            tot_no_contratos_activos: 0,
            total_valor_contratos: 0,
            altas: 0,
            cancelaciones: 0,
            planes: new Map(),
          });
        }

        const categoriaData = categoriaMap.get(categoria)!;
        categoriaData.tot_no_contratos_activos++;
        categoriaData.total_valor_contratos += valorContrato;

        if (!categoriaData.planes.has(plan)) {
          categoriaData.planes.set(plan, {
            tot_no_contratos_activos: 0,
            total_valor_contratos: 0,
          });
        }

        const planData = categoriaData.planes.get(plan)!;
        planData.tot_no_contratos_activos++;
        planData.total_valor_contratos += valorContrato;
      });

      contratosActivos.forEach((contrato) => {
        const categoria = contrato.plan.categoria.nombre;
        if (new Date(contrato.fecha_inicio_contrato).getMonth() === currentDate.getMonth()) {
          const categoriaData = categoriaMap.get(categoria)!;
          categoriaData.altas++;
        }
      });

      contratosCancelados.forEach((contrato) => {
        const categoria = contrato.plan.categoria.nombre;
        if (new Date(contrato.fecha_cancelacion_contrato).getMonth() === currentDate.getMonth()) {
          const categoriaData = categoriaMap.get(categoria)!;
          categoriaData.cancelaciones++;
        }
      });

      return Array.from(categoriaMap.entries()).map(([categoria, data]) => ({
        mes: formattedDate,
        nombre_categoria: data.nombre_categoria,
        tot_no_general_contratos_activos: data.tot_no_contratos_activos,
        altas: data.altas,
        cancelaciones: data.cancelaciones,
        total_valor_general_contratos: data.total_valor_contratos,
        planes: Array.from(data.planes.entries()).map(([nombre_plan, planData]) => ({
          nombre_plan,
          tot_no_contratos_activos: planData.tot_no_contratos_activos,
          total_valor_contratos: planData.total_valor_contratos,
        })),
      }));
    } else {
      throw new BadRequestException('Tipo de consulta no válido. Debe ser 1 o 2.');
    }
  }

  async cancelarContrato(dto: CancelarContratoDto): Promise<string> {
    let contrato: Net_Contratos_Conasa | undefined;
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

  async listarFacturas(tipo: number | null): Promise<Net_Facturas_Conasa[]> {
    const whereCondition = tipo !== null ? { tipo_factura: tipo } : {};
    return await this.facturasRepository.find({
      where: whereCondition,
      order: { fecha_subida: 'DESC' },
    });
  }


  async obtenerFactura(id: number): Promise<Net_Facturas_Conasa | null> {
    return await this.facturasRepository.findOne({ where: { id_factura: id } });
  }

  async eliminarFactura(id: number): Promise<boolean> {
    const factura = await this.obtenerFactura(id);

    if (!factura) {
      throw new NotFoundException('Factura no encontrada.');
    }

    const ahora = new Date();
    const limiteEliminacion = new Date(factura.fecha_subida);
    limiteEliminacion.setHours(limiteEliminacion.getHours() + 24);

    if (ahora > limiteEliminacion) {
      return false;
    }

    await this.facturasRepository.delete(id);
    return true;
  }
}
