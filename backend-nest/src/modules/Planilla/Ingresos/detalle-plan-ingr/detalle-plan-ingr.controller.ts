import { BadRequestException, Body, Controller, HttpStatus, Param, Post, Res, Get, Logger, Query, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetallePlanillaIngresoService } from './detalle-planilla-ing.service';

@ApiTags('Detalle-Planilla-Ingreso')
@Controller('detalle-plan-ingr')
export class DetallePlanIngrController {
  private readonly logger = new Logger(DetallePlanIngrController.name);

  constructor(private readonly planillaIngresoService: DetallePlanillaIngresoService) { }

  @Post()
  create(@Body('idCentroTrabajo') idCentroTrabajo: number) {
    return this.planillaIngresoService.create(idCentroTrabajo);
  }

  @Get('/obtenerDetalleIngresos/:idCentroTrabajo/:id_tipo_planilla')
  async obtenerDetalleIngresosPorCentroTrabajo(@Res() res, @Param('idCentroTrabajo') idCentroTrabajo: number, @Param('id_tipo_planilla') id_tipo_planilla: number) {
    try {
      const datos = await this.planillaIngresoService.obtenerDetallesPorCentroTrabajo(idCentroTrabajo, id_tipo_planilla);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Datos de detalle de planilla de ingresos por centro de trabajo obtenidos correctamente',
        data: datos
      });

    } catch (error) {
      throw error
    }
  }

  @Get('/obtenerDetalleIngresosAgrupCent/:idCentroTrabajo/:id_tipo_planilla')
  async obtenerDetalleIngresosAgrupCent(@Res() res, @Param('idCentroTrabajo') idCentroTrabajo: number, @Param('id_tipo_planilla') id_tipo_planilla: number) {
    try {
      const datos = await this.planillaIngresoService.obtenerDetalleIngresosAgrupCent(idCentroTrabajo, id_tipo_planilla);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Datos de detalle de planilla de ingresos por centro de trabajo obtenidos correctamente',
        data: datos
      });

    } catch (error) {
      throw error
    }
  }

  @Get('buscar')
  async buscarPorMesYDni(@Query('idCentroTrabajo') idCentroTrabajo: number) {
    try {
      const persona = await this.planillaIngresoService?.buscarUltimaPlanCarg(idCentroTrabajo);
      console.log(persona);

      return persona;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      /* console.error('Error en buscarPorMesYDni:', error.message); */
      throw new InternalServerErrorException(error.message);
    }
  }
}