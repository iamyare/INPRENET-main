import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf/pdf.service';
import { EmpleadoDto } from './pdf/empleado.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('constancia-beneficiarios/:id')
async generarConstanciaBeneficiarios(
  @Param('id') idPersona: string,
  @Body() dto: EmpleadoDto,  // ✅ Recibe el DTO
  @Res() res: Response
) {
  try {
    const pdfBuffer = await this.pdfService.generarConstanciaBeneficiarios(idPersona, dto);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Constancia_Beneficiarios_${idPersona}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    res.end(pdfBuffer);
  } catch (error) {
    console.error('Error al generar la constancia de beneficiarios:', error);
    res.status(500).json({ message: 'Error al generar el documento PDF.' });
  }
}


  @Post('movimientos-pdf')
  async postMovimientosPdf(@Body() data: any, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generateMovimientosPdf(data);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=movimientos.pdf',
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      throw new HttpException('Error al generar el PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('constancia-afiliacion')
  async postConstanciaAfiliacion(
    @Body('data') data: any,
    @Body('dto') dto: EmpleadoDto,
    @Res() res: Response
  ) {
    try {
      const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'afiliacion');
      res.json({ fileId });
    } catch (error) {
      console.error('Error al generar la constancia:', error.message);
      res.status(500).json({
        message: 'Error interno al generar la constancia',
        error: error.message,
      });
    }
  }
  
  @Post('constancia-afiliacion2')
  async postConstanciaAfiliacion2(@Body() data: any, @Body('dto') dto: EmpleadoDto, @Res() res: Response) {
    if (!data || !data.primer_nombre || !data.n_identificacion) {
      return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
    }
    try {
      const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'afiliacion2');
      res.json({ fileId });
    } catch (error) {
      console.error('Error al generar constancia de afiliación 2:', error);
      res.status(500).json({ message: 'Error interno al generar constancia.' });
    }
  }

  @Post('constancia-renuncia-cap')
  async postConstanciaRenunciaCap(@Body() data: any, @Body('dto') dto: EmpleadoDto, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'renuncia-cap');
    res.json({ fileId });
  }

  @Post('constancia-no-cotizar')
  async postConstanciaNoCotizar(@Body() data: any,  @Body('dto') dto: EmpleadoDto, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'no-cotizar');
    res.json({ fileId });
  }

  @Post('constancia-debitos')
  async postConstanciaDebitos(@Body() data: any,  @Body('dto') dto: EmpleadoDto, @Res() res: Response) {

    const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'debitos');
    res.json({ fileId });
  }

  @Post('constancia-tiempo-cotizar-con-monto')
  async postConstanciaTiempoCotizarConMonto(@Body() data: any,  @Body('dto') dto: EmpleadoDto, @Res() res: Response) {
    const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'tiempo-cotizar-con-monto');
    res.json({ fileId });
  }

  @Post('constancia-qr')
    async postConstanciaQR(
      @Body('dto') dto: EmpleadoDto, 
      @Body('type') type: string,
      @Body() data: any,         
      @Res() res: Response
    ) {
      try {
        const pdfBuffer = await this.pdfService.generateConstanciaWithQR(data, type, dto);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=constancia_${type}_qr.pdf`,
          'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
      } catch (error) {
        console.error('Error al generar la constancia con QR:', error.message);
        res.status(500).json({
          message: 'Error interno al generar la constancia',
          error: error.message,
        });
      }
    }

    @Post('constancia-beneficios')
    async postConstanciaBeneficios(
      @Body('data') data: any,
      @Body('dto') dto: EmpleadoDto,
      @Body('includeQR') includeQR: boolean,
      @Res() res: Response
    ) {
      try {
        const fileId = await this.pdfService.generateAndUploadConstancia(data, dto, 'beneficios');
        res.json({ fileId });
      } catch (error) {
        console.error('Error al generar la constancia de beneficios:', error.message);
        res.status(500).json({
          message: 'Error interno al generar la constancia de beneficios',
          error: error.message,
        });
      }
    }


}
