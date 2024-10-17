import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, Query, ParseIntPipe, BadRequestException, HttpStatus } from '@nestjs/common';
import { DeduccionService } from './deduccion.service';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('deduccion')
@Controller('deduccion')
export class DeduccionController {
  constructor(private readonly deduccionService: DeduccionService) { }

  @Get(':idCentroTrabajo/detalles-deduccion')
  async obtenerDetallesDeduccionPorCentro(
    @Param('idCentroTrabajo') idCentroTrabajo: number,
    @Query('codigoDeduccion') codigoDeduccion: number,
    @Res() res
  ) {
    try {
      const detallesDeduccion = await this.deduccionService.obtenerDetallesDeduccionPorCentro(idCentroTrabajo, codigoDeduccion);
      return res.status(HttpStatus.OK).json(detallesDeduccion);
    } catch (error) {
      console.error('Error al obtener los detalles de deducción:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al obtener los detalles de deducción',
        error: error.message,
      });
    }
  }

  @Delete(':idCentroTrabajo/deduccion/:codigoDeduccion/planilla/:idPlanilla/eliminar')
  async eliminarDeduccionesPorCentro(
    @Param('idCentroTrabajo') idCentroTrabajo: number,
    @Param('codigoDeduccion') codigoDeduccion: number,
    @Param('idPlanilla') idPlanilla: number
  ) {
    await this.deduccionService.eliminarDetallesDeduccionPorCentro(idCentroTrabajo, codigoDeduccion, idPlanilla);
    return { message: 'Registros eliminados correctamente' };
  }

  @Post('upload-excel-deducciones')
  @UseInterceptors(FileInterceptor('file'))
  uploadDeducciones(@UploadedFile() file: Express.Multer.File, @Body('id_planilla') id_planilla: string,) {
    return this.deduccionService.uploadDeducciones(id_planilla, file);
  }

  @Get('deducciones-por-anio-mes/:dni')
  async getDeduccionesPorAnioMes(
    @Param('dni') dni: string,
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number
  ): Promise<any> {
    if (anio < 0 || mes < 1 || mes > 12) {
      throw new BadRequestException('Año o mes inválidos');
    }
    return await this.deduccionService.obtenerDeduccionesPorAnioMes(dni, anio, mes);
  }

  @Post()
  create(@Body() createDeduccionDto: CreateDeduccionDto) {
    return this.deduccionService.create(createDeduccionDto);
  }

  @Get()
  findAll() {
    return this.deduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deduccionService.findOne(+id);
  }

  @Get('byNameInst/:nombre_institucion')
  findOneByNombInst(@Param('nombre_institucion') nombre_institucion: string) {
    return this.deduccionService.findOneByNombInst(nombre_institucion);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeduccionDto: UpdateDeduccionDto) {
    return this.deduccionService.update(+id, updateDeduccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deduccionService.remove(+id);
  }
}
