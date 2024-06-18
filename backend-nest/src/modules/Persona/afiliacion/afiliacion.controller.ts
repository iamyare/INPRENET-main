import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { Net_Persona } from '../entities/Net_Persona.entity';

@Controller('afiliacion')
export class AfiliacionController {
    constructor(private readonly afiliacionService: AfiliacionService) {        
    }

    @Get('persona-dni/:n_identificacion')
  async getPersonaByDni(@Param('n_identificacion') n_identificacion: string): Promise<Net_Persona> {
    return this.afiliacionService.getPersonaByn_identificacioni(n_identificacion);
  }

    @Get('causantes/:n_identificacion')
  async getCausantesByDniBeneficiario(@Param('n_identificacion') n_identificacion: string): Promise<Net_Persona[]> {
    try {
      const causantes = await this.afiliacionService.getCausantesByDniBeneficiario(n_identificacion);
      if (!causantes || causantes.length === 0) {
        throw new NotFoundException('Causantes no encontrados');
      }
      return causantes;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
