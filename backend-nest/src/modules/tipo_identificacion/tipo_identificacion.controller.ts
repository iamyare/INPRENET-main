import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TipoIdentificacionService } from './tipo_identificacion.service';
import { CreateTipoIdentificacionDto } from './dto/create-tipo_identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo_identificacion.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tipo-identificacion')
@Controller('tipo-identificacion')
export class TipoIdentificacionController {
  constructor(private readonly tipoIdentificacionService: TipoIdentificacionService) { }

  @Post()
  create(@Body() createTipoIdentificacionDto: CreateTipoIdentificacionDto) {
    return this.tipoIdentificacionService.create(createTipoIdentificacionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tipoIdentificacionService.findAll(paginationDto);
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
