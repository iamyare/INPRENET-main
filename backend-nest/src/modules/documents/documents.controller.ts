import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf/pdf.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly pdfService: PdfService) { }
  @Post('constancia-afiliacion')
  async postConstanciaAfiliacion(@Body() data: any, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, 'afiliacion');
    res.json({ fileId });
  }

  @Post('constancia-renuncia-cap')
  async postConstanciaRenunciaCap(@Body() data: any, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, 'renuncia-cap');
    res.json({ fileId });
  }

  @Post('constancia-no-cotizar')
  async postConstanciaNoCotizar(@Body() data: any, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, 'no-cotizar');
    res.json({ fileId });
  }

  @Post('constancia-debitos')
  async postConstanciaDebitos(@Body() data: any, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, 'debitos');
    res.json({ fileId });
  }

  @Post('constancia-tiempo-cotizar-con-monto')
  async postConstanciaTiempoCotizarConMonto(@Body() data: any, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, 'tiempo-cotizar-con-monto');
    res.json({ fileId });
  }


  @Post('constancia-qr')
  async postConstanciaQR(@Body() data: any, @Res() res: Response) {

    const { type, ...payload } = data;

    const pdfBuffer = await this.pdfService.generateConstanciaWithQR(payload, type);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=constancia_${type}_qr.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
