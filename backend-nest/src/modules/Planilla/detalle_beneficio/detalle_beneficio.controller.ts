import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {  DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
/* import { CreateDetalleBeneficioDto } from './dto/create-beneficio_planilla.dto';
import { UpdateDetalleBeneficioDto } from './dto/update-beneficio_planilla.dto'; */

@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) {}

  @Post()
  create(@Body() createDetalleBeneficioDto: any) {
    return this.detallebeneficioService.create(createDetalleBeneficioDto);
  }

  @Get()
  findAll() {
    return this.detallebeneficioService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.detallebeneficioService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleBeneficioDto: UpdateDetalleBeneficioDto) {
    return this.detallebeneficioService.update(+id, updateDetalleBeneficioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallebeneficioService.remove(+id);
  }
}