import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Afiliado')
@Controller('afiliado')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService) { }

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadoService.create(createAfiliadoDto);
  }

  @Post('temp')
  createEspecial(@Body() createAfiliadoTempDto: CreateAfiliadoTempDto) {
    return this.afiliadoService.createTemp(createAfiliadoTempDto);
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get('/dni/:dni')
  async findByDni(@Param('dni') dni: string) {
    return await this.afiliadoService.findByDni(dni);
  }

  @Get(':term')
  findOne(@Param('term') term: number) {
    return this.afiliadoService.findOne(term);
  }

  @Get('obtenerBenDeAfil/:dniAfil')
  async obtenerDatosRelacionados(@Param('dniAfil') dniAfil: string): Promise<any> {
    return this.afiliadoService.obtenerBenDeAfil(dniAfil);
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
