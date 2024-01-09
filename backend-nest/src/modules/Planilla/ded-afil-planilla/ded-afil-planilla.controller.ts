import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DedAfilPlanillaService } from './ded-afil-planilla.service';
import { CreateDedAfilPlanillaDto } from './dto/create-ded-afil-planilla.dto';
import { UpdateDedAfilPlanillaDto } from './dto/update-ded-afil-planilla.dto';

@Controller('ded-afil-planilla')
export class DedAfilPlanillaController {
  constructor(private readonly dedAfilPlanillaService: DedAfilPlanillaService) {}

  @Post()
  create(@Body() createDedAfilPlanillaDto: CreateDedAfilPlanillaDto) {
    return this.dedAfilPlanillaService.create(createDedAfilPlanillaDto);
  }

  @Get()
  findAll() {
    return this.dedAfilPlanillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dedAfilPlanillaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDedAfilPlanillaDto: UpdateDedAfilPlanillaDto) {
    return this.dedAfilPlanillaService.update(+id, updateDedAfilPlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dedAfilPlanillaService.remove(+id);
  }
}
