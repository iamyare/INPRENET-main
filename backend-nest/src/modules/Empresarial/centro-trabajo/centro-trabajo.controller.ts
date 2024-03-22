import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CentroTrabajoService } from './centro-trabajo.service';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('centro-trabajo')
@Controller('centro-trabajo')
export class CentroTrabajoController {
  constructor(private readonly centroTrabajoService: CentroTrabajoService) { }

  @Post()
  create(@Body() createCentroTrabajoDto: CreateCentroTrabajoDto) {
    return this.centroTrabajoService.create(createCentroTrabajoDto);
  }

  @Get()
  findAll() {
    return this.centroTrabajoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroTrabajoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCentroTrabajoDto: UpdateCentroTrabajoDto) {
    return this.centroTrabajoService.update(+id, updateCentroTrabajoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centroTrabajoService.remove(+id);
  }
}
