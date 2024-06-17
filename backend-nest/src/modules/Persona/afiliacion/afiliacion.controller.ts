import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { Net_Persona } from '../entities/Net_Persona.entity';

@Controller('afiliacion')
export class AfiliacionController {
    constructor(private readonly afiliacionService: AfiliacionService) {        
    }

    @Get('causantes/:dni')
  async getCausantesByDniBeneficiario(@Param('dni') dni: string): Promise<Net_Persona[]> {
    try {
      const causantes = await this.afiliacionService.getCausantesByDniBeneficiario(dni);
      if (!causantes || causantes.length === 0) {
        throw new NotFoundException('Causantes no encontrados');
      }
      return causantes;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
