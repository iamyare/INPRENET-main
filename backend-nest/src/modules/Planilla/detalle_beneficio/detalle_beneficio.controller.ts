import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import {  DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { DetalleBeneficio } from './entities/detalle_beneficio.entity';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';

@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) {}

  @Post()
  create(@Body() createDetalleBeneficioDto: CreateDetalleBeneficioDto) {
    return this.detallebeneficioService.create(createDetalleBeneficioDto);
  }

  @Get('por-rango-fecha')
async findByDateRange(
  @Query('fechaInicio') fechaInicioString: string,
  @Query('fechaFin') fechaFinString: string,
  @Query('idAfiliado') idAfiliadoString: string
): Promise<DetalleBeneficio[]> {
  const fechaInicio = new Date(fechaInicioString);
  const fechaFin = new Date(fechaFinString);

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime()) || !idAfiliadoString.trim()) {
    throw new BadRequestException('Los parámetros proporcionados no son válidos.');
  }

  return this.detallebeneficioService.findByDateRange(fechaInicio, fechaFin, idAfiliadoString);
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
