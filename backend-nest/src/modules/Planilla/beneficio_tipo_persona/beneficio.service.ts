import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBeneficioTipoPersonaDto } from './dto/create-beneficio_tipo_persona.dto';
import { UpdateBeneficioTipoPersonaDto } from './dto/update-beneficio_tipo_persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name)
  constructor() { }

}
