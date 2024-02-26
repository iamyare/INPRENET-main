import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Component({
  selector: 'app-ver-editar-beneficio-afil',
  templateUrl: './ver-editar-beneficio-afil.component.html',
  styleUrl: './ver-editar-beneficio-afil.component.scss'
})
export class VerEditarBeneficioAfilComponent {

  backgroundImageBase64: string = '';

  constructor(
    private http: HttpClient
  ){
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al convertir la imagen a Base64', error);
    });
  }

  personData = {
    name: "Cristian Garay",
    email: "cristiangaray@gmail.com",
    orderNumber: "C95B670AC",
    payment: {
      method: "Webpay Redcompra",
      total: 11415,
      date: "26 de Octubre de 2017 12:42"
    }
  };

  dataPrueba = {
    ingresos: [
      { nombre_ingreso: "pensión por vejez", monto: 5000 },
      { nombre_ingreso: "Beneficio por incapacidad", monto: 6000 }
    ],
    deducciones: [
      { nombre_deduccion: "préstamos", total_deduccion: 2000 },
      { nombre_deduccion: "intereses", total_deduccion: 3000 }
    ]
  };

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

  generateVoucher() {
    let docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Comprobante de Pago', style: 'header' },
        { text: 'Nº Orden: ' + this.personData.orderNumber, style: 'subheader' },
        {
          image: this.backgroundImageBase64,
          width: 595, // Ancho de una página A4 en puntos. Ajusta según necesidad
          height: 842, // Altura de una página A4 en puntos. Ajusta según necesidad
          absolutePosition: {x: 0, y: 0}, // Posición en la esquina superior izquierda
        },
        {
          columns: [
            [
              { text: 'Cliente', style: 'subheader' },
              { text: 'Nombre: ' + this.personData.name },
              { text: 'Email: ' + this.personData.email },
            ],
            [
              { text: 'Pago', style: 'subheader' },
              { text: 'Medio de Pago: ' + this.personData.payment.method },
              { text: 'Pago Total: $' + this.personData.payment.total.toFixed(2) },
              { text: 'Fecha de pago: ' + this.personData.payment.date },
            ]
          ]
        },
        this.buildTable('Ingresos', this.dataPrueba.ingresos, ['nombre_ingreso', 'monto'], 'monto'),
        this.buildTable('Deducciones', this.dataPrueba.deducciones, ['nombre_deduccion', 'total_deduccion'], 'total_deduccion'),
        { text: 'Neto: $' + this.calculateNet(this.dataPrueba).toFixed(2), style: 'subheader' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  buildTable(header: string, data: any[], columns: string[], sumColumn: string) {
    let body = [
      [{ text: header, style: 'tableHeader', colSpan: 2 }, {}],
      ...data.map(item => columns.map(column => item[column]))
    ];

    let total = data.reduce((acc, curr) => acc + curr[sumColumn], 0);
    body.push([{ text: 'Total', style: 'tableHeader' }, { text: '$' + total.toFixed(2), alignment: 'right' }]);

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: body
      },
      layout: 'lightHorizontalLines'
    };
  }

  calculateNet(data: any): number {
    const totalIngresos = data.ingresos.reduce((acc:any, curr:any) => acc + curr.monto, 0);
    const totalDeducciones = data.deducciones.reduce((acc:any, curr:any) => acc + curr.total_deduccion, 0);
    return totalIngresos - totalDeducciones;
  }
}


