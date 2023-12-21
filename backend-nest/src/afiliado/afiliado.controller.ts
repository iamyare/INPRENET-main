import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';

@Controller('afiliado')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService) {}

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadoService.create(createAfiliadoDto);
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.afiliadoService.findOne(+id);
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
