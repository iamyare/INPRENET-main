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
      const montoDeduccion = d.monto_total != null ? d.monto_total : ''; // Asumiendo que puede ser 0
      const anio = d.AÑO != null ? d.AÑO : '';
      const mes = d.MES != null ? d.MES : '';
      
      
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

      const asignacion: any = {
          anio: d.AÑO,
          mes: d.MES,
          montoDeduccion: d.monto_total,
          id_deduccion: deduccion.id_deduccion,
          id_institucion : institucion.id_institucion,
          nombre_institucion: institucion?.nombre_institucion,
      };
      
      let resultados: any = {
          idAfiliado: afiliado.id_afiliado,
          salario_base: afiliado.salario_base,
          deduccion: asignacion
      };

      arrayTemp.push(resultados);
                
      } catch (error) {
        this.logger.error(`Failed to save detail: ${JSON.stringify(d)}`, error.stack);
        failedRows.push({ ...d, error: error.message });
      }
    }
    console.log("ENTRO")
    const deducciones = this.agruparDeduccionesPorAfiliado(arrayTemp, 100)
    console.log(JSON.stringify(deducciones,null,2));
    
    for (let clave in deducciones) {
      if (deducciones.hasOwnProperty(clave)) {
        
        let deduccion = deducciones[clave];
        for (let deduccionClave in deduccion) {
          if (deduccionClave === "deducciones") {
            
            /* for (const key in deduccion[deduccionClave]) {
              const detalle = new DetalleDeduccion(); 
              detalle.afiliado = clave; 
              console.log(deduccion[deduccionClave][key].valor_utilizado);

              detalle.anio = deduccion[deduccionClave][key].anio;
              detalle.mes = deduccion[deduccionClave][key].mes;
              detalle.monto_total = deduccion[deduccionClave][key].montoDeduccion;

              detalle.institucion = deduccion[deduccionClave][key].institucion;
              detalle.monto_aplicado = deduccion[deduccionClave][key].valor_utilizado;
              
              detalle.deduccion = `${key}`;
              
              await this.detalleDeduccionRepository.save(detalle);
            
            } */
          }
        }
      }
    }
    
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
