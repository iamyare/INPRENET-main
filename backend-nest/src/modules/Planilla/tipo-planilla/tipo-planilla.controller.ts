import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoPlanillaService } from './tipo-planilla.service';
import { CreateTipoPlanillaDto } from './dto/create-tipo-planilla.dto';
import { UpdateTipoPlanillaDto } from './dto/update-tipo-planilla.dto';

@Controller('tipo-planilla')
export class TipoPlanillaController {
  constructor(private readonly tipoPlanillaService: TipoPlanillaService) {}

  @Post()
  create(@Body() createTipoPlanillaDto: CreateTipoPlanillaDto) {
    return this.tipoPlanillaService.create(createTipoPlanillaDto);
  }

  @Get()
  findAll() {
    return this.tipoPlanillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoPlanillaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoPlanillaDto: UpdateTipoPlanillaDto) {
    return this.tipoPlanillaService.update(+id, updateTipoPlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoPlanillaService.remove(+id);
  }
}
