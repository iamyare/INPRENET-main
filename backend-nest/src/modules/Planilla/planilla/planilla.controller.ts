import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';

@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService) {}

  @Post('create-view')
  async createView() {
    await this.planillaService.createView();
    return { message: 'Vista creada con éxito' };
  }


  @Post('create-complementary-view')
  async createComplementaryView() {
    await this.planillaService.createComplementaryView();
    return { message: 'Vista complementaria creada con éxito' };
  }

  
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
  findAll() {
    return this.planillaService.findAll();
  }

/*   @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planillaService.findOne(+id);
  } */

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.planillaService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanillaDto: UpdatePlanillaDto) {
    return this.planillaService.update(+id, updatePlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planillaService.remove(+id);
  }
}
