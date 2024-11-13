import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DriveService } from '../drive/drive.service';
import { unirNombres } from '../../../shared/formatoNombresP';
import { calcularEdad } from '../../../shared/calcularEdad';
import * as path from 'path';

@Injectable()
export class PdfService {
  constructor(private readonly driveService: DriveService) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  async getMembreteHorizontalBase64(): Promise<string> {
    const imagesPath = process.env.IMAGES_PATH || path.resolve(__dirname, '../../../../assets/images');
    const imagePath = path.join(imagesPath, 'membretado_horizontal.jpg');
    const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
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

  public async generateConstanciaAfiliacionTemplate2(data: any, includeQR: boolean) {
    
    let persona = data?.persona    
    let dataCentTrab = persona?.perfPersCentTrabs;
    let dataRef = persona?.referencias;
    let dataCuenBan = persona?.personasPorBanco;
    let cargos_publicos = persona.peps?.flatMap((peps: any) => peps.cargo_publico) || [];
    let conyuge = data?.conyuge

    const jsonObj: any = data.persona.direccion_residencia
      ? data.persona.direccion_residencia.split(',').reduce((acc: any, curr: any) => {
        const [key, value] = curr.split(':').map((s: string) => s.trim());
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: string })
      : {};
    const content: Array<any> = [
      {
        table: {
          widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'],
          body: [
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DATOS GENERALES DEL DOCENTE', colSpan: 6, alignment: 'center', style: ['header'] },
              {}, {}, {}, {}, {},  // Estas celdas vacías completan la fila para el colSpan

              {
                // Aquí está la condición para mostrar la foto o el texto 'SIN FOTO'
                ...(data.persona.foto_perfil && data.persona.foto_perfil.data.length > 0
                  ? {
                    image: `data:image/png;base64,${Buffer.from(data.persona.foto_perfil.data).toString('base64')}`,
                    fit: [80, 150],  // Ajusta el tamaño según sea necesario
                    alignment: 'center',
                    rowSpan: 3
                  }
                  : {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'SIN FOTO',
                    alignment: 'center',
                    rowSpan: 3
                  })
              }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NOMBRE DEL DOCENTE', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
              text: `${persona?.primer_apellido} ${persona?.segundo_apellido} ${persona?.primer_nombre} ${persona?.segundo_nombre} ${persona?.tercer_nombre || ''}`, 
              alignment: 'center',
              colSpan: 5, },
              {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'No DE IDENTIDAD Y/O CARNET DEL RESIDENTE VIGENTE', alignment: 'left', colSpan: 2, style: ['subheader'] },
              {}, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${persona?.n_identificacion}`, alignment: 'center', colSpan: 4 }, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'GÉNERO', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.genero, alignment: 'left', colSpan: 3 },
              {},
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'ESTADO CIVIL', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.estado_civil, alignment: 'left', colSpan: 2 },
              {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NÚMERO DE DEPENDIENTES', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.cantidad_dependientes, alignment: 'left', colSpan: 3 }, {}, {}, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'PROFESIÓN', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.profesion?.descripcion, alignment: 'left', colSpan: 2 }, {}],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NACIONALIDAD', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.pais?.nacionalidad, alignment: 'left', colSpan: 3 }, {}, {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'RTN', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.rtn, alignment: 'left', colSpan: 2 }, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'LUGAR Y FECHA DE NACIMIENTO', alignment: 'center', colSpan: 7, style: ['header'] },
              {}, {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'PAÍS', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.pais?.nombre_pais, alignment: 'left', colSpan: 2 }, {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DEPARTAMENTO', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.municipio_nacimiento?.departamento?.nombre_departamento, alignment: 'left', colSpan: 3 }, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CIUDAD', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.municipio_nacimiento.nombre_municipio, alignment: 'left', colSpan: 2 }, {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'FECHA DE NACIMIENTO', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.fecha_nacimiento, alignment: 'left' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'Edad', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${calcularEdad(persona?.fecha_nacimiento)} Años`, alignment: 'left' }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'REPRESENTACIÓN', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.representacion, alignment: 'left', colSpan: 6 }, {}, {},
              {},
              {}, {}
            ],

            [{ borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DECLARACIÓN DE PERSONA POLÍTICAMENTE EXPUESTA (PEPS)', alignment: 'center', colSpan: 7, style: ['header'] },
            {}, {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '¿DESEMPEÑA O HA DESEMPEÑADO UN CARGO PÚBLICO?', alignment: 'center', style: ['subheader'] },
              {
                ...(cargos_publicos?.length > 0
                  ? {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `SI`, alignment: 'center', colSpan: 6
                  }
                  : {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NO',
                    alignment: 'center', colSpan: 6
                  })
              },
              {}, {}, {}, {}, {}
            ],

            ...cargos_publicos.length > 0 ? cargos_publicos.flatMap((cargo: any, index: number) => {
              
              return [
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `CARGO DESEMPEÑADO #${index + 1}`, alignment: 'center', colSpan: 2, style: ['subheader'] }, {}, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${cargo?.cargo}`, alignment: 'left' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'PERÍODO', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${cargo?.fecha_inicio || ''} / ${cargo?.fecha_fin || ''}`, alignment: 'left', colSpan: 3 }, {}, {}
                ],
              ]
            }) : [],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DIRECCIÓN DOMICILIARIA DEL DOCENTE', alignment: 'center', colSpan: 7, style: ['header'] }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'BARRIO O COLONIA', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'AVENIDA', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CALLE', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'SECTOR', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'BLOQUE', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'N DE CASA', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'COLOR DE CASA', alignment: 'center', style: ['subheader'] }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.["BARRIO_COLONIA"], alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.AVENIDA, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.CALLE, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.SECTOR, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.BLOQUE, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.["N° DE CASA"], alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.["COLOR CASA"], alignment: 'center' }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'ALDEA', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CASERÍO', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DEPARTAMENTO', alignment: 'center', colSpan: 2, style: ['subheader'] },
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'MUNICIPIO', alignment: 'center', colSpan: 2, style: ['subheader'] },
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CIUDAD', alignment: 'center', style: ['subheader'] }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.ALDEA, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: jsonObj?.CASERIO, alignment: 'center' },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center', colSpan: 2 },
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center', colSpan: 2 },
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' }
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'OTROS PUNTOS DE REFERENCIA', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'left', colSpan: 6 }, {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NÚMEROS DE TELEFÓNICOS', alignment: 'left', rowSpan: 2, style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CASA', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.telefono_1, alignment: 'left', colSpan: 2 }, {}, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CORREO ELECTRÓNICO 1', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.correo_1, alignment: 'left', colSpan: 2 }, {}
            ],
            [
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CELULAR', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.telefono_2, alignment: 'left', colSpan: 2 }, {}, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CORREO ELECTRÓNICO 2', alignment: 'left', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: persona?.correo_2, alignment: 'left', colSpan: 2 }, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DATOS DE CUENTAS BANCARIAS', alignment: 'center', colSpan: 7, style: ['header'] },
              {}, {}, {}, {}, {}, {}
            ],
            ...dataCuenBan?.length > 0 ? dataCuenBan.flatMap((b: any) => {
              return [
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'BANCO', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${b?.banco?.nombre_banco}`, alignment: 'left', colSpan: 2 }, {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'No. DE CUENTA BANCARIA ACTUAL', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.num_cuenta, alignment: 'left', colSpan: 3 }, {}, {}
                ],
              ]
            }) : [],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'INSTITUCIONES EDUCATIVAS', alignment: 'center', colSpan: 7, style: ['header'] },
              {}, {}, {}, {}, {}, {}
            ],
            ...dataCentTrab?.length > 0 ? dataCentTrab.flatMap((b: any, index: number) => {
              const direccionCentro = b.centroTrabajo.direccion_1
                ? b.centroTrabajo.direccion_1.split(',').reduce((acc: any, curr: any) => {
                    const [key, value] = curr.split(':').map((s: string) => s.trim());
                    acc[key] = value;
                    return acc;
                  }, {} as { [key: string]: string })
                : {};

              return [
                [

                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `CENTRO EDUCATIVO #${index + 1}`, alignment: 'center', colSpan: 7, style: ['subheader'] }, {},
                  {}, {},
                  {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NOMBRE DEL CENTRO EDUCATIVO', alignment: 'left', style: ['subheader'], colSpan: 3 }, {}, {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'SECTOR', alignment: 'center', colSpan: 4, style: ['subheader'] }, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.centroTrabajo?.nombre_centro_trabajo, alignment: 'left', colSpan: 3 }, {}, {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.centroTrabajo?.sector_economico, alignment: 'left', colSpan: 4 }, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CARGO', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.cargo, alignment: 'left', colSpan: 6 }, {}, {}, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'FECHA DE INGRESO', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.fecha_ingreso, alignment: 'left', colSpan: 2 }, {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'FECHA DE PAGO', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.fecha_pago, alignment: 'left', colSpan: 3 }, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'INGRESO / SALARIO MENSUAL', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `L. ${b?.salario_base}`, alignment: 'left', colSpan: 6 },
                  {}, {},
                  {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DIRECCIÓN DEL CENTRO EDUCATIVO', alignment: 'center', colSpan: 7, style: ['subheader'] }, {},
                  {}, {},
                  {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DEPARTAMENTO', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'MUNICIPIO', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CIUDAD', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'ALDEA', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'BARRIO O COLONIA', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'AVENIDA / CALLE', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'SECTOR', alignment: 'center', style: ['subheader'] },
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${b?.centroTrabajo?.municipio?.departamento?.nombre_departamento}`, alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${b?.centroTrabajo?.municipio?.nombre_municipio}`, alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'center' },
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'TELÉFONO 1', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.centroTrabajo?.celular_1, alignment: 'center', colSpan: 2 },
                  {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'TELÉFONO 2', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.centroTrabajo?.celular_2, alignment: 'center', colSpan: 3 },
                  {},
                  {},
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'OTROS PUNTOS DE REFERENCIA', alignment: 'left', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: b?.centroTrabajo?.direccion_2, alignment: 'left', colSpan: 6 }, {}, {}, {}, {}, {}
                ],

              ];
            }) : [],

            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DATOS GENERALES DEL CÓNYUGE', alignment: 'center', colSpan: 7, style: ['header'] },
              {}, {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NOMBRE COMPLETO DEL CÓNYUGE', alignment: 'center', style: ['subheader'] },
              {
                ...(conyuge?.persona?.primer_apellido
                  ? {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${conyuge?.persona?.primer_apellido} ${conyuge?.persona?.segundo_apellido} ${conyuge?.persona?.primer_nombre} ${conyuge?.persona?.segundo_nombre}`, alignment: 'center', colSpan: 6
                  }
                  : {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '',
                    alignment: 'center', colSpan: 6
                  })
              },
              {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'No DE IDENTIDAD', alignment: 'center', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.persona?.n_identificacion || '', alignment: 'center', colSpan: 6 },
              {}, {}, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'FECHA DE NACIMIENTO', alignment: 'center', rowSpan: 2, style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NÚMEROS TELEFÓNICOS', alignment: 'center', rowSpan: 3, style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CASA', alignment: 'center', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.persona?.telefono_1 || '', alignment: 'center', colSpan: 4 }, {}, {}, {}
            ],
            [
              {},
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CELULAR', alignment: 'center', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.persona?.telefono_2 || '', alignment: 'center', colSpan: 4 }, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.persona?.fecha_nacimiento || '', alignment: 'center' },
              {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'TRABAJO', alignment: 'center', style: ['subheader'] }, { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.persona?.telefono_3 || '', alignment: 'center', colSpan: 4 }, {}, {}, {}
            ],
            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '¿TRABAJA?', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: conyuge?.trabaja || '', alignment: 'left', colSpan: 2 }, {},
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '¿ES AFILIADO?', alignment: 'left', style: ['subheader'] },
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: '', alignment: 'left', colSpan: 3 }, {}, {}
            ],

            [
              { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'REFERENCIAS', alignment: 'center', colSpan: 7, style: ['header'] },
              {}, {}, {}, {}, {}, {}
            ],

            ...dataRef?.length > 0 ? dataRef.flatMap((b: any, index: number) => {
              const formatText = (text: any) => text || '';
              return [
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `REFERENCIA #${index + 1}`, alignment: 'center', colSpan: 7, style: ['subheader'] },
                  {}, {}, {}, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NOMBRE COMPLETO', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: `${formatText(b?.primer_apellido)} ${formatText(b?.segundo_apellido)} ${formatText(b?.primer_nombre)} ${formatText(b?.segundo_nombre)}`, alignment: 'center', colSpan: 6 },
                  {}, {}, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'DIRECCIÓN', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: formatText(b?.direccion), alignment: 'center', colSpan: 6 },
                  {}, {}, {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'PARENTESCO', alignment: 'center', rowSpan: 2, style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'NÚMEROS TELEFÓNICOS', alignment: 'center', rowSpan: 3, style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CASA', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: formatText(b?.telefono_domicilio), alignment: 'center', colSpan: 4 },
                  {}, {}, {}
                ],
                [
                  {}, {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'CELULAR', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: formatText(b?.telefono_personal), alignment: 'center', colSpan: 4 },
                  {}, {}, {}
                ],
                [
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: formatText(b?.parentesco), alignment: 'center' },
                  {},
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: 'TRABAJO', alignment: 'center', style: ['subheader'] },
                  { borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], text: formatText(b?.telefono_trabajo), alignment: 'center', colSpan: 4 },
                  {}, {}, {}
                ],
              ];
            }) : [],
          ]
        },
      },
    ];

    if (includeQR) {
      const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
      content.push({ image: qrCode, width: 100, alignment: 'center', margin: [0, 10, 10, 10] });
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
          color: 'white',
          fillColor: '#1c9588',
          bold: true,
          //margin: [40, 10, 40, 5]
        },
        name: {
          fontSize: 12,
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

  async generateMovimientosPdf(data: any): Promise<Buffer> {
    try {
      const base64data = await this.getMembreteHorizontalBase64();
      const docDefinition: any = this.getMovimientosPdfTemplate(data, base64data);

      return new Promise((resolve, reject) => {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
          if (buffer) {
            resolve(buffer);
          } else {
            reject(new Error('Error al crear el buffer del PDF.'));
          }
        });
      });
    } catch (error) {
      console.error('Error en generateMovimientosPdf:', error);
      throw error;
    }
}

