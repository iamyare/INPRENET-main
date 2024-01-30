import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deduccion } from './entities/deduccion.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';

@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(DetalleDeduccion)
    private detalleDeduccionRepository : Repository<DetalleDeduccion>,
    @InjectRepository(Afiliado)
    private afiliadoRepository: Repository<Afiliado>,
    @InjectRepository(Deduccion)
    private deduccionRepository: Repository<Deduccion>,
    @InjectRepository(Institucion)
    private institucionRepository: Repository<Institucion>
  ){}

  async create(createDeduccionDto: CreateDeduccionDto) {
    const existingDeduccion = await this.deduccionRepository.findOne({
      where: { descripcion_deduccion: createDeduccionDto.descripcion_deduccion }
    });
  
    if (existingDeduccion) {
      throw new BadRequestException('La deducción con esa descripción ya existe');
    }
  
    const deduccion = this.deduccionRepository.create(createDeduccionDto);
    await this.deduccionRepository.save(deduccion);
    return deduccion;
  }
  // Función para calcular el salario neto para un arreglo de deducciones
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
      /* const nombreInstitucion = deduccion.nombre_institucion; */
 
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
      afiliado.salarioRestante = afiliado.salarioBase - afiliado.deduccionFinal
    });
   
    return resultados;
  }
  
  findAll() {
    return this.deduccionRepository.find()
  }

  async findOne(id: string) {
    const deduccion = await this.deduccionRepository.findOne({ where: { id_deduccion: id } });
    if(!deduccion){
      throw new BadRequestException(`deduccion con ID ${id} no encontrado.`);
    }
    return deduccion;
  }

  async update(id_deduccion: string, updateDeduccionDto: UpdateDeduccionDto) {
    const deduccion = await this.deduccionRepository.preload({
      id_deduccion: id_deduccion, 
      ...updateDeduccionDto
    });

    if (!deduccion) {
      throw new BadRequestException(`deduccion con ID ${id_deduccion} no encontrado.`);
    }

    try {
      await this.deduccionRepository.save(deduccion);
      return deduccion;
    } catch (error) {
      this.handleException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} deduccion`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('La deduccion ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
