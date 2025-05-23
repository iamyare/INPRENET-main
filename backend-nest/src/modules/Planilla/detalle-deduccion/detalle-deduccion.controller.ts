import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Response, HttpCode, HttpStatus, Query, BadRequestException, Res, HttpException, ParseIntPipe } from '@nestjs/common';
import { DetalleDeduccionService } from './detalle-deduccion.service';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('detalle-deduccion')
@Controller('detalle-deduccion')
export class DetalleDeduccionController {
  constructor(private readonly detalleDeduccionService: DetalleDeduccionService) { }

  @Get('detallePorCodDeduccion')
  async obtenerDetalleYDescargarExcel(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Query('idTiposPlanilla') idTiposPlanilla: string,
    @Query('codDeduccion') codDeduccion: number,
    @Res() res
  ) {
    const tiposPlanillaArray = idTiposPlanilla.split(',').map(Number);
    
    const buffer = await this.detalleDeduccionService.obtenerDetallePorDeduccionPorCodigoYGenerarExcel(
      periodoInicio,
      periodoFinalizacion,
      tiposPlanillaArray,
      codDeduccion
    );

    // Configurar respuesta para descargar el archivo Excel
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Deducciones_${codDeduccion}.xlsx"`,
    });

    res.send(buffer);
  }

  @Patch('actualizar-estado/:idPlanilla')
  async actualizarEstadoAplicacionPorPlanilla(
    @Param('idPlanilla') idPlanilla: string,
    @Body('nuevoEstado') nuevoEstado: string
  ) {
    try {
      const respuesta = await this.detalleDeduccionService.actualizarEstadoAplicacionPorPlanilla(idPlanilla, nuevoEstado);
      return respuesta; // NestJS automáticamente envolverá esto en una respuesta HTTP 200
    } catch (error) {
      throw new HttpException('Error al actualizar el estado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('total-deducciones/:idPlanilla')
  async getTotalDeduccionesPorPlanilla(@Param('idPlanilla') idPlanilla: string): Promise<any> {
    return this.detalleDeduccionService.getTotalDeduccionesPorPlanilla(idPlanilla);
  }

  @Get('detallesPreliminar')
  async getDetallesDeduccionPorAfiliadoYPlanilla(
    @Query('idPersona') idPersona: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {

    try {
      const detalles = await this.detalleDeduccionService.getDetallesDeduccionPorPersonaYPlanilla(idPersona, idPlanilla);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de deducción', error: error.message });
    }
  }

  @Get('getDeduccionesByPersonaAndBenef')
  async getDeduccionesByPersonaAndBenef(
    @Query('idPersona') idPersona: number,
    @Query('idPlanilla') idPlanilla: number,
    @Response() res
  ) {

    try {
      const detalles = await this.detalleDeduccionService.getDeduccionesByPersonaAndBenef(idPersona, idPlanilla);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de deducción', error: error.message });
    }
  }

  @Get('detallesDefinitiva')
  async getDetallesDeduccioDefinitiva(
    @Query('idPersona') idPersona: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {

    try {
      const detalles = await this.detalleDeduccionService.getDetallesDeduccioDefinitiva(idPlanilla, idPersona);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de deducción', error: error.message });
    }
  }


  @Get('/rango-deducciones')
  async getRangoDetalleDeducciones(
    @Query('idPersona') idPersona: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!idPersona || !fechaInicio || !fechaFin) {
      throw new BadRequestException('El ID de la persona, la fecha de inicio y la fecha de fin son obligatorios');
    }
    return await this.detalleDeduccionService.getRangoDetalleDeducciones(idPersona, fechaInicio, fechaFin);
  }

  @Get('inconsistencias/:idPersona')
  async getInconsistencias(@Param('idPersona') idPersona: string) {
    return this.detalleDeduccionService.findInconsistentDeduccionesByAfiliado(idPersona);
  }

  @Patch('/actualizar-deduccion-planilla')
  actualizarPlanillasYEstados(@Body() detalles: { idDedDeduccion: number; codigoPlanilla: string; estadoAplicacion: string }[]) {
    return this.detalleDeduccionService.actualizarPlanillasYEstadosDeDeducciones(detalles);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDetalleDeduccionDto: CreateDetalleDeduccionDto) {
    return this.detalleDeduccionService.createDetalleDeduccion(createDetalleDeduccionDto);
  }

  /* @Post('subirArchivo')
  @UseInterceptors(FileInterceptor('file'))
  subirFile(@UploadedFile() file: Express.Multer.File) {
    const data = this.detalleDeduccionService.readExcel(file.buffer);
    // Procesa los datos según sea necesario
    return data;
  } */

  @Get()
  findAll() {
    return this.detalleDeduccionService.findAll();
  }

  @Get('por-dni/:dni')
  findByDni(@Param('dni') dni: string) {
    return this.detalleDeduccionService.findDeduccionesByDni(dni);
  }

  @Get('detalles-completos')
  findAllDetailed() {
    return this.detalleDeduccionService.findAllDetailed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleDeduccionService.findOne(+id);
  }

  /* @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleDeduccionDto: UpdateDetalleDeduccionDto) {
    return this.detalleDeduccionService.update(+id, updateDetalleDeduccionDto);
  } */

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
     return this.detalleDeduccionService.deleteDetalleDeduccion(id);
    }


}
