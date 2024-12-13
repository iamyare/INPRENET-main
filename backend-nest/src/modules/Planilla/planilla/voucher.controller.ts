import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { VoucherService } from './voucher.service';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('generar')
  async generarVoucher(
    @Body('dni') dni: string,
    @Body('mes') mes: number,
    @Body('anio') anio: number,
    @Body('correo') correo: string,
  ) {
    try {
      await this.voucherService.generarYEnviarVoucher(dni, mes, anio, correo);
      return { message: 'Voucher generado y enviado correctamente.' };
    } catch (error) {
        console.error('Error interno:', error);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message || 'Error al generar o enviar el voucher',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
  }
}
