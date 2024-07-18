import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-documentosPlanilla',
  templateUrl: './documentosPlanilla.component.html',
  styleUrls: ['./documentosPlanilla.component.scss']
})
export class DocumentosPlanillaComponent implements OnInit {

  constructor(private http: HttpClient, private planillaService: PlanillaService) { }

  ngOnInit() {
  }

  async generarDocumento(tipo: string, mes: string, anio: string) {
    let idTiposPlanilla: number[];
    let nombrePlanilla: string;
    const periodoInicio = `01/${mes}/${anio}`;
    const periodoFinalizacion = new Date(Number(anio), Number(mes), 0).toLocaleDateString('es-ES');

    if (tipo === 'ordinaria') {
      idTiposPlanilla = [1, 2];
      nombrePlanilla = 'ORDINARIA';
    } else if (tipo === 'complementaria') {
      idTiposPlanilla = [3, 4, 10];
      nombrePlanilla = 'COMPLEMENTARIA';
    } else if (tipo === 'extraordinaria') {
      idTiposPlanilla = [9, 8];
      nombrePlanilla = 'EXTRAORDINARIA';
    } else {
      console.error('Tipo de planilla no válido');
      return;
    }

    this.planillaService.getBeneficiosConDeducciones(periodoInicio, periodoFinalizacion, idTiposPlanilla).subscribe({
      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg');

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          background: (currentPage, pageSize) => ({
            image: base64Image,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 }
          }),
          pageMargins: [40, 150, 40, 100],
          header: (currentPage, pageCount, pageSize) => {
            return [
              {
                text: `PAGO DE PLANILLA ${nombrePlanilla}`,
                style: 'header',
                alignment: 'center',
                margin: [50, 80, 50, 0]
              },
              {
                columns: [
                  {
                    width: '50%',
                    text: [
                      { text: 'Mes de la Planilla: ', bold: true },
                      `${mes}/${anio}`
                    ],
                    alignment: 'left'
                  },
                  {
                    width: '50%',
                    text: [
                      { text: 'Neto Total: ', bold: true },
                      `L ${data.reduce((acc, cur) => acc + cur.NETO, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                    ],
                    alignment: 'right'
                  }
                ],
                margin: [40, 5, 40, 10]
              }
            ];
          },
          content: [
            { text: 'Reporte de Totales', style: 'header' },
            this.crearTablaPDF(data, 'Totales', `Total Neto: L${data.reduce((acc, cur) => acc + cur.NETO, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),
            {
              columns: [
                {
                  width: '33%',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ],
                  alignment: 'center',
                  margin: [0, 60, 0, 5]
                },
                {
                  width: '33%',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ],
                  alignment: 'center',
                  margin: [0, 60, 0, 5]
                },
                {
                  width: '33%',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ],
                  alignment: 'center',
                  margin: [0, 60, 0, 5]
                }
              ]
            },
            {
              columns: [
                {
                  width: '33%',
                  text: 'ELABORÓ',
                  style: 'signature',
                  alignment: 'center',
                  margin: [0, 5, 0, 20]
                },
                {
                  width: '33%',
                  text: 'REVISÓ',
                  style: 'signature',
                  alignment: 'center',
                  margin: [0, 5, 0, 20]
                },
                {
                  width: '33%',
                  text: 'AUTORIZÓ',
                  style: 'signature',
                  alignment: 'center',
                  margin: [0, 5, 0, 20]
                }
              ]
            }
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 10, 0, 10]
            },
            tableHeader: {
              bold: true,
              fontSize: 13,
              color: 'black'
            },
            tableTotal: {
              bold: true,
              fontSize: 13,
              color: 'black',
              alignment: 'right'
            },
            totalNeto: {
              fontSize: 16,
              bold: true,
              alignment: 'right'
            },
            signature: {
              fontSize: 16,
              bold: true
            }
          },
          footer: function (currentPage, pageCount) {
            return {
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'Fecha y Hora: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false] },
                    { text: 'Generó: ', alignment: 'left', border: [false, false, false, false] },
                    { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] }
                  ]
                ]
              },
              margin: [20, 0, 20, 20]
            };
          },
          defaultStyle: {
            fontSize: 10
          },
          pageOrientation: 'portrait'
        };

        pdfMake.createPdf(docDefinition).download(`Reporte_Beneficios_Deducciones_${tipo}.pdf`);
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }

  convertirImagenABase64(url: string): Promise<string> {
    return this.http.get(url, { responseType: 'blob' }).toPromise().then(blob => {
      return new Promise<string>((resolve, reject) => {
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        } else {
          reject('No se pudo cargar la imagen. El blob es undefined.');
        }
      });
    });
  }

  crearTablaPDF(data: any[], titulo: string, totalTexto: string) {
    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'Código', style: 'tableHeader' },
            { text: 'Nombre Beneficio', style: 'tableHeader' },
            { text: 'Total Monto Beneficio', style: 'tableHeader' },
            { text: 'Deducciones Inprema', style: 'tableHeader' },
            { text: 'Deducciones Terceros', style: 'tableHeader' },
            { text: 'Neto', style: 'tableHeader' }
          ],
          ...data.map(el => [
            el.ID_BENEFICIO,
            el.NOMBRE_BENEFICIO,
            { text: `L${Number(el.TOTAL_MONTO_BENEFICIO).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.DEDUCCIONES_INPREMA).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.DEDUCCIONES_DE_TERCEROS).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.NETO).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' }
          ]),
          [{ text: totalTexto, style: 'tableTotal', alignment: 'right', colSpan: 6 }, {}, {}, {}, {}, {}]
        ]
      },
      layout: {
        fillColor: function (rowIndex: any, node: any, columnIndex: any) {
          return (rowIndex === 0) ? '#CCCCCC' : null;
        },
        hLineWidth: function (i: any, node: any) {
          return (i === 0 || i === node.table.body.length) ? 2 : 1;
        },
        vLineWidth: function (i: any, node: any) {
          return (i === 0 || i === node.table.widths.length) ? 2 : 1;
        },
        hLineColor: function (i: any, node: any) {
          return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
        },
        vLineColor: function (i: any, node: any) {
          return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
        }
      }
    };
  }
}
