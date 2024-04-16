import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Response, BadRequestException, HttpStatus } from '@nestjs/common';
import { DetalleBeneficioService } from './detalle_beneficio.service';
import { UpdateDetalleBeneficioDto } from './dto/update-detalle_beneficio_planilla.dto';
import { CreateDetalleBeneficioDto } from './dto/create-detalle_beneficio.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('beneficio-planilla')
@Controller('beneficio-planilla')
export class DetalleBeneficioController {
  constructor(private readonly detallebeneficioService: DetalleBeneficioService) { }

  @Post('nuevoDetalle/:idAfiliadoPadre')
  async createDetalleBeneficioBeneficiario(@Body() createDetalleBeneficioDto: CreateDetalleBeneficioDto, @Param('idAfiliadoPadre') idAfiliadoPadre: number) {
    try {
      const nuevoDetalle = await this.detallebeneficioService.createDetalleBeneficioAfiliado(createDetalleBeneficioDto, idAfiliadoPadre);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Detalle de beneficio afiliado creado exitosamente',
        data: nuevoDetalle
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('nuevoDetalle')
  async createDetalleBeneficioAfiliado(@Body() createDetalleBeneficioDto: CreateDetalleBeneficioDto) {
    try {
      const nuevoDetalle = await this.detallebeneficioService.createDetalleBeneficioAfiliado(createDetalleBeneficioDto);
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

  @Post('createBenBenefic/:idAfiliado')
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
    @Query('idAfiliado') idAfiliado: string,
    @Query('idPlanilla') idPlanilla: string,
    @Response() res
  ) {
    try {
      const detalles = await this.detallebeneficioService.getBeneficiosDefinitiva(idAfiliado, idPlanilla);
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

}
