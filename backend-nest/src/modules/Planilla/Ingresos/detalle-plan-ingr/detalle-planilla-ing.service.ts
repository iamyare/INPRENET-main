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

@Injectable()
export class DetallePlanillaIngresoService {
  private readonly logger = new Logger(DetallePlanillaIngresoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) { }

  @InjectRepository(Net_Detalle_planilla_ingreso)
  private detallePlanillaIngr: Repository<Net_Detalle_planilla_ingreso>

  @InjectRepository(Net_SALARIO_COTIZABLE)
  private salarioCotizableRepository: Repository<Net_SALARIO_COTIZABLE>
  @InjectRepository(Net_Persona)
  private personaRepository: Repository<Net_Persona>

  async create(createDetPlanIngDTO: CreateDetallePlanIngDto) {
    try {
      let personas = await this.personaRepository.findOne({
        where: { dni: createDetPlanIngDTO.dni, perfAfilCentTrabs: { centroTrabajo: { id_centro_trabajo: createDetPlanIngDTO.idInstitucion } } },
        relations: ['perfAfilCentTrabs', 'perfAfilCentTrabs.centroTrabajo'],
      });

      let salarioCotizableRepository = await this.salarioCotizableRepository.find()

      console.log(createDetPlanIngDTO);
      console.log(personas);
      console.log(salarioCotizableRepository);

      if (personas.perfAfilCentTrabs[0].centroTrabajo.sector_economico == "PRIVADO") {
        let prueba = {
          dni: createDetPlanIngDTO.dni,
          idInstitucion: createDetPlanIngDTO.idInstitucion,
          sueldo: createDetPlanIngDTO.sueldo,
          prestamos: createDetPlanIngDTO.prestamos,
          aportaciones: this.calculoAportaciones(personas, salarioCotizableRepository),
          cotizaciones: this.calculoCotizaciones(personas.perfAfilCentTrabs[0].salario_base, salarioCotizableRepository),
          deducciones: this.calculoDeducciones(personas.perfAfilCentTrabs[0].salario_base, salarioCotizableRepository),
          sueldo_neto: this.calculoSueldoNeto(personas.perfAfilCentTrabs[0].salario_base, salarioCotizableRepository)
        }

        console.log(prueba);
        personas.perfAfilCentTrabs[0].centroTrabajo.sector_economico

      }

      /* const detallePlanIng = this.detallePlanillaIngr.create(createDetPlanIngDTO);
      return this.detallePlanillaIngr.save(detallePlanIng); */
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

  private calculoCotizaciones(salarioBaseAfiliado, salarioCotizableRepository): number {
    let LimiteSSL;
    let PorcAportacionSECPriv;

    const accionesSalario = {
      "COTIZACION DOCENTE": (tem: any) => {
      },
      "COTIZACION ESCALONADA": (tem: any) => {
      },
      "LIMITE SSC": (tem: any) => {
        LimiteSSL = tem;
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
    const sueldoBase = this.calculoSueldoBase(salarioCotizableRepository);


    if (salarioBaseAfiliado < 20000) {
      return salarioBaseAfiliado * PorcAportacionSECPriv
    } else if (salarioBaseAfiliado >= 20000) {
      return salarioBaseAfiliado * PorcAportacionSECPriv
    }

  }

  private calculoDeducciones(salarioBaseAfiliado, salarioCotizableRepository): number {
    return 0
  }

  private calculoSueldoNeto(salarioBaseAfiliado, salarioCotizableRepository): number {
    return 0
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