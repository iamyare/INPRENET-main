import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { DetalleDeduccionService } from './detalle-deduccion.service';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('detalle-deduccion')
export class DetalleDeduccionController {
  constructor(private readonly detalleDeduccionService: DetalleDeduccionService) {}


  @Get('/rango-deducciones')
  async getRangoDetalleDeducciones(
    @Query('idAfiliado') idAfiliado: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
    ) {
    if (!idAfiliado || !fechaInicio || !fechaFin) {
      throw new BadRequestException('El ID del afiliado, la fecha de inicio y la fecha de fin son obligatorios');
    }
    return await this.detalleDeduccionService.getRangoDetalleDeducciones(idAfiliado, fechaInicio, fechaFin);
  }

  @Get('inconsistencias/:idAfiliado')
    async getInconsistencias(@Param('idAfiliado') idAfiliado: string) {
    return this.detalleDeduccionService.findInconsistentDeduccionesByAfiliado(idAfiliado);
  }

  @Get('/detallesDeducc-complementaria-afiliado')
  async obtenerDetallesPorAfiliado(@Query('idAfiliado') idAfiliado: string) {
    if (!idAfiliado) {
      throw new BadRequestException('Se requiere el parámetro idAfiliado');
    }
    return this.detalleDeduccionService.obtenerDetallesDeduccionPorAfiliado(idAfiliado);
  }
s
@Patch('/actualizar-deduccion-planilla')
actualizarPlanilla(@Body() body: { idDedDeduccion: string; codigoPlanilla: string; estadoAplicacion: string }) {
  const { idDedDeduccion, codigoPlanilla, estadoAplicacion } = body;
  return this.detalleDeduccionService.actualizarPlanillaDeDeduccion(idDedDeduccion, codigoPlanilla, estadoAplicacion);
}

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
