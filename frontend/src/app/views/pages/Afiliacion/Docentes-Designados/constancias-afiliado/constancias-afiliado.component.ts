import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-constancias-afiliado',
  templateUrl: './constancias-afiliado.component.html',
  styleUrls: ['./constancias-afiliado.component.scss']
})
export class ConstanciasAfiliadoComponent {
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;

  constructor(
    private http: HttpClient
  ){
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  menuItems = [
    { name: 'Generar Constancia de Renuncia CAP', action: this.generarConstanciaRenunciaCap.bind(this) },
    { name: 'Generar Constancia de Afiliación', action: this.generarConstanciaAfiliacion.bind(this) },
    { name: 'Generar Constancia de No Cotizar', action: this.generarConstanciaNoCotizar.bind(this) },
  ];

  async getMembreteBase64() {
    const response: any = await this.http.get('/assets/images/MEMBRETADO.jpg', { responseType: 'blob' }).toPromise();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(response);
    });
  }

  async generarConstanciaRenunciaCap() {
    const base64data = await this.getMembreteBase64();
    const afiliado = this.Afiliado;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 40],
      background: {
        image: base64data,
        width: 595.28,
        height: 841.89
      },
      content: [
        { text: 'CONSTANCIA', style: 'header' },
        {
          text: [
            'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que el/la Docente: ',
            { text: `${afiliado.nameAfil}`, bold: true },
            ' con Identidad No. ',
            { text: `${afiliado.DNI}`, bold: true },
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
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 120, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ],
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
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  async generarConstanciaAfiliacion() {
    const base64data = await this.getMembreteBase64();
    const afiliado = this.Afiliado;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 40],
      background: {
        image: base64data,
        width: 595.28,
        height: 841.89
      },
      content: [
        { text: 'A QUIEN INTERESE', style: 'header' },
        {
          text: 'El Instituto Nacional de Previsión del Magisterio (INPREMA), por este medio indica que:',
          style: 'subheader'
        },
        {
          text: unirNombres(afiliado.PRIMER_NOMBRE, afiliado.SEGUNDO_NOMBRE, afiliado.TERCER_NOMBRE, afiliado.PRIMER_APELLIDO, afiliado.SEGUNDO_APELLIDO),
          style: 'name'
        },
        {
          text: [
            { text: 'Se encuentra afiliado a este Sistema de Previsión con el número ' },
            { text: `${afiliado.DNI}`, style: 'dni' }
          ],
          style: 'body'
        },
        {
          text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de Tegucigalpa, Departamento de Francisco Morazán, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
          style: 'body'
        },
        { text: '\n\n\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 120, 0, 0] },
        { text: 'Fabiola Caceres', style: 'signature' },
        { text: 'Jefe Departamento de Afiliación', style: 'signatureTitle' }
      ],
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
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  async generarConstanciaNoCotizar() {
    const base64data = await this.getMembreteBase64();
    const afiliado = this.Afiliado;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 40],
      background: {
        image: base64data,
        width: 595.28,
        height: 841.89
      },
      content: [
        { text: 'A QUIEN INTERESE', style: 'header' },
        {
          text: [
            'El Departamento de Atención al Docente del Instituto Nacional de Previsión del Magisterio, (INPREMA) INFORMA que el(la) Sr.(Sra.): ',
            { text: `${afiliado.nameAfil}`, bold: true },
            ' con Identidad No. ',
            { text: `${afiliado.DNI}`, bold: true },
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
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 120, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ],
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
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}
