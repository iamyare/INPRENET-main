import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { TransaccionesService } from './transacciones.service';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post()
  create(@Body() createTransaccionesDto: CreateTransaccionesDto) {
    return this.transaccionesService.create(createTransaccionesDto);
  }

  @Get()
  findAll() {
    return this.transaccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaccionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranssacionesDto: UpdateTranssacionesDto) {
    return this.transaccionesService.update(+id, updateTranssacionesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaccionesService.remove(+id);
  }
}
