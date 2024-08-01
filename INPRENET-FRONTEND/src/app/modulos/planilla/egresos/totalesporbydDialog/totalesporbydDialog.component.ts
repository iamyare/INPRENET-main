import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-totalesporbydDialog',
  templateUrl: './totalesporbydDialog.component.html',
  styleUrls: ['./totalesporbydDialog.component.css']
})
export class TotalesporbydDialogComponent implements OnInit {
  @ViewChild('paginatorBeneficios', { static: true }) paginatorBeneficios!: MatPaginator;
  @ViewChild('paginatorDeduccionesInprema', { static: true }) paginatorDeduccionesInprema!: MatPaginator;
  @ViewChild('paginatorDeduccionesTerceros', { static: true }) paginatorDeduccionesTerceros!: MatPaginator;

  dataSourceBeneficios: MatTableDataSource<any>;
  dataSourceDeduccionesInprema: MatTableDataSource<any>;
  dataSourceDeduccionesTerceros: MatTableDataSource<any>;
  displayedColumns: string[] = ['nombre', 'total'];

  constructor(
    public dialogRef: MatDialogRef<TotalesporbydDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { beneficios: any[], deduccionesInprema: any[], deduccionesTerceros: any[] },
    private http: HttpClient
  ) {
    this.dataSourceBeneficios = new MatTableDataSource<any>(this.data.beneficios);
    this.dataSourceDeduccionesInprema = new MatTableDataSource<any>(this.data.deduccionesInprema);
    this.dataSourceDeduccionesTerceros = new MatTableDataSource<any>(this.data.deduccionesTerceros);

  }

  ngOnInit(): void {
    this.dataSourceBeneficios.paginator = this.paginatorBeneficios;
    this.dataSourceDeduccionesInprema.paginator = this.paginatorDeduccionesInprema;
    this.dataSourceDeduccionesTerceros.paginator = this.paginatorDeduccionesTerceros;
  }

  aplicarFiltro(event: Event, dataSource: MatTableDataSource<any>) {
    const filtro = (event.target as HTMLInputElement).value;
    dataSource.filter = filtro.trim().toLowerCase();
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

  async generarPDF() {
    /* const base64Image = await this.convertirImagenABase64('assets/images/HOJA-MEMBRETADA.jpg');

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
            text: `TOTALES BENEFICIOS Y DEDUCCIONES DE PLANILLA ${this.data.nombrePlanilla}`,
            style: 'header',
            alignment: 'center',
            margin: [50, 80, 50, 0]
          },
          {
            columns: [
              {
                width: '50%',
                text: [
                  { text: 'Código de Planilla: ', bold: true },
                  this.data.codigoPlanilla,
                  '\n',
                  { text: 'Mes de la Planilla: ', bold: true },
                  this.data.mesPlanilla
                ],
                alignment: 'left'
              },
              {
                width: '50%',
                text: [
                  { text: 'Neto Total: ', bold: true },
                  `L ${this.data.totales.reduce((acc, cur) => acc + cur.neto, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
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
        this.crearTablaPDF(this.data.totales, 'Totales', `Total Neto: L${this.data.totales.reduce((acc, cur) => acc + cur.neto, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),
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

    pdfMake.createPdf(docDefinition).download('Reporte_Totales_Beneficios_Deducciones.pdf'); */
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
            el.idBeneficio,
            el.nombreBeneficio,
            { text: `L${Number(el.totalMontoBeneficio).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.deduccionesInprema).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.deduccionesTerceros).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' },
            { text: `L${Number(el.neto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' }
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

  closeDialog(): void {
    this.dialogRef.close();
  }
}
