import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateAldeaDto } from '../provincia/dto/create-aldea.dto';
import { CreateColoniaDto } from '../provincia/dto/CreateColoniaDto';
import { UpdateAldeaColoniaDto } from '../provincia/dto/update-aldea-colonia.dto';

@ApiTags('municipio')
@Controller('municipio')
export class MunicipioController {
  constructor(private readonly municipioService: MunicipioService) { }

  @Get()
  findAll() {
    return this.municipioService.findAll();
  }

  @Get('aldeas')
  async getAllAldeas() {
    return await this.municipioService.findAllAldeas();
  }

  @Get('colonias')
  async getAllColonias() {
    return await this.municipioService.findAllColonias();
  }

  @Patch('aldea/:id')
  async actualizarAldea(@Param('id') id: number, @Body() updateDto: UpdateAldeaColoniaDto) {
    return await this.municipioService.actualizarAldea(id, updateDto);
  }

  @Patch('colonia/:id')
  async actualizarColonia(@Param('id') id: number, @Body() updateDto: UpdateAldeaColoniaDto) {
    return await this.municipioService.actualizarColonia(id, updateDto);
  }

  @Post('aldea')
  async createAldea(@Body() createAldeaDto: CreateAldeaDto) {
    return await this.municipioService.createAldea(createAldeaDto);
  }

  @Post('colonia')
  async createColonia(@Body() createColoniaDto: CreateColoniaDto) {
    return await this.municipioService.createColonia(createColoniaDto);
  }

  @Get('departamento/:id')
  findByDepartamento(@Param('id') id: number) {
    return this.municipioService.getMunicipiosByDepartamento(id);
  }

  @Get(':id/departamento')
  async getDepartamentoByMunicipio(@Param('id') municipioId: number) {
    return this.municipioService.getDepartamentoByMunicipio(municipioId);
  }

  @Get(':id/aldeas')
  getAldeasByMunicipio(@Param('id') municipioId: number) {
    return this.municipioService.getAldeasByMunicipio(municipioId);
  }

  @Get(':id/colonias')
  async getColoniasByMunicipio(@Param('id') municipioId: number) {
    return this.municipioService.getColoniasByMunicipio(municipioId);
  }
  
}
