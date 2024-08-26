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
    const imagePath = path.join(imagesPath, 'membratadoFinal.jpg');

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

  async generateConstanciaAfiliacionTemplate2(data: any, includeQR: boolean) {
    let dataCentTrab = [{},{}];
    let dataRef = [{},{}];

    const content: Array<any> = [
      {
        table: {
          widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'],
            body: [
                [
                  { text: 'DATOS GENERALES DEL DOCENTE', colSpan: 6, alignment: 'center', style:['header']},
                  {}, {}, {}, {}, {}, {text: 'FOTO',rowSpan: 3, alignment: 'center'}
                ],
                [ 
                  { text: 'NOMBRE DEL DOCENTE', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'center', colSpan: 5,  },
                  {}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'No DE IDENTIDAD Y/O CARNET DEL RESIDENTE VIGENTE', alignment: 'left', colSpan: 2, style:['subheader']  },
                   {}, {text: '', alignment: 'center', colSpan: 4}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'GÉNERO', alignment: 'left' , style:['subheader'] },  
                  { text: '', alignment: 'center', colSpan: 3}, 
                  {}, 
                  {},
                  { text: 'ESTADO CIVIL', alignment: 'left' , style:['subheader']},
                  { text: '', alignment: 'center', colSpan: 2},
                  {}
                ],
                [ 
                  { text: 'NÚMERO DE DEPENDIENTES', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'left', colSpan: 3}, {}, {}, { text: 'PROFESIÓN', alignment: 'left', style:['subheader']},  { text: '', alignment: 'left', colSpan: 2}, {}],
                [ 
                  { text: 'NACIONALIDAD', alignment: 'left', style:['subheader'] },  { text: '', alignment: 'left', colSpan: 3}, {}, {}, 
                  { text: 'RTN', alignment: 'left' , style:['subheader'] },  { text: '', alignment: 'left', colSpan: 2}, {}
                ],
                [ 
                  { text: 'LUGAR Y FECHA DE NACIMIENTO', alignment: 'center', colSpan: 7, style:['header']}, 
                  {}, {}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'PAÍS', alignment: 'left', style:['subheader'] },  { text: '', alignment: 'left', colSpan: 2},  {}, 
                  { text: 'DEPARTAMENTO', alignment: 'left', style:['subheader'] },  { text: '', alignment: 'left', colSpan: 3}, {},{} 
                ],
                [ 
                  { text: 'CIUDAD', alignment: 'left', style:['subheader'] },  { text: '', alignment: 'left', colSpan: 2},  {}, 
                  { text: 'FECHA DE NACIMIENTO', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'left'}, {text: 'Edad', alignment: 'left', style:['subheader']},{} 
                ],
                [ 
                  { text: '¿ACTÚA POR CUENTA PROPIA?', alignment: 'left', style:['subheader'] }, 
                  { text: '', alignment: 'left', colSpan: 2}, {}, {text: '¿ACTÚA EN REPRESENTACIÓN DE TERCEROS?', alignment: 'left', colSpan: 2, style:['subheader'] }, 
                  {},  
                  { text: '', alignment: 'left', colSpan: 2}, {}
                ],

                [ { text: 'DECLARACIÓN DE PERSONA POLÍTICAMENTE EXPUESTA (PEPS)', alignment: 'center', colSpan: 7, style:['header']}, 
                {},{}, {}, {}, {}, {}
                ],
                [ 
                  { text: '¿DESEMPEÑA O HA DESEMPEÑADO UN CARGO PÚBLICO?', alignment: 'center', style:['subheader']}, 
                  {text: '', colSpan: 6}, 
                  {},{},{},{},{}
                ],
                [ { text: 'CARGO DESEMPEÑADO', alignment: 'center', colSpan: 2, style:['subheader']}, {}, {}, { text: 'PERÍODO', alignment: 'left', style:['subheader']}, {text: '', alignment: 'left', colSpan: 3}, {}, {}], 

                [ 
                  { text: 'DIRECCIÓN DOMICILIARIA DEL DOCENTE', alignment: 'center', colSpan: 7, style:['header']}
                ],
                [ 
                  { text: 'BARRIO O COLONIA', alignment: 'center', style:['subheader'] }, 
                  {text: 'AVENIDA', alignment: 'center', style:['subheader'] }, 
                  {text: 'CALLE', alignment: 'center', style:['subheader'] }, 
                  {text: 'SECTOR', alignment: 'center', style:['subheader'] }, 
                  {text: 'BLOQUE', alignment: 'center', style:['subheader'] },
                  {text: 'N DE CASA', alignment: 'center', style:['subheader'] },
                  {text: 'COLOR DE CASA', alignment: 'center', style:['subheader'] }
                ],
                [ 
                  { text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}, 
                  {text: '', alignment: 'center'}
                ],
                [ 
                  { text: 'ALDEA', alignment: 'center', style:['subheader'] }, 
                  {text: 'CASERÍO', alignment: 'center', style:['subheader'] }, 
                  {text: 'DEPARTAMENTO', alignment: 'center', colSpan:2, style:['subheader'] }, 
                  {}, 
                  {text: 'MUNICIPIO', alignment: 'center', colSpan:2, style:['subheader'] }, 
                  {}, 
                  {text: 'CIUDAD', alignment: 'center', style:['subheader'] }
                ],
                [ 
                  { text: '', alignment: 'center'}, 
                  { text: '', alignment: 'center'}, 
                  { text: '', alignment: 'center',colSpan:2}, 
                  {}, 
                  {text: '', alignment: 'center',colSpan:2}, 
                  {}, 
                  {text: '', alignment: 'center'}
                ],
                [ 
                  { text: 'OTROS PUNTOS DE REFERENCIA', alignment: 'left', style:['subheader'] }, 
                  {text: '', alignment: 'left', colSpan: 6},{}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'NÚMEROS DE TELEFÓNICOS', alignment: 'left', rowSpan: 2, style:['subheader'] }, 
                  {text: 'CASA', alignment: 'left', style:['subheader']}, { text: '', alignment: 'left', colSpan: 2 }, {}, {text: 'CORREO ELECTRÓNICO 1', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'left', colSpan: 2}, {}
                ],
                [ 
                  {}, 
                  {text: 'CELULAR', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'left', colSpan: 2}, {}, {text: 'CORREO ELECTRÓNICO 2', alignment: 'left', style:['subheader'] }, { text: '', alignment: 'left', colSpan: 2}, {}
                ],
                [ 
                  { text: 'DATOS DE CUENTAS BANCARIAS', alignment: 'center', colSpan: 7, style:['header']}, 
                  {},{}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'BANCO', alignment: 'left', style:['subheader'] }, 
                  { text: '', alignment: 'left', colSpan: 2}, {}, 
                  { text: 'No. DE CUENTA BANCARIA ACTUAL', alignment: 'left', style:['subheader'] }, 
                  { text: '', alignment: 'left', colSpan: 3}, {}, {}
                ],
                [ 
                  { text: 'INSTITUCIONES EDUCATIVAS', alignment: 'center', colSpan: 7, style:['header']}, 
                  {},{}, {}, {}, {}, {}
                ],
                ...dataCentTrab.flatMap((b: any) => {
                      return [
                        [ 
                           
                            { text: 'CENTRO EDUCATIVO #', alignment: 'center', colSpan: 7, style:['subheader']}, {}, 
                            {}, {}, 
                            {}, {}, {}
                        ],
                        [ 
                          { text: 'NOMBRE DEL CENTRO EDUCATIVO', alignment: 'left' , style:['subheader']  }, 
                          { text: 'SECTOR', alignment: 'center', colSpan:6, style:['subheader'] }, {}, {}, {}, {}, {}
                        ],
                        [ 
                          {}, 
                          { text: '', alignment: 'left', colSpan:6}, {}, {}, {}, {}, {}
                        ],
                        [ 
                          { text: 'CARGO', alignment: 'left', style:['subheader'] }, 
                          { text: '', alignment: 'left', colSpan: 6}, {}, {}, {}, {}, {}
                        ],
                        [ 
                          { text: 'FECHA DE INGRESO', alignment: 'left', style:['subheader'] }, 
                          { text: '', alignment: 'left', colSpan: 2}, {}, 
                          { text: 'FECHA DE PAGO', alignment: 'left', style:['subheader'] }, 
                          { text: '', alignment: 'left', colSpan: 3}, {}, {}
                        ],
                        [ 
                          { text: 'INGRESO / SALARIO MENSUAL', alignment: 'left', style:['subheader'] },
                          { text: '', alignment: 'left', colSpan: 6},  
                          {}, {}, 
                          {}, {}, {}
                        ],
                        [ 
                          { text: 'DIRECCIÓN DEL CENTRO EDUCATIVO', alignment: 'center', colSpan: 7, style:['subheader']}, {}, 
                          {}, {}, 
                          {}, {}, {}
                        ],
                        [ 
                          { text: 'DEPARTAMENTO', alignment: 'center', style:['subheader'] },
                          { text: 'MUNICIPIO', alignment: 'center', style:['subheader'] },
                          { text: 'CIUDAD', alignment: 'center', style:['subheader'] },
                          { text: 'ALDEA', alignment: 'center', style:['subheader'] },
                          { text: 'BARRIO O COLONIA', alignment: 'center', style:['subheader'] },
                          { text: 'AVENIDA / CALLE', alignment: 'center', style:['subheader'] },
                          { text: 'SECTOR', alignment: 'center', style:['subheader'] },
                        ],
                        [ 
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                          { text: '', alignment: 'center'},
                        ],
                        [ 
                          { text: 'TELÉFONO 1', alignment: 'center', style:['subheader'] },
                          { text: '', alignment: 'center',colSpan:2},
                          { },
                          { text: 'TELÉFONO 2', alignment: 'center', style:['subheader'] },
                          { text: '', alignment: 'center',colSpan:3},
                          { },
                          { },
                        ],
                        [ 
                          { text: 'OTROS PUNTOS DE REFERENCIA', alignment: 'left', style:['subheader'] }, 
                          {text: '', alignment: 'left', colSpan: 6},{}, {}, {}, {}, {}
                        ],
        
                      ];
                }),

                [ 
                  { text: 'DATOS GENERALES DEL CÓNYUGE', alignment: 'center', colSpan: 7, style:['header']}, 
                  {},{}, {}, {}, {}, {}
                ],
                [ 
                  { text: 'NOMBRE COMPLETO DEL CÓNYUGE', alignment: 'center', style:['subheader'] }, 
                  { text: '', alignment: 'center', colSpan: 6}, 
                  {},{}, {}, {}, {}
                ],
                [ 
                  { text: 'No DE IDENTIDAD', alignment: 'center', style:['subheader']  }, 
                  { text: '', alignment: 'center', colSpan: 6}, 
                  {},{}, {}, {}, {}
                ],
                [ 
                  { text: 'FECHA DE NACIMIENTO', alignment: 'center', rowSpan: 2, style:['subheader'] }, 
                  {text: 'NÚMEROS TELEFÓNICOS', alignment: 'center', rowSpan: 3, style:['subheader'] }, 
                  { text: 'CASA', alignment: 'center', style:['subheader']}, {text: '', alignment: 'center', colSpan: 4 }, {}, {}, {}
                ],
                [ 
                  {}, 
                  {},
                  { text: 'CELULAR', alignment: 'center', style:['subheader']}, {text: '', alignment: 'center', colSpan: 4 }, {}, {}, {}
                ],
                [ 
                  {}, 
                  {},
                  { text: 'TRABAJO', alignment: 'center', style:['subheader']}, {text: '', alignment: 'center', colSpan: 4 }, {}, {}, {}
                ],
                [ 
                  { text: '¿TRABAJA?', alignment: 'left', style:['subheader'] }, 
                  { text: '', alignment: 'left', colSpan: 2}, {}, 
                  { text: '¿ES AFILIADO?', alignment: 'left', style:['subheader'] }, 
                  { text: '', alignment: 'left', colSpan: 3}, {}, {}
                ],

                [ 
                  { text: 'REFERENCIAS', alignment: 'center', colSpan: 7, style:['header'] }, 
                  {},{}, {}, {}, {}, {}
                ],

                ...dataRef.flatMap((b: any) => {
                  return [
                    [ 
                           
                      { text: 'REFERENCIA #', alignment: 'center', colSpan: 7, style:['subheader']}, {}, 
                      {}, {}, 
                      {}, {}, {}
                    ],
                    [ 
                      { text: 'NOMBRE COMPLETO', alignment: 'center', style:['subheader'] }, 
                      {text: '', alignment: 'center', colSpan: 6},{}, {}, {}, {}, {}
                    ],
                    [ 
                      { text: 'DIRECCIÓN', alignment: 'center', style:['subheader'] }, 
                      {text: '', alignment: 'center', colSpan: 6},{}, {}, {}, {}, {}
                    ],
                    [ 
                      { text: 'PARENTESCO', alignment: 'center', rowSpan: 2, style:['subheader'] }, 
                      {text: 'NÚMEROS TELEFÓNICOS', alignment: 'center', rowSpan: 3, style:['subheader'] }, 
                      {text: 'CASA', alignment: 'center', style:['subheader'] }, {text: '', alignment: 'center', colSpan: 4}, {}, {}, {}
                    ],
                    [ 
                      {}, 
                      {},
                      {text: 'CELULAR', alignment: 'center', style:['subheader'] }, {text: '', alignment: 'center', colSpan: 4}, {}, {}, {}
                    ],
                    [ 
                      {}, 
                      {},
                      {text: 'TRABAJO', alignment: 'center', style:['subheader'] }, {text: '', alignment: 'center', colSpan: 4}, {}, {}, {}
                    ],
    
                  ];
            }),
          ]
        },
      },
    ];

    if (includeQR) {
      const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
      content.push({ image: qrCode, width: 100, alignment: 'center' });
    }

    return {
      pageSize: 'letter',
      pageMargins: [40, 100, 40, 60],
      background: {
        image: data.base64data,
        width: 595.28,
        height: 800
      },
      content: content,
      styles: {
        header: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          //margin: [0, 20, 0, 20],
          color: 'black', 
          fillColor: 'lightgray' 
        },
        subheader: {
          fontSize: 10,
          alignment: 'left',
          color:'white',
          fillColor: '#1c9588',
          bold: true,
          //margin: [40, 10, 40, 5]
        },
        name: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [40, 10, 40, 5]
        },
        body: {
          fontSize: 10,
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

  async generateConstanciaAfiliacion2(data: any, includeQR: boolean): Promise<Buffer> {
    return this.generateConstancia(data, includeQR, this.generateConstanciaAfiliacionTemplate2);
  }

  async generateAndUploadConstancia(data: any, type: string): Promise<string> {
    const nombreCompleto = `${data.primer_nombre}_${data.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    const fileName = `${nombreCompleto}_${fechaActual}_constancia_${type}`;

    console.log(data);
    
    // Generar documento sin QR
    let pdfBufferWithoutQR;
    switch (type) {
      case 'afiliacion':
        pdfBufferWithoutQR = await this.generateConstanciaAfiliacion(data, false);
        break;
      case 'afiliacion2':
        pdfBufferWithoutQR = await this.generateConstanciaAfiliacion2(data, false);
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
      case 'afiliacion2':
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
    console.log(type);
    
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
      case 'afiliacion2':
        return await this.generateConstanciaAfiliacion2(data, true);
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
