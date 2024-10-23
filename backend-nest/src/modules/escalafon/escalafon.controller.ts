import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EscalafonService } from './escalafon.service';
import { CreateEscalafonDto } from './dto/create-escalafon.dto';
import { UpdateEscalafonDto } from './dto/update-escalafon.dto';

@Controller('escalafon')
export class EscalafonController {
  constructor(private readonly escalafonService: EscalafonService) {}

  @Post()
  create(@Body() createEscalafonDto: CreateEscalafonDto) {
    return this.escalafonService.create(createEscalafonDto);
  }
/**/
  @Get('prestamos/:dni')
  findOne(@Param('dni') dni: string) {
    console.log('probar ruta')
    return this.escalafonService.findOne(dni);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEscalafonDto: UpdateEscalafonDto) {
    return this.escalafonService.update(+id, updateEscalafonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escalafonService.remove(+id);
  }
}
