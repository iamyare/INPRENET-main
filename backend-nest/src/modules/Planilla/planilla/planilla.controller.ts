import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, BadRequestException, InternalServerErrorException, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService) { }

  @Post('/actualizar-planilla')
  async actualizar(@Body() body: any): Promise<string> {
    const { tipo, idPlanilla, periodoInicio, periodoFinalizacion } = body;
    switch (tipo) {
      case 'ORDINARIA - AFILIADO':
        return this.planillaService.actualizarOrdinariaAfiliadosAPreliminar(idPlanilla, periodoInicio, periodoFinalizacion);
      case 'ORDINARIA - BENEFICIARIO':
        return this.planillaService.actualizarOrdinariaBeneficiariosAPreliminar(idPlanilla, periodoInicio, periodoFinalizacion);
      case 'COMPLEMENTARIA - AFILIADO':
        return this.planillaService.actualizarComplementariaAfiliadosAPreliminar(idPlanilla, periodoInicio, periodoFinalizacion);
      case 'COMPLEMENTARIA - BENEFICIARIO':
        return this.planillaService.actualizarComplementariBeneficiariosAPreliminar(idPlanilla, periodoInicio, periodoFinalizacion);
      default:
        throw new Error('Tipo de actualización no soportado');
    }
  }

  @Get('/desglose-beneficios-OA')
  async getDesgloseBeneficiosOA(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseBeneficiosOrdinariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de beneficios realizada con éxito',
        data: resultado
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de beneficios',
        error: error.message
        
      });
    }
  }

  @Get('/desglose-deducciones-OA')
  async getDesgloseDeduccionesOA(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseDeduccionesOrdinariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de deducciones realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de deducciones',
        error: error.message
      });
    }
  }


  @Get('desglose-beneficios-OB')
  async getDesgloseBeneficiosOB(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseBeneficiosOrdinariaBeneficiarios(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de beneficios realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de beneficios',
        error: error.message
      });
    }
  }

  @Get('desglose-deducciones-OB')
  async getDesgloseDeduccionesOB(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseDeduccionesOrdinariaBeneficiarios(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de deducciones realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de deducciones',
        error: error.message
      });
    }
  }

  @Get('desglose-beneficios-CA')
  async getDesgloseBeneficiosComplementarios(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseBeneficiosComplemenariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de beneficios complementarios realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de beneficios complementarios',
        error: error.message
      });
    }
  }

  @Get('desglose-deducciones-CA')
  async getDesgloseDeduccionesComplementarias(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseDeduccionesComplementariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de deducciones complementarias realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de deducciones complementarias',
        error: error.message
      });
    }
  }

  @Get('desglose-beneficios-CB')
  async getDesgloseBeneficiosComplementariaBenef(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseBeneficiosComplemenariaBeneficiarios(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de beneficios realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de beneficios',
        error: error.message
      });
    }
  }

  @Get('desglose-deducciones-CB')
  async getDesgloseDeduccionesComplementariaBenef(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getDesgloseDeduccionesComplementariaBeneficiarios(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta de desglose de deducciones realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta de desglose de deducciones',
        error: error.message
      });
    }
  }


  @Get('ordinaria-afiliado')
  async getConsulta(@Query('periodoInicio') periodoInicio: string, @Query('periodoFinalizacion') periodoFinalizacion: string, @Res() res) {
    try {
      const resultado = await this.planillaService.getPlanillaOrdinariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('beneficios-ordinaria-afil')
  async getMontoPagarPorBeneficio(@Query('dni') dni: string, @Query('periodoInicio') periodoInicio: string, @Query('periodoFinalizacion') periodoFinalizacion: string, @Res() res) {
    console.log('entro');

    try {
      const resultado = await this.planillaService.beneficiosOrdinariaDeAfil(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('deduccion-ordinaria-afil')
  async getMontoPorBeneficio(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.deduccionesOrdinariaDeAfil(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('ordinaria-beneficiario')
  async getResumenBeneficiosYDeducciones(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getPlanillaOrdinariaBenef(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('beneficios-ordinaria-benef')
  async getDetallePagos(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.beneficiosOrdinariaDeBenef(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('deduccion-ordinaria-benef')
  async getDetalleDeducciones(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.deduccionesOrdinariaDeBenef(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('complementaria-afiliado')
  async getDetalleResumen(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getPlanillaComplementariaAfiliados(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('beneficios-complementaria-afil')
  async getDetallePagosBeneficios(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.beneficiosComplementariaDeAfil(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('deducciones-complementaria-afil')
  async getDetalleDeduccionesEspecificas(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.deduccionesComplementariaDeAfil(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('complementaria-beneficiario')
  async getDetalleResumenBeneficiosDeducciones(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.getPlanillaComplementariaBenef(periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('beneficios-complementaria-benef')
  async getDetallePagoBeneficio(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.beneficiosComplementariaDeBenef(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
  }

  @Get('deducciones-complementaria-benef')
  async getDetalleDeduccionesDeBenef(
    @Query('dni') dni: string,
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Res() res
  ) {
    try {
      const resultado = await this.planillaService.deduccionesComplementariaDeBenef(dni, periodoInicio, periodoFinalizacion);
      return res.status(HttpStatus.OK).json({
        message: 'Consulta realizada con éxito',
        data: resultado
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al realizar la consulta',
        error: error.message
      });
    }
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
    @Query('codPlanilla') codPlanilla: string,
  ) {
    if (!codPlanilla) {
      throw new BadRequestException('Los parámetros codPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerPreliminar(codPlanilla);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener planilla preliminar');
    }
  }

  @Get('todas')
  async ObtenerTodasPlanillas(
    @Query('codPlanilla') codPlanilla: string,
  ) {
    if (!codPlanilla) {
      throw new BadRequestException('Los parámetros codPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerTodasPlanillas(codPlanilla);
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

  @Get('Definitiva/personas/:term')
  async ObtenerPlanDefinPersonas(
    @Param('term') term: string
  ) {
    if (!term) {
      throw new BadRequestException('Los parámetros idPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerPlanDefinPersonas(term);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener planilla preliminar');
    }
  }

  /* @Get('planillaOrdinaria')
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
  } */

  /* @Get('planillaComplementaria')
  async ObtenerAfilComplementaria() {
    return this.planillaService.obtenerAfilComplementaria();
  }

  @Get('planillaExtraordinaria')
  async ObtenerAfilExtraordinaria() {
    return this.planillaService.obtenerAfilExtraordinaria();
  } */

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

  @Get(':codigoPlanilla')
  async findOne(@Param('codigoPlanilla') codigoPlanilla: string, @Res() res) {
    const planilla = await this.planillaService.findOne(codigoPlanilla);

    if (!planilla) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: `Planilla con código ${codigoPlanilla} no encontrada.`,
      });
    }

    return res.status(HttpStatus.OK).json({
      message: "Consulta realizada con éxito",
      data: planilla, // Asumiendo que deseas devolver un objeto único, si esperas un array, debes ajustarlo
    });
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePlanillaDto: UpdatePlanillaDto) {
    return this.planillaService.update(id, updatePlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planillaService.remove(+id);
  }
}
