import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, BadRequestException, InternalServerErrorException, HttpCode, HttpStatus } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService) {}

  @Post('/actualizar-transacciones')
  @HttpCode(HttpStatus.OK)
  async actualizarBeneficiosYDeducciones(@Body() body: any): Promise<any> {
    await this.planillaService.actualizarBeneficiosYDeduccionesConTransaccion(body.detallesBeneficios, body.detallesDeducciones);
    return { message: 'Transacción completada con éxito' };
  }

  @Get('totalesBYD/:idPlanilla')
  async getTotalesPorPlanilla(@Param('idPlanilla') idPlanilla: string) {
    return this.planillaService.getTotalPorDedYBen(idPlanilla);
  }

  @Get('generar-voucher')
  async generarVoucher(
    @Query('idPlanilla') idPlanilla: string,
    @Query('dni') dni: string
  ) {
    // Verifica si los parámetros de consulta están presentes
    if (!idPlanilla) {
      throw new BadRequestException('El ID de la planilla es obligatorio.');
    }
    if (!dni) {
      throw new BadRequestException('El DNI del afiliado es obligatorio.');
    }

    try {
      const resultados = await this.planillaService.generarVoucher(idPlanilla, dni);
      return resultados;
    } catch (error) {
      // Aquí deberías manejar diferentes tipos de errores de acuerdo a lo que tu lógica de negocio requiera
      throw new InternalServerErrorException('Ocurrió un error al generar el voucher.');
    }
  }

  @Get('total/:id')
  @HttpCode(HttpStatus.OK)
  async obtenerTotalPlanilla(
    @Param('id') idPlanilla: string
  ) {
    try {
      return await this.planillaService.calcularTotalPlanilla(idPlanilla);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el total planilla');
    }
  }


  @Get('preliminar')
  async ObtenerPlanillaPreliminar(
    @Query('idPlanilla') idPlanilla: string,
  ) {
    if (!idPlanilla) {
      throw new BadRequestException('Los parámetros idPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerPreliminar(idPlanilla);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener planilla preliminar');
    }
  }

  @Get('Definitiva/:term')
  async ObtenerPlanDefin(
    @Param('term') term: string
  ) {
    if (!term) {
      throw new BadRequestException('Los parámetros idPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerPlanDefin(term);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener planilla preliminar');
    }
  }

  @Get('planillaOrdinaria')
  async obtenerAfilOrdinaria(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
  ) {
    if (!periodoInicio || !periodoFinalizacion) {
      throw new BadRequestException('Los parámetros periodoInicio y periodoFinalizacion son obligatorios');
    }

    try {
      return await this.planillaService.obtenerAfilOrdinaria(periodoInicio, periodoFinalizacion);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el resumen de afiliados');
    }
  }

  @Get('planillaComplementaria')
  async ObtenerAfilComplementaria() {
    return this.planillaService.obtenerAfilComplementaria();
  }

  @Get('planillaExtraordinaria')
  async ObtenerAfilExtraordinaria() {
    return this.planillaService.obtenerAfilExtraordinaria();
  }
 
  /* @Post('create-ordinaria-view')
  async createView() {
    await this.planillaService.createView();
    return { message: 'Vista creada con éxito' };
  }


  @Post('create-complementary-view')
  async createComplementaryView() {
    await this.planillaService.createComplementaryView();
    return { message: 'Vista complementaria creada con éxito' };
  }

  @Post('create-extraordinaria-view')
  async createExtraOrdinariaView() {
    await this.planillaService.createExtraOrdinariaView();
    return { message: 'Vista complementaria creada con éxito' };
  }
 */
  
  @Post()
  create(@Body() createPlanillaDto: CreatePlanillaDto) {
    return this.planillaService.create(createPlanillaDto);
  }

  @Get('deducciones-no-aplicadas')
  getDeduccionesNoAplicadas(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string
  ) {
    return this.planillaService.getDeduccionesNoAplicadas(periodoInicio, periodoFinalizacion);
  }
  
  @Get('beneficios-no-aplicadas')
  getBeneficiosNoAplicados(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string
  ) {
    return this.planillaService.getBeneficiosNoAplicados(periodoInicio, periodoFinalizacion);
  }


  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.planillaService.findAll(paginationDto);
  }

  /*  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.planillaService.findOne(+id);
    } 
  */

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.planillaService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanillaDto: UpdatePlanillaDto) {
    return this.planillaService.update(id, updatePlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planillaService.remove(+id);
  }
}
