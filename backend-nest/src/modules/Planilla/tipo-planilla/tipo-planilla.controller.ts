import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TipoPlanillaService } from './tipo-planilla.service';
import { CreateTipoPlanillaDto } from './dto/create-tipo-planilla.dto';
import { UpdateTipoPlanillaDto } from './dto/update-tipo-planilla.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tipo-planilla')
@Controller('tipo-planilla')
export class TipoPlanillaController {
  constructor(private readonly tipoPlanillaService: TipoPlanillaService) { }

  @Post()
  create(@Body() createTipoPlanillaDto: CreateTipoPlanillaDto) {
    return this.tipoPlanillaService.create(createTipoPlanillaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tipoPlanillaService.findAll(paginationDto);
  }

  @Post("findTipoPlanByclasePlan")
  findTipoPlanByclasePlan(@Query() paginationDto: PaginationDto, @Body() clasePlanilla: string) {
    return this.tipoPlanillaService.findTipoPlanByclasePlan(paginationDto, clasePlanilla);
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
