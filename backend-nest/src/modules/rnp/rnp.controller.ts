import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RnpService } from './rnp.service';

@Controller('rnp')
export class RnpController {
  constructor(private readonly rnpService: RnpService) {}

  @Post('/start-device')
  startDevice(@Body() body: { filename: string }) {
    const { filename } = body;
    try {
      const result = this.rnpService.startScannerProcess(filename || 'fingerprint.jpg');
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/verificar-huella')
  async verificarHuella(@Body() body: { numeroIdentidad: string, imageName: string }) {
    const { numeroIdentidad, imageName } = body;

    if (!numeroIdentidad || !imageName) {
      throw new HttpException('Número de identidad e imagen son requeridos.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.rnpService.verificarHuella(numeroIdentidad, imageName);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/data-docentes')
  async dataDocentes(@Body() body: { numeroIdentidad: string }) {
    const { numeroIdentidad } = body;

    if (!numeroIdentidad) {
      throw new HttpException('El número de identidad es requerido.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.rnpService.obtenerDatosPersona(numeroIdentidad);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