getMovimientosPdfTemplate(data: any, base64data: string) {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const tipoCuenta = data.tipoCuenta || 'N/A';
    const numeroCuenta = data.numeroCuenta || 'N/A';
    const nombreCompleto = `${data.PRIMER_NOMBRE || ''} ${data.SEGUNDO_NOMBRE || ''} ${data.PRIMER_APELLIDO || ''} ${data.SEGUNDO_APELLIDO || ''}`.trim();
    const identificacion = data.N_IDENTIFICACION || 'N/A';

    const tableBody = [
      [{ text: 'Año', style: 'tableHeader' }, ...months.map(month => ({ text: month, style: 'tableHeader' })), { text: 'Total', style: 'tableHeader' }],
      ...Object.keys(data.movimientos).map(year => {
        const yearTotal = Array(12).fill(0).reduce((acc, _, i) => {
          const movimientos = data.movimientos[year][i + 1] || [];
          const totalMes = movimientos.reduce((sum, mov) => sum + mov.MONTO, 0);
          return acc + totalMes;
        }, 0);

        return [
          { text: year, style: 'year' },
          ...Array(12).fill('').map((_, i) => {
            const movimientos = data.movimientos[year][i + 1] || [];
            return {
              text: movimientos.length ? movimientos.map(mov => mov.MONTO.toLocaleString('en-US', { minimumFractionDigits: 2 })).join('\n') : '-',
              style: 'movementCell'
            };
          }),
          { text: yearTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }), style: 'totalCell' } // Formato con comas
        ];
      })
    ];

    // Totales calculados
    const totalAportaciones = Object.keys(data.movimientos).reduce((acc, year) => {
      const yearTotal = Array(12).fill(0).reduce((sum, _, i) => {
        const movimientos = data.movimientos[year][i + 1] || [];
        return sum + movimientos.reduce((mesSum, mov) => mesSum + mov.MONTO, 0);
      }, 0);
      return acc + yearTotal;
    }, 0);

    return {
      pageSize: 'A3',
      pageOrientation: 'landscape',
      pageMargins: [40, 100, 40, 40],
      background: {
        image: base64data,
        width: 900,
        height: 600,
        alignment: 'center',
        margin: [0, -10, 0, 0]
      },
      content: [
        {
          columns: [
            { text: `Nombre: ${nombreCompleto}`, style: 'personaInfo' },
            { text: `Identidad: ${identificacion}`, style: 'personaInfo' },
            { text: `Tipo de Cuenta: ${tipoCuenta}`, style: 'personaInfo' },
            { text: `Número de Cuenta: ${numeroCuenta}`, style: 'personaInfo' }
          ],
          columnGap: 20,
          margin: [0, 10, 0, 10]
        },
        {
          table: {
            widths: Array(14).fill('*'),
            body: tableBody
          },
          layout: {
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
            hLineColor: function () { return '#aaaaaa'; },
            vLineColor: function () { return '#aaaaaa'; },
          },
          margin: [0, 0, 0, 10]
        }
      ],
      footer: (currentPage, pageCount) => ({
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'FECHA Y HORA: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], fontSize: 8 },
              { text: 'GENERÓ: INPRENET', alignment: 'center', border: [false, false, false, false], fontSize: 8 },
              { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, alignment: 'right', border: [false, false, false, false], fontSize: 8 }
            ]
          ]
        },
        margin: [20, 0, 20, 20]
      }),
      styles: {
        personaInfo: { fontSize: 12, bold: true },
        year: { fontSize: 10, bold: true, alignment: 'center' },
        tableHeader: { bold: true, fontSize: 10, alignment: 'center', fillColor: '#eeeeee' },
        movementCell: { fontSize: 9, alignment: 'center' },
        totalCell: { fontSize: 10, alignment: 'center', bold: true, color: '#000' }
      }
    };
}

  





}
