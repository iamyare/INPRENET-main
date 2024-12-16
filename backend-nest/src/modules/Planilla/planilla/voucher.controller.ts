import { Controller, Post, Body, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
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

  @Post('enviar-masivo')
  async enviarVouchersMasivos(
    @Body() body: { personas: { dni: string; correo: string }[]; mes: number; anio: number },
  ): Promise<{ message: string }> {
    const { personas, mes, anio } = body;
    if (!Array.isArray(personas) || !personas.length || !mes || !anio) {
      throw new BadRequestException(
        'Debe proporcionar un arreglo de personas con DNI y correo, además del mes y año.',
      );
    }
    await this.voucherService.enviarVouchersMasivos(personas, mes, anio);

    return { message: 'El envío masivo de vouchers se inició correctamente.' };
  }
}
