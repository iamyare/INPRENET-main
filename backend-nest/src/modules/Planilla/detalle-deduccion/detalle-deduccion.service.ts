import { BadRequestException, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from './entities/detalle-deduccion.entity';
import { Repository } from 'typeorm';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Deduccion } from '../deduccion/entities/deduccion.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { DatosIdentificacion } from 'src/afiliado/entities/datos_identificacion';
import * as xlsx from 'xlsx';

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
    @InjectRepository(DatosIdentificacion)
    private datosIdentificacionRepository: Repository<DatosIdentificacion>,
  ){}

  async create(createDto: CreateDetalleDeduccionDto): Promise<DetalleDeduccion> {
    const { nombre_deduccion, dni, nombre_institucion, ...otrosDatos } = createDto;
  
    const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion } });
    if (!deduccion) {
      throw new BadRequestException('La deducción no se encontró en la base de datos.'); 
    }
  
    const afiliado = await this.afiliadoRepository.createQueryBuilder('afiliado')
    .innerJoinAndSelect('afiliado.datosIdentificacion', 'datosIdentificacion')
    .where('datosIdentificacion.dni = :dni', { dni })
    .getOne();
    if (!afiliado) {
      throw new BadRequestException('El afiliado con el DNI proporcionado no se encontró en la base de datos.');
    }
  
    const institucion = await this.institucionRepository.findOne({ where: { nombre_institucion } });
    if (!institucion) {
      throw new BadRequestException('La institución no se encontró en la base de datos.');
    }
  
    const detalleDeduccion = this.detalleDeduccionRepository.create({
      deduccion,
      afiliado,
      institucion,
      ...otrosDatos
    });
  
    await this.detalleDeduccionRepository.save(detalleDeduccion);
    return detalleDeduccion;
  }
  
  

  findAll() {
    const detalleDeduccion = this.detalleDeduccionRepository.find()
    return detalleDeduccion;
  }

  async findAllDetailed(): Promise<any[]> {
    try {
      const detalles = await this.detalleDeduccionRepository.find({
        select: ['id_ded_deduccion', 'monto_total', 'monto_aplicado', 'estado_aplicacion', 'anio', 'mes', 'fecha_aplicado', 'fecha_subida'], // selecciona los campos específicos de detalleDeduccion que deseas
        relations: ['deduccion', 'afiliado', 'institucion'], // asegúrate de cargar las relaciones
        join: {
          alias: 'detalleDeduccion',
          leftJoinAndSelect: {
            deduccion: 'detalleDeduccion.deduccion',
            afiliado: 'detalleDeduccion.afiliado',
            institucion: 'detalleDeduccion.institucion',
          },
        },
      });
      return detalles.map(detalle => ({
        ...detalle,
        nombre_deduccion: detalle.deduccion.nombre_deduccion, // nombre_deduccion de la entidad Deduccion
        //dni: detalle.afiliado.dni, // dni de la entidad Afiliado
        nombre_institucion: detalle.institucion.nombre_institucion, // nombre_institucion de la entidad Institucion
      }));
    } catch (error) {
      this.handleException(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleDeduccion`;
  }

  update(id: number, updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    return `This action updates a #${id} detalleDeduccion`;
  }

  async editDetalleDeduccion(id: string, updateDetalleDeduccionDto: UpdateDetalleDeduccionDto): Promise<DetalleDeduccion> {
    const detalleDeduccion = await this.detalleDeduccionRepository.findOne({
      where: { id_ded_deduccion: id } // Asumiendo que el campo de ID se llama 'id_ded_deduccion' en tu entidad
    });
  
    if (!detalleDeduccion) {
      throw new BadRequestException('Detalle de deducción no encontrado.');
    }

    const { dni, nombre_institucion, nombre_deduccion, monto_total } = updateDetalleDeduccionDto;

    /* if (dni) {
      const afiliado = await this.afiliadoRepository.findOne({ where: { dni } });
      if (!afiliado) throw new BadRequestException('Afiliado no encontrado');
      detalleDeduccion.afiliado = afiliado;
    } */

    if (nombre_institucion) {
      const institucion = await this.institucionRepository.findOne({ where: { nombre_institucion } });
      if (!institucion) throw new BadRequestException('Institución no encontrada');
      detalleDeduccion.institucion = institucion;
    }

    if (nombre_deduccion) {
      const deduccion = await this.deduccionRepository.findOne({ where: { nombre_deduccion } });
      if (!deduccion) throw new BadRequestException('Deducción no encontrada');
      detalleDeduccion.deduccion = deduccion;
    }

    if (monto_total !== undefined) {
      detalleDeduccion.monto_total = monto_total;
    }

    await this.detalleDeduccionRepository.save(detalleDeduccion);

    return detalleDeduccion;
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