import { BadRequestException, Body, Controller, HttpStatus, Param, Post, Res, Get, Logger, Query, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetallePlanillaIngresoService } from './detalle-planilla-ing.service';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';

@ApiTags('Detalle-Planilla-Ingreso')
@Controller('detalle-plan-ingr')
export class DetallePlanIngrController {
    private readonly logger = new Logger(DetallePlanIngrController.name);
    constructor(private readonly planillaIngresoService: DetallePlanillaIngresoService) { }

    @Post()
    create(@Body() CreateDetallePlanIngDto: CreateDetallePlanIngDto) {
        return this.planillaIngresoService.create(CreateDetallePlanIngDto);
    }

    @Get('/obtenerDetalleIngresos/:idCentroTrabajo')
  async obtenerDetalleIngresosPorCentroTrabajo(@Res() res, @Param('idCentroTrabajo') idCentroTrabajo: number) {
    try {
      const datos = await this.planillaIngresoService.obtenerDetallesPorCentroTrabajo(idCentroTrabajo);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Datos de detalle de planilla de ingresos por centro de trabajo obtenidos correctamente',
        data: datos
      });
    } catch (error) {
      throw error
    }
  }

  /* @Get('buscar')
  async buscarPorMesYDni(@Query('mes') mes: string, @Query('dni') dni: string) {
    if (!mes || !dni) {
      throw new BadRequestException('Se requiere tanto el mes como el DNI para realizar la búsqueda.');
    }
    try {
      const mesNumerico = parseInt(mes);
      if (isNaN(mesNumerico)) {
        throw new BadRequestException('El mes debe ser un número válido.');
      }

      const persona = await this.planillaIngresoService.buscarPorMesYDni(mesNumerico, dni);
      return persona;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error en buscarPorMesYDni:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  } */
}