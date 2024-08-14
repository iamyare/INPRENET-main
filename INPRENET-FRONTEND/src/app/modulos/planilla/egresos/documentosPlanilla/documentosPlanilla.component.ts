import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-documentosPlanilla',
  templateUrl: './documentosPlanilla.component.html',
  styleUrls: ['./documentosPlanilla.component.scss']
})
export class DocumentosPlanillaComponent implements OnInit {
  planillaForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private planillaService: PlanillaService) {
    this.planillaForm = this.fb.group({
      mes: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]],
      anio: ['', [Validators.required, Validators.pattern('^\\d{4}$')]]
    });
  }

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

    this.planillaService.getTotalBeneficiosYDeduccionesPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla).subscribe({
      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('assets/images/membratadoFinal.jpg');

        const totalBeneficios = data.beneficios.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);
        const totalDeduccionesInprema = data.deduccionesInprema.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
        const totalDeduccionesTerceros = data.deduccionesTerceros.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);

        const totalMontoConCuenta = data.beneficiosSC
        .filter((cur:any) => cur.NOMBRE_BANCO == 'SIN BANCO')
        .reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);
        
        const netoTotal = totalBeneficios - (totalDeduccionesInprema + totalDeduccionesTerceros + totalMontoConCuenta) ;

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          background: (currentPage, pageSize) => ({
            image: base64Image,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 }
          }),
          pageMargins: [40, 130, 40, 100],
          header: {
            text: `RESUMEN DE PLANILLA ${nombrePlanilla}`,
            style: 'header',
            alignment: 'center',
            margin: [50, 90, 50, 0]
          },
          content: [
            {
              columns: [
                {
                  width: '50%',
                  text: [
                    /* { text: 'Código de Planilla: ', bold: true },
                    nombrePlanilla,
                    '\n', */
                    { text: 'MES DE LA PLANILLA: ', bold: true },
                    `${mes}/${anio}`
                  ],
                  alignment: 'left'
                },
                {
                  width: '50%',
                  text: [
                    { text: 'MONTO NETO DE LA PLANILLA: ', bold: true },
                    `L ${netoTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ],
                  alignment: 'right'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            { text: 'BENEFICIOS A PAGAR', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.beneficios, 'Beneficios', `TOTAL BENEFICIOS: L${totalBeneficios.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'DEDUCCIONES INPREMA', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.deduccionesInprema, 'DEDUCCIONES INPREMA', `TOTAL DEDUCCIONES INPREMA: L${totalDeduccionesInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'DEDUCCIONES DE TERCEROS', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.deduccionesTerceros, 'DEDUCCIONES TERCEROS', `TOTAL DEDUCCIONES TERCEROS: L${totalDeduccionesTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

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
            header: { fontSize: 16, bold: true },
            subheader: { fontSize: 14, bold: false, margin: [0, 5, 0, 10] },
            tableHeader: { bold: true, fontSize: 13, color: 'black' },
            tableBody: { fontSize: 8, color: 'black' },  // Texto más pequeño para las celdas de la tabla
            tableTotal: { bold: true, fontSize: 13, color: 'black', alignment: 'right' },
            signature: { fontSize: 10, bold: true }
          },
          footer: (currentPage, pageCount) => ({
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: 'FECHA Y HORA: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false],  fontSize: 8 },
                  { text: 'GENERÓ: INPRENET', alignment: 'left', border: [false, false, false, false] },
                  { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, alignment: 'right', border: [false, false, false, false], fontSize: 8 }
                ]
              ]
            },
            margin: [20, 0, 20, 20]
          }),
          defaultStyle: { fontSize: 10 },
          pageOrientation: 'portrait'
        };

        pdfMake.createPdf(docDefinition).download(`Reporte_Totales_Beneficios_Deducciones_${nombrePlanilla}.pdf`);
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
    const headers = [
      { text: 'Nombre', style: 'tableHeader' },
      { text: 'Total', style: 'tableHeader', alignment: 'right' }
    ];

    const body = data.map(item => {
      const nombre = item?.NOMBRE_BENEFICIO ?? item?.NOMBRE_DEDUCCION ?? 'N/A';
      const total = item?.TOTAL_MONTO_BENEFICIO ?? item?.TOTAL_MONTO_DEDUCCION ? `L${Number(item.TOTAL_MONTO_BENEFICIO ?? item.TOTAL_MONTO_DEDUCCION).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : 'L0.00';
      return [
        nombre,
        { text: total, alignment: 'right' }
      ];
    });

    if (totalTexto) {
      body.push([
        { text: totalTexto, style: 'tableTotal', colSpan: 2, alignment: 'right' }
      ]);
    }

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

  async generarPDFMontosPorBancoPeriodo(tipo: string, mes: string, anio: string) {
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

    console.log(periodoFinalizacion);
    this.planillaService.getTotalMontosPorBancoYPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla).subscribe({

      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('assets/images/membratadoFinal.jpg');

        // Calcular solo el monto de "CON CUENTA"
        const totalMontoConCuenta = data
          .filter((cur:any) => cur.NOMBRE_BANCO !== 'SIN BANCO')
          .reduce((acc: any, cur: any) => acc + (cur.MONTO_NETO ? parseFloat(cur.MONTO_NETO) : 0), 0);

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          background: (currentPage, pageSize) => ({
            image: base64Image,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 }
          }),
          pageMargins: [40, 130, 40, 100],
          header: {
            text: `DESGLOSE POR BANCO EN LA PLANILLA ${nombrePlanilla}`,
            style: 'header',
            alignment: 'center',
            margin: [50, 100, 50, 0]
          },
          content: [
            {
              columns: [
                {
                  width: '50%',
                  text: [
                    { text: 'MES DE LA PLANILLA: ', bold: true },
                    `${mes}/${anio}`
                  ],
                  alignment: 'left'
                },
                {
                  width: '50%',
                  text: [
                    { text: 'MONTO NETO DE LA PLANILLA: ', bold: true },
                    `L ${totalMontoConCuenta.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ],
                  alignment: 'right'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            { text: 'MONTOS A PAGAR POR BANCO', style: 'subheader', margin: [0, 5, 0, 10] },
            ...this.crearTablaMontosPorBanco(data, 'MONTOS A PAGAR POR BANCO', `TOTAL DE MONTOS A PAGAR: L ${totalMontoConCuenta.toFixed(2)}`, [10, 10, 10, 10])
          ],
          styles: {
            header: { fontSize: 16, bold: true },
            subheader: { fontSize: 14, bold: false, margin: [0, 5, 0, 10] },
            tableHeader: { bold: true, fontSize: 13, color: 'black' },
            tableBody: { fontSize: 10, color: 'black' },
            tableTotal: { bold: true, fontSize: 13, color: 'black', alignment: 'right' },
            signature: { fontSize: 10, bold: true }
          },
          footer: (currentPage, pageCount) => ({
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: 'FECHA Y HORA: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], fontSize: 8 },
                  { text: 'GENERÓ: INPRENET', alignment: 'left', border: [false, false, false, false] },
                  { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, alignment: 'right', border: [false, false, false, false], fontSize: 8 }
                ]
              ]
            },
            margin: [20, 0, 20, 20]
          }),
          defaultStyle: { fontSize: 10 },
          pageOrientation: 'portrait'
        };

        pdfMake.createPdf(docDefinition).download(`Reporte_Montos_Por_Banco_${nombrePlanilla}.pdf`);
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }


  crearTablaMontosPorBanco(data: any[], titulo: string, totalTexto: string, margin: [number, number, number, number]) {
    const formatAmount = (amount: number) => amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Calcular montos agrupados
    const montosAgrupados = data.reduce((acc, cur) => {
        if (cur.NOMBRE_BANCO === 'SIN BANCO') {
            acc.sinCuenta.totalBeneficio += cur.TOTAL_BENEFICIO ? parseFloat(cur.TOTAL_BENEFICIO) : 0;
            acc.sinCuenta.deduccionesInprema += cur.DEDUCCIONES_INPREMA ? parseFloat(cur.DEDUCCIONES_INPREMA) : 0;
            acc.sinCuenta.deduccionesTerceros += cur.DEDUCCIONES_TERCEROS ? parseFloat(cur.DEDUCCIONES_TERCEROS) : 0;
            acc.sinCuenta.montoNeto += cur.MONTO_NETO ? parseFloat(cur.MONTO_NETO) : 0;
        } else {
            acc.conCuenta.totalBeneficio += cur.TOTAL_BENEFICIO ? parseFloat(cur.TOTAL_BENEFICIO) : 0;
            acc.conCuenta.deduccionesInprema += cur.DEDUCCIONES_INPREMA ? parseFloat(cur.DEDUCCIONES_INPREMA) : 0;
            acc.conCuenta.deduccionesTerceros += cur.DEDUCCIONES_TERCEROS ? parseFloat(cur.DEDUCCIONES_TERCEROS) : 0;
            acc.conCuenta.montoNeto += cur.MONTO_NETO ? parseFloat(cur.MONTO_NETO) : 0;
        }
        return acc;
    }, {
        conCuenta: { totalBeneficio: 0, deduccionesInprema: 0, deduccionesTerceros: 0, montoNeto: 0 },
        sinCuenta: { totalBeneficio: 0, deduccionesInprema: 0, deduccionesTerceros: 0, montoNeto: 0 }
    });

    // Primera tabla con las filas "CON CUENTA" y "SIN CUENTA"
    const tablaResumen = {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'TIPO DE CUENTA', style: 'tableHeader' },
            { text: 'TOTAL BENEFICIO', style: 'tableHeader', },
            { text: 'DEDUCCIONES INPREMA', style: 'tableHeader', },
            { text: 'DEDUCCIONES TERCEROS', style: 'tableHeader', },
            { text: 'MONTO NETO A PAGAR', style: 'tableHeader', }
          ],
          [
            { text: 'CON CUENTA', style: 'tableBody' },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.totalBeneficio)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesInprema)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesTerceros)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.montoNeto)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 }
          ],
          [
            { text: 'SIN CUENTA', style: 'tableBody' },
            { text: `L ${formatAmount(montosAgrupados.sinCuenta.totalBeneficio)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.sinCuenta.deduccionesInprema)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.sinCuenta.deduccionesTerceros)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.sinCuenta.montoNeto)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 }
          ],
          [
            { text: 'TOTAL', style: 'tableBody',  bold: true, alignment: 'center' },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.totalBeneficio + montosAgrupados.sinCuenta.totalBeneficio)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesInprema + montosAgrupados.sinCuenta.deduccionesInprema)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesTerceros + montosAgrupados.sinCuenta.deduccionesTerceros)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.montoNeto + montosAgrupados.sinCuenta.montoNeto)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: margin
    };

    // Segunda tabla con detalles por banco
    const tablaPorBanco = {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'NOMBRE DEL BANCO', style: 'tableHeader' },
            { text: 'TOTAL DEL BENEFICIO', style: 'tableHeader', },
            { text: 'DEDUCCIONES INPREMA', style: 'tableHeader', },
            { text: 'DEDUCCIONES TERCEROS', style: 'tableHeader', },
            { text: 'MONTO NETO A PAGAR', style: 'tableHeader', }
          ],
          ...data.filter(el => el.NOMBRE_BANCO !== 'SIN BANCO').map(el => {
            const nombre = el.NOMBRE_BANCO;
            const totalBeneficio = el.TOTAL_BENEFICIO ? formatAmount(parseFloat(el.TOTAL_BENEFICIO)) : '0.00';
            const deduccionesInprema = el.DEDUCCIONES_INPREMA ? formatAmount(parseFloat(el.DEDUCCIONES_INPREMA)) : '0.00';
            const deduccionesTerceros = el.DEDUCCIONES_TERCEROS ? formatAmount(parseFloat(el.DEDUCCIONES_TERCEROS)) : '0.00';
            const montoNeto = el.MONTO_NETO ? formatAmount(parseFloat(el.MONTO_NETO)) : '0.00';
            return [
              { text: nombre, style: 'tableBody' },
              { text: `L ${totalBeneficio}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
              { text: `L ${deduccionesInprema}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
              { text: `L ${deduccionesTerceros}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
              { text: `L ${montoNeto}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 }
            ];
          }),
          [
            { text: 'TOTAL', style: 'tableBody',   bold: true , alignment: 'center' },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.totalBeneficio)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesInprema)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.deduccionesTerceros)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 },
            { text: `L ${formatAmount(montosAgrupados.conCuenta.montoNeto)}`, style: 'tableBody', alignment: 'right', lineHeight: 1.15 }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: margin
    };

    return [tablaResumen, tablaPorBanco];
  }


  formatearFecha(fecha: Date): string {
    const dia = ("0" + fecha.getDate()).slice(-2);
    const mes = ("0" + (fecha.getMonth() + 1)).slice(-2);
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}


}
