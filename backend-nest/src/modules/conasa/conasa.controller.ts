import { Controller, Get, Post, Body, Param, Req, Query, UnauthorizedException, NotFoundException} from '@nestjs/common';
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

  @Get('buscar-afiliado-por-nombres-apellidos')
  async buscarPersona(
    @Query('terminos') terminos: string,
    @Req() req: Request,
  ): Promise<{ message: string; personas: { nombre_completo: string; dni: string }[] }> {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('No authorization header present');
    }

    const [scheme, base64Credentials] = authorization.split(' ');
    if (scheme !== 'Basic' || !base64Credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const decoded = atob(base64Credentials);
      const [email, password] = decoded.split(':');

      const personas = await this.conasaService.buscarPersonaPorNombresYApellidos(
        terminos,
        email,
        password,
      );

      return {
        message: 'Persons found',
        personas,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error; 
      }
      console.error(`Error occurred while processing request: ${error.message}`);
      throw new UnauthorizedException('Failed to decode or validate authorization');
    }
  }

  @Get('AfiliadoConasa/:term')
  findOneConasa(
    @Param('term') term: string,
    @Req() req: Request
  ) {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('No authorization header present');
    }
    const [scheme, base64Credentials] = authorization.split(' ');
    if (scheme !== 'Basic' || !base64Credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }
    try {
      const decoded = atob(base64Credentials);
      const [email, password] = decoded.split(':');
      return this.conasaService.findOneConasa(term, email, password);
    } catch (error) {
      throw new UnauthorizedException('Failed to decode or validate authorization');
    }
  }

}
