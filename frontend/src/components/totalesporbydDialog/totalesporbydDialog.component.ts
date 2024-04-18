import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Component({
  selector: 'app-totalesporbydDialog',
  templateUrl: './totalesporbydDialog.component.html',
  styleUrls: ['./totalesporbydDialog.component.css']
})
export class TotalesporbydDialogComponent implements OnInit {

  @ViewChild('paginatorBeneficios', { static: true }) paginatorBeneficios!: MatPaginator;
  @ViewChild('paginatorDeducciones', { static: true }) paginatorDeducciones!: MatPaginator;


  dataSourceBeneficios: MatTableDataSource<any>;
  dataSourceDeducciones: MatTableDataSource<any>;
  displayedColumns: string[] = ['nombre', 'total'];
  totalBeneficios: number = 0;
  totalDeducciones: number = 0;

  constructor(
    public dialogRef: MatDialogRef<TotalesporbydDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { beneficios: any[], deducciones: any[] },
    private http: HttpClient
  ) {
    this.dataSourceBeneficios = new MatTableDataSource<any>(this.data.beneficios);
    this.dataSourceDeducciones = new MatTableDataSource<any>(this.data.deducciones);
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.dataSourceBeneficios.paginator = this.paginatorBeneficios;
    this.dataSourceDeducciones.paginator = this.paginatorDeducciones;
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
    const base64Image = await this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg');
    this.totalBeneficios = this.dataSourceBeneficios.data.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);
    this.totalDeducciones = this.dataSourceDeducciones.data.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);

    const docDefinition: TDocumentDefinitions = {
      background: function(currentPage, pageSize) {
        return {
          image: base64Image,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        };
      },
      content: [
        { text: '\n\n\n\n\nReporte de Beneficios', style: 'header' },
        this.crearTablaPDF(this.dataSourceBeneficios.data, 'Beneficios'),
        { text: 'Reporte de Deducciones', style: 'header' },
        this.crearTablaPDF(this.dataSourceDeducciones.data, 'Deducciones'),
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Valor Neto', style: 'header' }, { text: `L ${Number(this.totalBeneficios - this.totalDeducciones).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'totalNeto' }]
            ]
          },
          layout: 'noBorders'
        },
        {
          columns: [
            {
              width: '*',
              text: ''
            },
            {
              width: 'auto',
              stack: [
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ]
                },
                {
                  text: 'P Smith\nDirector General',
                  style: 'signatureName'
                }
              ],
              margin: [0, 5] // Adjust margin to position the signature properly
            }
          ],
          // This positions the entire columns object at the bottom of the page.
          absolutePosition: { x: 0, y: 720 } // Adjust the 'y' value as needed.
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
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
        signatureName: {
          alignment: 'center',
          bold: true,
          margin: [0, 5] // Adjust margin to position the name text properly
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('Reporte_Beneficios_Deducciones.pdf');
  }

  crearTablaPDF(data: any[], titulo: string) {
    const total = data.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Nombre', style: 'tableHeader', colSpan: 2  }, { text: 'Total de ingresos:', style: 'tableHeader' }],
          ...data.map(el => [el.nombre, {text: "L" + Number(el.total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","), alignment: 'right'}]), // Alineación a la derecha para la última columna
          [{ text: 'Total de deducciones:', style: 'tableTotal', alignment: 'right', colSpan: 1 }, { text: "L" + Number(total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","), style: 'tableTotal' }]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
