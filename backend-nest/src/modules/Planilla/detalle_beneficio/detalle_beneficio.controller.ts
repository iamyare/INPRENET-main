import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import {  DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { DetalleBeneficio } from './entities/detalle_beneficio.entity';

@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) {}

  @Post()
  create(@Body() createDetalleBeneficioDto: any) {
    return this.detallebeneficioService.create(createDetalleBeneficioDto);
  }

  @Get('por-rango-fecha')
  async findByDateRange(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('idAfiliado') idAfiliado: string
  ): Promise<DetalleBeneficio[]> {
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Validar que las fechas y el ID del afiliado sean válidos
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime()) || !idAfiliado) {
      throw new BadRequestException('Los parámetros proporcionados no son válidos.');
    }

    return this.detallebeneficioService.findByDateRange(fechaInicioDate, fechaFinDate, idAfiliado);
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
