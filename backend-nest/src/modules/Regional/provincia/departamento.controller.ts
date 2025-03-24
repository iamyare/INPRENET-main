import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { ApiTags } from '@nestjs/swagger';
import { DepartamentoService } from './departamento.service';

@ApiTags('departamento')
@Controller('departamento')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) { }

  @Post()
  create(@Body() createProvinciaDto: CreateProvinciaDto) {
    return this.departamentoService.create(createProvinciaDto);
  }

  @Get()
  findAll() {
    return this.departamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departamentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProvinciaDto: UpdateProvinciaDto) {
    return this.departamentoService.update(+id, updateProvinciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departamentoService.remove(+id);
  }

  @Get('pais/:paisId')
  findByPais(@Param('paisId') paisId: string) {
    return this.departamentoService.findByPaisId(+paisId);
  }
}
