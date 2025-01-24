import { Controller, Get, Post, Body, Param, Req, Query, UnauthorizedException, Res, BadRequestException, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, HttpException, HttpStatus, Delete, NotFoundException} from '@nestjs/common';
import { ConasaService } from './conasa.service';
import { ManejarTransaccionDto } from './dto/crear-contrato.dto';
import { ApiResponse } from '@nestjs/swagger';
import { CrearConsultaDto } from './dto/create-consulta-medica.dto';
import { CancelarContratoDto } from './dto/cancelar-contrato.dto';
import { ObtenerAfiliadosPorPeriodoDto } from './dto/afiliados-periodo.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('conasa')
export class ConasaController {
  constructor(private readonly conasaService: ConasaService) {}

  @Post('subir-factura')
  @UseInterceptors(FileInterceptor('archivo_pdf'))
  async subirFactura(
    @Body() body: { tipo_factura: number; periodo_factura: string },
    @UploadedFile() archivo_pdf: Express.Multer.File,
    @Res() res,
  ) {
    const tipoFactura = parseInt(body.tipo_factura as any, 10);
  
    if (![1, 2].includes(tipoFactura)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'El tipo de factura debe ser 1 o 2 (Asistencia Médica o Contratos Funerarios).',
      });
    }
  
    // Continuar con el resto de la lógica
    if (!archivo_pdf) {
      return res.status(400).json({
        statusCode: 400,
        message: 'El archivo PDF es requerido.',
      });
    }
  
    if (!body.periodo_factura || !/^\d{4}-\d{2}$/.test(body.periodo_factura)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'El periodo de factura debe estar en el formato AAAA-MM.',
      });
    }
  
    try {
      const resultado = await this.conasaService.guardarFactura({
        tipo_factura: tipoFactura,
        periodo_factura: body.periodo_factura,
        archivo_pdf: archivo_pdf.buffer,
      });
  
      return res.status(201).json({
        statusCode: 201,
        message: 'Factura subida exitosamente.',
        data: resultado,
      });
    } catch (error) {
      console.error('Error al guardar la factura:', error.message);
      return res.status(500).json({
        statusCode: 500,
        message: 'Error al guardar la factura.',
        error: error.message,
      });
    }
  } 

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
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'Error de autorización.' })
  async crearConsultas(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    crearConsultasDto: CrearConsultaDto[],
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



  @Get('cuadres')
  async obtenerDatos(
    @Req() req: Request,
    @Query('tipo') tipo: number,
  ): Promise<any> {
    // Validar credenciales del usuario
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

    // Delegar al servicio según el tipo de consulta
    return await this.conasaService.obtenerDatos(email, password, tipo);
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

  @Get('afiliados-por-periodo-excel')
  @UsePipes(ValidationPipe)
  async obtenerAfiliadosPorPeriodoExcel(
    @Query() params: ObtenerAfiliadosPorPeriodoDto,
    @Res() res,
  ) {
    await this.conasaService.obtenerAfiliadosPorPeriodoExcel(params.fechaInicio, params.fechaFin, res);
  }

  @Get('beneficiarios/excel')
  @ApiResponse({ status: 200, description: 'Archivo Excel generado correctamente.' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  @ApiResponse({ status: 500, description: 'Error al generar el archivo Excel.' })
  async generarExcelBeneficiarios(@Res() res) {
    return await this.conasaService.generarExcelBeneficiarios(res);
  }

  @Get('listar-facturas')
  async listarFacturas(@Query('tipo') tipo: number) {
    if (![0, 1, 2].includes(tipo)) {
      throw new BadRequestException('El tipo de factura debe ser 0, 1 o 2.');
    }
    return await this.conasaService.listarFacturas(tipo === 0 ? null : tipo);
  }
  
  @Get('visualizar-factura/:id')
  async visualizarFactura(@Param('id') id: number, @Res() res) {
    const factura = await this.conasaService.obtenerFactura(id);
    if (!factura) {
      throw new NotFoundException('Factura no encontrada.');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.send(factura.archivo_pdf);
  }

  @Get('descargar-factura/:id')
  async descargarFactura(@Param('id') id: number, @Res() res) {
    const factura = await this.conasaService.obtenerFactura(id);
    if (!factura) {
      throw new NotFoundException('Factura no encontrada.');
    }
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=factura-${factura.id_factura}.pdf`,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.send(factura.archivo_pdf);
  }

  @Delete('eliminar-factura/:id')
  async eliminarFactura(@Param('id') id: number) {
    const eliminado = await this.conasaService.eliminarFactura(id);
    if (!eliminado) {
      throw new BadRequestException(
        'La factura no puede ser eliminada. Solo puede eliminarse dentro de las primeras 24 horas.',
      );
    }
    return { message: 'Factura eliminada exitosamente.' };
  }


}
