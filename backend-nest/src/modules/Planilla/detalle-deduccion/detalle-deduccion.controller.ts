import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { DetalleDeduccionService } from './detalle-deduccion.service';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('detalle-deduccion')
export class DetalleDeduccionController {
  constructor(private readonly detalleDeduccionService: DetalleDeduccionService) {}

  @Post()
  create(@Body() createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    return this.detalleDeduccionService.create(createDetalleDeduccionDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('excel'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      return res.status(400).json({ error: 'No se encontró el archivo' });
    }

    try {
      const detalles = this.detalleDeduccionService.processExcel(file.buffer);
      await this.detalleDeduccionService.saveDetalles(detalles);
      res.status(201).json({ mjs: 'Datos Guardados exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error al procesar el archivo' });
    }
  }

  @Get()
  findAll() {
    return this.detalleDeduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleDeduccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    return this.detalleDeduccionService.update(+id, updateDetalleDeduccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleDeduccionService.remove(+id);
  }
}
