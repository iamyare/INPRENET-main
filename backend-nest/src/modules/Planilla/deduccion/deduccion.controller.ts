import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { DeduccionService } from './deduccion.service';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('deduccion')
@Controller('deduccion')
export class DeduccionController {
  constructor(private readonly deduccionService: DeduccionService) { }

  @Get('deducciones-por-anio-mes/:dni')
  async getDeduccionesPorAnioMes(
    @Param('dni') dni: string,
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number
  ): Promise<any> {
    if (anio < 0 || mes < 1 || mes > 12) {
      throw new BadRequestException('Año o mes inválidos');
    }
    return await this.deduccionService.obtenerDeduccionesPorAnioMes(dni, anio, mes);
  }

  @Post()
  create(@Body() createDeduccionDto: CreateDeduccionDto) {
    return this.deduccionService.create(createDeduccionDto);
  }

  @Get()
  findAll() {
    return this.deduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deduccionService.findOne(+id);
  }

  @Get('byNameInst/:nombre_institucion')
  findOneByNombInst(@Param('nombre_institucion') nombre_institucion: string) {
    return this.deduccionService.findOneByNombInst(nombre_institucion);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeduccionDto: UpdateDeduccionDto) {
    return this.deduccionService.update(+id, updateDeduccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deduccionService.remove(+id);
  }
}
