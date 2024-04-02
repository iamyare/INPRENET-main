import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Net_Institucion } from 'src/modules/Empresarial/institucion/entities/net_institucion.entity';
import * as xlsx from 'xlsx';
import { AfiliadoService } from 'src/modules/afiliado/afiliado.service';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Net_Detalle_Afiliado } from 'src/modules/afiliado/entities/Net_detalle_persona.entity';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';
import { UpdateDetallePlanIngDto } from './dto/update-detalle-plani-Ing.dto';
import { Net_Detalle_planilla_ingreso } from './entities/net_detalle_plani_ing.entity';
import { Net_SALARIO_COTIZABLE } from './entities/net_detalle_plani_ing.entity copy';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';

@Injectable()
export class DetallePlanillaIngresoService {
  private readonly logger = new Logger(DetallePlanillaIngresoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) { }

  @InjectRepository(Net_Detalle_planilla_ingreso)
  private detallePlanillaIngr: Repository<Net_Detalle_planilla_ingreso>

  @InjectRepository(Net_SALARIO_COTIZABLE)
  private salarioCotizableRepository: Repository<Net_SALARIO_COTIZABLE>
  @InjectRepository(Net_Persona)
  private personaRepository: Repository<Net_Persona>


  async obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number): Promise<any> {
    try {
      const detalles = await this.detallePlanillaIngr
        .createQueryBuilder('detalle')
        .innerJoinAndSelect('detalle.persona', 'persona')
        .innerJoinAndSelect('detalle.centroTrabajo', 'centroTrabajo')
        .select([
          'persona.dni AS Identidad',
          'persona.primer_nombre || \' \' || persona.primer_apellido AS NombrePersona',
          'detalle.sueldo AS Sueldo',
          'detalle.aportaciones AS Aportaciones',
          'detalle.prestamos AS Prestamos',
          'detalle.cotizaciones AS Cotizaciones',
          'detalle.deducciones AS Deducciones',
          'detalle.sueldo_neto AS SueldoNeto'
        ])
        .where('centroTrabajo.id_centro_trabajo = :idCentroTrabajo', { idCentroTrabajo })
        .getRawMany();

      if (!detalles.length) {
        this.logger.warn(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
        throw new NotFoundException(`No se encontraron detalles para el centro de trabajo con ID ${idCentroTrabajo}`);
      }

      return detalles;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error al obtener detalles por centro de trabajo: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener detalles por centro de trabajo');
    }
  }

  async create(createDetPlanIngDTO: CreateDetallePlanIngDto) {
    const { idTipoPlanilla, mes, dni, idInstitucion, prestamos } = createDetPlanIngDTO

    try {
      let personas = await this.personaRepository.findOne({
        where: { dni: dni, perfAfilCentTrabs: { centroTrabajo: { id_centro_trabajo: idInstitucion } } },
        relations: ['perfAfilCentTrabs', 'perfAfilCentTrabs.centroTrabajo'],
      });

      let salarioCotizableRepository = await this.salarioCotizableRepository.find()

      const DetPlanIng = this.buscarPlanilla(personas, salarioCotizableRepository, createDetPlanIngDTO);

      if (!DetPlanIng) {
        /**los valores a insertar seran  createDetPlanIngDTO*/
        const Planilla = this.insertPlanilla(personas, salarioCotizableRepository, createDetPlanIngDTO);
        /**Faltaria hacer rollback */

        if (Planilla) {
          return this.insertNetDetPlanilla(personas, salarioCotizableRepository, createDetPlanIngDTO);
        }

      } else {
        const Planilla = this.insertPlanilla(personas, salarioCotizableRepository, DetPlanIng);
        /**Faltaria hacer rollback */

        if (Planilla) {
          return this.insertNetDetPlanilla(personas, salarioCotizableRepository, DetPlanIng);
        }
        /**los valores a insertar seran  DetPlanIng lo que cambiaria seria el mes de la planilla*/
      }

    } catch (error) {
      console.log(error);
      this.handleException(error);
    }

  }

  private calculoAportaciones(persona, salarioCotizableRepository): number {
    const salarioBaseAfiliado = persona.perfAfilCentTrabs[0].salario_base
    const sector_economico = persona.perfAfilCentTrabs[0].centroTrabajo.sector_economico
    let LimiteSSL;
    let PorcAportacionSECPriv;
    let PorcAportacionSECPUB;

    const accionesSalario = {
      "APORTACION SECTOR PUBLICO": (tem: any) => {
        PorcAportacionSECPUB = tem
      },
      "IPC INTERANUAL": (tem: any) => {
      },
      "APORTACION SECTOR PRIVADO": (tem: any) => {
        PorcAportacionSECPriv = tem;
      },
      "LIMITE SSC": (tem: any) => {
        LimiteSSL = tem;
      },
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }
    const sueldoBase = this.calculoSueldoBase(salarioCotizableRepository);

    if (salarioBaseAfiliado <= sueldoBase && salarioBaseAfiliado <= LimiteSSL) {
      return sueldoBase;
    } else if (sector_economico == "PRIVADO" && salarioBaseAfiliado <= LimiteSSL) {
      return salarioBaseAfiliado * PorcAportacionSECPriv
    } else if (sector_economico == "PRIVADO" && salarioBaseAfiliado > LimiteSSL) {
      return LimiteSSL
    } else if (sector_economico == "PUBLICO" && salarioBaseAfiliado <= LimiteSSL) {
      /* return salarioBaseAfiliado * PorcAportacionSECPUB */
    }

  }

  private calculoCotizaciones(persona, salarioCotizableRepository): number {
    const salarioBaseAfiliado = persona.perfAfilCentTrabs[0].salario_base
    const sector_economico = persona.perfAfilCentTrabs[0].centroTrabajo.sector_economico

    let limiteSSL;
    let cotizacionDoc;
    let cotizacionEsc;

    const accionesSalario = {
      "COTIZACION DOCENTE": (tem: any) => {
        cotizacionDoc = tem
      },
      "COTIZACION ESCALONADA": (tem: any) => {
        cotizacionEsc = tem
      },
      "LIMITE SSC": (tem: any) => {
        limiteSSL = tem;
      },
      "IPC INTERANUAL": (tem: any) => {
      }
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }

    if (salarioBaseAfiliado < 20000 && sector_economico == "PRIVADO") {
      return salarioBaseAfiliado * cotizacionDoc
    } else if (salarioBaseAfiliado >= 20000 && sector_economico == "PRIVADO") {
      return salarioBaseAfiliado * cotizacionEsc
    }

  }

  private calculoSueldoBase(salarioCotizableRepository): number {
    let sueldoBase;
    let porcAportMin;

    const accionesSalario = {
      "SUELDO BASE": (tem: any) => {
        sueldoBase = tem
      },
      "APORTACION MINIMA": (tem: any) => {
        porcAportMin = tem;
      },
    };

    for (let salarioC of salarioCotizableRepository) {
      const accion = accionesSalario[salarioC.nombre];
      if (accion) {
        accion(salarioC.valor); // Ejecutar la acción asociada al nombre del salario
      }
    }

    return sueldoBase * porcAportMin
  }

  private async buscarPlanilla(persona, salarioCotizableRepository, createDetPlanIngDTO): Promise<void> {
    
  }
  private async insertPlanilla(persona, salarioCotizableRepository, createDetPlanIngDTO): Promise<void> {
    /* const { idTipoPlanilla, mes, dni, idInstitucion, prestamos } = createDetPlanIngDTO

    let ValoresDetalle = {
      idpersona: persona.id_persona,
      idInstitucion: idInstitucion,
      sueldo: persona.perfAfilCentTrabs[0].salario_base,
      prestamos: prestamos,
      aportaciones: this.calculoAportaciones(persona, salarioCotizableRepository),
      cotizaciones: this.calculoCotizaciones(persona, salarioCotizableRepository),
      deducciones: this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + prestamos,
      sueldo_neto: persona.perfAfilCentTrabs[0].salario_base - (this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + createDetPlanIngDTO.prestamos)
    }
    const queryInsDeBBenf = `INSERT INTO NET_DETALLE_PLANILLA_ING (
      SUELDO,
      PRESTAMOS,
      APORTACIONES,
      COTIZACIONES,
      DEDUCCIONES,
      SUELDO_NETO,
      ID_PERSONA,
      ID_CENTRO_TRABAJO
    ) VALUES (
      ${ValoresDetalle.sueldo},
      ${ValoresDetalle.prestamos},
      ${ValoresDetalle.aportaciones},
      ${ValoresDetalle.cotizaciones},
      '${ValoresDetalle.deducciones}',
      '${ValoresDetalle.sueldo_neto}',
      ${ValoresDetalle.idpersona},
      ${ValoresDetalle.idInstitucion}
    )`

    const detPlanillaIng = await this.entityManager.query(queryInsDeBBenf);
    return detPlanillaIng; */
  }
  private async insertNetDetPlanilla(persona, salarioCotizableRepository, createDetPlanIngDTO): Promise<number> {
    const { idInstitucion, prestamos } = createDetPlanIngDTO
    let ValoresDetalle = {
      idpersona: persona.id_persona,
      idInstitucion: idInstitucion,
      sueldo: persona.perfAfilCentTrabs[0].salario_base,
      prestamos: prestamos,
      aportaciones: this.calculoAportaciones(persona, salarioCotizableRepository),
      cotizaciones: this.calculoCotizaciones(persona, salarioCotizableRepository),
      deducciones: this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + prestamos,
      sueldo_neto: persona.perfAfilCentTrabs[0].salario_base - (this.calculoAportaciones(persona, salarioCotizableRepository) + this.calculoCotizaciones(persona, salarioCotizableRepository) + createDetPlanIngDTO.prestamos)
    }
    const queryInsDeBBenf = `INSERT INTO NET_DETALLE_PLANILLA_ING (
      SUELDO,
      PRESTAMOS,
      APORTACIONES,
      COTIZACIONES,
      DEDUCCIONES,
      SUELDO_NETO,
      ID_PERSONA,
      ID_CENTRO_TRABAJO
    ) VALUES (
      ${ValoresDetalle.sueldo},
      ${ValoresDetalle.prestamos},
      ${ValoresDetalle.aportaciones},
      ${ValoresDetalle.cotizaciones},
      '${ValoresDetalle.deducciones}',
      '${ValoresDetalle.sueldo_neto}',
      ${ValoresDetalle.idpersona},
      ${ValoresDetalle.idInstitucion}
    )`

    const detPlanillaIng = await this.entityManager.query(queryInsDeBBenf);
    return detPlanillaIng;
  }

  private handleException(error: any): void {
    this.logger.error(error);

    // Verifica si el error es un BadRequestException y propaga el mismo
    if (error instanceof BadRequestException) {
      throw error;
    }
    // Verifica errores específicos de la base de datos o de la lógica de negocio
    if (error.driverError && error.driverError.errorNum) {
      // Aquí puedes agregar más condiciones según los códigos de error específicos de tu base de datos
      if (error.driverError.errorNum === 1) {
        throw new BadRequestException('La Planilla ya existe');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

}