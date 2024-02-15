import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from './entities/detalle-deduccion.entity';
import { EntityManager, Repository } from 'typeorm';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import * as xlsx from 'xlsx';
import { AfiliadoService } from 'src/afiliado/afiliado.service';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { DetalleAfiliado } from 'src/afiliado/entities/detalle_afiliado.entity';
import { Planilla } from '../planilla/entities/planilla.entity';

@Injectable()
export class DetalleDeduccionService {

  private readonly logger = new Logger(DetalleDeduccionService.name)

  constructor(
    @InjectRepository(DetalleDeduccion)
    private detalleDeduccionRepository: Repository<DetalleDeduccion>,
    @InjectRepository(Afiliado)
    private afiliadoRepository: Repository<Afiliado>,
    @InjectRepository(Deduccion)
    private deduccionRepository: Repository<Deduccion>,
    @InjectRepository(Institucion)
    private institucionRepository: Repository<Institucion>,
    @InjectRepository(DetalleAfiliado)
    private detalleAfiliadoRepository: Repository<DetalleAfiliado>,
    @InjectRepository(Planilla)
    private planillaRepository: Repository<Planilla>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ){}

  async getRangoDetalleDeducciones(idAfiliado: string, fechaInicio: string, fechaFin: string): Promise<any> {
    const query = `
      SELECT
        dd."id_ded_deduccion",
        dd."monto_total",
        dd."monto_aplicado",
        dd."estado_aplicacion",
        dd."anio",
        dd."mes",
        d."nombre_deduccion",
        afil."id_afiliado",
        TRIM(
          afil."primer_nombre" || ' ' || 
          COALESCE(afil."segundo_nombre", '') || ' ' || 
          COALESCE(afil."tercer_nombre", '') || ' ' || 
          afil."primer_apellido" || ' ' || 
          COALESCE(afil."segundo_apellido", '')
        ) AS "nombre_completo"
      FROM
        "C##TEST"."detalle_deduccion" dd
      JOIN
        "C##TEST"."deduccion" d ON dd."id_deduccion" = d."id_deduccion"
      JOIN
        "C##TEST"."afiliado" afil ON dd."id_afiliado" = afil."id_afiliado"
      WHERE
        dd."id_afiliado" = :idAfiliado
      AND
        TO_DATE(CONCAT(dd."anio", LPAD(dd."mes", 2, '0')), 'YYYYMM') BETWEEN TO_DATE(:fechaInicio, 'DD-MM-YYYY') AND TO_DATE(:fechaFin, 'DD-MM-YYYY')
      AND
        dd."estado_aplicacion" = 'NO COBRADA'
    `;
  
    try {
      const parametros :any = {
        idAfiliado: idAfiliado,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
      return await this.detalleDeduccionRepository.query(query, parametros);
    } catch (error) {
      this.logger.error('Error al obtener los detalles de deducción', error.stack);
      throw new InternalServerErrorException('Error al consultar los detalles de deducción en la base de datos');
    }
  }


async findInconsistentDeduccionesByAfiliado(idAfiliado: string) {
  try {
    const query = this.detalleDeduccionRepository.createQueryBuilder('detDs')
      .innerJoinAndSelect('detDs.deduccion', 'ded')
      .where('detDs.estado_aplicacion = :estado', { estado: 'INCONSISTENCIA' })
      .andWhere('detDs.id_afiliado = :idAfiliado', { idAfiliado }) // Asegúrate de que afiliadoId es el nombre correcto de la columna FK en tu entidad DetalleDeduccion
      .select([
        'ded.nombre_deduccion',
        'detDs.id_ded_deduccion',
        'detDs.monto_total',
        'detDs.monto_aplicado',
        'detDs.estado_aplicacion',
        'detDs.anio',
        'detDs.mes'
      ]);

    return await query.getMany();
  } catch (error) {
    this.logger.error(`Error al buscar deducciones inconsistentes por afiliado: ${error.message}`);
    throw new InternalServerErrorException('Error al buscar deducciones inconsistentes por afiliado');
  }
}

async obtenerDetallesDeduccionPorAfiliado(idAfiliado: string): Promise<any[]> {
  try {
    const query = `
      SELECT
        detD."id_ded_deduccion",
        detD."monto_total",
        detD."monto_aplicado",
        detD."estado_aplicacion",
        detD."anio",
        detD."mes",
        afil."id_afiliado",
        afil."dni",
        TRIM(
            afil."primer_nombre" || ' ' || 
            COALESCE(afil."segundo_nombre", '') || ' ' || 
            COALESCE(afil."tercer_nombre", '') || ' ' || 
            afil."primer_apellido" || ' ' || 
            COALESCE(afil."segundo_apellido", '')
        ) AS "nombre_completo",
        ded."nombre_deduccion",
        ded."descripcion_deduccion",
        ded."tipo_deduccion",
        ded."codigo_deduccion"
      FROM
        "detalle_deduccion" detD
      JOIN
        "deduccion" ded ON detD."id_deduccion" = ded."id_deduccion"
      JOIN
        "afiliado" afil ON detD."id_afiliado" = afil."id_afiliado"
      WHERE
        detD."id_afiliado" = :1 AND
        detD."estado_aplicacion" != 'INCONSISTENCIA' AND
        detD."id_afiliado" NOT IN (
            SELECT detD2."id_afiliado"
            FROM "detalle_deduccion" detD2
            WHERE detD2."estado_aplicacion" = 'COBRADA'
        )
        AND detD."id_afiliado" NOT IN (
            SELECT detB."id_afiliado"
            FROM "detalle_beneficio" detB
            WHERE detB."estado" = 'PAGADA'
        )
      ORDER BY
        afil."id_afiliado",
        ded."id_deduccion"
    `;

    return await this.detalleDeduccionRepository.query(query, [idAfiliado]);
  } catch (error) {
    this.logger.error('Error al obtener detalles de deduccion por afiliado', error.stack);
    throw new InternalServerErrorException('Error al obtener detalles de deduccion por afiliado');
  }
}

async actualizarPlanillasYEstadosDeDeducciones(detalles: { idDedDeduccion: string; codigoPlanilla: string; estadoAplicacion: string }[], transactionalEntityManager?: EntityManager): Promise<DetalleDeduccion[]> {
  const resultados = [];
  const entityManager = transactionalEntityManager ? transactionalEntityManager : this.entityManager;

  for (const { idDedDeduccion, codigoPlanilla, estadoAplicacion } of detalles) {
    const deduccion = await entityManager.findOne(DetalleDeduccion, { where: { id_ded_deduccion: idDedDeduccion } });
    if (!deduccion) {
      throw new NotFoundException(`DetalleDeduccion con ID "${idDedDeduccion}" no encontrado`);
    }

    const planilla = await entityManager.findOne(Planilla, { where: { codigo_planilla: codigoPlanilla } });
    if (!planilla) {
      throw new NotFoundException(`Planilla con código "${codigoPlanilla}" no encontrada`);
    }

    deduccion.planilla = planilla;
    deduccion.estado_aplicacion = estadoAplicacion; // Actualiza el estado de aplicación

    resultados.push(await entityManager.save(deduccion));
  }
  return resultados;
}

  

  async create(createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    const { dni, nombre_deduccion, nombre_institucion, monto_total, monto_aplicado, estado_aplicacion, anio, mes } = createDetalleDeduccionDto;

    // Buscar el afiliado por DNI
    const afiliado = await this.afiliadoRepository.findOne({ where: { dni } });
    if (!afiliado) {
      throw new NotFoundException(`Afiliado con DNI '${dni}' no encontrado.`);
    }

    // Buscar la deducción por nombre
    const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion: nombre_deduccion } });
    if (!deduccion) {
      throw new NotFoundException(`Deducción con nombre '${nombre_deduccion}' no encontrada.`);
    }

    // Buscar la institución por nombre
    const institucion = await this.institucionRepository.findOne({ where: { nombre_institucion } });
    if (!institucion) {
      throw new NotFoundException(`Institución con nombre '${nombre_institucion}' no encontrada.`);
    }

    // Crear una nueva instancia de DetalleDeduccion con los ID obtenidos
    const nuevoDetalleDeduccion = this.detalleDeduccionRepository.create({
      afiliado: afiliado,
      deduccion: deduccion,
      institucion: institucion,
      monto_total: monto_total,
      monto_aplicado: monto_aplicado,
      estado_aplicacion: estado_aplicacion,
      anio: anio,
      mes: mes
    });
    

    // Guardar el nuevo DetalleDeduccion en la base de datos
    try {
      await this.detalleDeduccionRepository.save(nuevoDetalleDeduccion);
      return nuevoDetalleDeduccion;
    } catch (error) {
    this.handleException(error);
    }
  }
  
  
  findAll() {
    const detalleDeduccion = this.detalleDeduccionRepository.find()
    return detalleDeduccion;
  }

  async findAllDetailed(): Promise<any[]> {
    const queryBuilder = this.detalleDeduccionRepository.createQueryBuilder('detalleDeduccion');
  
    queryBuilder
      .leftJoinAndSelect('detalleDeduccion.deduccion', 'deduccion')
      .leftJoinAndSelect('detalleDeduccion.afiliado', 'afiliado')
      .leftJoinAndSelect('detalleDeduccion.institucion', 'institucion')
      .leftJoinAndSelect('afiliado.detalleAfiliado', 'detalleAfiliado'); // Asume que existe una relación desde Afiliado a DetalleAfiliado
  
    const result = await queryBuilder.getMany();
  
    return result; // Devuelve el resultado directamente
  }
  

  findOne(id: number) {
    return `This action returns a #${id} detalleDeduccion`;
  }

  async update(id_ded_deduccion: string, updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    // Buscar el DetalleDeduccion existente por ID
    const detalleDeduccion = await this.detalleDeduccionRepository.findOne({ where: { id_ded_deduccion } });
    if (!detalleDeduccion) {
      throw new NotFoundException(`DetalleDeduccion con ID '${id_ded_deduccion}' no encontrado.`);
    }

    const { dni, nombre_deduccion, nombre_institucion, monto_total, monto_aplicado, estado_aplicacion, anio, mes } = updateDetalleDeduccionDto;

    // Buscar el afiliado por DNI
    if (dni) {
        const afiliado = await this.afiliadoRepository.findOne({ where: { dni } });
        if (!afiliado) {
          throw new NotFoundException(`Afiliado con DNI '${dni}' no encontrado.`);
        }
        detalleDeduccion.afiliado = afiliado;
    }

    // Buscar la deducción por nombre
    if (nombre_deduccion) {
        const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion } });
        if (!deduccion) {
          throw new NotFoundException(`Deducción con nombre '${nombre_deduccion}' no encontrada.`);
        }
        detalleDeduccion.deduccion = deduccion;
    }

    // Buscar la institución por nombre
    if (nombre_institucion) {
        const institucion = await this.institucionRepository.findOne({ where: { nombre_institucion } });
        if (!institucion) {
          throw new NotFoundException(`Institución con nombre '${nombre_institucion}' no encontrada.`);
        }
        detalleDeduccion.institucion = institucion;
    }

    // Actualizar los campos del DetalleDeduccion existente
    detalleDeduccion.monto_total = monto_total ?? detalleDeduccion.monto_total;
    detalleDeduccion.monto_aplicado = monto_aplicado ?? detalleDeduccion.monto_aplicado;
    detalleDeduccion.estado_aplicacion = estado_aplicacion ?? detalleDeduccion.estado_aplicacion;
    detalleDeduccion.anio = anio ?? detalleDeduccion.anio;
    detalleDeduccion.mes = mes ?? detalleDeduccion.mes;

    // Guardar el DetalleDeduccion actualizado en la base de datos
    try {
      await this.detalleDeduccionRepository.save(detalleDeduccion);
      return detalleDeduccion;
    } catch (error) {
      this.handleException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} detalleDeduccion`;
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
        throw new BadRequestException('La deduccion ya existe');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  readExcel(buffer: Buffer): any {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  }
  
}


/*  // Función para calcular el salario neto para un arreglo de deducciones
 agruparDeduccionesPorAfiliado(arrayTemp, valorMinimo) {
  const resultados = {};
  
  
  arrayTemp.forEach((item) => {
    const idAfiliado = item.idAfiliado;
    const deduccion = item.deduccion;
    const salarioBase = Math.max(item.salario_base - valorMinimo, valorMinimo);
    
    const deduccions = item.deduccion.montoDeduccion;
    
    if (!resultados[idAfiliado]) {
      resultados[idAfiliado] = {
        salarioBase: salarioBase,
        salarioRestante: salarioBase,
        deducciones: {},
      };
    }
    
    let salarioRestante = resultados[idAfiliado].salarioRestante;
    const deducciones = resultados[idAfiliado].deducciones;
    
    // Buscar si la deducción ya existe en las deducciones
    // const nombreInstitucion = deduccion.nombre_institucion; //
    
    if (!deducciones[deduccion.id_deduccion]) {
      deducciones[deduccion.id_deduccion] = {
        anio: deduccion.anio,
        mes: deduccion.mes,
        montoDeduccion: deduccions,
        institucion: deduccion.id_institucion,
        nombre_institucion: deduccion.nombre_institucion,
        valor_utilizado: 0,
        valor_no_utilizado: 0,
      };
    } else {
      // Si la deducción ya existe, sumar los montos
      deducciones[deduccion.id_deduccion].montoDeduccion += deduccions;
    }
    
    let montoDeduccion;
    if (salarioRestante >= valorMinimo) {
      montoDeduccion = Math.min(salarioRestante, deducciones[deduccion.id_deduccion].montoDeduccion);
    } else {
      montoDeduccion = deducciones[deduccion.id_deduccion].montoDeduccion - item.deduccionFinal;
    }
    
    salarioRestante -= montoDeduccion;
    deducciones[deduccion.id_deduccion].montoDeduccion = montoDeduccion;
    
    deducciones[deduccion.id_deduccion].valor_utilizado = montoDeduccion;
    deducciones[deduccion.id_deduccion].valor_no_utilizado = Math.abs(deducciones[deduccion.id_deduccion].montoDeduccion - deducciones[deduccion.id_deduccion].valor_utilizado) ;
    
    resultados[idAfiliado].salarioBase = salarioBase;
    resultados[idAfiliado].deducciones = deducciones;
  });
  
  Object.values(resultados).forEach((afiliado:any) => {
    let deduccionFinal = 0;
    
    Object.values(afiliado.deducciones).forEach((asignacion:any) => {
      deduccionFinal += asignacion.valor_utilizado;
    });
    afiliado.deduccionFinal = deduccionFinal;
    afiliado.salarioRestante = afiliado.salarioBase - afiliado.deduccionFinal;
  });
  
  console.log(JSON.stringify(resultados,null,2));
  return resultados;
}
 */