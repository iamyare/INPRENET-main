import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { DetalleDeduccionService } from './detalle-deduccion.service';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DetalleDeduccion } from './entities/detalle-deduccion.entity';

@Controller('detalle-deduccion')
export class DetalleDeduccionController {
  constructor(private readonly detalleDeduccionService: DetalleDeduccionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    return this.detalleDeduccionService.create(createDetalleDeduccionDto);
  }

  @Post('subirArchivo')
  @UseInterceptors(FileInterceptor('file'))
  subirFile(@UploadedFile() file: Express.Multer.File) {
    const data = this.detalleDeduccionService.readExcel(file.buffer);
    // Procesa los datos según sea necesario
    return data;
}

  @Get()
  findAll() {
    return this.detalleDeduccionService.findAll();
  }

  @Get('detalles-completos')
  findAllDetailed() {
    return this.detalleDeduccionService.findAllDetailed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleDeduccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    return this.detalleDeduccionService.update(id, updateDetalleDeduccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleDeduccionService.remove(+id);
  }
}
