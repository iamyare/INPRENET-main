import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { P60RentasService } from './p_60_rentas.service';
import { CreateP60RentaDto } from './dto/create-p_60_renta.dto';
import { UpdateP60RentaDto } from './dto/update-p_60_renta.dto';


@Controller('p-60-rentas')
export class P60RentasController {
  constructor(private readonly p60RentasService: P60RentasService) {}

  @Post()
  create(@Body() createP60RentaDto: CreateP60RentaDto) {
    return this.p60RentasService.create(createP60RentaDto);
  }

  @Get(':dni')
  findOne(@Param('dni') dni: string) {
    console.log('probar ruta')
    return this.p60RentasService.findOne(dni);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateP60RentaDto: UpdateP60RentaDto) {
    return this.p60RentasService.update(+id, updateP60RentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.p60RentasService.remove(+id);
  }
  
}
