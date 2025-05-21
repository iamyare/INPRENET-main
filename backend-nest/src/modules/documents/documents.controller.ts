import { Body, Controller, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf/pdf.service';
import { EmpleadoDto } from './pdf/empleado.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('constancia-beneficiarios/:id')
async generarConstanciaBeneficiarios(
  @Param('id') idPersona: string,
  @Body() dto: EmpleadoDto,
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

}
