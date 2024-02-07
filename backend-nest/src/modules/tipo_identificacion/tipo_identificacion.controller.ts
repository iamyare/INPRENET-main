import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoIdentificacionService } from './tipo_identificacion.service';
import { CreateTipoIdentificacionDto } from './dto/create-tipo_identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo_identificacion.dto';

@Controller('tipo-identificacion')
export class TipoIdentificacionController {
  constructor(private readonly tipoIdentificacionService: TipoIdentificacionService) {}

  @Post()
  create(@Body() createTipoIdentificacionDto: CreateTipoIdentificacionDto) {
    return this.tipoIdentificacionService.create(createTipoIdentificacionDto);
  }

  @Get()
  findAll() {
    return this.tipoIdentificacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoIdentificacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoIdentificacionDto: UpdateTipoIdentificacionDto) {
    return this.tipoIdentificacionService.update(+id, updateTipoIdentificacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoIdentificacionService.remove(+id);
  }
}
