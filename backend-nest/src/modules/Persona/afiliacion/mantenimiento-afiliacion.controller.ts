import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { MantenimientoAfiliacionService } from './mantenimiento-afiliacion.service';
import { CreateDiscapacidadDto } from './dtos/create-discapacidad.dto';
import { UpdateDiscapacidadDto } from './dtos/update-discapacidad.dto';
import { CreateProfesionDto } from './dtos/create-profesion.dto';
import { UpdateProfesionDto } from './dtos/update-profesion.dto';
import { CreateColegioDto } from './dtos/create-colegio.dto';
import { UpdateColegioDto } from './dtos/update-colegio.dto';
import { CreateBancoDto } from './dtos/create-banco.dto';
import { UpdateBancoDto } from './dtos/update-banco.dto';
@Controller('mantenimiento-afiliacion')
export class MantenimientoAfiliacionController {
  constructor(private readonly mantenimientoAfiliacionService: MantenimientoAfiliacionService) {}

  // Rutas para Discapacidades

  @Get('discapacidades/listar')
  findAllDiscapacidades() {
    return this.mantenimientoAfiliacionService.findAllDiscapacidades();
  }

  @Get('discapacidades/detalle/:id')
  findOneDiscapacidad(@Param('id') id: number) {
    return this.mantenimientoAfiliacionService.findOneDiscapacidad(id);
  }

  @Post('discapacidades/crear')
  createDiscapacidad(@Body() createDiscapacidadDto: CreateDiscapacidadDto) {
    return this.mantenimientoAfiliacionService.createDiscapacidad(createDiscapacidadDto);
  }

  @Put('discapacidades/actualizar/:id')
  updateDiscapacidad(@Param('id') id: number, @Body() updateDiscapacidadDto: UpdateDiscapacidadDto) {
    return this.mantenimientoAfiliacionService.updateDiscapacidad(id, updateDiscapacidadDto);
  }

  // Rutas para Profesiones

  @Get('profesiones/listar')
  findAllProfesiones() {
    return this.mantenimientoAfiliacionService.findAllProfesiones();
  }

  @Get('profesiones/detalle/:id')
  findOneProfesion(@Param('id') id: number) {
    return this.mantenimientoAfiliacionService.findOneProfesion(id);
  }

  @Post('profesiones/crear')
  createProfesion(@Body() createProfesionDto: CreateProfesionDto) {
    return this.mantenimientoAfiliacionService.createProfesion(createProfesionDto);
  }

  @Put('profesiones/actualizar/:id')
  updateProfesion(@Param('id') id: number, @Body() updateProfesionDto: UpdateProfesionDto) {
    return this.mantenimientoAfiliacionService.updateProfesion(id, updateProfesionDto);
  }

  // Rutas para Colegios Magisteriales

  @Get('colegios/listar')
  findAllColegios() {
    return this.mantenimientoAfiliacionService.findAllColegios();
  }

  @Get('colegios/detalle/:id')
  findOneColegio(@Param('id') id: number) {
    return this.mantenimientoAfiliacionService.findOneColegio(id);
  }

  @Post('colegios/crear')
  create(@Body() createColegioDto: CreateColegioDto) {
    return this.mantenimientoAfiliacionService.createColegio(createColegioDto);
  }

  @Put('colegios/actualizar/:id')
  updateColegio(@Param('id') id: number, @Body() updateColegioDto: UpdateColegioDto) {
    return this.mantenimientoAfiliacionService.updateColegio(id, updateColegioDto);
  }

  // Rutas para Bancos

  @Get('bancos/listar')
  findAllBancos() {
    return this.mantenimientoAfiliacionService.findAllBancos();
  }

  @Get('bancos/detalle/:id')
  findOneBanco(@Param('id') id: number) {
    return this.mantenimientoAfiliacionService.findOneBanco(id);
  }

  @Post('bancos/crear')
  createBanco(@Body() createBancoDto: CreateBancoDto) {
    return this.mantenimientoAfiliacionService.createBanco(createBancoDto);
  }

  @Put('bancos/actualizar/:id')
  updateBanco(@Param('id') id: number, @Body() updateBancoDto: UpdateBancoDto) {
    return this.mantenimientoAfiliacionService.updateBanco(id, updateBancoDto);
  }
}
