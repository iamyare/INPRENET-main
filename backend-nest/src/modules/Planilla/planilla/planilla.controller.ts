import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, BadRequestException, InternalServerErrorException, HttpStatus, NotFoundException, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Net_Planilla } from './entities/net_planilla.entity';
import { GetPlanillasPreliminaresDto } from './dto/get-planillas-preliminares.dto';
import { GeneratePlanillaDto } from './dto/generate-planilla.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('planilla')
@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService, @InjectEntityManager() private readonly entityManager: EntityManager) { }

  /* @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  uploadExcel(@UploadedFile() file: Express.Multer.File) {
    return this.planillaService.uploadExcel(file);
  } */

    @Post('verificar-beneficios')
  @UseInterceptors(FileInterceptor('file'))
  async verificarBeneficios(@UploadedFile() file: Express.Multer.File): Promise<void> {
    const tempDir = path.join('D:', 'tmp');
    const filePath = path.join(tempDir, file.originalname);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(filePath, file.buffer);
    await this.planillaService.verificarBeneficioEnExcel(filePath);
    fs.unlinkSync(filePath);
  }
 
  @Get('total/:id_planilla')
  async getPlanilla(@Param('id_planilla', ParseIntPipe) id_planilla: number) {
    try {
      return await this.planillaService.getPlanillaById(id_planilla);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Planilla con ID ${id_planilla} no encontrada`);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Patch('actualizar-planilla-a-cerrada')
  async updatePlanillaACerrada(
    @Query('codigo_planilla') codigo_planilla: string
  ): Promise<void> {
    return this.planillaService.updatePlanillaACerrada(codigo_planilla);
  }

  @Get('desglose-persona-planilla')
  async getDesglosePorPersonaPlanilla(
    @Query('id_persona') id_persona: string,
    @Query('codigo_planilla') codigo_planilla: string
  ): Promise<any> {
    return this.planillaService.getDesglosePorPersonaPlanilla(id_persona, codigo_planilla);
  }

  @Get('activas')
  //@Roles({ rol: 'ADMINISTRADOR DE PLANILLA', modulo: 'PLANILLA' })
  async getActivePlanillas(@Query('clasePlanilla') clasePlanilla?: string) {
    return this.planillaService.getActivePlanillas(clasePlanilla);
  }
  
  @Get('montos-banco-periodo')
  async getMontosPorBancoYPeriodo(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Query('idTiposPlanilla') idTiposPlanilla: string,
  ): Promise<any> {
    const tiposPlanillaArray = idTiposPlanilla.split(',').map(Number);
    return this.planillaService.getTotalPorBancoYPeriodo(
      periodoInicio,
      periodoFinalizacion,
      tiposPlanillaArray,
    );
  }

  @Get('beneficios-deducciones-periodo')
  async getBeneficiosDeducciones(
    @Query('periodoInicio') periodoInicio: string,
    @Query('periodoFinalizacion') periodoFinalizacion: string,
    @Query('idTiposPlanilla') idTiposPlanilla: string,
  ): Promise<any> {
    const tiposPlanillaArray = idTiposPlanilla.split(',').map(Number);
    return this.planillaService.getTotalPorBeneficiosYDeduccionesPorPeriodo(
      periodoInicio,
      periodoFinalizacion,
      tiposPlanillaArray,
    );
  }

  @Get('totales-beneficios-deducciones/:idPlanilla')
  async getTotalesBeneficiosDeducciones(@Param('idPlanilla', ParseIntPipe) idPlanilla: number) {
    return this.planillaService.getTotalesBeneficiosDeducciones(idPlanilla);
  }

  @Get('desglose-deducciones/:idPlanilla/:idBeneficio')
  async getDesgloseDeducciones(
    @Param('idPlanilla') idPlanilla: number,
    @Param('idBeneficio') idBeneficio: number,
  ): Promise<any> {
    return this.planillaService.getDesgloseDeducciones(idPlanilla, idBeneficio);
  }

  @Get('generar-excel')
  async generarExcel(
    @Query('codPlanilla') codPlanilla: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res,
  ) {
    const data = await this.planillaService.ObtenerPlanDefinPersonas(codPlanilla, page, limit);
    await this.planillaService.generarExcel(data, res);
  }

  @Get('totalesBYD/:idPlanilla')
  async getTotalesPorPlanilla(@Param('idPlanilla') idPlanilla: string) {
    return this.planillaService.getTotalPorBeneficiosYDeducciones(Number(idPlanilla));
  }

  @Get('beneficios/:idPlanilla')
  async getBeneficiosPorPlanilla(@Param('idPlanilla') idPlanilla: number) {
    return await this.planillaService.GetBeneficiosPorPlanilla(idPlanilla);
  }

  @Get('deducciones/:idPlanilla')
  async getDeduccionesPorPlanilla(@Param('idPlanilla') idPlanilla: number) {
    return await this.planillaService.GetDeduccionesPorPlanilla(idPlanilla);
  }

  @Get('deducciones-separadas/:idPlanilla')
  async getDeduccionesPorPlanillaSeparadas(@Param('idPlanilla', ParseIntPipe) idPlanilla: number) {
    return this.planillaService.GetDeduccionesPorPlanillaSeparadas(idPlanilla);
  }

  @Get('generar-voucher')
  async generarVoucher(
    @Query('idPlanilla') idPlanilla: number,
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
    @Param('term') term: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    if (!term) {
      throw new BadRequestException('Los parámetros idPlanilla son obligatorios');
    }
    try {
      return await this.planillaService.ObtenerPlanDefinPersonas(term, page, limit);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener planilla preliminar');
    }
  }

  @Get('montos-banco/:term')
  async ObtenerMontosPorBanco(
    @Param('term') term: string
  ) {
    if (!term) {
      throw new BadRequestException('El parámetro term es obligatorio');
    }
    try {
      return await this.planillaService.ObtenerMontosPorBanco(term);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los montos por banco');
    }
  }
  @Post()
  create(@Body() createPlanillaDto: CreatePlanillaDto) {
    return this.planillaService.create(createPlanillaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.planillaService.findAll(paginationDto);
  }

  @Get(':codigoPlanilla')
  async findOne(@Param('codigoPlanilla') codigoPlanilla: string, @Res() res) {
    try {
      return await this.entityManager.transaction(async manager => {
        const planilla = await manager.findOne(Net_Planilla, {
          where: {
            codigo_planilla: codigoPlanilla,
            tipoPlanilla: { clase_planilla: "EGRESO" }
          },
          relations: ["tipoPlanilla"]
        });

        if (!planilla) {
          return res.status(HttpStatus.NOT_FOUND).json({
            message: `Planilla con código ${codigoPlanilla} no encontrada.`,
          });
        } else {
          return res.status(HttpStatus.OK).json({
            message: "Consulta realizada con éxito",
            data: planilla,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePlanillaDto: UpdatePlanillaDto) {
    return this.planillaService.update(id, updatePlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planillaService.remove(+id);
  }

  @Post('generar-complementaria')
  async generarComplementaria(@Body() generatePlanillaDto: GeneratePlanillaDto): Promise<void> {
    await this.planillaService.generarPlanillaComplementaria(generatePlanillaDto.tipos_persona);
  }

  @Post('generar-ordinaria')
  async generarOrdinaria(@Body() generatePlanillaDto: GeneratePlanillaDto): Promise<void> {
    await this.planillaService.generarPlanillaOrdinaria(generatePlanillaDto.tipos_persona);
  }

  @Post('get-preliminares')
  async getPlanillasPreliminares(@Body() getPlanillasPreliminaresDto: GetPlanillasPreliminaresDto): Promise<any[]> {
    return this.planillaService.getPlanillasPreliminares(getPlanillasPreliminaresDto.codigo_planilla);
  }

  
}
