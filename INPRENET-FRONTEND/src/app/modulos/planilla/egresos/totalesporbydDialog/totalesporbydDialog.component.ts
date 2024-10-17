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
    @Inject(MAT_DIALOG_DATA) public data: { beneficios: any[], deduccionesInprema: any[], deduccionesTerceros: any[], codigoPlanilla: string, nombrePlanilla: string, mesPlanilla: string },
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
    try {
      const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

      const totalBeneficios = this.data.beneficios.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);
      const totalDeduccionesInprema = this.data.deduccionesInprema.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
      const totalDeduccionesTerceros = this.data.deduccionesTerceros.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
      const netoTotal = totalBeneficios - (totalDeduccionesInprema + totalDeduccionesTerceros);

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'LETTER',
        background: (currentPage, pageSize) => ({
          image: base64Image,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }),
        pageMargins: [40, 150, 40, 100],
        header: {
          text: `TOTALES BENEFICIOS Y DEDUCCIONES DE PLANILLA ${this.data.nombrePlanilla}`,
          style: 'header',
          alignment: 'center',
          margin: [50, 80, 50, 0]
        },
        content: [
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
                  `L ${netoTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                ],
                alignment: 'right'
              }
            ],
            margin: [40, 5, 40, 10]
          },
          { text: 'Beneficios', style: 'subheader', margin: [0, 10, 0, 5] },
          this.crearTablaPDF(this.data.beneficios, 'Beneficios', `Total Beneficios: L${totalBeneficios.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

          { text: 'Deducciones INPREMA', style: 'subheader', margin: [0, 10, 0, 5] },
          this.crearTablaPDF(this.data.deduccionesInprema, 'Deducciones INPREMA', `Total Deducciones INPREMA: L${totalDeduccionesInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

          { text: 'Deducciones de Terceros', style: 'subheader', margin: [0, 10, 0, 5] },
          this.crearTablaPDF(this.data.deduccionesTerceros, 'Deducciones Terceros', `Total Deducciones Terceros: L${totalDeduccionesTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

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
                margin: [0, 40, 0, 5]  // Ajustar el espacio entre la última tabla y la línea de firma
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
                margin: [0, 40, 0, 5]  // Ajustar el espacio entre la última tabla y la línea de firma
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
                margin: [0, 40, 0, 5]  // Ajustar el espacio entre la última tabla y la línea de firma
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
                margin: [0, 5, 0, 20]  // Espaciado después de la línea de firma
              },
              {
                width: '33%',
                text: 'REVISÓ',
                style: 'signature',
                alignment: 'center',
                margin: [0, 5, 0, 20]  // Espaciado después de la línea de firma
              },
              {
                width: '33%',
                text: 'AUTORIZÓ',
                style: 'signature',
                alignment: 'center',
                margin: [0, 5, 0, 20]  // Espaciado después de la línea de firma
              }
            ]
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true },
          subheader: { fontSize: 14, bold: false, margin: [0, 5, 0, 10] },
          tableHeader: { bold: true, fontSize: 13, color: 'black' },
          tableTotal: { bold: true, fontSize: 13, color: 'black', alignment: 'right' },
          signature: { fontSize: 10, bold: true }
        },
        footer: (currentPage, pageCount) => ({
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Fecha y Hora: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false] },
                { text: 'Generó: INPRENET', alignment: 'left', border: [false, false, false, false] },
                { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] }
              ]
            ]
          },
          margin: [20, 0, 20, 20]
        }),
        defaultStyle: { fontSize: 10 },
        pageOrientation: 'portrait'
      };

      pdfMake.createPdf(docDefinition).download('Reporte_Totales_Beneficios_Deducciones.pdf');
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  }

  crearTablaPDF(data: any[], titulo: string, totalTexto: string) {
    // Definir encabezados de la tabla
    const headers = [
      { text: 'Nombre', style: 'tableHeader' },
      { text: 'Total', style: 'tableHeader', alignment: 'right' }
    ];

    // Mapear los datos a filas de la tabla, manejando posibles datos indefinidos
    const body = data.map(item => {
      const nombre = item?.nombre ?? item?.NOMBRE_DEDUCCION ?? 'N/A'; // Verificar nombres de deducciones
      const total = item?.total ?? item?.TOTAL_MONTO_DEDUCCION ? `L${Number(item.total ?? item.TOTAL_MONTO_DEDUCCION).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : 'L0.00';
      return [
        nombre,
        { text: total, alignment: 'right' }
      ];
    });

    // Añadir fila de total, verificando que el totalTexto esté definido
    if (totalTexto) {
      body.push([
        { text: totalTexto, style: 'tableTotal', colSpan: 2, alignment: 'right' }
      ]);
    }

    // Si no hay datos, agregar una fila que indique que no hay datos disponibles
    if (body.length === 0) {
      body.push([
        { text: 'No hay datos disponibles', colSpan: 2, alignment: 'center' }
      ]);
    }

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [headers, ...body]
      },
      layout: 'lightHorizontalLines'
    };
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
