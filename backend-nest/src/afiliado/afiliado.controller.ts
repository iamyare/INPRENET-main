import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';

@Controller('afiliado')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService) {}

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadoService.create(createAfiliadoDto);
  }

  @Post('temp')
  createEspecial(@Body() createAfiliadoTempDto: CreateAfiliadoTempDto) {
    return this.afiliadoService.createTemp(createAfiliadoTempDto);
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.afiliadoService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadoService.update(+id, updateAfiliadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.afiliadoService.remove(+id);
  }
}
