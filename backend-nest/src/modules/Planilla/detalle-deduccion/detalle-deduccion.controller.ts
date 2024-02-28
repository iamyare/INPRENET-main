import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Response, HttpCode, HttpStatus, Query, BadRequestException, Res, HttpException } from '@nestjs/common';
import { DetalleDeduccionService } from './detalle-deduccion.service';
import { CreateDetalleDeduccionDto } from './dto/create-detalle-deduccion.dto';
import { UpdateDetalleDeduccionDto } from './dto/update-detalle-deduccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('detalle-deduccion')
export class DetalleDeduccionController {
  constructor(private readonly detalleDeduccionService: DetalleDeduccionService) {}

  /* @Post()
  @HttpCode(HttpStatus.CREATED)
  async insertarDetalles(@Body() data: any[], @Res() res: Response) {
    try {
      await this.detalleDeduccionService.insertarDetalles(data);
      res.status(HttpStatus.CREATED).json({
        message: 'Detalles de deducción insertados exitosamente',
      });
    } catch (error) {
      if (error instanceof HttpException) {
        // If it's a NestJS-defined HTTP exception, rethrow it
        throw error;
      } else {
        // For any other errors, throw a generic internal server error
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  } */
  
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
    @Query('idAfiliado') idAfiliado: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {

    try {
      const detalles = await this.detalleDeduccionService.getDetallesDeduccionPorAfiliadoYPlanilla(idAfiliado, idPlanilla);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de deducción', error: error.message });
    }
  }


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

@Patch('/actualizar-deduccion-planilla')
  actualizarPlanillasYEstados(@Body() detalles: { idDedDeduccion: string; codigoPlanilla: string; estadoAplicacion: string }[]) {
  return this.detalleDeduccionService.actualizarPlanillasYEstadosDeDeducciones(detalles);
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
