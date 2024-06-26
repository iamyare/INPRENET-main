import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BeneficioService } from './beneficio.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBeneficioTipoPersonaDto } from './dto/create-beneficio_tipo_persona.dto';

@ApiTags('beneficioTipoPersona')
@Controller('beneficioTipoPersona')
export class BeneficioTipoPersonaController {
  constructor(private readonly beneficioService: BeneficioService) { }

  @Post("createTipoBeneficio")
  create(@Body() createBeneficioDto: CreateBeneficioTipoPersonaDto) {
    /* return this.beneficioService.create(createBeneficioDto); */
  }

}
