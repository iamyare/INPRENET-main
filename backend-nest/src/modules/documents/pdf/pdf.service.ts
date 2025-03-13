import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DriveService } from '../drive/drive.service';
import { unirNombres } from '../../../shared/formatoNombresP';
import * as path from 'path';
import { EmpleadoDto } from './empleado.dto';
import { validate } from 'class-validator';
import { AfiliacionService } from 'src/modules/Persona/afiliacion/afiliacion.service';

@Injectable()
export class PdfService {
  token: any;
  constructor(private readonly driveService: DriveService, private readonly afiliacionService: AfiliacionService) {
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

  async generateConstanciaAfiliacionTemplate(data: any, includeQR: boolean, dto: EmpleadoDto) {
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
        text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de ${dto.municipio}, Departamento de ${dto.departamento}, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
        style: 'body'
      },
      { text: '\n\n\n' }
    ];

    // Espaciado adicional para empujar la firma hacia abajo
    content.push({ text: '\n\n\n\n\n\n\n\n\n' });

    // Firma completamente centrada usando una tabla
    content.push({
      table: {
        widths: ['*', 'auto', '*'],
        body: [
          [
            '',
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                { text: dto.nombreEmpleado, style: 'signature' },
                { text: dto.nombrePuesto, style: 'signatureTitle' }
              ],
              alignment: 'center'
            },
            ''
          ]
        ]
      },
      layout: 'noBorders',
      margin: [0, 20, 0, 0]
    });

    return {
      pageSize: 'letter',
      pageMargins: [20, 80, 20, 80], // Ajustar márgenes para que no corte el membrete
      background: [
        {
          image: data.base64data, // Imagen del membrete
          width: 612, // Tamaño completo de la página letter
          height: 792,
          absolutePosition: { x: 0, y: 0 } // Fijar imagen en la parte superior
        }
      ],
      content: content,
      footer: function (currentPage, pageCount) {
        const user = dto.correo.split('@')[0];
        return {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: `Fecha y Hora: ${new Date().toLocaleString()}`, alignment: 'left', border: [false, false, false, false], style: 'footer' },
                { text: `Generó: ${user}`, alignment: 'center', border: [false, false, false, false], style: 'footer' },
                { text: `Página: ${currentPage} de ${pageCount}`, alignment: 'right', border: [false, false, false, false], style: 'footer' }
              ]
            ]
          },
          margin: [20, 0, 20, 20]
        };
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        subheader: {
          fontSize: 11,
          alignment: 'center',
          margin: [40, 10, 40, 5],
          lineHeight: 1.8
        },
        name: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [20, 10, 20, 5],
          lineHeight: 1.8
        },
        body: {
          fontSize: 11,
          alignment: 'center',
          margin: [20, 10, 20, 5],
          lineHeight: 1.8
        },
        dni: {
          fontSize: 11,
          bold: true,
          lineHeight: 1.8
        },
        signature: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 0]
        },
        signatureTitle: {
          fontSize: 12,
          alignment: 'center'
        },
        footer: {
          fontSize: 8,
          alignment: 'center',
        }
      }
    };
  }

  public async generateConstanciaAfiliacionTemplate2(data: any, includeQR: boolean, dto: EmpleadoDto) {

    const calcularEdad = (fecha: string) => {
      if (!fecha) return '';
      const hoy = new Date();
      const cumpleanos = new Date(fecha);
      let edad = hoy.getFullYear() - cumpleanos.getFullYear();
      const mes = hoy.getMonth() - cumpleanos.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
      }
      return edad;
    };

    let persona = data;
    let dataCentTrab = persona?.perfPersCentTrabs;
    let dataRef = persona?.referencias;
    let dataCuenBan = persona?.personasPorBanco;
    let cargos_publicos = Array.isArray(persona?.peps)
      ? persona.peps.flatMap((peps: any) => peps.cargo_publico || [])
      : [];
    let conyuge = data?.conyuge;

    const detallePersonaFiltrado = data.detallePersona?.find(
      (detalle: any) => [1, 2, 3].includes(detalle.tipoPersona.id_tipo_persona)
    );

    // Si no hay un tipo válido, no generamos la constancia
    if (!detallePersonaFiltrado) {
      console.error('No se encontró un tipo de persona válido para la constancia.');
      return;
    }

    // Obtener la clase cliente
    let claseCliente = detallePersonaFiltrado.tipoPersona.tipo_persona;

    // Si el tipo de persona es "AFILIADO", establecerlo como "ACTIVO"
    if (claseCliente === 'AFILIADO') {
      claseCliente = 'ACTIVO';
    }

    // Obtener el tipo de formulario
    const tipoFormulario = data.tipoFormulario || 'NO DISPONIBLE'


    const jsonObj: any =
      typeof persona?.direccion_residencia_estructurada === 'string'
        ? persona.direccion_residencia_estructurada.split('/').reduce(
          (acc: any, curr: any) => {
            const [key, value] = curr.split(':').map((s: string) => s.trim());
            acc[key] = value;
            return acc;
          },
          {} as { [key: string]: string }
        )
        : {};

    const currentDate = new Date(); // Obtiene la fecha actual
    const formattedDate = currentDate.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const municipio = dto.municipio;


    const content: Array<any> = [
      {
        table: {
          widths: ['50%', '50%'], // Divide la sección en dos partes iguales
          body: [
            [
              {
                text: `CLASE CLIENTE: ${claseCliente}`,
                style: 'infoHeader',
                alignment: 'left',
                margin: [0, 5, 0, 5],
                border: [false, false, false, false], // Sin bordes
              },
              {
                text: `TIPO DE FORMULARIO: ${tipoFormulario}`,
                style: 'infoHeader',
                alignment: 'right',
                margin: [0, 5, 0, 5],
                border: [false, false, false, false], // Sin bordes
              }
            ]
          ]
        },
        layout: 'noBorders' // Elimina cualquier borde de la tabla
      },
      {
        table: {
          widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'],
          body: [
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DATOS GENERALES DEL DOCENTE',
                colSpan: 6,
                alignment: 'center',
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {
                ...(persona?.foto_perfil?.data?.length > 0
                  ? {
                    image: `data:image/png;base64,${Buffer.from(
                      persona.foto_perfil.data
                    ).toString('base64')}`,
                    fit: [75, 100], // Ajusta las dimensiones de la imagen al cuadro
                    alignment: 'center',
                    rowSpan: 6,
                  }
                  : {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                    text: 'SIN FOTO',
                    alignment: 'center',
                    rowSpan: 6,
                  }),
              }
              ,
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NOMBRE DEL DOCENTE',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: [
                  persona?.primer_nombre,
                  persona?.segundo_nombre,
                  persona?.tercer_nombre,
                  persona?.primer_apellido,
                  persona?.segundo_apellido,
                ]
                  .filter((name) => name && name.trim() !== "")
                  .join(" "),
                alignment: 'left',
                style: 'smallCell',
                colSpan: 4,
              },
              {},
              {},
              {},
              {}
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'No DE IDENTIDAD Y/O CARNET DEL RESIDENTE VIGENTE',
                alignment: 'left',
                colSpan: 2,
                style: ['subheader'],
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: `${persona?.n_identificacion}`,
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'GÉNERO',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.genero || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'PROFESIÓN',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.profesion?.descripcion || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'ESTADO CIVIL',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.estado_civil || '',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {}, // Espacio reservado para respetar la imagen
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NÚMERO DE DEPENDIENTES',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.cantidad_dependientes !== undefined && persona?.cantidad_dependientes !== null ? persona.cantidad_dependientes.toString() : '',
                alignment: 'left',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CANTIDAD DE HIJOS',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.cantidad_hijos !== undefined && persona?.cantidad_hijos !== null ? persona.cantidad_hijos.toString() : '',
                alignment: 'left',
                style: 'smallCell',
              },
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NACIONALIDAD',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.pais?.nacionalidad || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'RTN',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.rtn || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'LUGAR Y FECHA DE NACIMIENTO',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'PAÍS',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.pais?.nombre_pais || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DEPARTAMENTO',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text:
                  persona?.municipio_nacimiento?.departamento?.nombre_departamento ||
                  '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 3,
              },
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CIUDAD',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text:
                  persona?.municipio_nacimiento?.nombre_municipio ||
                  '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 1,
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'FECHA DE NACIMIENTO',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.fecha_nacimiento || '',
                alignment: 'left',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'EDAD',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.fecha_nacimiento
                  ? `${calcularEdad(persona?.fecha_nacimiento)} Años`
                  : '',
                alignment: 'left',
              },
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'REPRESENTACIÓN',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.representacion || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 5,
              },
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'OTRAS FUENTES DE INGRESO',
                alignment: 'center',
                colSpan: 7, // Asegurar que usa las 7 columnas de la tabla
                style: ['header'],
              },
              {}, {}, {}, {}, {}, {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'ACTIVIDAD ECONÓMICA',
                alignment: 'center',
                style: ['subheader'],
                colSpan: 2, // Ajustado para evitar _span issues
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'OBSERVACIÓN',
                alignment: 'center',
                style: ['subheader'],
                colSpan: 3, // Ajustado para evitar _span issues
              },
              {}, {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'MONTO INGRESO',
                alignment: 'center',
                style: ['subheader'],
                colSpan: 2, // Ajustado para evitar _span issues
              },
              {},
            ],
            ...(
              persona?.otra_fuente_ingreso?.length > 0
                ? persona.otra_fuente_ingreso.flatMap((fuente: any) => [
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: fuente.actividad_economica || 'N/A',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 2,
                    },
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: fuente.observacion || 'N/A',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 3,
                    },
                    {},
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: fuente.monto_ingreso ? `L. ${fuente.monto_ingreso}` : 'N/A',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 2,
                    },
                    {},
                  ],
                ])
                : [
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'No hay otras fuentes de ingreso registradas',
                      colSpan: 7,
                      alignment: 'center',
                      style: 'smallCell',
                    },
                    {}, {}, {}, {}, {}, {},
                  ],
                ]
            ),

            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DIRECCIÓN DOMICILIARIA DEL DOCENTE',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'BARRIO O COLONIA',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'AVENIDA',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CALLE',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'SECTOR',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'BLOQUE',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'N DE CASA',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'COLOR DE CASA',
                alignment: 'center',
                style: ['subheader'],
              },
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.['BARRIO_COLONIA'] || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.AVENIDA || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.CALLE || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.SECTOR || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.BLOQUE || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.['N° DE CASA'] || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.['COLOR CASA'] || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'ALDEA',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CASERÍO',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DEPARTAMENTO',
                alignment: 'center',
                colSpan: 2,
                style: ['subheader'],
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'MUNICIPIO',
                alignment: 'center',
                colSpan: 2,
                style: ['subheader'],
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CIUDAD',
                alignment: 'center',
                style: ['subheader'],
              },
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.ALDEA || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: jsonObj?.CASERIO || 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text:
                  persona?.municipio?.departamento?.nombre_departamento ||
                  'N/A',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.municipio?.nombre_municipio || 'N/A',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'N/A',
                alignment: 'center',
                style: 'smallCell',
              },
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'OTROS PUNTOS DE REFERENCIA',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona.direccion_residencia || 'N/A',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 5,
              },
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NÚMEROS DE TELEFÓNICOS',
                alignment: 'left',
                rowSpan: 2,
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CASA',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.telefono_1 || '\n',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 1,
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CORREO ELECTRÓNICO 1',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.correo_1 || '\n',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
            ],
            [
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CELULAR',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.telefono_2 || '\n',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 1,
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CORREO ELECTRÓNICO 2',
                alignment: 'left',
                style: ['subheader'],
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: persona?.correo_2 || '\n',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DATOS DE CUENTA BANCARIA',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            // Sección de CUENTAS BANCARIAS
            ...(() => {
              if (dataCuenBan?.length > 0) {
                return dataCuenBan.flatMap((b: any) => {
                  return [
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'BANCO',
                        alignment: 'left',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: `${b?.banco?.nombre_banco || ''}`,
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 3,
                      },
                      {},
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'No. DE CUENTA',
                        alignment: 'left',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.num_cuenta || '',
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                    ],
                  ];
                });
              } else {
                return [
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'BANCO',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 2,
                    },
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'No. DE CUENTA',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 3,
                    },
                    {},
                    {},
                  ],
                ];
              }
            })(),
            // Encabezado de la sección
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'INSTITUCIONES EDUCATIVAS',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            // Sección de centros educativos:
            ...(() => {
              if (dataCentTrab?.length > 0) {
                return dataCentTrab.flatMap((b: any, index: number) => {
                  return [
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: `CENTRO EDUCATIVO #${index + 1}`,
                        alignment: 'center',
                        colSpan: 7,
                        style: ['subheader'],
                      },
                      {}, {}, {}, {}, {}, {},
                    ],
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'NOMBRE DEL CENTRO EDUCATIVO',
                        alignment: 'left',
                        style: ['subheader'],
                        colSpan: 5,
                      },
                      {}, {},
                      {}, {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'SECTOR',
                        alignment: 'center',
                        colSpan: 2,
                        style: ['subheader'],
                      },
                      {},
                    ],
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.nombre_centro_trabajo || '\n',
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 5,
                      },
                      {}, {},
                      {}, {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.sector_economico || '\n',
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                    ],
                    // Fila 3: Cargo
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'CARGO',
                        alignment: 'left',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.cargo || '',
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 6,
                      },
                      {}, {}, {}, {}, {},
                    ],
                    // Fila 4: Fecha de Ingreso, Fecha de Pago
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'FECHA DE INGRESO',
                        alignment: 'left',
                        style: ['subheader'],
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.fecha_ingreso || '',
                        alignment: 'left',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'FECHA DE PAGO',
                        alignment: 'left',
                        style: ['subheader'],
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.fecha_pago || '',
                        alignment: 'left',
                        style: 'smallCell'
                      },
                    ],
                    // Fila 5: Ingreso / Salario Mensual
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'SALARIO MENSUAL',
                        alignment: 'center',
                        colSpan: 3, // 🔹 Se expande más en la fila
                        style: ['subheader'],
                      },
                      {},
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.salario_base ? `L. ${b?.salario_base}` : '',
                        alignment: 'left',
                        style: 'smallCell',
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'NÚMERO DE ACUERDO',
                        alignment: 'left',
                        style: ['subheader'],
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.numero_acuerdo || 'N/A',
                        alignment: 'left',
                        style: 'smallCell',
                      },
                    ],

                    // Fila 6: Título dirección
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'DIRECCIÓN DEL CENTRO EDUCATIVO',
                        alignment: 'center',
                        colSpan: 7,
                        style: ['subheader'],
                      },
                      {}, {}, {}, {}, {}, {},
                    ],
                    // Fila 7: 3 columnas - DEPARTAMENTO, MUNICIPIO, DIRECCIÓN COMPLETA
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'DEPARTAMENTO',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'MUNICIPIO',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'DIRECCIÓN COMPLETA',
                        alignment: 'center',
                        style: ['subheader'],
                        colSpan: 5,
                      },
                      {}, {}, {}, {},
                    ],
                    // Fila 8: Datos de dirección
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.municipio?.departamento?.nombre_departamento || '',
                        style: 'smallCell',
                        alignment: 'center',
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.municipio?.nombre_municipio || '',
                        style: 'smallCell',
                        alignment: 'center',
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.direccion_1 || '',
                        style: 'smallCell',
                        alignment: 'center',
                        colSpan: 5,
                      },
                      {}, {}, {}, {},
                    ],
                    // Fila 9: Teléfonos
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'TELÉFONO 1',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.telefono_1 || '',
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'TELÉFONO 2',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: b?.centroTrabajo?.celular_2 || '',
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 3,
                      },
                      {}, {},
                    ]
                  ];
                });
              } else {
                return [
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'CENTRO EDUCATIVO #1',
                      alignment: 'center',
                      colSpan: 7,
                      style: ['subheader'],
                    },
                    {}, {}, {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'NOMBRE DEL CENTRO EDUCATIVO',
                      alignment: 'left',
                      style: ['subheader'],
                      colSpan: 3,
                    },
                    {}, {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'SECTOR',
                      alignment: 'center',
                      colSpan: 4,
                      style: ['subheader'],
                    },
                    {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 3,
                    },
                    {}, {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 4,
                    },
                    {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'CARGO',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 6,
                    },
                    {}, {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'FECHA DE INGRESO',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 2,
                    },
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'FECHA DE PAGO',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 3,
                    },
                    {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'INGRESO / SALARIO MENSUAL',
                      alignment: 'left',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'left',
                      style: 'smallCell',
                      colSpan: 6,
                    },
                    {}, {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'DIRECCIÓN DEL CENTRO EDUCATIVO',
                      alignment: 'center',
                      colSpan: 7,
                      style: ['subheader'],
                    },
                    {}, {}, {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'DEPARTAMENTO',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'MUNICIPIO',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'DIRECCIÓN COMPLETA',
                      alignment: 'center',
                      style: ['subheader'],
                      colSpan: 5,
                    },
                    {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      colSpan: 5,
                    },
                    {}, {}, {}, {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'TELÉFONO 1',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 2,
                    },
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'TELÉFONO 2',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 3,
                    },
                    {}, {},
                  ]
                ];
              }
            })(),

            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'DATOS GENERALES DEL CÓNYUGE',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NOMBRE COMPLETO DEL CÓNYUGE',
                alignment: 'center',
                style: ['subheader'],
                colSpan: 3,
              },
              {}, {},
              {
                ...(conyuge?.primer_apellido
                  ? {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                    text: [
                      conyuge?.primer_apellido,
                      conyuge?.segundo_apellido,
                      conyuge?.primer_nombre,
                      conyuge?.segundo_nombre,
                    ]
                      .filter((name) => name && name.trim() !== "")
                      .join(" "),
                    alignment: 'center',
                    style: 'smallCell',
                    colSpan: 4,
                  }
                  : {
                    borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                    text: '',
                    alignment: 'center',
                    style: 'smallCell',
                    colSpan: 4,
                  }),
              },
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'No DE IDENTIDAD',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.n_identificacion || '',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 6,
              },
              {},
              {},
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'FECHA DE NACIMIENTO',
                alignment: 'center',
                rowSpan: 2,
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'NÚMEROS TELEFÓNICOS',
                alignment: 'center',
                rowSpan: 3,
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CASA',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.telefono_3 || '',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 4,
              },
              {},
              {},
              {},
            ],
            [
              {},
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'CELULAR',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.telefono_1 || '',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 4,
              },
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.fecha_nacimiento || '',
                alignment: 'center',
                style: 'smallCell',
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'TRABAJO',
                alignment: 'center',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.telefono_2 || '',
                alignment: 'center',
                style: 'smallCell',
                colSpan: 4,
              },
              {},
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: '¿TRABAJA?',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.trabaja || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 2,
              },
              {},
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: '¿ES AFILIADO?',
                alignment: 'left',
                style: ['subheader'],
              },
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: conyuge?.esAfiliado || '',
                alignment: 'left',
                style: 'smallCell',
                colSpan: 3,
              },
              {},
              {},
            ],
            [
              {
                borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                text: 'REFERENCIAS',
                alignment: 'center',
                colSpan: 7,
                style: ['header'],
              },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            // Sección de REFERENCIAS
            ...(() => {
              const formatText = (text: any) => text || '';
              if (dataRef?.length > 0) {
                return dataRef.flatMap((b: any, index: number) => {
                  return [
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: `REFERENCIA #${index + 1}`,
                        alignment: 'center',
                        colSpan: 7,
                        style: ['subheader'],
                      },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                    ],
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'NOMBRE COMPLETO',
                        alignment: 'center',
                        style: ['subheader'],
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: [
                          b?.primer_apellido,
                          b?.segundo_apellido,
                          b?.primer_nombre,
                          b?.segundo_nombre,
                        ]
                          .filter((name) => name && name.trim() !== "")
                          .join(" "),
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'DIRECCIÓN',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: formatText(b?.direccion),
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 2,
                      },
                      {},
                    ],
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'PARENTESCO',
                        alignment: 'center',
                        rowSpan: 2,
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'NÚMEROS TELEFÓNICOS',
                        alignment: 'center',
                        rowSpan: 3,
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'CASA',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: formatText(b?.telefono_domicilio),
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 4,
                      },
                      {},
                      {},
                      {},
                    ],
                    [
                      {},
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'CELULAR',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: formatText(b?.telefono_personal),
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 4,
                      },
                      {},
                      {},
                      {},
                    ],
                    [
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: formatText(b?.parentesco),
                        alignment: 'center',
                        style: 'smallCell',
                      },
                      {},
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: 'TRABAJO',
                        alignment: 'center',
                        style: ['subheader'],
                      },
                      {
                        borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                        text: formatText(b?.telefono_trabajo),
                        alignment: 'center',
                        style: 'smallCell',
                        colSpan: 4,
                      },
                      {},
                      {},
                      {},
                    ],
                  ];
                });
              } else {
                // Sección vacía si no hay referencias
                return [
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: `REFERENCIA #1`,
                      alignment: 'center',
                      colSpan: 7,
                      style: ['subheader'],
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'NOMBRE COMPLETO',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 6,
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'DIRECCIÓN',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 6,
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'PARENTESCO',
                      alignment: 'center',
                      rowSpan: 2,
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'NÚMEROS TELEFÓNICOS',
                      alignment: 'center',
                      rowSpan: 3,
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'CASA',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 4,
                    },
                    {},
                    {},
                    {},
                  ],
                  [
                    {},
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'CELULAR',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 4,
                    },
                    {},
                    {},
                    {},
                  ],
                  [
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                    },
                    {},
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: 'TRABAJO',
                      alignment: 'center',
                      style: ['subheader'],
                    },
                    {
                      borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                      text: '',
                      alignment: 'center',
                      style: 'smallCell',
                      colSpan: 4,
                    },
                    {},
                    {},
                    {},
                  ],
                ];
              }
            })(),
          ],
        },
      },
    ];

    if (cargos_publicos.length > 0) {
      content.push({
        table: {
          widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'], // 7 columnas exactas
          body: [
            // Encabezado principal
            [
              { text: 'DECLARACIÓN DE PERSONA POLÍTICAMENTE EXPUESTA (PEPS)', colSpan: 7, style: 'header', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {}, {}, {}, {}, {}, {} // Completar el colSpan con celdas vacías
            ],
            // Pregunta general
            [
              { text: '¿ACTUALMENTE DESEMPEÑA O HA DESEMPEÑADO ALGÚN CARGO PÚBLICO?', colSpan: 6, style: 'subheader', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {}, {}, {}, {}, {}, // Espacios para el colSpan
              { text: 'SI', style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], }
            ],
            ...cargos_publicos.map((cargo: any, index: number) => {
              return [
                { text: `CARGO #${index + 1}`, colSpan: 2, style: 'subheader', alignment: 'center', fillColor: '#1c9588', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                {},
                { text: cargo?.cargo || 'N/A', style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                { text: 'PERÍODO', style: 'subheader', fillColor: '#1c9588', colSpan: 2, alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                {},
                { text: `${cargo?.fecha_inicio || 'N/A'} - ${cargo?.fecha_fin || 'N/A'}`, colSpan: 2, style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                {},
              ];
            })
          ],
        },
      });
    }
    // ✅ Si hay cargos públicos, se agregan familiares
    if (cargos_publicos.length > 0 && persona?.familiares?.length > 0) {
      content.push({
        table: {
          widths: ['14%', '14%', '14%', '14%', '14%', '14%', '14%'], // 7 columnas fijas
          body: [
            // Encabezado principal
            [
              { text: 'EN CASO AFIRMATIVO: INDIQUE EL NOMBRE DE SUS FAMILIARES', colSpan: 7, style: 'header', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {}, {}, {}, {}, {}, {} // Completar el colSpan con celdas vacías
            ],
            [
              { text: 'NOMBRES Y APELLIDOS', colSpan: 3, style: 'subheader', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {},
              {},
              { text: 'NÚMERO DE IDENTIFICACIÓN', colSpan: 2, style: 'subheader', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {},
              { text: 'PARENTESCO', style: 'subheader', colSpan: 2, alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
              {},
            ],
            ...persona.familiares.map((familiar: any, index: number) => {
              return [
                {
                  text: `${familiar?.referenciada?.primer_nombre || ''} ${familiar?.referenciada?.segundo_nombre || ''} ${familiar?.referenciada?.primer_apellido || ''} ${familiar?.referenciada?.segundo_apellido || ''}`,
                  colSpan: 3, style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'],
                },
                {},
                {},
                { text: familiar?.referenciada?.n_identificacion || 'N/A', colSpan: 2, style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                {},
                { text: familiar?.parentesco || 'N/A', colSpan: 2, style: 'smallCell', alignment: 'center', borderColor: ['#1c9588', '#1c9588', '#1c9588', '#1c9588'], },
                {}
              ];
            })
          ],
        },
      });
    }




    /* 
     Si quieres incluir el QR, descomenta y ajusta a tu necesidad:
     if (includeQR) {
       const qrCode = await QRCode.toDataURL(`https://drive.google.com/file/d/${data.fileId}/view`);
       content.push({ image: qrCode, width: 100, alignment: 'center', margin: [0, 10, 10, 10] });
     }
    */

    content.push(
      {
        table: {
          widths: ['33%', '33%', '34%'],
          body: [
            [
              {
                margin: [0, 30, 0, 0],
                stack: [
                  { text: `${municipio}, ${formattedDate}`, style: 'footer', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '_______________________________', style: 'footer', alignment: 'center' },
                  { text: 'Lugar y Fecha', style: 'footer', alignment: 'center', margin: [0, 5, 0, 0] },
                ],
                border: [false, false, false, false],
              },
              {
                margin: [0, 30, 0, 0],
                stack: [
                  { text: ' ', style: 'footer', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '_______________________________', style: 'footer', alignment: 'center' },
                  { text: 'Firma del Docente', style: 'footer', alignment: 'center', margin: [0, 5, 0, 0] },
                ],
                border: [false, false, false, false],
              },
              {
                margin: [0, 30, 0, 0], // Ajustado para que quede alineado con las demás firmas
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 80,
                        h: 100,
                        lineColor: '#000000',
                      },
                    ],
                    margin: [40, 0, 0, 0],
                  },
                  {
                    text: 'HUELLA',
                    alignment: 'center',
                    margin: [0, 5, 0, 0],
                    style: 'footer',
                  },
                ],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'PARA USO EXCLUSIVO DEL INPREMA',
                style: 'header',
                alignment: 'center',
              },
            ],
          ],
        },
        margin: [0, 5, 0, 0],
      },
      {
        table: {
          widths: ['33%', '33%', '34%'],
          body: [
            [
              {
                margin: [0, 20, 0, 0], // Ajustado para alineación
                stack: [
                  { text: dto.nombreEmpleado || 'NOMBRE NO DISPONIBLE', style: 'footer', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '_______________________________', style: 'footer', alignment: 'center' },
                  { text: 'Nombre del empleado que atendió al docente', style: 'footer', alignment: 'center', margin: [0, 5, 0, 0] },
                ],
                border: [false, false, false, false],
              },
              {
                margin: [0, 20, 0, 0], // Ajustado para alineación
                stack: [
                  { text: dto.numero_empleado || 'CÓDIGO NO DISPONIBLE', style: 'footer', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '_______________________________', style: 'footer', alignment: 'center' },
                  { text: 'Código de Empleado', style: 'footer', alignment: 'center', margin: [0, 5, 0, 0] },
                ],
                border: [false, false, false, false],
              },
              {
                margin: [0, 20, 0, 0], // Alineado con las demás firmas
                stack: [
                  { text: ' ', style: 'footer', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: '_______________________________', style: 'footer', alignment: 'center' },
                  { text: 'Firma del Empleado', style: 'footer', alignment: 'center', margin: [0, 5, 0, 0] },
                ],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
      }
    );



    return {
      pageSize: 'letter',
      pageMargins: [40, 85, 40, 60],
      background: {
        image: data.base64data,
        width: 595.28,
        height: 800,
      },
      content: content,
      styles: {
        header: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: 'black',
          fillColor: 'lightgray',
        },
        subheader: {
          fontSize: 8,
          alignment: 'left',
          color: 'white',
          fillColor: '#1c9588',
          bold: true,
        },
        name: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [40, 10, 40, 5],
        },
        body: {
          fontSize: 8,
          alignment: 'left',
          margin: [40, 10, 40, 5],
        },
        dni: {
          fontSize: 11,
          bold: true,
        },
        signature: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
        signatureTitle: {
          fontSize: 12,
          alignment: 'center',
        },
        infoHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'left',
        },
        footer: {
          fontSize: 10,
          alignment: 'right',
        },
        smallCell: {
          fontSize: 8,
        },
        leyenda: {
          fontSize: 10,
        },
      },
    };
  }

  async generateConstanciaAfiliacion(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
    return this.generateConstancia({ ...data, dto }, includeQR, (data, includeQR) =>
      this.generateConstanciaAfiliacionTemplate(data, includeQR, dto)
    );
  }

  async generateConstanciaAfiliacion2(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
    return this.generateConstancia({ ...data, dto }, includeQR, (data, includeQR) =>
      this.generateConstanciaAfiliacionTemplate2(data, includeQR, dto)
    );
  }

  async generateAndUploadConstancia(data: any, dto: EmpleadoDto, type: string): Promise<string> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new Error(
        `Validation failed: ${errors
          .map(err => Object.values(err.constraints || {}).join(', '))
          .join('; ')}`,
      );
    }
    const nombreCompleto = `${data.primer_nombre}_${data.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    const fileName = `${nombreCompleto}_${fechaActual}_constancia_${type}`;

    let pdfBufferWithoutQR;
    switch (type) {
      case 'afiliacion':
        pdfBufferWithoutQR = await this.generateConstanciaAfiliacion(data, false, dto);
        break;
      case 'afiliacion2':
        pdfBufferWithoutQR = await this.generateConstanciaAfiliacion2(data, false, dto);
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
      case 'beneficios':
        pdfBufferWithoutQR = await this.generateConstanciaBeneficios(data, false, dto);
        break;
      case 'constancia-beneficios':
        pdfBufferWithoutQR = await this.generateConstanciaBeneficiosFormatoNuevo(data, false, dto);
        break;
      case 'constancia-beneficio-fallecido':
        pdfBufferWithoutQR = await this.generateConstanciaJubiladoFallecido(data, false, dto);
        break;
      case 'beneficiarios-sin-pago':
          pdfBufferWithoutQR = await this.generateConstanciaBeneficiariosSinPago(data, false, dto);
        break;
      default:
        throw new Error('Invalid constancia type');
    }

    const fileId = await this.driveService.uploadFile(`${fileName}_sin_qr.pdf`, pdfBufferWithoutQR);

    let pdfBufferWithQR;
    /*  switch (type) {
       case 'afiliacion':
         pdfBufferWithQR = await this.generateConstanciaAfiliacion({ ...data, fileId }, true, dto);
         break;
       case 'afiliacion2':
         pdfBufferWithQR = await this.generateConstanciaAfiliacion2({ ...data, dto, fileId }, true, dto);
         break;
       case 'renuncia-cap':
         pdfBufferWithQR = await this.generateConstanciaRenunciaCap({ ...data, dto, fileId }, true);
         break;
       case 'no-cotizar':
         pdfBufferWithQR = await this.generateConstanciaNoCotizar({ ...data, dto, fileId }, true);
         break;
       case 'debitos':
         pdfBufferWithQR = await this.generateConstanciaDebitos({ ...data, dto, fileId }, true);
         break;
       case 'tiempo-cotizar-con-monto':
         pdfBufferWithQR = await this.generateConstanciaTiempoCotizarConMonto({ ...data, dto, fileId }, true);
         break;
       case 'beneficios': // Nuevo caso para constancia de beneficios con QR
         pdfBufferWithQR = await this.generateConstanciaBeneficios({ ...data, fileId }, true, dto);
         break;
       default:
         throw new Error('Invalid constancia type');
     }
   
     fs.writeFileSync(`${fileName}_con_qr.pdf`, pdfBufferWithQR); */

    return fileId;
  }

  async generateConstanciaWithQR(data: any, type: string, dto: EmpleadoDto): Promise<Buffer> {
    switch (type) {
      case 'afiliacion':
        return await this.generateConstanciaAfiliacion(data, true, dto);
      case 'renuncia-cap':
        return await this.generateConstanciaRenunciaCap(data, true);
      case 'no-cotizar':
        return await this.generateConstanciaNoCotizar(data, true);
      case 'debitos':
        return await this.generateConstanciaDebitos(data, true);
      case 'tiempo-cotizar-con-monto':
        return await this.generateConstanciaTiempoCotizarConMonto(data, true);
      case 'afiliacion2':
        return await this.generateConstanciaAfiliacion2(data, true, dto);
      case 'beneficios':
        return await this.generateConstanciaBeneficios(data, true, dto);
      case 'constancia-beneficios':
        return await this.generateConstanciaBeneficiosFormatoNuevo(data, false, dto);
      case 'constancia-beneficio-fallecido':
        return await this.generateConstanciaJubiladoFallecido(data, false, dto);
      case 'beneficiarios-sin-pago':
        return await this.generateConstanciaBeneficiariosSinPago(data, false, dto);
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
            { text: '', bold: true },
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

  private convertirFechaFormal(fecha: Date): string {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `a los ${dia} días del mes de ${mes} del año ${anio}`;
}

async generateConstanciaBeneficios(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
  const templateFunction = async (data: any, includeQR: boolean) => {
      const today = new Date();
      const formattedDate = `${today.getDate()} de ${today.toLocaleString('es-HN', { month: 'long' })} del ${today.getFullYear()}`;
      const user = dto.correo.split('@')[0]; // Usuario antes de la arroba

      const content: Array<any> = [
          // 📌 Título principal
          { text: 'CONSTANCIA DE BENEFICIO VITALICIO', style: 'mainTitle' },

          // 📌 Párrafo con información clave del beneficio
          {
              text: [
                  'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que ',
                  { text: data.nombre_completo.toUpperCase(), bold: true },
                  ', con número de identificación ',
                  { text: data.n_identificacion, bold: true },
                  ', goza del beneficio vitalicio de ',
                  { text: `${data.beneficio.toUpperCase()},`, bold: true }, // ✅ Se mantiene la coma
                  ' otorgado a partir del ',
                  { text: `${data.fecha_inicio},`, bold: true }, // ✅ Se mantiene la coma y se elimina espacio extra
                  ' cuyo monto asciende a la cantidad de ',
                  { text: data.monto_letras.toUpperCase(), bold: true },
                  ' (L. ',
                  { text: data.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bold: true },
                  ').'
              ],
              style: 'body'
          },

          {
              text: [
                  'Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de ',
                  { text: dto.municipio.charAt(0).toUpperCase() + dto.municipio.slice(1).toLowerCase(), bold: true },
                  ', ',
                  { text: dto.departamento.charAt(0).toUpperCase() + dto.departamento.slice(1).toLowerCase(), bold: true },
                  ', el ',
                  { text: formattedDate, bold: true },
                  '.'
              ],
              style: 'body'
          },

          { text: '\n\n\n\n\n\n\n\n\n' }, // Espaciado antes de la firma
          
          // 📌 Firma
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 0, 0, 0] },
          { text: dto.nombreEmpleado, style: 'signature' },
          { text: dto.nombrePuesto, style: 'signatureTitle' }
      ];

      return {
          pageSize: 'A4',
          pageMargins: [40, 120, 40, 85],
          background: {
              image: data.base64data,
              width: 595.28,
              height: 841.89
          },
          content: content,
          footer: (currentPage, pageCount) => ({
              table: {
                  widths: ['*', '*', '*'],
                  body: [
                      [
                          { text: 'Fecha y Hora: ' + today.toLocaleString(), alignment: 'left', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Generado por: ' + user, alignment: 'center', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Página: ' + currentPage + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: 'footerText' }
                      ]
                  ]
              },
              margin: [20, 0, 20, 20]
          }),
          styles: {
              mainTitle: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 30, 0, 20] },
              body: { fontSize: 12, alignment: 'justify', margin: [40, 10, 40, 5], lineHeight: 1.5 },
              signature: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 10, 0, 0] },
              signatureTitle: { fontSize: 12, alignment: 'center' },
              footerText: { fontSize: 8 }
          }
      };
  };

  return this.generateConstancia(data, includeQR, templateFunction);
}

async generateConstanciaBeneficiosFormatoNuevo(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
  const templateFunction = async (data: any, includeQR: boolean) => {
      const today = new Date();
      const formattedDate = `${today.getDate()} de ${today.toLocaleString('es-HN', { month: 'long' })} del ${today.getFullYear()}`;
      const user = dto.correo.split('@')[0];

      const content: Array<any> = [
          // 📌 Título principal
          { text: 'CONSTANCIA DE BENEFICIO', style: 'mainTitle' },

          // 📌 Párrafo con información clave del beneficio
          {
              text: [
                  'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que ',
                  { text: data.nombre_completo.toUpperCase(), bold: true },
                  ', con número de identificación ',
                  { text: data.n_identificacion, bold: true },
                  ', goza del beneficio de ',
                  { text: `${data.beneficio.toUpperCase()},`, bold: true }, // ✅ Se mantiene la coma correctamente
                  ' otorgado a partir del ',
                  { text: `${data.fecha_inicio},`, bold: true }, // ✅ Se mantiene la coma correctamente
                  data.fecha_fin ? ' con fecha de finalización ' : '',
                  data.fecha_fin ? { text: `${data.fecha_fin},`, bold: true } : '',
                  ' cuyo monto asciende a la cantidad de ',
                  { text: data.monto_letras.toUpperCase(), bold: true },
                  ' (L. ',
                  { text: data.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bold: true },
                  '), y por el término de ',
                  { text: `${data.num_rentas_aprobadas || 'INDEFINIDO'}`, bold: true },
                  ' rentas.'
              ],
              style: 'body'
          },

          {
              text: [
                  'Y para los fines que el interesado estime convenientes, se extiende el presente documento en la ciudad de ',
                  { text: dto.municipio.charAt(0).toUpperCase() + dto.municipio.slice(1).toLowerCase(), bold: true },
                  ', ',
                  { text: dto.departamento.charAt(0).toUpperCase() + dto.departamento.slice(1).toLowerCase(), bold: true },
                  ', el ',
                  { text: formattedDate, bold: true },
                  '.'
              ],
              style: 'body'
          },

          { text: '\n\n\n\n\n\n\n\n\n' }, // Espaciado antes de la firma
          
          // 📌 Firma
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 0, 0, 0] },
          { text: dto.nombreEmpleado, style: 'signature' },
          { text: dto.nombrePuesto, style: 'signatureTitle' }
      ];

      return {
          pageSize: 'A4',
          pageMargins: [40, 120, 40, 85],
          background: {
              image: data.base64data,
              width: 595.28,
              height: 841.89
          },
          content: content,
          footer: (currentPage, pageCount) => ({
              table: {
                  widths: ['*', '*', '*'],
                  body: [
                      [
                          { text: 'Fecha y Hora: ' + today.toLocaleString(), alignment: 'left', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Generado por: ' + user, alignment: 'center', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Página: ' + currentPage + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: 'footerText' }
                      ]
                  ]
              },
              margin: [20, 0, 20, 20]
          }),
          styles: {
              mainTitle: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 30, 0, 20] },
              body: { fontSize: 12, alignment: 'justify', margin: [40, 10, 40, 5], lineHeight: 1.5 },
              signature: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 10, 0, 0] },
              signatureTitle: { fontSize: 12, alignment: 'center' },
              footerText: { fontSize: 8 }
          }
      };
  };

  return this.generateConstancia(data, includeQR, templateFunction);
}

async generateConstanciaBeneficiariosSinPago(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
  const templateFunction = async (data: any, includeQR: boolean) => {
    const today = new Date();
    const formattedDate = `${today.getDate()} de ${today.toLocaleString('es-HN', { month: 'long' })} del ${today.getFullYear()}.`;
    const user = dto.correo.split('@')[0];

    const nombre_completo = (data?.nombre_completo || 'NO DEFINIDO').toUpperCase();
    const n_identificacion = (data?.n_identificacion || 'SIN IDENTIFICACIÓN').toUpperCase();

    const content: Array<any> = [
      { text: 'A QUIEN INTERESE', style: 'mainTitle' },

      {
        text: [
          'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que ',
          { text: nombre_completo, bold: true },
          ', con número de identificación ',
          { text: n_identificacion, bold: true },
          ', gozaba del beneficio de ',
          { text: `${data.beneficio.toUpperCase()},`, bold: true }, // ✅ Se mantiene la coma correctamente
          ' y sus beneficiarios ',
          { text: 'no han recibido', bold: true },
          ' beneficio causado por el(la) docente fallecido(a).'
        ],
        style: 'body'
      },

      {
        text: [
          'Y para los fines que el interesado estime convenientes, se extiende el presente documento en la ciudad de ',
          { text: dto.municipio.charAt(0).toUpperCase() + dto.municipio.slice(1).toLowerCase(), bold: true },
          ', ',
          { text: dto.departamento.charAt(0).toUpperCase() + dto.departamento.slice(1).toLowerCase(), bold: true },
          ', el ',
          { text: formattedDate, bold: true } // ✅ Eliminación de espacio innecesario después de la fecha
        ],
        style: 'body'
      },

      { text: '\n\n\n\n\n\n\n\n\n' }, // Espaciado antes de la firma

      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }],
        margin: [127, 0, 0, 0]
      },

      { text: dto.nombreEmpleado, style: 'signature', alignment: 'center' },
      { text: dto.nombrePuesto, style: 'signatureTitle', alignment: 'center' }
    ];

    return {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 85],
      background: {
        image: data.base64data,
        width: 595.28,
        height: 841.89
      },
      content: content,
      footer: (currentPage, pageCount) => ({
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Fecha y Hora: ' + today.toLocaleString(), alignment: 'left', border: [false, false, false, false], style: 'footerText' },
              { text: 'Generado por: ' + user, alignment: 'center', border: [false, false, false, false], style: 'footerText' },
              { text: 'Página: ' + currentPage + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: 'footerText' }
            ]
          ]
        },
        margin: [20, 0, 20, 20]
      }),
      styles: {
        mainTitle: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 30, 0, 20] },
        body: { fontSize: 12, alignment: 'justify', margin: [40, 10, 40, 5], lineHeight: 1.5 },
        signature: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 10, 0, 0] },
        signatureTitle: { fontSize: 12, alignment: 'center' },
        footerText: { fontSize: 8 }
      }
    };
  };

  return this.generateConstancia(data, includeQR, templateFunction);
}

async generateConstanciaJubiladoFallecido(data: any, includeQR: boolean, dto: EmpleadoDto): Promise<Buffer> {
  const templateFunction = async (data: any, includeQR: boolean) => {
      const today = new Date();
      const formattedDate = `${today.getDate()} de ${today.toLocaleString('es-HN', { month: 'long' })} del ${today.getFullYear()}.`;
      const user = dto.correo.split('@')[0];

      const content: Array<any> = [
          { text: 'A QUIEN INTERESE', style: 'mainTitle' },
          {
              text: [
                  'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que ',
                  { text: data.nombre_completo.toUpperCase(), bold: true },
                  ', con número de identificación ',
                  { text: data.n_identificacion, bold: true },
                  ', gozaba del beneficio de ',
                  { text: data.beneficio.toUpperCase(), bold: true },
                  ', otorgado a partir del ',
                  { text: data.fecha_inicio, bold: true },
                  data.fecha_fin ? ', y con fecha de finalización el ' : '.',
                  data.fecha_fin ? { text: data.fecha_fin, bold: true } : '.'
              ],
              style: 'body'
          },
          {
              text: [
                  'Este beneficio fue aprobado con un monto de ',
                  { text: data.monto_letras.toUpperCase(), bold: true },
                  ' (L. ',
                  { text: data.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bold: true },
                  ').'
              ],
              style: 'body'
          },

          {
              text: [
                  'Y para los fines que el interesado estime convenientes, se extiende la presente confirmación en la ciudad de ',
                  { text: dto.municipio.charAt(0).toUpperCase() + dto.municipio.slice(1).toLowerCase(), bold: true },
                  ', ',
                  { text: dto.departamento.charAt(0).toUpperCase() + dto.departamento.slice(1).toLowerCase(), bold: true },
                  ', el ',
                  { text: formattedDate, bold: true }
              ],
              style: 'body'
          },

          { text: '\n\n\n\n\n\n\n\n\n' }, // Espaciado antes de la firma
          
          // 📌 Firma
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 0, 0, 0] },
          { text: dto.nombreEmpleado, style: 'signature' },
          { text: dto.nombrePuesto, style: 'signatureTitle' }
      ];

      return {
          pageSize: 'A4',
          pageMargins: [40, 120, 40, 85],
          background: {
              image: data.base64data,
              width: 595.28,
              height: 841.89
          },
          content: content,
          footer: (currentPage, pageCount) => ({
              table: {
                  widths: ['*', '*', '*'],
                  body: [
                      [
                          { text: 'Fecha y Hora: ' + today.toLocaleString(), alignment: 'left', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Generado por: ' + user, alignment: 'center', border: [false, false, false, false], style: 'footerText' },
                          { text: 'Página: ' + currentPage + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: 'footerText' }
                      ]
                  ]
              },
              margin: [20, 0, 20, 20]
          }),
          styles: {
              mainTitle: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 30, 0, 20] },
              body: { fontSize: 12, alignment: 'justify', margin: [40, 10, 40, 5], lineHeight: 1.5 },
              signature: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 10, 0, 0] },
              signatureTitle: { fontSize: 12, alignment: 'center' },
              footerText: { fontSize: 8 }
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
            { text: `Tipo de Cuenta: COTIZACIONES`, style: 'personaInfo' },
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

  async generarConstanciaBeneficiarios(idPersona: string, dto: EmpleadoDto): Promise<Buffer> {
    const datos = await this.afiliacionService.getPersonaConPerfilYBeneficiarios(idPersona);

    if (!datos.data) {
      throw new Error(`No se encontraron datos para la persona con ID: ${idPersona}`);
    }

    const { persona, perfil, beneficiarios } = datos.data;
    const backgroundImageBase64 = await this.getMembreteBase64();
    const documentDefinition = this.getDocumentDefinition(persona, perfil, beneficiarios, backgroundImageBase64, dto);

    return new Promise((resolve, reject) => {
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  getDocumentDefinition(
    persona: any,
    perfil: any,
    beneficiarios: any[],
    backgroundImageBase64: string,
    dto: EmpleadoDto
  ): any {
    beneficiarios.forEach(item => {
      item.nombre = item.nombre_completo || 'N/A';
      item.fechaNacimiento = item.fecha_nacimiento || 'N/A';
      item.identidad = item.n_identificacion || 'N/A';
      item.parentesco = item.parentesco || 'N/A';
      item.porcentaje = item.porcentaje || 'N/A';
      item.direccion_residencia = item.direccion_residencia || 'N/A';
      item.telefono_1 = item.telefono_1 || 'N/A';
    });

    const opcionesFecha: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = new Date().toLocaleDateString('es-ES', opcionesFecha).toUpperCase();

    const afiliado = {
      nombre: persona.nombre_completo || 'N/A',
      grado_academico: persona.grado_academico || 'N/A',
      centroEducativo: perfil.nombre_centro_trabajo || 'N/A',
      municipioResidencia: perfil.nombre_municipio || 'N/A',
      departamentoResidencia: perfil.nombre_departamento || 'N/A',
      n_identificacion: persona.n_identificacion || 'N/A'
    };

    const body: any[][] = [
      [
        { text: 'N°', style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center' },
        { text: 'NOMBRE COMPLETO', style: 'tableHeader', alignment: 'center' },
        { text: 'FECHA DE NACIMIENTO', style: 'tableHeader', alignment: 'center' },
        { text: 'IDENTIDAD', style: 'tableHeader', alignment: 'center' },
        { text: 'PARENTESCO', style: 'tableHeader', alignment: 'center' },
        { text: '%', style: 'tableHeader', alignment: 'center' },
      ]
    ];

    beneficiarios.forEach((item, index) => {
      const fechaNacimiento = item.fechaNacimiento
        ? new Date(item.fechaNacimiento).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : 'N/A';

      body.push(
        [
          { text: (index + 1).toString(), rowSpan: 2, style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.nombre, style: 'tableRowLarge', alignment: 'center' },
          { text: fechaNacimiento, style: 'tableRowLarge', alignment: 'center' },
          { text: item.identidad, style: 'tableRowLarge', alignment: 'center' },
          { text: item.parentesco, style: 'tableRowLarge', alignment: 'center' },
          { text: item.porcentaje, style: 'tableRowLarge', alignment: 'center' },
        ],
        [
          {},
          { text: 'DIRECCIÓN', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.direccion_residencia, style: 'tableRowLarge', colSpan: 2, alignment: 'center' },
          { text: '', style: 'tableRowLarge' },
          { text: 'TELÉFONO/CEL', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.telefono_1, style: 'tableRowLarge', alignment: 'center' },
        ]
      );
    });

    return {
      pageMargins: [40, 100, 40, 10], // 📌 Subí un poco más la posición general
      background: function (currentPage: any, pageSize: any) {
        return {
          image: backgroundImageBase64,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        };
      },
      content: [
        {
          text: [
            'Señores de la Comisión Interventora del INPREMA\nPresente.\n\nYo ',
            { text: afiliado.nombre, bold: true },
            ', mayor de edad, laborando como docente en el nivel ',
            { text: afiliado.grado_academico, bold: true },
            ', del Centro Educativo ',
            { text: afiliado.centroEducativo || 'NOMBRE NO DISPONIBLE', bold: true },
            ', ubicado en el Municipio ',
            { text: afiliado.municipioResidencia, bold: true },
            ' del Departamento ',
            { text: afiliado.departamentoResidencia, bold: true },
            ', con Identidad N°. ',
            { text: afiliado.n_identificacion, bold: true },
            ', comparezco ante el Instituto Nacional de Previsión del magisterio a registrar mis beneficiarios legales de la manera siguiente:\n\n'
          ],
          style: 'introText',
          margin: [0, 5, 0, 10] // 📌 Ajusté la separación superior
        },
        {
          table: {
            widths: [20, '*', '*', '*', '*', '*'],
            body: body
          }
        },
        {
          text: '',
          margin: [0, 15, 0, 0] // 📌 Reducí espacio antes de "Lugar y Fecha"
        },
        {
          text: `LUGAR Y FECHA: ${dto.municipio}, ${dto.departamento}, ${fechaFormateada}`,
          style: 'subHeader',
          margin: [0, 10, 0, 5] // 📌 Subí la ubicación y fecha
        },
        {
          text: '(F) _______________________________',
          margin: [0, 20, 0, 15] // 📌 Subí la firma
        },
        {
          style: 'usoExclusivo',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'PARA USO EXCLUSIVO DEL INPREMA', style: 'tableHeader', alignment: 'center', fillColor: '#CCCCCC' }],
              [
                {
                  columns: [
                    {
                      width: '50%',
                      stack: [
                        { text: `NOMBRE DE EMPLEADO: ${dto.nombreEmpleado}`, margin: [0, 5] }, // 📌 Subí el texto del empleado
                        { text: `CÓDIGO DE EMPLEADO: ${dto.numero_empleado}`, margin: [0, 5] } // 📌 Subí el código
                      ],
                      style: 'subHeader'
                    },
                    {
                      width: '50%',
                      stack: [
                        { text: '________________________________', alignment: 'center', margin: [0, 25, 0, 0] }, // 📌 Subí la firma
                        { text: 'FIRMA Y SELLO', alignment: 'center', margin: [-10, 10, 0, 0] }
                      ],
                      style: 'subHeader'
                    }
                  ]
                }
              ]
            ]
          },
          margin: [0, 5, 0, 0] // 📌 Subí el bloque "Para Uso Exclusivo del INPREMA"
        }
      ],
      styles: {
        introText: { fontSize: 12, margin: [0, 0, 0, 10] },
        subHeader: { fontSize: 12, italics: true, margin: [0, 0, 0, 5] },
        tableHeader: { bold: true, fontSize: 12, fillColor: '#DDDDDD' },
        usoExclusivo: { margin: [0, 15, 0, 0] } // 📌 Ajusté el margen del bloque final
      }
    };
  }






}
