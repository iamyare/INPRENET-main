import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { format } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { DynamicInputDialogComponent } from 'src/app/components/dinamicos/dynamic-input-dialog/dynamic-input-dialog.component';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-documentosPlanilla',
  templateUrl: './documentosPlanilla.component.html',
  styleUrls: ['./documentosPlanilla.component.scss']
})
export class DocumentosPlanillaComponent implements OnInit {
  @Output() getElemSeleccionados = new EventEmitter<any>()
  planillaForm: FormGroup;
  tipoPlanilla: string | null = null;

  myColumns: any = [
    {
      header: 'codigo_planilla',
      col: 'codigo_planilla',

    },
    { header: 'secuencia', col: 'secuencia', },
    {
      header: 'estado',
      col: 'estado',
    },
    { header: 'periodoInicio', col: 'periodoInicio', },
    { header: 'periodoFinalizacion', col: 'periodoFinalizacion', },
  ];
  filas: any
  ejecF: any;
  desOBenSeleccionado: any
  fechaInicioFormateada: any;
  fechaFinFormateada: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private planillaService: PlanillaService, private deduccionesService: DeduccionesService, public dialog: MatDialog) {
    this.planillaForm = this.fb.group({
      rangoFechas: this.fb.group({
        fechaInicio: ['', Validators.required],
        fechaFin: ['', Validators.required],
      }, { validators: this.sameMonthValidator })
    });
  }

  ngOnInit() {
    this.planillaForm.get('rangoFechas.fechaInicio')?.valueChanges.subscribe(() => this.checkFechasCompletas());
    this.planillaForm.get('rangoFechas.fechaFin')?.valueChanges.subscribe(() => this.checkFechasCompletas());
    // Escuchar los cambios en el rango de fechas
    this.planillaForm.get('rangoFechas')?.valueChanges.subscribe((value) => {
      this.getFilas().then(() => this.cargar());
    });
  }

  getFilas = async () => {
    try {
      const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();
      if (fechaInicioFormateada && fechaFinFormateada) {
        const data = await this.planillaService.getPlanillasCerradaByFechas(fechaInicioFormateada, fechaFinFormateada).toPromise();
        this.filas = data.map((item: any) => ({
          id_planilla: item.id_planilla,
          codigo_planilla: item.codigo_planilla,
          fecha_apertura: item.fecha_apertura,
          fecha_cierre: item.fecha_cierre,
          secuencia: item.secuencia,
          estado: item.estado,
          periodoInicio: item.periodoInicio,
          periodoFinalizacion: item.periodoFinalizacion,
          tipoPlanilla: item.tipoPlanilla.nombre_planilla
        }));

        return data;
      }
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error;
    }
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  manejarRowClick(row: any) {
    // Ocultamos el formulario temporalmente
    //this.mostrarB = false;

    // Asignamos el valor del DNI de la fila seleccionada al campo de DNI del beneficiario
    //console.log(row);

    this.desOBenSeleccionado = row;
    this.getElemSeleccionados.emit(this.desOBenSeleccionado);

  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
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

  sameMonthValidator: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const fechaInicio = formGroup.get('fechaInicio')?.value;
    const fechaFin = formGroup.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      /* if (fechaInicioDate.getMonth() !== fechaFinDate.getMonth() || fechaInicioDate.getFullYear() !== fechaFinDate.getFullYear()) {
        console.log('Error: Las fechas no pertenecen al mismo mes y año');
        return { differentMonths: true };
      } */

      // Verificar que fechaInicio <= fechaFin
      if (fechaInicioDate > fechaFinDate) {
        return { invalidRange: true };
      }
    }

    return null;
  }

  seleccionarTipoPlanilla(tipo: string) {
    this.tipoPlanilla = tipo;
  }

  checkFechasCompletas() {
    const fechaInicio = this.planillaForm.get('rangoFechas.fechaInicio')?.value;
    const fechaFin = this.planillaForm.get('rangoFechas.fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const fechaInicioFormateada = this.formatearFecha(fechaInicio);
      const fechaFinFormateada = this.formatearFecha(fechaFin);
    }
  }

  private obtenerIdYNombrePlanilla(): { idTiposPlanilla: number[], nombrePlanilla: string } {
    switch (this.tipoPlanilla) {
      case '60 RENTAS': return { idTiposPlanilla: [10], nombrePlanilla: '60 RENTAS' };
      case 'ordinaria': return { idTiposPlanilla: [1, 2], nombrePlanilla: 'ORDINARIA' };
      case 'complementaria': return { idTiposPlanilla: [3, 4], nombrePlanilla: 'COMPLEMENTARIA' };
      case 'extraordinaria': return { idTiposPlanilla: [9, 8], nombrePlanilla: 'EXTRAORDINARIA' };
      default: console.error('Tipo de planilla no válido'); return { idTiposPlanilla: [], nombrePlanilla: '' };
    }
  }

  private obtenerFechasFormateadas() {
    const fechaInicio = this.planillaForm.get('rangoFechas.fechaInicio')?.value;
    const fechaFin = this.planillaForm.get('rangoFechas.fechaFin')?.value;
    this.fechaInicioFormateada = this.formatearFecha(new Date(fechaInicio)),
      this.fechaFinFormateada = this.formatearFecha(new Date(fechaFin))
    return {
      fechaInicioFormateada: this.formatearFecha(new Date(fechaInicio)),
      fechaFinFormateada: this.formatearFecha(new Date(fechaFin))
    };
  }

  async generarDocumento() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.getTotalBeneficiosYDeduccionesPorPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla).subscribe({
      next: async (data) => {
        //console.log(data);

        const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

        const totalBeneficios = data.beneficios.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);
        const totalDeduccionesInprema = data.deduccionesInprema.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
        const totalDeduccionesTerceros = data.deduccionesTerceros.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);

        const totalMontoConCuenta = data.beneficiosSC
          .filter((cur: any) => cur.NOMBRE_BANCO == 'SIN BANCO')
          .reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);

        const netoTotal = totalBeneficios - (totalDeduccionesInprema + totalDeduccionesTerceros);

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
                    { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                    `${fechaInicioFormateada} - ${fechaFinFormateada}`
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
            this.crearTablaPDF(nombrePlanilla, data.beneficios, 'Beneficios', `TOTAL BENEFICIOS: L${totalBeneficios.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),
            { text: 'DEDUCCIONES INPREMA', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(nombrePlanilla, data.deduccionesInprema, 'DEDUCCIONES INPREMA', `TOTAL DEDUCCIONES INPREMA: L${totalDeduccionesInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'DEDUCCIONES DE TERCEROS', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(nombrePlanilla, data.deduccionesTerceros, 'DEDUCCIONES TERCEROS', `TOTAL DEDUCCIONES TERCEROS: L${totalDeduccionesTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

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
            tableBody: { fontSize: 8, color: 'black' },
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

        pdfMake.createPdf(docDefinition).download(`Reporte_Totales_Beneficios_Deducciones_${nombrePlanilla}.pdf`);
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }

  async generarDocumentoSinCuenta() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.getTotalBeneficiosYDeduccionesPorPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla).subscribe({

      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

        const totalBeneficiosSC = data.beneficiosSC.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_BENEFICIO ? parseFloat(cur.TOTAL_MONTO_BENEFICIO) : 0), 0);
        const totalDeduccionesInpremaSC = data.deduccionesInpremaSC.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);
        const totalDeduccionesTercerosSC = data.deduccionesTercerosSC.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION ? parseFloat(cur.TOTAL_MONTO_DEDUCCION) : 0), 0);

        const netoTotalSC = totalBeneficiosSC - (totalDeduccionesInpremaSC + totalDeduccionesTercerosSC);

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
            text: `RESUMEN DE PLANILLA ${nombrePlanilla} (Sin Cuenta)`,
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
                    { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                    `${fechaInicioFormateada} - ${fechaFinFormateada}`
                  ],
                  alignment: 'left'
                },
                {
                  width: '50%',
                  text: [
                    { text: 'MONTO NETO DE LA PLANILLA: ', bold: true },
                    `L ${netoTotalSC.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  ],
                  alignment: 'right'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            { text: 'BENEFICIOS A PAGAR', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(nombrePlanilla, data.beneficiosSC, 'Beneficios', `TOTAL BENEFICIOS: L${totalBeneficiosSC.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),
            { text: 'DEDUCCIONES INPREMA', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(nombrePlanilla, data.deduccionesInpremaSC, 'DEDUCCIONES INPREMA', `TOTAL DEDUCCIONES INPREMA: L${totalDeduccionesInpremaSC.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

            { text: 'DEDUCCIONES DE TERCEROS', style: 'subheader', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(nombrePlanilla, data.deduccionesTercerosSC, 'DEDUCCIONES TERCEROS', `TOTAL DEDUCCIONES TERCEROS: L${totalDeduccionesTercerosSC.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`),

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
                  margin: [0, 40, 0, 5]
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
                  margin: [0, 40, 0, 5]
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
                  margin: [0, 40, 0, 5]
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
            header: { fontSize: 16, bold: true },
            subheader: { fontSize: 14, bold: false, margin: [0, 5, 0, 10] },
            tableHeader: { bold: true, fontSize: 13, color: 'black' },
            tableBody: { fontSize: 8, color: 'black' },
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

        pdfMake.createPdf(docDefinition).download(`Reporte_Totales_Beneficios_Deducciones_SinCuenta_${nombrePlanilla}.pdf`);
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      }
    });
  }


  crearTablaPDF(nombrePlanilla: string, data: any[], titulo: string, totalTexto: string) {

    //console.log(nombrePlanilla);
    //console.log(nombrePlanilla);

    if (nombrePlanilla == "60 RENTAS") {
      const headers = [
        { text: 'Nombre', style: 'tableHeader' },
        { text: 'Número de pago:', style: 'tableHeader', alignment: 'center' },
        { text: 'Lote:', style: 'tableHeader', alignment: 'center' },
        { text: 'Total', style: 'tableHeader', alignment: 'right' }
      ];

      const body = data.map(item => {
        const nombre = item?.NOMBRE_BENEFICIO ?? item?.NOMBRE_DEDUCCION ?? 'N/A';
        const numPago = item?.NUMERO_PAGOS ?? item?.NUMERO_PAGOS ?? 'N/A';
        const numLote = item?.NUMERO_LOTE ?? item?.NUMERO_LOTE ?? 'N/A';
        const total = item?.TOTAL_MONTO_BENEFICIO ?? item?.TOTAL_MONTO_DEDUCCION ? `L${Number(item.TOTAL_MONTO_BENEFICIO ?? item.TOTAL_MONTO_DEDUCCION).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : 'L0.00';

        return [
          nombre,
          { text: numPago, alignment: 'center' },
          { text: numLote, alignment: 'center' },
          { text: total, alignment: 'right' }
        ];
      });

      if (totalTexto) {
        body.push([
          { text: totalTexto, style: 'tableTotal', colSpan: 4, alignment: 'right' }
        ]);
      }

      if (body.length === 0) {
        body.push([
          { text: 'No hay datos disponibles', colSpan: 4, alignment: 'center' }
        ]);
      }

      return {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [headers, ...body]
        },
        layout: 'lightHorizontalLines'
      };

    } else {
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
          widths: ['*', '*'],
          body: [headers, ...body]
        },
        layout: 'lightHorizontalLines'
      };
    }
  }

  async generarPDFMontosPorBancoPeriodo() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.getTotalMontosPorBancoYPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla).subscribe({
      next: async (data) => {
        const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

        // Calcular solo el monto de "CON CUENTA"
        const totalMontoConCuenta = data
          .filter((cur: any) => cur.NOMBRE_BANCO !== 'SIN BANCO')
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
                    { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                    `${fechaInicioFormateada} - ${fechaFinFormateada}`
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
            , {
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
            header: { fontSize: 10, bold: true },
            subheader: { fontSize: 9, bold: false, margin: [0, 5, 0, 10] },
            tableHeader: { bold: true, fontSize: 13, color: 'black' },
            tableBody: { fontSize: 9, color: 'black' },
            tableTotal: { bold: true, fontSize: 11, color: 'black', alignment: 'right' },
            signature: { fontSize: 9, bold: true }
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
            { text: 'TOTAL', style: 'tableBody', bold: true, alignment: 'center' },
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
            { text: 'TOTAL', style: 'tableBody', bold: true, alignment: 'center' },
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

  descargarExcelDeduccionPorCodigo(codDeduccion: number): void {
    const { idTiposPlanilla } = this.obtenerIdYNombrePlanilla();

    if (idTiposPlanilla.length === 0) {
      console.error('No se ha seleccionado un tipo de planilla válido.');
      return;
    }

    if (!codDeduccion || isNaN(codDeduccion)) {
      console.error('Código de deducción no válido.');
      return;
    }

    this.deduccionesService.descargarExcelDeduccionPorCodigo(
      this.fechaInicioFormateada,
      this.fechaFinFormateada,
      idTiposPlanilla,
      codDeduccion
    ).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `deducciones_${codDeduccion}.xlsx`);
      },
      error: (error) => {
        console.error('Error al descargar el archivo Excel:', error);
      }
    });
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  descargarReporte(): void {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.descargarReporteDetallePago(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'detalle_pago.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al descargar el archivo', error);
        }
      });
  }

  descargarExcelInv(): void {
    const fechaInicio = this.planillaForm.get('rangoFechas.fechaInicio')?.value;
    const fechaFin = this.planillaForm.get('rangoFechas.fechaFin')?.value;

    const perI = format(fechaInicio, 'dd-MM-yyyy');
    const perF = format(fechaFin, 'dd-MM-yyyy');
    //const fechaInicioFormateada = this.formatearFecha(new Date(fechaInicio));
    //const fechaFinFormateada = this.formatearFecha(new Date(fechaFin));
    //console.log(fechaInicioFormateada);

    this.planillaService.generarExcelPlanillaInv(perI, perF).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'reporte_inversiones.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error('Error al descargar el Excel', error);
    });
  }

  openDynamicDialog(inputs: any[]) {
    const dialogRef = this.dialog.open(DynamicInputDialogComponent, {
      width: '400px',
      data: {
        title: 'Ingrese los detalles',
        inputs: inputs
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procesarResultadoDialogo(result);
      }
    });
  }

  procesarResultadoDialogo(result: any): void {
    // Aquí puedes manejar el resultado del diálogo, por ejemplo:
    if (result.codDeduccion) {
      this.descargarExcelDeduccionPorCodigo(result.codDeduccion);
    }
    // Puedes manejar otros resultados según los inputs
  }

  async generarReporteTotalesDeducciones() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.getTotalBeneficiosYDeduccionesPorPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla)
      .subscribe({
        next: async (data) => {
          if (!data || (!data.deduccionesInprema && !data.deduccionesTerceros)) {
            console.error('Datos no válidos para crear el reporte:', data);
            return;
          }

          const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

          const agruparPorNombre = (deducciones: any[]) => {
            return deducciones.reduce((acc: any, item: any) => {
              const existing = acc.find((ded: any) => ded.NOMBRE_DEDUCCION === item.NOMBRE_DEDUCCION);
              if (existing) {
                existing.TOTAL_MONTO_DEDUCCION += item.TOTAL_MONTO_DEDUCCION || 0;
                existing.CANTIDAD_DOCENTES += item.CANTIDAD_DOCENTES || 0;
              } else {
                acc.push({ ...item });
              }
              return acc;
            }, []);
          };

          const ordenarPorCodigo = (deducciones: any[]) => {
            return deducciones.sort((a, b) => a.ID_DEDUCCION - b.ID_DEDUCCION);
          };

          // Combinar deduccionesInprema y deduccionesInpremaSC
          const deduccionesInpremaCombinadas = [...(data.deduccionesInprema || []), ...(data.deduccionesInpremaSC || [])];
          const deduccionesInpremaAgrupadas = agruparPorNombre(deduccionesInpremaCombinadas);
          const deduccionesInpremaOrdenadas = ordenarPorCodigo(deduccionesInpremaAgrupadas);

          // Combinar deduccionesTerceros y deduccionesTercerosSC
          const deduccionesTercerosCombinadas = [...(data.deduccionesTerceros || []), ...(data.deduccionesTercerosSC || [])];
          const deduccionesTercerosAgrupadas = agruparPorNombre(deduccionesTercerosCombinadas);
          const deduccionesTercerosOrdenadas = ordenarPorCodigo(deduccionesTercerosAgrupadas);


          const totalDeduccionesInprema = deduccionesInpremaOrdenadas.reduce((sum: number, item: any) => sum + (item.TOTAL_MONTO_DEDUCCION || 0), 0);
          const totalDocentesInprema = deduccionesInpremaOrdenadas.reduce((sum: number, item: any) => sum + (item.CANTIDAD_DOCENTES || 0), 0);

          const totalDeduccionesTerceros = deduccionesTercerosOrdenadas.reduce((sum: number, item: any) => sum + (item.TOTAL_MONTO_DEDUCCION || 0), 0);
          const totalDocentesTerceros = deduccionesTercerosOrdenadas.reduce((sum: number, item: any) => sum + (item.CANTIDAD_DOCENTES || 0), 0);

          const totalGeneral = totalDeduccionesInprema + totalDeduccionesTerceros;

          const docDefinition: TDocumentDefinitions = {
            pageSize: 'LETTER',
            pageOrientation: 'landscape',
            background: (currentPage, pageSize) => ({
              image: base64Image,
              width: pageSize.width,
              height: pageSize.height,
              absolutePosition: { x: 0, y: 0 }
            }),
            pageMargins: [40, 100, 40, 60],
            header: {
              text: `REPORTE DE TOTALES DE DEDUCCIONES REGISTROS (PLANILLA ${nombrePlanilla})`,
              style: 'header',
              alignment: 'center',
              margin: [50, 70, 50, 0]
            },
            content: [
              {
                columns: [
                  {
                    width: '50%',
                    text: [
                      { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                      `${fechaInicioFormateada} - ${fechaFinFormateada}`
                    ],
                    alignment: 'left',
                    fontSize: 7
                  },
                  {
                    width: '50%',
                    text: [
                      { text: 'NOMBRE DE LA PLANILLA: ', bold: true },
                      `PLANILLA ${nombrePlanilla}`
                    ],
                    alignment: 'right',
                    fontSize: 7
                  }
                ],
                margin: [40, 0, 40, 5] // Ajustado para subir la posición
              },
              { text: 'DEDUCCIONES INPREMA', style: 'subheader', margin: [0, 0, 0, 3] },
              this.crearTablaTotalesDeducciones(deduccionesInpremaOrdenadas, 'DEDUCCIONES INPREMA', totalDocentesInprema, totalDeduccionesInprema),
              { text: 'DEDUCCIONES TERCEROS', style: 'subheader', margin: [0, 0, 0, 3] },
              this.crearTablaTotalesDeducciones(deduccionesTercerosOrdenadas, 'DEDUCCIONES TERCEROS', totalDocentesTerceros, totalDeduccionesTerceros),
              {
                text: `TOTAL GENERAL DE DEDUCCIONES: L ${totalGeneral.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                style: 'tableTotal',
                alignment: 'right',
                margin: [0, 10, 0, 0]
              }
            ],

            styles: {
              header: { fontSize: 9, bold: true },
              subheader: { fontSize: 7, bold: true },
              tableHeader: { bold: true, fontSize: 6, color: 'black' },
              tableBody: { fontSize: 6, color: 'black' },
              tableTotal: { bold: true, fontSize: 6, color: 'black', alignment: 'right' }
            },
            footer: (currentPage, pageCount) => ({
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'FECHA Y HORA: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], fontSize: 6 },
                    { text: 'GENERÓ: INPRENET', alignment: 'left', border: [false, false, false, false], fontSize: 6 },
                    { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, alignment: 'right', border: [false, false, false, false], fontSize: 6 }
                  ]
                ]
              },
              margin: [20, 0, 20, 10]
            }),
            defaultStyle: { fontSize: 6 },
          };

          pdfMake.createPdf(docDefinition).download(`Reporte_Totales_Deducciones_CCB${nombrePlanilla}.pdf`);
        },
        error: (error) => {
          console.error('Error al generar el reporte de deducciones:', error);
        }
      });
  }

  /*   async generarReporteTotalesDeduccionesSinCuentBanc() {
      const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
      const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();
  
      if (idTiposPlanilla.length === 0) return;
  
      this.planillaService.obtenerTotalesDedPorPerSinCuenBan(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla)
        .subscribe({
          next: async (data) => {
            let deduccionesInprema = data.deduccionesInprema || []
            let deduccionesTerceros = data.deduccionesTerceros || []
  
  
  
            if (!data || (!deduccionesInprema && !deduccionesTerceros)) {
              console.error('Datos no válidos para crear el reporte:', data);
              return;
            }
  
            const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');
  
            const agruparPorNombre = (deducciones: any[]) => {
              return deducciones.reduce((acc: any, item: any) => {
                const existing = acc.find((ded: any) => ded.NOMBRE_DEDUCCION === item.NOMBRE_DEDUCCION);
                if (existing) {
                  existing.TOTAL_MONTO_DEDUCCION += item.TOTAL_MONTO_DEDUCCION || 0;
                  existing.CANTIDAD_DOCENTES += item.CANTIDAD_DOCENTES || 0;
                } else {
                  acc.push({ ...item });
                }
                return acc;
              }, []);
            };
  
            const deduccionesInpremaAgrupadas = agruparPorNombre(deduccionesInprema);
            const deduccionesTercerosAgrupadas = agruparPorNombre(deduccionesTerceros);
  
            const ordenarPorCodigo = (deducciones: any[]) => {
              return deducciones.sort((a, b) => a.ID_DEDUCCION - b.ID_DEDUCCION);
            };
            console.log(deduccionesInprema);
            console.log(deduccionesTerceros);
            const deduccionesInpremaOrdenadas = ordenarPorCodigo(deduccionesInpremaAgrupadas);
            const deduccionesTercerosOrdenadas = ordenarPorCodigo(deduccionesTercerosAgrupadas);
  
            const totalDeduccionesInprema = deduccionesInpremaOrdenadas.reduce((sum: number, item: any) => sum + (item.TOTAL_MONTO_DEDUCCION || 0), 0);
            const totalDocentesInprema = deduccionesInpremaOrdenadas.reduce((sum: number, item: any) => sum + (item.CANTIDAD_DOCENTES || 0), 0);
  
            const totalDeduccionesTerceros = deduccionesTercerosOrdenadas.reduce((sum: number, item: any) => sum + (item.TOTAL_MONTO_DEDUCCION || 0), 0);
            const totalDocentesTerceros = deduccionesTercerosOrdenadas.reduce((sum: number, item: any) => sum + (item.CANTIDAD_DOCENTES || 0), 0);
  
            const totalGeneral = totalDeduccionesInprema + totalDeduccionesTerceros;
  
            const docDefinition: TDocumentDefinitions = {
              pageSize: 'LETTER',
              pageOrientation: 'landscape',
              background: (currentPage, pageSize) => ({
                image: base64Image,
                width: pageSize.width,
                height: pageSize.height,
                absolutePosition: { x: 0, y: 0 }
              }),
              pageMargins: [40, 100, 40, 60],
              header: {
                text: `REPORTE DE TOTALES DE DEDUCCIONES REGISTROS SIN CUENTA BANCARIA (PLANILLA ${nombrePlanilla})`,
                style: 'header',
                alignment: 'center',
                margin: [50, 70, 50, 0]
              },
              content: [
                {
                  columns: [
                    {
                      width: '50%',
                      text: [
                        { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                        `${fechaInicioFormateada} - ${fechaFinFormateada}`
                      ],
                      alignment: 'left',
                      fontSize: 7
                    },
                    {
                      width: '50%',
                      text: [
                        { text: 'NOMBRE DE LA PLANILLA: ', bold: true },
                        `PLANILLA ${nombrePlanilla}`
                      ],
                      alignment: 'right',
                      fontSize: 7
                    }
                  ],
                  margin: [40, 0, 40, 5] // Ajustado para subir la posición
                },
                { text: 'DEDUCCIONES INPREMA', style: 'subheader', margin: [0, 0, 0, 3] },
                this.crearTablaTotalesDeducciones(deduccionesInpremaOrdenadas, 'DEDUCCIONES INPREMA', totalDocentesInprema, totalDeduccionesInprema),
                { text: 'DEDUCCIONES TERCEROS', style: 'subheader', margin: [0, 0, 0, 3] },
                this.crearTablaTotalesDeducciones(deduccionesTercerosOrdenadas, 'DEDUCCIONES TERCEROS', totalDocentesTerceros, totalDeduccionesTerceros),
                {
                  text: `TOTAL GENERAL DE DEDUCCIONES: L ${totalGeneral.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                  style: 'tableTotal',
                  alignment: 'right',
                  margin: [0, 10, 0, 0]
                }
              ],
  
              styles: {
                header: { fontSize: 9, bold: true },
                subheader: { fontSize: 7, bold: true },
                tableHeader: { bold: true, fontSize: 6, color: 'black' },
                tableBody: { fontSize: 6, color: 'black' },
                tableTotal: { bold: true, fontSize: 6, color: 'black', alignment: 'right' }
              },
              footer: (currentPage, pageCount) => ({
                table: {
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: 'FECHA Y HORA: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], fontSize: 6 },
                      { text: 'GENERÓ: INPRENET', alignment: 'left', border: [false, false, false, false], fontSize: 6 },
                      { text: 'PÁGINA ' + currentPage.toString() + ' DE ' + pageCount, alignment: 'right', border: [false, false, false, false], fontSize: 6 }
                    ]
                  ]
                },
                margin: [20, 0, 20, 10]
              }),
              defaultStyle: { fontSize: 6 },
            };
  
            pdfMake.createPdf(docDefinition).download(`Reporte_Totales_Deducciones_SCB${nombrePlanilla}.pdf`);
          },
          error: (error) => {
            console.error('Error al generar el reporte de deducciones:', error);
          }
        });
    } */

  crearTablaTotalesDeducciones(data: any[], titulo: string, totalDocentes: number, totalMonto: number) {
    if (!Array.isArray(data) || data.length === 0) {
      /* console.error(`No se encontraron datos para ${titulo}`);
      return {
        table: {
          body: [[{ text: `No se encontraron datos para ${titulo}`, alignment: 'center', colSpan: 4 }]]
        }
      }; */
    }

    const headers = [
      { text: 'Código', style: 'tableHeader' },
      { text: 'Nombre Deducción', style: 'tableHeader' },
      { text: 'Cantidad Docentes', style: 'tableHeader', alignment: 'right' },
      { text: 'Total Deducción', style: 'tableHeader', alignment: 'right' }
    ];

    const body: any = data.map(item => [
      { text: item?.ID_DEDUCCION || 'N/A', style: 'tableBody' },
      { text: item?.NOMBRE_DEDUCCION || 'N/A', style: 'tableBody' },
      { text: item?.CANTIDAD_DOCENTES || 0, style: 'tableBody', alignment: 'right' },
      { text: `L ${Number(item?.TOTAL_MONTO_DEDUCCION || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableBody', alignment: 'right' }
    ]);

    body.push([
      { text: 'TOTALES', style: 'tableTotal', colSpan: 2, alignment: 'right' },
      {},
      { text: totalDocentes, style: 'tableTotal', alignment: 'right' },
      { text: `L ${totalMonto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableTotal', alignment: 'right' }
    ]);

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['10%', '50%', '20%', '20%'],
        body: [headers, ...body]
      },
      layout: 'noBorders'
    };
  }

  crearTablaPartidaDiario(data: any[], deduccionesInprema: number, deduccionesTerceros: number) {
    const headers = [
      { text: 'Cuenta Contable', style: 'tableHeader' },
      { text: 'No. Comprobante', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Débito (L)', style: 'tableHeader', alignment: 'right' },
      { text: 'Crédito (L)', style: 'tableHeader', alignment: 'right' }
    ];

    // Agrupamos los datos por cuenta contable
    const gruposPorCuenta = data.reduce((acc: any, beneficio: any) => {
      const cuenta = beneficio.cuentaContable;
      if (!acc[cuenta]) {
        acc[cuenta] = [];
      }
      acc[cuenta].push(beneficio);
      return acc;
    }, {});

    const body: any = [];

    // Construimos secciones por cuenta contable
    Object.keys(gruposPorCuenta).forEach((cuenta) => {
      const beneficios = gruposPorCuenta[cuenta];
      const totalDebito = beneficios.reduce((acc: number, item: any) => acc + (item.debito || 0), 0);
      const totalCredito = beneficios.reduce((acc: number, item: any) => acc + (item.credito || 0), 0);

      const nombreCuenta: Record<string, string> = {
        "611.01.04": "JUBILACION VOLUNTARIA",
        "611.02.01": "PENSION POR INVALIDEZ",
        "612.01.04.01": "CONTINUACION DE JUBILACION",
        "148.99.04.01": "JUBILACIONES Y PENSIONES DEL GOBIERNO",
        "611.02.02": "PENSION POR SOBREVIVENCIA Y ORFANDAD",
      };

      const descripcionCuenta = nombreCuenta[cuenta] || "Cuenta Desconocida";

      // Título de la cuenta contable desglosado por columnas
      body.push([
        { text: cuenta, style: 'tableHeader' }, // Cuenta Contable
        { text: 'N/A', style: 'tableHeader' }, // No. Comprobante
        { text: descripcionCuenta, style: 'tableHeader' }, // Descripción
        { text: `L ${totalDebito.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeader', alignment: 'right' }, // Débito (L)
        { text: `L ${totalCredito.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeader', alignment: 'right' } // Crédito (L)
      ]);

      // Beneficios de la cuenta
      beneficios.forEach((item: any) => {
        body.push([
          { text: cuenta, style: 'tableBody' },
          { text: item.noComprobante || 'N/A', style: 'tableBody' },
          { text: item.descripcion || 'N/A', style: 'tableBody' },
          { text: item.debito?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0.00', style: 'tableBody', alignment: 'right' },
          { text: item.credito?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0.00', style: 'tableBody', alignment: 'right' }
        ]);
      });

      // Separador visual entre cuentas
      body.push([
        { text: '', colSpan: 5 },
        {},
        {},
        {},
        {}
      ]);
    });

    // Espacio antes de las deducciones
    body.push([
      { text: '', colSpan: 5 },
      {},
      {},
      {},
      {}
    ]);

    // Totales generales
    const totalDebitos = data.reduce((acc: number, item: any) => acc + (item.debito || 0), 0);
    const totalCreditos = deduccionesInprema + deduccionesTerceros;

    // Ajuste para balancear los débitos y créditos (colocado antes de las deducciones)
    const diferencia = Math.abs(totalDebitos - totalCreditos);
    if (totalDebitos > totalCreditos) {
      body.push([
        { text: '211.01.01', style: 'tableHeaderBold' }, // Cuenta Contable
        { text: 'N/A', style: 'tableHeaderBold' }, // No. Comprobante
        { text: 'PENSION POR VEJEZ', style: 'tableHeaderBold' }, // Descripción
        { text: '0.00', style: 'tableHeaderBold', alignment: 'right' }, // Débito (L)
        { text: `L ${diferencia.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeaderBold', alignment: 'right' } // Crédito (L)
      ]);
    } else if (totalCreditos > totalDebitos) {
      body.push([
        { text: '211.01.01', style: 'tableHeaderBold' }, // Cuenta Contable
        { text: 'N/A', style: 'tableHeaderBold' }, // No. Comprobante
        { text: 'PENSION POR VEJEZ', style: 'tableHeaderBold' }, // Descripción
        { text: `L ${diferencia.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeaderBold', alignment: 'right' }, // Débito (L)
        { text: '0.00', style: 'tableHeaderBold', alignment: 'right' } // Crédito (L)
      ]);
    }

    // Espacio antes de las deducciones
    body.push([
      { text: '', colSpan: 5 },
      {},
      {},
      {},
      {}
    ]);

    // Deducciones INPREMA (en negrita)
    body.push([
      { text: '297.01.04', style: 'tableHeaderBold' },
      { text: 'N/A', style: 'tableHeaderBold' },
      { text: 'RETENCIONES POR APLICAR JUBILADOS', style: 'tableHeaderBold' },
      { text: '0.00', style: 'tableHeaderBold', alignment: 'right' },
      { text: `L ${deduccionesInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeaderBold', alignment: 'right' }
    ]);

    // Deducciones Terceros (en negrita)
    body.push([
      { text: '212.01.01', style: 'tableHeaderBold' },
      { text: 'N/A', style: 'tableHeaderBold' },
      { text: 'PAGOS A TERCEROS POR DEDUCCION JUBILADOS', style: 'tableHeaderBold' },
      { text: '0.00', style: 'tableHeaderBold', alignment: 'right' },
      { text: `L ${deduccionesTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableHeaderBold', alignment: 'right' }
    ]);

    // Totales finales después del ajuste
    body.push([
      { text: 'TOTAL DEBITOS Y CREDITOS', style: 'tableTotal', colSpan: 3, alignment: 'left' },
      {}, // Estas celdas vacías corresponden al colSpan
      {},
      { text: `L ${Math.max(totalDebitos, totalCreditos).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableTotal', alignment: 'right' },
      { text: `L ${Math.max(totalDebitos, totalCreditos).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'tableTotal', alignment: 'right' }
    ]);

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['15%', '20%', '30%', '20%', '15%'], // Ajuste de anchos
        body: [headers, ...body]
      },
      layout: 'lightHorizontalLines'
    };
  }

  async generarReportePartidaDiario() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) return;

    this.planillaService.getTotalBeneficiosYDeduccionesPorPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla).subscribe({
      next: async (data) => {
        if (!data || (!data.beneficios && !data.deduccionesInprema && !data.deduccionesTerceros)) {
          console.error('No se encontraron datos para generar el reporte.');
          return;
        }

        const base64Image = await this.convertirImagenABase64('../assets/images/membratadoFinal.jpg');

        // Mapeo de cuentas contables
        const cuentaContableMap: Record<string, string> = {
          "JUBILACION VOLUNTARIA": "611.01.04",
          "PENSION POR VEJEZ": "611.01.04",
          "PENSION POR VEJEZ COMPLEMENTARIA": "611.01.04",
          "PENSION POR INVALIDEZ": "611.02.01",
          "PENSION POR INVALIDEZ 2": "611.02.01",
          "CONTINUACION JUBILACION": "612.01.04.01",
          "JUBILACION VOLUNTARIA GOBIERNO": "148.99.04.01",
          "PENSION POR INVALIDEZ GOBIERNO": "148.99.04.01",
          "CONTINUACION DE JUBILACION GOBIERNO": "148.99.04.01",
          "PENSION POR VIUDEZ Y ORFANDAD": "611.02.02",
          "PENSION POR ORFANDAD": "611.02.02"
        };
        const partidaDiarioData = data.beneficios.map((beneficio: any) => ({
          cuentaContable: cuentaContableMap[beneficio.NOMBRE_BENEFICIO] || 'N/A',
          noComprobante: beneficio.ID_BENEFICIO || 'N/A',
          descripcion: beneficio.NOMBRE_BENEFICIO,
          debito: beneficio.TOTAL_MONTO_BENEFICIO || 0,
          credito: 0
        }));

        const totalDeduccionesInprema = data.deduccionesInprema.reduce((acc: number, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION || 0), 0);
        const totalDeduccionesTerceros = data.deduccionesTerceros.reduce((acc: number, cur: any) => acc + (cur.TOTAL_MONTO_DEDUCCION || 0), 0);

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          pageOrientation: 'landscape',
          background: (currentPage, pageSize) => ({
            image: base64Image,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 }
          }),
          pageMargins: [40, 130, 40, 100],
          header: {
            text: `PARTIDA DE DIARIO - PLANILLA ${nombrePlanilla}`,
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
                    { text: 'PERIODO DE LA PLANILLA: ', bold: true },
                    `${fechaInicioFormateada} - ${fechaFinFormateada}`
                  ],
                  alignment: 'left'
                }
              ],
              margin: [40, 5, 40, 10]
            },
            this.crearTablaPartidaDiario(partidaDiarioData, totalDeduccionesInprema, totalDeduccionesTerceros),
            {
              columns: [
                {
                  width: '50%',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ],
                  alignment: 'center',
                  margin: [0, 80, 0, 5] // Ajustar margen superior
                },
                {
                  width: '50%',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 150, y2: 0,
                      lineWidth: 1.5
                    }
                  ],
                  alignment: 'center',
                  margin: [0, 80, 0, 5] // Ajustar margen superior
                }
              ]
            },
            {
              columns: [
                {
                  width: '50%',
                  text: 'ELABORADO POR',
                  style: 'signature',
                  alignment: 'center',
                  margin: [0, 5, 0, 40] // Espaciado entre línea y texto
                },
                {
                  width: '50%',
                  text: 'VERIFICADO POR',
                  style: 'signature',
                  alignment: 'center',
                  margin: [0, 5, 0, 40] // Espaciado entre línea y texto
                }
              ]
            }

          ],
          styles: {
            header: { fontSize: 16, bold: true },
            tableHeader: { bold: true, fontSize: 12, color: 'black' },
            tableBody: { fontSize: 10, color: 'black' },
            tableTotal: { bold: true, fontSize: 12, color: 'black', alignment: 'right' },
            tableHeaderBold: { bold: true, fontSize: 12, color: 'black' }
          },
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
          defaultStyle: { fontSize: 10 }
        };

        pdfMake.createPdf(docDefinition).download(`Partida_Diario_Planilla_${nombrePlanilla}.pdf`);
      },
      error: (error) => {
        console.error('Error al generar el reporte de partida de diario:', error);
      }
    });
  }


  async exportarExcelDetallePorPeriodo() {
    const { idTiposPlanilla, nombrePlanilla } = this.obtenerIdYNombrePlanilla();
    const { fechaInicioFormateada, fechaFinFormateada } = this.obtenerFechasFormateadas();

    if (idTiposPlanilla.length === 0) {
      console.error('Seleccione un tipo de planilla válido.');
      return;
    }

    // Llamar al servicio para obtener los datos detallados
    this.planillaService.getDetalleBeneficiosYDeduccionesPorPeriodo(fechaInicioFormateada, fechaFinFormateada, idTiposPlanilla)
      .subscribe({
        next: (data) => {
          if (!data) {
            console.error('No se obtuvieron datos del servicio.');
            return;
          }

          // Mapeo de datos para las hojas
          const beneficiosDetalle = data.beneficiosDetallados.map((item: any) => ({
            'Identificación': item.IDENTIFICACION,
            'Nombre Completo': item.NOMBRE_COMPLETO,
            'Nombre Beneficio': item.NOMBRE_BENEFICIO,
            'Monto Beneficio': item.MONTO ? parseFloat(item.MONTO).toFixed(2) : '0.00',
          }));

          const deduccionesInpremaDetalle = data.deduccionesInpremaDetalladas.map((item: any) => ({
            'Identificación': item.IDENTIFICACION,
            'Nombre Completo': item.NOMBRE_COMPLETO,
            'Nombre Deducción (INPREMA)': item.NOMBRE_DEDUCCION,
            'Monto Deducción': item.MONTO ? parseFloat(item.MONTO).toFixed(2) : '0.00',
          }));

          const deduccionesTercerosDetalle = data.deduccionesTercerosDetalladas.map((item: any) => ({
            'Identificación': item.IDENTIFICACION,
            'Nombre Completo': item.NOMBRE_COMPLETO,
            'Nombre Deducción (Terceros)': item.NOMBRE_DEDUCCION,
            'Monto Deducción': item.MONTO ? parseFloat(item.MONTO).toFixed(2) : '0.00',
          }));

          // Crear libro de Excel
          const workbook = XLSX.utils.book_new();

          // Crear hojas
          const beneficiosSheet = XLSX.utils.json_to_sheet(beneficiosDetalle);
          XLSX.utils.book_append_sheet(workbook, beneficiosSheet, 'Detalle Beneficios');

          const deduccionesInpremaSheet = XLSX.utils.json_to_sheet(deduccionesInpremaDetalle);
          XLSX.utils.book_append_sheet(workbook, deduccionesInpremaSheet, 'Deducciones INPREMA');

          const deduccionesTercerosSheet = XLSX.utils.json_to_sheet(deduccionesTercerosDetalle);
          XLSX.utils.book_append_sheet(workbook, deduccionesTercerosSheet, 'Deducciones Terceros');

          // Generar archivo Excel
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

          // Descargar archivo
          const nombreArchivo = `Detalle_Beneficios_Deducciones_${nombrePlanilla}_${fechaInicioFormateada}_to_${fechaFinFormateada}.xlsx`;
          saveAs(blob, nombreArchivo);
        },
        error: (error) => {
          console.error('Error al obtener datos del servicio:', error);
        }
      });
  }



}
