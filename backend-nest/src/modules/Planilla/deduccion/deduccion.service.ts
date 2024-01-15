import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deduccion } from './entities/deduccion.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';

@Injectable()
export class DeduccionService {

  private readonly logger = new Logger(DeduccionService.name)

  constructor(
    @InjectRepository(DetalleDeduccion)
    private detalleDeduccionRepository: Repository<DetalleDeduccion>,
    @InjectRepository(Afiliado)
    private afiliadoRepository: Repository<Afiliado>,
    @InjectRepository(Deduccion)
    private deduccionRepository: Repository<Deduccion>,
    @InjectRepository(Institucion)
    private institucionRepository: Repository<Institucion>
  ){
   
  }

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

  processExcel(fileBuffer: Buffer): any {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }


  async saveDetalles(detallesData: any[]): Promise<void> {
    const failedRows = [];
    const arrayTemp = [];
    for (const d of detallesData) {
      // Asegúrate de que todos los campos necesarios estén presentes
      const dni = d.DNI ? String(d.DNI).trim() : '';
      const idDeduccion = d.id_deduccion ? String(d.id_deduccion).trim() : '';
      const nombreInstitucion = d.nombre_institucion ? String(d.nombre_institucion).trim() : '';
      const montoDeduccion = d.monto_deduccion != null ? d.monto_deduccion : ''; // Asumiendo que puede ser 0
      const anio = d.AÑO != null ? d.AÑO : '';
      const mes = d.MES != null ? d.MES : '';
      const detalle = new DetalleDeduccion();
      
      // Si alguno de los campos requeridos está vacío, agrega la fila a failedRows
      if (!dni || !idDeduccion || !nombreInstitucion || montoDeduccion === '' || anio === '' || mes === '') {
        failedRows.push({ ...d, error: 'Una o más columnas obligatorias están vacías o son inválidas' });
        continue; // Continúa con la siguiente fila
      }

      try {
        const afiliado = await this.afiliadoRepository.findOne({ where: { dni: d.DNI } });
        if (!afiliado) {
            failedRows.push({ ...d, error: `Afiliado con DNI ${d.DNI} no encontrado` });
            continue;
        }

        const deduccion = await this.deduccionRepository.findOne({ where: { id_deduccion: d.id_deduccion } });
        if (!deduccion) {
            failedRows.push({ ...d, error: `Deducción con ID ${d.id_deduccion} no encontrada` });
            continue;
        }

        const institucion = await this.institucionRepository.findOne({ where: { nombre_institucion: d.nombre_institucion } });
        if (!institucion) {
            failedRows.push({ ...d, error: `Institución con nombre ${d.nombre_institucion} no encontrada` });
            continue;
        }

        detalle.anio = d.AÑO;
        detalle.mes = d.MES;
        detalle.deduccion = deduccion;
        detalle.monto_deduccion = d.monto_deduccion;
        detalle.institucion = institucion;
        detalle.afiliado = afiliado;
        
        const temporal = await this.detalleDeduccionRepository.save(detalle);
        
        arrayTemp.push(temporal.temp);
        
      } catch (error) {
        this.logger.error(`Failed to save detail: ${JSON.stringify(d)}`, error.stack);
        failedRows.push({ ...d, error: error.message });
      }
    }
    
    const deducciones = this.agruparDeduccionesPorAfiliado(arrayTemp, 100)
    console.log(JSON.stringify(deducciones, null, 2));

    if (failedRows.length > 0) {
     /* console.log(failedRows); */
    }
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
          asignaciones: {},
        };
      }
  
      let salarioRestante = resultados[idAfiliado].salarioRestante;
      const asignaciones = resultados[idAfiliado].asignaciones;
  
      let montoDeduccion;
      if (salarioRestante >= valorMinimo) {
        montoDeduccion = Math.min(salarioRestante, deduccion.montoDeduccion);
      } else {
        montoDeduccion = deduccion.montoDeduccion - item.deduccionFinal;
      }
  
      salarioRestante -= montoDeduccion;
      deduccion.montoDeduccion -= montoDeduccion;
  
      const nombreInstitucion = deduccion.nombre_institucion;
      if (!asignaciones[nombreInstitucion]) {
        asignaciones[nombreInstitucion] = {
          montoDeduccion: deduccions,
          valor_utilizado: 0,
          valor_no_utilizado: 0,
        };
      }
  
      asignaciones[nombreInstitucion].montoDeduccion = deduccions;
      asignaciones[nombreInstitucion].valor_utilizado += montoDeduccion;
      asignaciones[nombreInstitucion].valor_no_utilizado = Math.abs(asignaciones[nombreInstitucion].montoDeduccion - asignaciones[nombreInstitucion].valor_utilizado) ;
  
      resultados[idAfiliado].salarioBase = salarioBase;
      resultados[idAfiliado].salarioRestante = salarioRestante;
      resultados[idAfiliado].asignaciones = asignaciones;
    });
  
    Object.values(resultados).forEach((afiliado:any) => {
      let deduccionFinal = 0;
  
      Object.values(afiliado.asignaciones).forEach((asignacion:any) => {
        deduccionFinal += asignacion.valor_utilizado;
      });
  
      afiliado.deduccionFinal = deduccionFinal;
    });
  
    return resultados;
  }
  
  findAll() {
    return this.deduccionRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} deduccion`;
  }

  async update(id_deduccion: string, updateDeduccionDto: UpdateDeduccionDto) {
    const deduccion = await this.deduccionRepository.preload({
      id_deduccion: id_deduccion,
      ...UpdateDeduccionDto
    });

    if(!deduccion) throw new NotFoundException(`Deduccion con el id: ${id_deduccion} no funciona`)
    
    try{
      await this.deduccionRepository.save(deduccion);
      return deduccion;
    } 
    catch (error) {
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
