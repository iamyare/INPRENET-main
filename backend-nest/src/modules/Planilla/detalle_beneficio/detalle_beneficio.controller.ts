import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Response, BadRequestException, HttpStatus, HttpException, Put, HttpCode } from '@nestjs/common';
import { DetalleBeneficioService } from './detalle_beneficio.service';
import { ApiTags } from '@nestjs/swagger';
import { Net_Detalle_Beneficio_Afiliado } from './entities/net_detalle_beneficio_afiliado.entity';

@ApiTags('beneficio-planilla')
@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) { }

  @Get('verificar-tipo-persona')
  async verificarPersonaConTipo(@Query('dni') dni: string) {
    try {
      const esValido = await this.detallebeneficioService.verificarPersonaConTipo(dni);
      return {
        statusCode: HttpStatus.OK,
        message: esValido
          ? 'La persona tiene un tipo válido (1, 2 o 3).'
          : 'La persona no tiene un tipo válido (1, 2 o 3).',
        esValido,
      };
    } catch (error) {
      console.error('Error en el controlador al verificar tipo de persona:', error.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al verificar el tipo de persona',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('verificar-pagos')
  async verificarBeneficiariosSinPago(@Query('n_identificacion') n_identificacion: string) {
    return this.detallebeneficioService.verificarPagosBeneficiarios(n_identificacion);
  }

  @Get('beneficios')
  async obtenerBeneficios(
    @Query('dni') dni: string,
    @Query('incluirCostoVida') incluirCostoVida?: string
  ) {
    if (!dni || isNaN(Number(dni))) {
      throw new BadRequestException('El DNI proporcionado no es válido.');
    }
    const incluirCosto = incluirCostoVida === 'true' || incluirCostoVida === '1';

    return await this.detallebeneficioService.obtenerBeneficiosPorPersona(dni, incluirCosto);
  }

  @Get('verificar-afiliado/:dni')
  async verificarAfiliado(@Param('dni') dni: string): Promise<{ esAfiliado: boolean }> {
    const esAfiliado = await this.detallebeneficioService.verificarSiEsAfiliado(dni);
    return { esAfiliado };
  }

  @Post('insertar-detalle-pago-beneficio')
  async insertarDetallePagoBeneficio(
    @Body() body: { id_persona: number, id_causante: number, id_detalle_persona: number, id_beneficio: number, id_planilla: number, monto_a_pagar: number }
  ) {
    try {
      const nuevoDetallePagoBeneficio = await this.detallebeneficioService.insertarDetallePagoBeneficio(
        body.id_persona,
        body.id_causante,
        body.id_detalle_persona,
        body.id_beneficio,
        body.id_planilla,
        body.monto_a_pagar
      );
      return {
        message: 'Detalle de pago de beneficio insertado correctamente.',
        data: nuevoDetallePagoBeneficio,
      };
    } catch (error) {
      console.error('Error al insertar el detalle de pago del beneficio:', error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Ocurrió un error inesperado. Inténtelo de nuevo más tarde.',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('detalle-pago')
  obtenerDetallePago(@Query('n_identificacion') n_identificacion: string, @Query('causante_identificacion') causante_identificacion: string, @Query('id_beneficio') id_beneficio: number) {
    return this.detallebeneficioService.obtenerDetallePagoConPlanilla(n_identificacion, causante_identificacion, id_beneficio);
  }


  @Get('causante/:dni')
  async getCausanteByDniBeneficiario(
    @Param('dni') dni: string
  ): Promise<any> {
    return this.detallebeneficioService.getBeneficiosConCausanteAgrupado(dni);
  }


  @Post('nuevoDetalle/:idAfiliadoPadre/:token')
  async createDetalleBeneficioBeneficiario(@Param('token') token: string, @Body() createDetalleBeneficioDto: any, @Param('idAfiliadoPadre') idAfiliadoPadre: number) {
    try {
      const nuevoDetalle = await this.detallebeneficioService.createDetalleBeneficioAfiliado(token, createDetalleBeneficioDto, idAfiliadoPadre);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Detalle de beneficio afiliado creado exitosamente',
        data: nuevoDetalle
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('nuevoDetalle/:token')
  async createDetalleBeneficioAfiliado(@Param('token') token: string, @Body() createDetalleBeneficioDto: any) {
    try {
      const nuevoDetalle = await this.detallebeneficioService.createDetalleBeneficioAfiliado(token, createDetalleBeneficioDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Detalle de beneficio afiliado creado exitosamente',
        data: nuevoDetalle
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('cargarDetBen')
  async cargarBenRec() {
    try {
      const cargarDetBen = await this.detallebeneficioService.cargarBenRec();
      return cargarDetBen
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('detallesPreliminar')
  async getDetalleBeneficiosPreliminar(
    @Query('idAfiliado') idAfiliado: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {
    try {
      const detalles = await this.detallebeneficioService.getDetalleBeneficiosPorAfiliadoYPlanilla(idAfiliado, idPlanilla);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de beneficio', error: error.message });
    }
  }

  @Get('detallesDefinitiva')
  async getDetalleBeneficiosDefinitiva(
    @Query('idPersona') idPersona: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {
    try {
      const detalles = await this.detallebeneficioService.getBeneficiosDefinitiva(idPersona, idPlanilla);
      return res.status(HttpStatus.OK).json(detalles);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los detalles de beneficio', error: error.message });
    }
  }

  @Get('/detallesBene-complementaria-afiliado')
  async obtenerDetallesPorAfiliado(@Query('idAfiliado') idAfiliado: string) {
    if (!idAfiliado) {
      throw new BadRequestException('Se requiere el parámetro idAfiliado');
    }
    return this.detallebeneficioService.obtenerDetallesBeneficioComplePorAfiliado(idAfiliado);
  }

  @Get('/obtenerBeneficiosDeAfil/:dni')
  async obtenerBeneficiosDeAfil(@Param('dni') dni: string) {
    if (!dni) {
      throw new BadRequestException('Se requiere el parámetro dni');
    }
    return this.detallebeneficioService.obtenerBeneficiosDeAfil(dni);
  }

  @Get('/obtenerTipoBeneficioByTipoPersona/:tipoPers')
  async obtenerTipoBeneficioByTipoPersona(@Param('tipoPers') tipoPers: string) {
    if (!tipoPers) {
      throw new BadRequestException('Se requiere el parámetro tipoPers');
    }
    return this.detallebeneficioService.obtenerTipoBeneficioByTipoPersona(tipoPers);
  }

  @Get('/obtenerTodosBeneficios/:dni')
  GetAllBeneficios(@Param('dni') dni: string) {
    return this.detallebeneficioService.GetAllBeneficios(dni);
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

  @Patch('actualizar-estado/:idPlanilla')
  async actualizarEstadoPorPlanilla(
    @Param('idPlanilla') idPlanilla: string,
    @Body('nuevoEstado') nuevoEstado: string
  ) {
    const respuesta = await this.detallebeneficioService.actualizarEstadoPorPlanilla(idPlanilla, nuevoEstado);
    return respuesta;
  }

  @Patch('eliminar-ben-plan/:token')
  async eliminarBenPlan(
    @Param('token') token: string,
    @Body('data') data: any
  ) {
    const respuesta = await this.detallebeneficioService.eliminarBenPlan(token, data);
    return respuesta;
  }


  @Put('/updateBeneficioPersona/:token')
  @HttpCode(HttpStatus.OK)
  async updateBeneficioPersona(
    @Param('token') token: string,
    @Body('data') data: any,
  ): Promise<{ message: string }> {
    this.detallebeneficioService.updateBeneficioPersona(token, data);
    return { message: 'Beneficio actualizado con éxito.' };
  }

}
