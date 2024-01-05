import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';

@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService) {}

  @Post()
  create(@Body() createPlanillaDto: CreatePlanillaDto) {
    return this.planillaService.create(createPlanillaDto);
  }

  @Get()
  findAll() {
    return this.planillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planillaService.findOne(+id);
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
