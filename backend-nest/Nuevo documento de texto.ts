/* 

import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deduccion } from './entities/deduccion.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
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

    for (const d of detallesData) {
      try {
        const afiliado = await this.afiliadoRepository.findOne({
          where: { dni: d.DNI },
        });
        if (!afiliado) {
          throw new NotFoundException(`Afiliado con DNI ${d.DNI} no encontrado`);
        }

        const deduccion = await this.deduccionRepository.findOne({
          where: { id_deduccion: d.id_deduccion },
        });
        if (!deduccion) {
          throw new NotFoundException(`Deducción con ID ${d.id_deduccion} no encontrada`);
        }

        const institucion = await this.institucionRepository.findOne({
          where: { nombre_institucion: d.nombre_institucion },
        });
        if (!institucion) {
          throw new NotFoundException(`Institución con nombre ${d.nombre_institucion} no encontrada`);
        }

        const detalle = new DetalleDeduccion();
        detalle.anio = d.AÑO;
        detalle.mes = d.MES;
        detalle.deduccion = deduccion;
        detalle.monto_deduccion = d.monto_deduccion;
        detalle.institucion = institucion;
        detalle.afiliado = afiliado;

        await this.detalleDeduccionRepository.save(detalle);
      } catch (error) {
        this.logger.error(`Failed to save detail: ${JSON.stringify(d)}`, error.stack);
        failedRows.push({ ...d, error: error.message });
      }
    }

    if (failedRows.length > 0) {
      const filePath = this.createFailedRowsExcel(failedRows);
      this.logger.error(`Failed rows written to Excel file at: ${filePath}`);
      // Aquí podrías, por ejemplo, mover el archivo a un bucket S3 o enviarlo por email
    }
  }

private createFailedRowsExcel(failedRows: any[]): string {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(failedRows);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Failed Rows');

  // Asegúrate de que el directorio 'failed_rows' existe
  const directory = path.join(__dirname, 'failed_rows');
  if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
  }

  // Define un nombre de archivo único
  const filePath = path.join(directory, `failed_rows_${Date.now()}.xlsx`);

  // Escribe el archivo Excel en el path especificado
  xlsx.writeFile(workbook, filePath);

  // Devuelve el path del archivo para su posterior procesamiento
  return filePath;
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



*/