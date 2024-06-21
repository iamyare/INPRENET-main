import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DriveService } from '../drive/drive.service';
import { unirNombres } from '../../../shared/formatoNombresP';
import * as path from 'path';

@Injectable()
export class PdfService {
  constructor(private readonly driveService: DriveService) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  async getMembreteBase64(): Promise<string> {
    const imagesPath = process.env.IMAGES_PATH || path.resolve(__dirname, '../../../../assets/images');
    const imagePath = path.join(imagesPath, 'MEMBRETADO.jpg');

    const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  }

  async getFirmaDigitalBase64(): Promise<string> {
    const imagesPath = process.env.IMAGES_PATH || path.resolve(__dirname, '../../../../assets/images');
    const imagePath = path.join(imagesPath, 'Firma.jpg');

    const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  }

  async generateConstancia(data: any, includeQR: boolean, templateFunction: (data: any, includeQR: boolean) => any): Promise<Buffer> {
    const base64data = await this.getMembreteBase64();
    const firmaDigitalBase64 = await this.getFirmaDigitalBase64();
    const docDefinition = await templateFunction({ ...data, base64data, firmaDigitalBase64 }, includeQR);

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  async generateConstanciaAfiliacionTemplate(data: any, includeQR: boolean) {
    const content: Array<any> = [
      { text: 'A QUIEN INTERESE', style: 'header' },
      {
        text: 'El Instituto Nacional de Previsión del Magisterio (INPREMA), por este medio indica que:',
        style: 'subheader'
      },
      {
        text: unirNombres(data.primer_nombre, data.segundo_nombre, data.tercer_nombre, data.primer_apellido, data.segundo_apellido),
        style: 'name'
      },
      {
        text: [
          { text: 'Se encuentra afiliado a este Sistema de Previsión con el número ' },
          { text: `${data.n_identificacion}`, style: 'dni' }
        ],
        style: 'body'
      },
      {
        text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de Tegucigalpa, Departamento de Francisco Morazán, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
        style: 'body'
      },
      { text: '\n\n\n' },
      { image: data.firmaDigitalBase64, width: 150, alignment: 'center', margin: [0, 0, 0, -20] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 0, 0, 0] },
      { text: '[Nombre]', style: 'signature' },
      { text: 'Jefe Departamento de Afiliación', style: 'signatureTitle' },
      { text: '\n\n\n' }
    ];

    if (includeQR) {
      const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
      content.push({ image: qrCode, width: 100, alignment: 'center' });
    }

    return {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 60],
      background: {
        image: data.base64data,
        width: 595.28,
        height: 841.89
      },
      content: content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        subheader: {
          fontSize: 11,
          alignment: 'left',
          margin: [40, 10, 40, 5]
        },
        name: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [40, 10, 40, 5]
        },
        body: {
          fontSize: 11,
          alignment: 'left',
          margin: [40, 10, 40, 5]
        },
        dni: {
          fontSize: 11,
          bold: true
        },
        signature: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },
        signatureTitle: {
          fontSize: 12,
          alignment: 'center'
        },
        footer: {
          fontSize: 10,
          alignment: 'right',
        }
      }
    };
  }


  async generateConstanciaAfiliacion(data: any, includeQR: boolean): Promise<Buffer> {
    return this.generateConstancia(data, includeQR, this.generateConstanciaAfiliacionTemplate);
  }

  async generateAndUploadConstancia(data: any, type: string): Promise<string> {
    const nombreCompleto = `${data.primer_nombre}_${data.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    const fileName = `${nombreCompleto}_${fechaActual}_constancia_${type}`;

    // Generar documento sin QR
    let pdfBufferWithoutQR;
    switch (type) {
      case 'afiliacion':
        pdfBufferWithoutQR = await this.generateConstanciaAfiliacion(data, false);
        break;
      case 'renuncia-cap':
        pdfBufferWithoutQR = await this.generateConstanciaRenunciaCap(data, false);
        break;
      case 'no-cotizar':
        pdfBufferWithoutQR = await this.generateConstanciaNoCotizar(data, false);
        break;
      case 'debitos':
        pdfBufferWithoutQR = await this.generateConstanciaDebitos(data, false);
        break;
      case 'tiempo-cotizar-con-monto':
        pdfBufferWithoutQR = await this.generateConstanciaTiempoCotizarConMonto(data, false);
        break;
      default:
        throw new Error('Invalid constancia type');
    }

    const fileId = await this.driveService.uploadFile(`${fileName}_sin_qr.pdf`, pdfBufferWithoutQR);

    // Generar documento con QR
    let pdfBufferWithQR;
    switch (type) {
      case 'afiliacion':
        pdfBufferWithQR = await this.generateConstanciaAfiliacion({ ...data, fileId }, true);
        break;
      case 'renuncia-cap':
        pdfBufferWithQR = await this.generateConstanciaRenunciaCap({ ...data, fileId }, true);
        break;
      case 'no-cotizar':
        pdfBufferWithQR = await this.generateConstanciaNoCotizar({ ...data, fileId }, true);
        break;
      case 'debitos':
        pdfBufferWithQR = await this.generateConstanciaDebitos({ ...data, fileId }, true);
        break;
      case 'tiempo-cotizar-con-monto':
        pdfBufferWithQR = await this.generateConstanciaTiempoCotizarConMonto({ ...data, fileId }, true);
        break;
      default:
        throw new Error('Invalid constancia type');
    }

    // Guardar el documento con QR localmente
    fs.writeFileSync(`${fileName}_con_qr.pdf`, pdfBufferWithQR);

    return fileId;
  }

  async generateConstanciaWithQR(data: any, type: string): Promise<Buffer> {
    switch (type) {
      case 'afiliacion':
        return await this.generateConstanciaAfiliacion(data, true);
      case 'renuncia-cap':
        return await this.generateConstanciaRenunciaCap(data, true);
      case 'no-cotizar':
        return await this.generateConstanciaNoCotizar(data, true);
      case 'debitos':
        return await this.generateConstanciaDebitos(data, true);
      case 'tiempo-cotizar-con-monto':
        return await this.generateConstanciaTiempoCotizarConMonto(data, true);
      default:
        throw new Error('Invalid constancia type');
    }
  }

  async generateConstanciaRenunciaCap(data: any, includeQR: boolean): Promise<Buffer> {
    const templateFunction = async (data: any, includeQR: boolean) => {
      const content: Array<any> = [
        { text: 'CONSTANCIA', style: 'header' },
        {
          text: [
            'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que el/la Docente: ',
            { text: unirNombres(data.primer_nombre, data.segundo_nombre, data.tercer_nombre, data.primer_apellido, data.segundo_apellido), bold: true },
            ' con Identidad No. ',
            { text: `${data.n_identificacion}`, bold: true },
            ' presentó su renuncia formal a la Cuenta de Ahorro Previsional (CAP) en fecha: ',
            { text: '24 de Julio del año 2014', bold: true },
            ' mediante el formulario No: ',
            { text: '34899', bold: true },
            ' en la ciudad de: ',
            { text: 'TEGUCIGALPA', bold: true },
            '.'
          ],
          style: 'body'
        },
        {
          text: [
            'Y para los fines que el interesado estime convenientes, se extiende la presente constancia en la ciudad de ',
            { text: 'TEGUCIGALPA, FRANCISCO MORAZAN', bold: true },
            ', a los ',
            { text: `${new Date().getDate()}`, bold: true },
            ' días del mes de ',
            { text: `${new Date().toLocaleString('es-HN', { month: 'long' })}`, bold: true },
            ' del año ',
            { text: `${new Date().getFullYear()}`, bold: true },
            '.'
          ],
          style: 'body'
        },
        { text: '\n\n\n' },
        { image: data.firmaDigitalBase64, width: 100, alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 10, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ];

      if (includeQR) {
        const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
        content.push({ image: qrCode, width: 100, alignment: 'center' });
      }


      return {
        pageSize: 'A4',
        pageMargins: [40, 120, 40, 60],
        background: {
          image: data.base64data,
          width: 595.28,
          height: 841.89
        },
        content: content,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 20],
          },
          body: {
            fontSize: 11,
            alignment: 'justify',
            margin: [40, 0, 40, 5]
          },
          signature: {
            fontSize: 12,
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          signatureTitle: {
            fontSize: 12,
            alignment: 'center'
          },
          footer: {
            fontSize: 10,
            alignment: 'right',
          }
        }
      };
    };

    return this.generateConstancia(data, includeQR, templateFunction);
  }

  async generateConstanciaNoCotizar(data: any, includeQR: boolean): Promise<Buffer> {
    const templateFunction = async (data: any, includeQR: boolean) => {
      const content: Array<any> = [
        { text: 'A QUIEN INTERESE', style: 'header' },
        {
          text: [
            'El Departamento de Atención al Docente del Instituto Nacional de Previsión del Magisterio, (INPREMA) INFORMA que el(la) Sr.(Sra.): ',
            { text: unirNombres(data.primer_nombre, data.segundo_nombre, data.tercer_nombre, data.primer_apellido, data.segundo_apellido), bold: true },
            ' con Identidad No. ',
            { text: `${data.n_identificacion}`, bold: true },
            ' no cotiza para esta institución.'
          ],
          style: 'body'
        },
        {
          text: [
            'Y para los fines que el interesado estime convenientes, se extiende la presente confirmación en la ciudad de ',
            { text: 'TEGUCIGALPA, FRANCISCO MORAZAN', bold: true },
            ', a los ',
            { text: `${new Date().getDate()}`, bold: true },
            ' días del mes de ',
            { text: `${new Date().toLocaleString('es-HN', { month: 'long' })}`, bold: true },
            ' del año ',
            { text: `${new Date().getFullYear()}`, bold: true },
            '.'
          ],
          style: 'body'
        },
        { text: '\n\n\n' },
        { image: data.firmaDigitalBase64, width: 100, alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 10, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ];

      if (includeQR) {
        const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
        content.push({ image: qrCode, width: 100, alignment: 'center' });
      }


      return {
        pageSize: 'A4',
        pageMargins: [40, 120, 40, 60],
        background: {
          image: data.base64data,
          width: 595.28,
          height: 841.89
        },
        content: content,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 20],
          },
          body: {
            fontSize: 11,
            alignment: 'justify',
            margin: [40, 0, 40, 5]
          },
          signature: {
            fontSize: 12,
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          signatureTitle: {
            fontSize: 12,
            alignment: 'center'
          },
          footer: {
            fontSize: 10,
            alignment: 'right',
          }
        }
      };
    };

    return this.generateConstancia(data, includeQR, templateFunction);
  }

  async generateConstanciaDebitos(data: any, includeQR: boolean): Promise<Buffer> {
    const templateFunction = async (data: any, includeQR: boolean) => {
      const content: Array<any> = [
        { text: 'A QUIEN INTERESE', style: 'header' },
        {
          text: [
            'El Departamento de Atención al Docente del Instituto Nacional de Previsión del Magisterio, (INPREMA) INFORMA que el(la) Docente: ',
            { text: unirNombres(data.primer_nombre, data.segundo_nombre, data.tercer_nombre, data.primer_apellido, data.segundo_apellido), bold: true },
            ' con Identidad No. ',
            { text: `${data.n_identificacion}`, bold: true },
            ' según los registros existentes de esta institución, tiene un debito de ',
            { text: 'L 0.00', bold: true },
            ' por concepto de ',
            { text: '', bold: true },
            ', con fecha de oficio ',
            { text: '', bold: true },
            '.'
          ],
          style: 'body'
        },
        {
          text: [
            'Y para los fines que el interesado estime convenientes, se extiende la presente confirmación en la ciudad de ',
            { text: 'TEGUCIGALPA, FRANCISCO MORAZAN', bold: true },
            ', a los ',
            { text: `${new Date().getDate()}`, bold: true },
            ' días del mes de ',
            { text: `${new Date().toLocaleString('es-HN', { month: 'long' })}`, bold: true },
            ' del año ',
            { text: `${new Date().getFullYear()}`, bold: true },
            '.'
          ],
          style: 'body'
        },
        { text: '\n\n\n' },
        { image: data.firmaDigitalBase64, width: 100, alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 10, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ];

      if (includeQR) {
        const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
        content.push({ image: qrCode, width: 100, alignment: 'center' });
      }


      return {
        pageSize: 'A4',
        pageMargins: [40, 120, 40, 60],
        background: {
          image: data.base64data,
          width: 595.28,
          height: 841.89
        },
        content: content,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 20],
          },
          body: {
            fontSize: 11,
            alignment: 'justify',
            margin: [40, 0, 40, 5]
          },
          signature: {
            fontSize: 12,
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          signatureTitle: {
            fontSize: 12,
            alignment: 'center'
          },
          footer: {
            fontSize: 10,
            alignment: 'right',
          }
        }
      };
    };

    return this.generateConstancia(data, includeQR, templateFunction);
  }

  async generateConstanciaTiempoCotizarConMonto(data: any, includeQR: boolean): Promise<Buffer> {
    const templateFunction = async (data: any, includeQR: boolean) => {
      const content: Array<any> = [
        { text: 'A QUIEN INTERESE', style: 'header' },
        {
          text: [
            'El Instituto Nacional de Previsión del Magisterio (INPREMA) INFORMA que el(la) Docente: ',
            { text: unirNombres(data.primer_nombre, data.segundo_nombre, data.tercer_nombre, data.primer_apellido, data.segundo_apellido), bold: true },
            ' con Identidad No. ',
            { text: `${data.n_identificacion}`, bold: true },
            ', según la información contenida en los registros existentes de esta institución, cotiza al sistema desde el mes de ',
            { text: 'Noviembre del año 2001', bold: true },
            ' a Mayo de 2024. Tiene por concepto de cotizaciones, la suma de L ',
            { text: '256,217.94', bold: true },
            ' (DOSCIENTOS CINCUENTA Y SEIS MIL DOSCIENTOS DIECISIETE LEMPIRAS CON 94/100 CTV).'
          ],
          style: 'body'
        },
        {
          text: [
            'Y para los fines que el interesado estime convenientes, se extiende la presente confirmación en la ciudad de ',
            { text: 'TEGUCIGALPA, FRANCISCO MORAZAN', bold: true },
            ', a los ',
            { text: `${new Date().getDate()}`, bold: true },
            ' días del mes de ',
            { text: `${new Date().toLocaleString('es-HN', { month: 'long' })}`, bold: true },
            ' del año ',
            { text: `${new Date().getFullYear()}`, bold: true },
            '.'
          ],
          style: 'body'
        },
        { text: '\n\n\n' },
        { image: data.firmaDigitalBase64, width: 100, alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 10, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ];

      if (includeQR) {
        const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
        content.push({ image: qrCode, width: 100, alignment: 'center' });
      }


      return {
        pageSize: 'A4',
        pageMargins: [40, 120, 40, 60],
        background: {
          image: data.base64data,
          width: 595.28,
          height: 841.89
        },
        content: content,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 20],
          },
          body: {
            fontSize: 11,
            alignment: 'justify',
            margin: [40, 0, 40, 5]
          },
          signature: {
            fontSize: 12,
            bold: true,
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          signatureTitle: {
            fontSize: 12,
            alignment: 'center'
          },
          footer: {
            fontSize: 10,
            alignment: 'right',
          }
        }
      };
    };

    return this.generateConstancia(data, includeQR, templateFunction);
  }
}
