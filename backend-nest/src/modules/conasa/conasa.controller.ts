import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConasaService } from './conasa.service';

@Controller('conasa')
export class ConasaController {
  constructor(private readonly conasaService: ConasaService) {}

  @Get('categorias')
  getCategorias() {
    return this.conasaService.getCategorias();
  }

  @Get('planes')
  getPlanes() {
    return this.conasaService.getPlanes();
  }
}
