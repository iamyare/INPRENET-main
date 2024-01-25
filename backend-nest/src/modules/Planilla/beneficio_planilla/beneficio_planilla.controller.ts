import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BeneficioPlanillaService } from './beneficio_planilla.service';
import { CreateBeneficioPlanillaDto } from './dto/create-beneficio_planilla.dto';
import { UpdateBeneficioPlanillaDto } from './dto/update-beneficio_planilla.dto';

@Controller('beneficio-planilla')
export class BeneficioPlanillaController {
  constructor(private readonly beneficioPlanillaService: BeneficioPlanillaService) {}

  @Post()
  create(@Body() createBeneficioPlanillaDto: any) {
    return this.beneficioPlanillaService.create(createBeneficioPlanillaDto);
  }

  @Get()
  findAll() {
    return this.beneficioPlanillaService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.beneficioPlanillaService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeneficioPlanillaDto: UpdateBeneficioPlanillaDto) {
    return this.beneficioPlanillaService.update(+id, updateBeneficioPlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficioPlanillaService.remove(+id);
  }
}