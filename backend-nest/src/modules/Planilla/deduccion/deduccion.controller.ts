import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { DeduccionService } from './deduccion.service';
import { CreateDeduccionDto } from './dto/create-deduccion.dto';
import { UpdateDeduccionDto } from './dto/update-deduccion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('deduccion')
@Controller('deduccion')
export class DeduccionController {
  constructor(private readonly deduccionService: DeduccionService) { }

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
