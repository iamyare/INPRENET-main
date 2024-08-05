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
        const base64Image = await this.convertirImagenABase64('assets/images/HOJA-MEMBRETADA.jpg');

        const totalBeneficios = data.beneficios.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);
        const totalDeduccionesInprema = data.deduccionesInprema.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
        const totalDeduccionesTerceros = data.deduccionesTerceros.reduce((acc:any, cur:any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
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
            text: `TOTALES BENEFICIOS Y DEDUCCIONES DE PLANILLA ${nombrePlanilla}`,
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
                    /* { text: 'Código de Planilla: ', bold: true },
                    nombrePlanilla,
                    '\n', */
                    { text: 'Mes de la Planilla: ', bold: true },
                    `${mes}/${anio}`
                  ],
                  alignment: 'left'
                },
                {
                  width: '50%',
                  text: [
                    { text: 'Total de planilla: ', bold: true },
                    `L ${netoTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ],
                  alignment: 'right'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            { text: 'Beneficios', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.beneficios, 'Beneficios', `Total Beneficios: L${totalBeneficios.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'Deducciones INPREMA', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.deduccionesInprema, 'Deducciones INPREMA', `Total Deducciones INPREMA: L${totalDeduccionesInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'Deducciones de Terceros', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(data.deduccionesTerceros, 'Deducciones Terceros', `Total Deducciones Terceros: L${totalDeduccionesTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

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
                  { text: 'Generó: ', alignment: 'left', border: [false, false, false, false] },
                  { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] }
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

    this.planillaService.getTotalMontosPorBancoYPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla).subscribe({
      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('assets/images/HOJA-MEMBRETADA.jpg');

        const totalMonto = data.reduce((acc: any, cur: any) => acc + (cur.MONTO_NETO ? parseFloat(cur.MONTO_NETO) : 0), 0);

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
            text: `MONTOS PAGADOS POR PLANILLA ${nombrePlanilla}`,
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
                    { text: 'Mes de la Planilla: ', bold: true },
                    `${mes}/${anio}`
                  ],
                  alignment: 'left'
                },
                {
                  width: '50%',
                  text: [
                    { text: 'Total de planilla: ', bold: true },
                    `L ${totalMonto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ],
                  alignment: 'right'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            { text: 'Montos Pagados por Banco', style: 'subheader', margin: [0, 0, 0, 5] },
            this.crearTablaMontosPorBanco(data, 'Montos Pagados por Banco', `Total de montos pagados: L ${totalMonto.toFixed(2)}`, [0, 0, 0, 10]),
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
                  { text: 'Generó: ', alignment: 'left', border: [false, false, false, false] },
                  { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] }
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
        //this.toastr.error('Error al obtener los datos');
      }
    });
  }

  crearTablaMontosPorBanco(data: any[], titulo: string, totalTexto: string, margin: [number, number, number, number]) {
    const formatAmount = (amount: number) => amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const totals = data.reduce((acc, cur) => {
      acc.totalBeneficio += cur.TOTAL_BENEFICIO ? parseFloat(cur.TOTAL_BENEFICIO) : 0;
      acc.deduccionesInprema += cur.DEDUCCIONES_INPREMA ? parseFloat(cur.DEDUCCIONES_INPREMA) : 0;
      acc.deduccionesTerceros += cur.DEDUCCIONES_TERCEROS ? parseFloat(cur.DEDUCCIONES_TERCEROS) : 0;
      acc.montoNeto += cur.MONTO_NETO ? parseFloat(cur.MONTO_NETO) : 0;
      return acc;
    }, { totalBeneficio: 0, deduccionesInprema: 0, deduccionesTerceros: 0, montoNeto: 0 });

    const formattedTotalText = `Total de ${titulo}: L ${formatAmount(totals.montoNeto)}`;

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'Nombre del Banco', style: 'tableHeader' },
            { text: 'Total Beneficio', style: 'tableHeader', alignment: 'right' },
            { text: 'Deducciones INPREMA', style: 'tableHeader', alignment: 'right' },
            { text: 'Deducciones Terceros', style: 'tableHeader', alignment: 'right' },
            { text: 'Monto Neto Pagado', style: 'tableHeader', alignment: 'right' }
          ],
          ...data.map(el => {
            const nombre = el.NOMBRE_BANCO || 'NO TIENE CUENTA';
            const totalBeneficio = el.TOTAL_BENEFICIO ? formatAmount(parseFloat(el.TOTAL_BENEFICIO)) : '0.00';
            const deduccionesInprema = el.DEDUCCIONES_INPREMA ? formatAmount(parseFloat(el.DEDUCCIONES_INPREMA)) : '0.00';
            const deduccionesTerceros = el.DEDUCCIONES_TERCEROS ? formatAmount(parseFloat(el.DEDUCCIONES_TERCEROS)) : '0.00';
            const montoNeto = el.MONTO_NETO ? formatAmount(parseFloat(el.MONTO_NETO)) : '0.00';
            return [
              nombre,
              { text: `L ${totalBeneficio}`, alignment: 'right' },
              { text: `L ${deduccionesInprema}`, alignment: 'right' },
              { text: `L ${deduccionesTerceros}`, alignment: 'right' },
              { text: `L ${montoNeto}`, alignment: 'right' }
            ];
          }),
          [
            { text: 'Total', style: 'tableTotal', alignment: 'right' },
            { text: `L ${formatAmount(totals.totalBeneficio)}`, alignment: 'right' },
            { text: `L ${formatAmount(totals.deduccionesInprema)}`, alignment: 'right' },
            { text: `L ${formatAmount(totals.deduccionesTerceros)}`, alignment: 'right' },
            { text: `L ${formatAmount(totals.montoNeto)}`, alignment: 'right' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: margin
    };
  }

}
