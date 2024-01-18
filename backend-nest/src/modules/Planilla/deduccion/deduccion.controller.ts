import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { DeduccionService } from './deduccion.service';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('deduccion')
export class DeduccionController {
  constructor(private readonly deduccionService: DeduccionService) {}

  @Post()
  create(@Body() createDeduccionDto: CreateDeduccionDto) {
    return this.deduccionService.create(createDeduccionDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('excel'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      return res.status(400).json({ error: 'No se encontró el archivo' });
    }

    try {
      const detalles = this.deduccionService.processExcel(file.buffer);

      await this.deduccionService.saveDetalles(detalles);
      
      res.status(201).json({ mjs: 'Datos Guardados exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error al procesar el archivo' });
    }
  }

  @Get()
  findAll() {
    return this.deduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deduccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeduccionDto: UpdateDeduccionDto) {
    return this.deduccionService.update(id, updateDeduccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deduccionService.remove(+id);
  }
}
