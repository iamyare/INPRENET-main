import { BadRequestException, Body, Controller, HttpStatus, Param, Post, Res, Get, Logger, Query, NotFoundException, InternalServerErrorException, Put, HttpCode, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetallePlanillaIngresoService } from './detalle-planilla-ing.service';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';

@ApiTags('Detalle-Planilla-Ingreso')
@Controller('detalle-plan-ingr')
export class DetallePlanIngrController {
  private readonly logger = new Logger(DetallePlanIngrController.name);

  constructor(private readonly planillaIngresoService: DetallePlanillaIngresoService) { }

  @Put('/actualizar-detalles-planilla-privada')
  @HttpCode(HttpStatus.OK)
  async actualizarDetallesPlanilla(
    @Body('dni') dni: string,
    @Body('idDetallePlanIngreso') idDetallePlanIngreso: number,
    @Body('sueldo') sueldo: number
  ): Promise<{ message: string }> {
    return await this.planillaIngresoService.actualizarDetallesPlanilla(dni, idDetallePlanIngreso, sueldo);
  }



  @Put('/:idDetallePlanIngreso')
  @HttpCode(HttpStatus.OK)
  async updateSueldo(
    @Param('idDetallePlanIngreso', ParseIntPipe) idDetallePlanIngreso: number,
    @Body('sueldo') sueldo: number,
  ) {
    return await this.planillaIngresoService.updateSueldo(idDetallePlanIngreso, sueldo);
  }

  @Post("/:id_planilla/:dni/:id_centro_educativo")
  create(@Param('id_planilla') id_planilla: number, @Param('dni') dni: string, @Param('id_centro_educativo') id_centro_educativo: number, @Body() createDetPlanIngDT: CreateDetallePlanIngDto) {
    return this.planillaIngresoService.insertNetDetPlanilla(id_planilla, dni, id_centro_educativo, createDetPlanIngDT);
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