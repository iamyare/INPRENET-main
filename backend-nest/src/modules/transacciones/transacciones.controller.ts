import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Res, HttpCode, ParseIntPipe, NotFoundException, Put } from '@nestjs/common';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { TransaccionesService } from './transacciones.service';
import { ApiTags } from '@nestjs/swagger';
import { CrearMovimientoDTO } from './dto/voucher.dto';
import { NET_PROFESIONES } from './entities/net_profesiones.entity';
import { crearCuentaDTO } from './dto/cuenta-transaccioens.dto';

@ApiTags('transacciones')
@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) { }

  @Get('profesiones')
  async findAllProfesiones(): Promise<any> {
    return await this.transaccionesService.findAllProfesiones();
  }

  @Get('voucher/:dni')
  obtenerVouchersDeMovimientos(@Param('dni') dni: string): Promise<any> {
    return this.transaccionesService.obtenerVoucherDeMovimientos(dni);
  }

  @Get('voucherEspecifico/:dni/:idMovimientoCuenta')
  obtenerVoucherMovimientoEspecifico(@Param('dni') dni: string, @Param('idMovimientoCuenta') idMovimientoCuenta: number): Promise<any> {
    return this.transaccionesService.obtenerVoucherDeMovimientoEspecifico(dni, idMovimientoCuenta);
  }

  @Post('crear-movimiento')
  crearMovimiento(@Body() crearMovimientoDto: CrearMovimientoDTO) {
    return this.transaccionesService.crearMovimiento(crearMovimientoDto);
  }
  @Post('crear-cuenta/:idPersona')
  crearCuenta(@Param("idPersona") idPersona: number, @Body() crearCuentaDto: [crearCuentaDTO]) {
    return this.transaccionesService.crearCuenta(idPersona, crearCuentaDto);
  }

  @Get('/tipos-de-cuenta/:dni')
  async obtenerTiposDeCuentaPorDNI(@Param('dni') dni: string) {
    try {
      const tiposDeCuenta = await this.transaccionesService.obtenerTiposDeCuentaPorDNI(dni);
      return {
        statusCode: HttpStatus.OK,
        message: 'Tipos de cuenta obtenidos con éxito',
        data: tiposDeCuenta,
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Ocurrió un error al obtener los tipos de cuenta',
      }, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('/tipos-de-cuenta/')
  async obtenerTiposDeCuenta() {
    try {
      const tiposDeCuenta = await this.transaccionesService.obtenerTiposDeCuenta();
      return {
        statusCode: HttpStatus.OK,
        message: 'Tipos de cuenta obtenidos con éxito',
        data: tiposDeCuenta,
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Ocurrió un error al obtener los tipos de cuenta',
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/getAllColegiosMagisteriales/')
  async getAllCentroTrabajo() {
    try {
      const colegiosMagisteriales = await this.transaccionesService.getAllColegiosMagisteriales();
      return {
        statusCode: HttpStatus.OK,
        message: 'Colegios magisteriales obtenidos con éxito',
        data: colegiosMagisteriales,
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Ocurrió un error al obtener los colegios magisteriales',
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/movimientos/:dni')
  async getMovimientosByDNI(@Param('dni') dni: string, @Res() res) {
    try {
      const movimientos = await this.transaccionesService.findMovimientosByDNI(dni);
      if (movimientos.length > 0) {
        return res.status(HttpStatus.OK).json(movimientos);
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No se encontraron movimientos para el DNI proporcionado.' });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Ocurrió un error al buscar los movimientos.', error: error.message });
    }
  }

  @Get()
  findAll() {
    return this.transaccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaccionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranssacionesDto: UpdateTranssacionesDto) {
    return this.transaccionesService.update(+id, updateTranssacionesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaccionesService.remove(+id);
  }

  @Put('ActivarCuenta/:numCuenta')
  async ActivarCuenta(@Param('numCuenta') numCuenta: string) {

    await this.transaccionesService.ActivarCuenta(numCuenta);
    return {
      mensaje: `La cuenta con número ${numCuenta} ha sido marcado como inactivo.`,
    };
  }

  @Put('desactivarCuenta/:numCuenta')
  async desactivarCuenta(@Param('numCuenta') numCuenta: string) {
    await this.transaccionesService.desactivarCuenta(numCuenta);
    return {
      mensaje: `Perfil de centro de trabajo con número ${numCuenta} ha sido marcado como inactivo.`,
    };
  }


}
