import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from './entities/detalle-deduccion.entity';
import { Repository } from 'typeorm';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import * as xlsx from 'xlsx';
import { AfiliadoService } from 'src/afiliado/afiliado.service';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { DetalleAfiliado } from 'src/afiliado/entities/detalle_afiliado.entity';

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
    private DetalleAfiliadoRepository: Repository<DetalleAfiliado>,
    private readonly afiliadoService: AfiliadoService,
  ){}

  async findBetweenDates(fechaInicio: Date, fechaFin: Date, idAfiliado: number): Promise<DetalleDeduccion[]> {
    const mesInicio = fechaInicio.getMonth() + 1;
    const anioInicio = fechaInicio.getFullYear();

    let mesFin = fechaFin.getMonth() + 1;
    let anioFin = fechaFin.getFullYear();

    // Ajustar el año y el mes para el final del periodo
    if (mesFin === 12) {
        mesFin = 1;
        anioFin += 1;
    } else {
        mesFin += 1;
    }

    const queryBuilder = this.detalleDeduccionRepository.createQueryBuilder('detalleDeduccion')
      .where('(detalleDeduccion.anio > :anioInicio OR (detalleDeduccion.anio = :anioInicioEqual AND detalleDeduccion.mes >= :mesInicio))', {
        anioInicio,
        anioInicioEqual: anioInicio,
        mesInicio,
      })
      .andWhere('(detalleDeduccion.anio < :anioFin OR (detalleDeduccion.anio = :anioFinEqual AND detalleDeduccion.mes <= :mesFin))', {
        anioFin,
        anioFinEqual: anioFin,
        mesFin,
      })
      .andWhere('detalleDeduccion.id_afiliado = :idAfiliado', { idAfiliado });

    return queryBuilder.getMany();
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