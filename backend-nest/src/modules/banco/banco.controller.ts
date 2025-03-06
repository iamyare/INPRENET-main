import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, InternalServerErrorException, HttpCode, Put, UseGuards } from '@nestjs/common';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultadosPagosDto } from './dto/ResultadosPagos.dto';
import { NotificacionPagosPendientesDto } from './dto/pago_pendiente.dto';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('banco')
@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) { }

  @Post('/generar-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generar y enviar un código OTP al correo' })
  @ApiResponse({ status: 200, description: 'Código OTP enviado al correo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async generarOtp(@Body() datos: { correo: string }): Promise<{ message: string }> {
    return this.bancoService.generarOtp(datos.correo);
  }

  @Put('/actualizar-contrasena')
  @HttpCode(200)
  @ApiOperation({ summary: 'Actualizar contraseña con OTP' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Código OTP inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async actualizarContrasena(
    @Body() datos: { correo: string; otp: string; nuevaContrasena: string }
  ): Promise<{ message: string }> {
    return this.bancoService.actualizarContrasena(datos.correo, datos.otp, datos.nuevaContrasena);
  }

  @Get('/planilla/disponibles')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'API_KEY_BANCO', required: true, description: 'Clave de autenticación del banco' })
  @ApiOperation({ summary: 'Obtener planillas disponibles para pago' })
  @ApiResponse({ status: 200, description: 'Lista de planillas disponibles para pago' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async obtenerDetallePagoPlanilla() {
    return await this.bancoService.obtenerDetallePagoPlanilla();
  }

  @Post('/pagos/pagos-fallidos')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'API_KEY_BANCO', required: true, description: 'Clave de autenticación del banco' })
  @ApiOperation({ summary: 'Procesar pagos fallidos de una planilla' })
  @ApiResponse({ status: 200, description: 'Pagos procesados correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async procesarPagos(@Body() datos:ResultadosPagosDto) {
    return await this.bancoService.procesarPagos(datos);
  }

  @Post('/pagos/pagos-pendientes')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'API_KEY_BANCO', required: true, description: 'Clave de autenticación del banco' })
  @ApiOperation({ summary: 'Procesar notificación de pagos acumulados y actualizar cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Pagos procesados correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async procesarPagosPendientes(@Body() datos: NotificacionPagosPendientesDto[]) {
      return this.bancoService.procesarPagosPendientes(datos);
  }


  @Get()
  async findAll() {
    try {
      const bancos = await this.bancoService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Tipos de cuenta obtenidos con éxito',
        data: bancos,
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Ocurrió un error al obtener los tipos de cuenta',
      }, HttpStatus.BAD_REQUEST);
    }
    
  }
}
