import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import {  DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { DetalleBeneficio } from './entities/detalle_beneficio.entity';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';

@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) {}

  
  @Get('/detallesBene-complementaria-afiliado')
  async obtenerDetallesPorAfiliado(@Query('idAfiliado') idAfiliado: string) {
    console.log('hola');
    
    if (!idAfiliado) {
      throw new BadRequestException('Se requiere el parámetro idAfiliado');
    }
    return this.detallebeneficioService.obtenerDetallesBeneficioComplePorAfiliado(idAfiliado);
  }
  
  @Get('/rango-beneficios')
  async getRangoDetalleBeneficios(
    @Query('idAfiliado') idAfiliado: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!idAfiliado || !fechaInicio || !fechaFin) {
      throw new BadRequestException('El ID del afiliado, la fecha de inicio y la fecha de fin son obligatorios');
    }
    return await this.detallebeneficioService.getRangoDetalleBeneficios(idAfiliado, fechaInicio, fechaFin);
  }

  @Post()
  create(@Body() createDetalleBeneficioDto: CreateDetalleBeneficioDto) {
    return this.detallebeneficioService.create(createDetalleBeneficioDto);
  }

  @Get('inconsistencias/:idAfiliado')
  async getInconsistencias(@Param('idAfiliado') idAfiliado: string) {
    return this.detallebeneficioService.findInconsistentBeneficiosByAfiliado(idAfiliado);
  }

  @Get()
  findAll() {
    return this.detallebeneficioService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleBeneficioDto: UpdateDetalleBeneficioDto) {
    return this.detallebeneficioService.update(+id, updateDetalleBeneficioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallebeneficioService.remove(+id);
  }


  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.detallebeneficioService.findOne(term);
  }
}
