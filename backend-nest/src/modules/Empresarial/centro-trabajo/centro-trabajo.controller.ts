import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { CentroTrabajoService } from './centro-trabajo.service';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePrivateCentroTrabajoCompleteDto } from './dto/create-private-centro-trabajo-complete.dto';

@ApiTags('centro-trabajo')
@Controller('centro-trabajo')
export class CentroTrabajoController {
  constructor(private readonly centroTrabajoService: CentroTrabajoService) { }

  @Post()
  create(@Body() createCentroTrabajoDto: CreateCentroTrabajoDto) {
    return this.centroTrabajoService.create(createCentroTrabajoDto);
  }

  @Post('create-private')
  async createPrivateCentroTrabajoComplete(@Body() createPrivateCentroTrabajoCompleteDto: CreatePrivateCentroTrabajoCompleteDto) {
    return this.centroTrabajoService.createPrivateCentroTrabajoComplete(createPrivateCentroTrabajoCompleteDto);
  }

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      const centrosTrabajo = await this.centroTrabajoService.findAll();
      res.status(HttpStatus.OK).json(centrosTrabajo);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get("Privados")
  async findAllPriv(@Res() res): Promise<void> {
    try {
      const centrosTrabajo = await this.centroTrabajoService.findAllPriv();
      res.status(HttpStatus.OK).json(centrosTrabajo);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroTrabajoService.findOne(+id);
  }

  @Get('findBy/:content')
  findBy(@Param('content') content: string) {
    return this.centroTrabajoService.findBy(content);
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
