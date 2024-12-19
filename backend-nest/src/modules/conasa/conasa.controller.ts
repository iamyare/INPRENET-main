import { Controller, Get, Post, Body, Param, Req, Query, UnauthorizedException, NotFoundException, Res, BadRequestException, UsePipes, ValidationPipe, ParseArrayPipe} from '@nestjs/common';
import { ConasaService } from './conasa.service';
import { AsignarContratoDto } from './dto/asignar-contrato.dto';
import { CrearBeneficiarioDto } from './dto/beneficiarios-conasa.dto';
import { ManejarTransaccionDto } from './dto/crear-contrato.dto';
import { ApiResponse } from '@nestjs/swagger';
import { CrearConsultaDto } from './dto/create-consulta-medica.dto';
import { CancelarContratoDto } from './dto/cancelar-contrato.dto';
import { ObtenerAfiliadosPorPeriodoDto } from './dto/afiliados-periodo.dto';

@Controller('conasa')
export class ConasaController {
  constructor(private readonly conasaService: ConasaService) {}

  @Post('crear-contrato')
async manejarTransaccion(@Body() payload: ManejarTransaccionDto, @Res() res) {
  try {
    const resultado = await this.conasaService.manejarTransaccion(payload);
    // Devuelve una respuesta clara y el status 201
    return res.status(201).json({
      statusCode: 201,
      message: 'Contrato y beneficiarios creados exitosamente.',
      data: resultado,
    });
  } catch (error) {
    console.error('Error en la creación del contrato:', error.message);
    // Si hay un error, devuelve el estado 500 con un mensaje claro
    return res.status(500).json({
      statusCode: 500,
      message: 'Error al crear el contrato.',
      error: error.message,
    });
  }
}

  @Get('verificar-contrato/:idPersona')
  async verificarContrato(@Param('idPersona') idPersona: number) {
    const existeContrato = await this.conasaService.verificarContratoExistente(idPersona);

    if (existeContrato) {
      return { tieneContrato: true, message: 'La persona ya tiene un contrato activo.' };
    }
    return { tieneContrato: false, message: 'La persona no tiene un contrato activo.' };
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

  @Post('cancelar-contrato')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async cancelarContrato(@Body() dto: CancelarContratoDto) {
    return await this.conasaService.cancelarContrato(dto);
  }

  @Get('buscar-afiliado')
  async consultaUnificada(
    @Query('tipo') tipo: string,
    @Query('terminos') terminos: string,
    @Req() req: Request
  ) {
    // Validación del header Authorization
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('No authorization header present');
    }

    const [scheme, base64Credentials] = authorization.split(' ');
    if (scheme !== 'Basic' || !base64Credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    let email: string;
    let password: string;
    try {
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      [email, password] = decoded.split(':');
      if (!email || !password) throw new Error();
    } catch (error) {
      throw new UnauthorizedException('Failed to decode or validate authorization');
    }

    if (!tipo || !terminos) {
      throw new BadRequestException('Tipo y términos son obligatorios');
    }

    return {
      message: 'Consulta realizada exitosamente',
      data: await this.conasaService.consultaUnificada(
        Number(tipo),
        terminos,
        email,
        password,
      ),
    };
  }

  @Get('planilla-activos')
  async obtenerPlanillaContratosActivos(
    @Req() req: Request 
  ) {
    // Validación del header Authorization
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('No authorization header present');
    }

    const [scheme, base64Credentials] = authorization.split(' ');
    if (scheme !== 'Basic' || !base64Credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    let email: string;
    let password: string;
    try {
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      [email, password] = decoded.split(':');
      if (!email || !password) throw new Error();
    } catch (error) {
      throw new UnauthorizedException('Failed to decode or validate authorization');
    }

    // Se pasa la validación de las credenciales y se obtiene la planilla
    return {
      message: 'Consulta de planilla realizada exitosamente.',
      data: await this.conasaService.obtenerPlanillaContratosActivos(email, password),
    };
  }

  @Post('/registrar-consulta-medica')
  @ApiResponse({ status: 201, description: 'Proceso de registro completado.' })
  @ApiResponse({ status: 401, description: 'Error de autorización.' })
  @ApiResponse({ status: 500, description: 'Error en el proceso de registro.' })
  async crearConsultas(
    @Body() crearConsultasDto: CrearConsultaDto[], // Sin ParseArrayPipe
    @Req() req: Request,
  ) {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('No authorization header present');
    }

    const [scheme, base64Credentials] = authorization.split(' ');
    if (scheme !== 'Basic' || !base64Credentials) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    let email: string;
    let password: string;
    try {
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      [email, password] = decoded.split(':');
      if (!email || !password) throw new Error();
    } catch (error) {
      throw new UnauthorizedException('Failed to decode or validate authorization');
    }

    return await this.conasaService.crearConsultasMedicas(crearConsultasDto, email, password);
  }

  @Get('afiliados-por-periodo')
  @UsePipes(ValidationPipe)
  async obtenerAfiliadosPorPeriodo(@Query() params: ObtenerAfiliadosPorPeriodoDto) {
    return await this.conasaService.obtenerAfiliadosPorPeriodo(params.fechaInicio, params.fechaFin);
  }

  @Get('beneficiarios')
  @ApiResponse({ status: 200, description: 'Lista de beneficiarios obtenida correctamente.' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  @ApiResponse({ status: 500, description: 'Error al obtener los beneficiarios.' })
  async obtenerBeneficiarios() {
    return await this.conasaService.obtenerBeneficiarios();
  }

}
