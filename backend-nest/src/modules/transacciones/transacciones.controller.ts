import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Res, HttpCode } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { TransaccionesService } from './transacciones.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transacciones')
@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) { }

  @Post('/crear-movimiento')
  @HttpCode(HttpStatus.CREATED)
  async crearMovimiento(@Body() createTransaccionesDto: CreateTransaccionesDto) {
    try {
      const movimiento = await this.transaccionesService.crearMovimiento(
        createTransaccionesDto.dni,
        createTransaccionesDto.numeroCuenta,
        createTransaccionesDto.descripcionMovimiento,
        createTransaccionesDto.monto
      );
      return { status: 'success', message: 'Movimiento creado con éxito', data: movimiento };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
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
}
