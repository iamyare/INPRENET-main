import { Controller, Get, Post, Body, Param} from '@nestjs/common';
import { ConasaService } from './conasa.service';
import { AsignarContratoDto } from './dto/asignar-contrato.dto';
import { CrearBeneficiarioDto } from './dto/beneficiarios-conasa.dto';

@Controller('conasa')
export class ConasaController {
  constructor(private readonly conasaService: ConasaService) {}
  
  @Post('manejar-transaccion')
  async manejarTransaccion(
    @Body('contrato') contratoData: AsignarContratoDto,
    @Body('beneficiarios') beneficiariosData?: CrearBeneficiarioDto[],
  ) {
    return this.conasaService.manejarTransaccion(contratoData, beneficiariosData);
  }

  @Get('categorias')
  getCategorias() {
    return this.conasaService.getCategorias();
  }

  @Get('planes')
  getPlanes() {
    return this.conasaService.getPlanes();
  }

  @Get('titular/:dni')
  async obtenerContratoYBeneficiarios(@Param('dni') dni: string): Promise<any> {
    return await this.conasaService.obtenerContratoYBeneficiariosPorDNI(dni);
  }

}
