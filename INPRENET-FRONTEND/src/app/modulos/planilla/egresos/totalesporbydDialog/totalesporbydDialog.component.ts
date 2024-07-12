import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    @Inject(MAT_DIALOG_DATA) public data: { beneficios: any[], deducciones: any[], codigoPlanilla: string, nombrePlanilla: string, mesPlanilla: string },
    private http: HttpClient
  ) {
    this.dataSourceBeneficios = new MatTableDataSource<any>(this.data.beneficios);
    this.dataSourceDeducciones = new MatTableDataSource<any>(this.data.deducciones);
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

    // Verificar y calcular los totales
    this.totalBeneficios = this.dataSourceBeneficios.data.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);
    this.totalDeducciones = this.dataSourceDeducciones.data.reduce((acc, cur) => acc + (cur.total ? parseFloat(cur.total) : 0), 0);

    const netoTotal = this.totalBeneficios - this.totalDeducciones;

    const docDefinition: TDocumentDefinitions = {
      background: (currentPage, pageSize) => ({
        image: base64Image,
        width: pageSize.width,
        height: pageSize.height,
        absolutePosition: { x: 0, y: 0 }
      }),
      pageMargins: [40, 150, 40, 100],
      header: () => [
        {
          text: this.data.nombrePlanilla,
          style: 'header',
          alignment: 'center',
          margin: [0, 80, 0, 0]
        },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Código de Planilla: ', bold: true },
                `${this.data.codigoPlanilla}\n`,
                { text: 'Mes de la Planilla: ', bold: true },
                `${this.data.mesPlanilla}`,
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
        }
      ],
      content: [
        { text: 'Reporte de Beneficios', style: 'header' },
        this.crearTablaPDF(this.dataSourceBeneficios.data, 'Beneficios', `Total de beneficios: ${this.totalBeneficios}`, this.totalDeducciones),
        { text: 'Reporte de Deducciones', style: 'header', pageBreak: 'before' },
        this.crearTablaPDF(this.dataSourceDeducciones.data, 'Deducciones', `Total de deducciones: ${this.totalDeducciones}`, this.totalDeducciones),
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
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('Reporte_Beneficios_Deducciones.pdf');
  }

  crearTablaPDF(data: any[], titulo: string, totalTexto: string, total: number) {
    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [{ text: titulo, style: 'tableHeader', colSpan: 2 }, {}],
          ...data.map(el => [el.nombre, { text: `L${Number(el.total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, alignment: 'right' }]),
          [{ text: totalTexto, style: 'tableTotal', alignment: 'right', colSpan: 2 }, { text: `L${Number(total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableTotal', alignment: 'right' }]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
