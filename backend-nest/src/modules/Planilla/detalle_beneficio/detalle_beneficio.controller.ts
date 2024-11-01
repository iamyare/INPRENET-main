import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Response, BadRequestException, HttpStatus, HttpException, Put, HttpCode } from '@nestjs/common';
import { DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { ApiTags } from '@nestjs/swagger';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { Net_Detalle_Beneficio_Afiliado } from './entities/net_detalle_beneficio_afiliado.entity';

@ApiTags('beneficio-planilla')
@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) { }

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
      // Insertamos el detalle del pago de beneficio
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
  ): Promise<{ causante: { nombres: string, apellidos: string, n_identificacion: string }, beneficios: Net_Detalle_Beneficio_Afiliado[] }[]> {
    return this.detallebeneficioService.getCausanteByDniBeneficiario(dni);
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

  /* @Post('createBenBenefic/:idAfiliado')
  async createBenBenefic(@Body() createDetalleBeneficioDto: CreateDetalleBeneficioDto, @Param('idAfiliado') idAfiliado: string) {
    try {
      const nuevoDetalle = await this.detallebeneficioService.createBenBenefic(createDetalleBeneficioDto, idAfiliado);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Detalle de beneficio afiliado creado exitosamente',
        data: nuevoDetalle
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  } */

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

  @Get('inconsistencias/:idAfiliado')
  async getInconsistencias(@Param('idAfiliado') idAfiliado: string) {
    return this.detallebeneficioService.findInconsistentBeneficiosByAfiliado(idAfiliado);
  }

  @Get()
  findAll() {
    return this.detallebeneficioService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: number) {
    return this.detallebeneficioService.findOne(term);
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

  /* @Patch('/actualizar-beneficio-planilla')
  actualizarPlanillasYEstados(@Body() detalles: { idBeneficioPlanilla: string; codigoPlanilla: string; estado: string }[]) {
    return this.detallebeneficioService.actualizarPlanillaYEstadoDeBeneficio(detalles);
  } */

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleBeneficioDto: UpdateDetalleBeneficioDto) {
    return this.detallebeneficioService.update(+id, updateDetalleBeneficioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallebeneficioService.remove(+id);
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
