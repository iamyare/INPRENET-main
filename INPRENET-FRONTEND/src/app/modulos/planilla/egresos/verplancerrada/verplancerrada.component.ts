import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha, obtenerNombreMes } from 'src/app/shared/functions/formatoFecha';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { DynamicDialogComponent } from 'src/app/components/dinamicos/dynamic-dialog/dynamic-dialog.component';
import { Validators } from '@angular/forms';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TotalesporbydDialogComponent } from '../totalesporbydDialog/totalesporbydDialog.component';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-verplancerrada',
  templateUrl: './verplancerrada.component.html',
  styleUrls: ['./verplancerrada.component.scss']
})
export class VerplancerradaComponent {
  convertirFecha = convertirFecha;

  dataPlan: any;
  idPlanilla: any = "";
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];

  datosTabl: any[] = [];
  myColumnsDed: TableColumn[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any;

  data: any[] = [];
  backgroundImageBase64: string = '';

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private http: HttpClient,
    private afiliadoService: AfiliadoService
  ) {
    this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al convertir la imagen a Base64', error);
    });
  }

  ngOnInit(): void {
    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required], display: true
      },
    ]

    this.myColumnsDed = [
      {
        header: 'DNI',
        col: 'dni',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'Nombre Completo',
        col: 'NOMBRE_COMPLETO',
        isEditable: true
      },
      {
        header: 'Total de Ingresos',
        col: 'Total Beneficio',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total De Deducciones Aplicadas',
        col: 'Total Deducciones',
        isEditable: true,
        moneda: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Neto',
        col: 'Total',
        moneda: true,
        isEditable: true
      },
    ];
  }

  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
  }

  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaDefin(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.getFilas(response.codigo_planilla).then(() => this.cargar());
              this.idPlanilla = response.id_planilla;
              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla:${this.datosFormateados.value.codigo_planilla}  no existe `);
            }
            if (this.ejecF) {
              this.getFilas("").then(async () => {
                const temp = await this.cargar();
                this.verDat = true;
                return temp;
              });
            }
          },
          error: (error) => {
            let mensajeError = 'Error desconocido al buscar la planilla';

            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              mensajeError = error.error;
            }

            this.toastr.error(mensajeError);
          }
        }
      );
    } catch (error) {
      console.error("Error al obtener datos de Tipo Planilla", error);
    }
  };

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.dataPlan).then(() => { });
    }
  }

  getFilas = async (cod_planilla: string) => {
    try {
      this.dataPlan = [];

      this.data = await this.planillaService.getPersPlanillaDefin(cod_planilla).toPromise();
      this.dataPlan = this.data.map((item: any) => {
        const deducciones = item["Total Deducciones"] || 0.00
        return {
          id_afiliado: item.ID_PERSONA,
          dni: item.DNI,
          NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
          "Total Beneficio": item["Total Beneficio"],
          "Total Deducciones": deducciones,
          "Total": item["Total Beneficio"] - deducciones,
          tipo_afiliado: item.tipo_afiliado,
          BENEFICIOSIDS: item.BENEFICIOSIDS,
          beneficiosNombres: item.beneficiosNombres,
          fecha_cierre: item.fecha_cierre,
          correo_1: item.correo_1
        };
      });

      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  manejarAccionDos(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI:${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo:${row.NOMBRE_COMPLETO}`, detail: row });

    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%',
      data: { logs: logs, type: 'deduccion' }
    });

    openDialog();
    this.planillaService.getDeduccionesDefinitiva(this.idPlanilla, row.id_afiliado).subscribe({
      next: (response) => {
        logs.push({ message: 'Datos De Deducciones:', detail: response });
      },
      error: (error) => {
        logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
      }
    });
  }

  manejarAccionUno(row: any) {
    let logs: any[] = [];

    this.planillaService.getBeneficiosDefinitiva(this.idPlanilla, row.id_afiliado).subscribe({
      next: (response) => {
        logs.push({ message: `DNI:${row.dni}`, detail: row });
        logs.push({ message: `Nombre Completo:${row.NOMBRE_COMPLETO}`, detail: row });
        logs.push({ message: 'Datos De Beneficios:', detail: response, type: 'beneficios' });

        const openDialog = () => this.dialog.open(DynamicDialogComponent, {
          width: '50%',
          data: { logs: logs }
        });

        openDialog();
      },

      error: (error) => {
        /* logs.push({ message: 'Error al obtener los beneficios inconsistentes:', detail: error }); */
      }
    });
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  manejarAccionTres(row: any) {
    const idPlanilla = this.idPlanilla;
    const dni = row.dni;

    this.afiliadoService.generarVoucher(idPlanilla, dni).subscribe({
      next: (resultados) => {

        // Construye el documento PDF usando los datos obtenidos
        this.construirPDF(row, resultados, this.backgroundImageBase64);
      },
      error: (error) => {
        console.error('Error al obtener los totales:', error);
        this.toastr.error('Error al obtener los datos para el voucher.');
      }
    });
  }

  construirPDF(row: { Total: any; NOMBRE_COMPLETO: any; dni: any; correo_1: any; fecha_cierre: any; }, resultados: any, backgroundImageBase64: string) {
    const formatCurrency = (amount: any) => {
      return 'L. ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    let beneficiosAgrupados: any = {};

    resultados.beneficios.forEach((b: {
      PERIODO_INICIO: any;
      NOMBRE_BANCO: any;
      NUM_CUENTA: any; METODO_PAGO: string; ID_BENEFICIO: string | number; NOMBRE_BENEFICIO: any; MontoAPagar: any; ID_DEDUCCION: any; NOMBRE_DEDUCCION: any; MONTO_APLICADO: any;
    }) => {
      if (!beneficiosAgrupados[b.ID_BENEFICIO]) {
        beneficiosAgrupados[b.ID_BENEFICIO] = {
          ID_BENEFICIO: b.ID_BENEFICIO,
          PERIODO_INICIO: b.PERIODO_INICIO,
          METODO_PAGO: b.METODO_PAGO,
          NOMBRE_BANCO: b.NOMBRE_BANCO,
          NUM_CUENTA: b.NUM_CUENTA,
          NOMBRE_BENEFICIO: b.NOMBRE_BENEFICIO,
          MontoAPagar: b.MontoAPagar,
          DEDUCCIONES: []
        };
      }

      if (b.ID_DEDUCCION !== null) {
        beneficiosAgrupados[b.ID_BENEFICIO].DEDUCCIONES.push({
          ID_DEDUCCION: b.ID_DEDUCCION,
          NOMBRE_DEDUCCION: b.NOMBRE_DEDUCCION,
          TotalMontoAplicado: b.MONTO_APLICADO
        });
      }
    });

    let data: any = Object.values(beneficiosAgrupados);
    let sumaBeneficios = 0;
    let SumaDeducciones = 0;

    data.forEach((beneficio: { MontoAPagar: number; DEDUCCIONES: any[]; }) => {
      sumaBeneficios += beneficio.MontoAPagar;

      beneficio.DEDUCCIONES.forEach((deduccion) => {
        SumaDeducciones += deduccion.TotalMontoAplicado;
      });
    });

    const neto = sumaBeneficios - SumaDeducciones;

    const docDefinition: TDocumentDefinitions = {
      background: function (currentPage, pageSize) {
        return {
          image: backgroundImageBase64,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 2 }
        };
      },
      content: [
        {
          stack: [
            { text: 'CONSTANCIA DE PAGO', style: ['header'], alignment: 'center' },
            { text: 'VOUCHER DEL MES DE: ' + obtenerNombreMes(data["0"].PERIODO_INICIO), style: 'subheader', alignment: 'center' },
            {
              columns: [
                [
                  { text: 'DOCENTE', style: 'subheader' },
                  { text: 'NOMBRE: ' + (row.NOMBRE_COMPLETO || 'NO PROPORCIONADO') },
                  { text: 'DNI: ' + (row.dni || 'NO PROPORCIONADO') },
                  { text: 'EMAIL: ' + (row.correo_1 || 'NO PROPORCIONADO') },
                ],
                [
                  { text: 'DETALLE DE PAGO', style: 'subheader' },
                  { text: 'PAGO TOTAL: ' + formatCurrency(neto) },
                  { text: 'MÉTODO DE PAGO:' + (data["0"].METODO_PAGO || 'NO PROPORCIONADO') },
                  { text: 'BANCO:' + (data["0"].NOMBRE_BANCO || 'NO PROPORCIONADO') },
                  { text: 'N° CUENTA:' + (data["0"].NUM_CUENTA || 'NO PROPORCIONADO') },
                ]
              ],
              margin: [0, 10, 0, 0]  // Añade 5px de margen superior
            },
            {
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [{ text: 'INGRESO', style: 'tableHeader' }, { text: 'MONTO INGRESO', style: ['tableHeader', 'alignRight'] }, { text: 'DEDUCCIÓN', style: 'tableHeader' }, { text: 'MONTO DEDUCCIÓN', style: ['tableHeader', 'alignRight'] }],
                  ...data.flatMap((b: any) => {
                    if (b.DEDUCCIONES.length === 0) {
                      return [[
                        { text: b.NOMBRE_BENEFICIO },
                        { text: formatCurrency(b.MontoAPagar), style: 'alignRight' },
                        { text: '---------------', alignment: 'center' },
                        { text: formatCurrency(0), style: 'alignRight' }
                      ]];
                    } else {
                      return b.DEDUCCIONES.map((d: { NOMBRE_DEDUCCION: any; TotalMontoAplicado: number; }, index: number) => [
                        index === 0 ? { text: b.NOMBRE_BENEFICIO, rowSpan: b.DEDUCCIONES.length } : {},
                        index === 0 ? { text: formatCurrency(b.MontoAPagar), rowSpan: b.DEDUCCIONES.length, style: 'alignRight' } : { text: formatCurrency(0), style: 'alignRight' },
                        { text: d.NOMBRE_DEDUCCION },
                        { text: formatCurrency(d.TotalMontoAplicado), style: 'alignRight' }
                      ]);
                    }
                  })
                ]
              },
              margin: [0, 5, 0, 0],
              style: 'tableExample'
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [{ text: 'TOTAL INGRESOS', style: 'tableHeader' }, { text: formatCurrency(sumaBeneficios), style: ['tableHeader', 'alignRight'] }]
                ]
              },
              style: 'tableExample'
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [{ text: 'TOTAL DEDUCCIONES', style: 'tableHeader' }, { text: formatCurrency(SumaDeducciones), style: ['tableHeader', 'alignRight'] }]
                ]
              },
              style: 'tableExample'
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [{ text: 'NETO A PAGAR', style: 'tableHeader' }, { text: formatCurrency(neto), style: ['tableHeader', 'alignRight'] }]
                ]
              },
              style: 'tableExample'
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 70, 0, 10] }, // Aumenta el margen inferior en 10px
            { text: 'FIRMA CONTROL DE BENEFICIOS', style: 'signatureTitle', margin: [0, 5, 0, 0] } // Aumenta el margen superior en 10px
          ],
          margin: [0, 0, 0, 0]
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Fecha y Hora: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false] },
                { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] }
              ],
              [{ text: '', border: [false, false, false, false] }, { text: '', border: [false, false, false, false] }]
            ]
          },
          margin: [20, 0, 20, 20]
        };
      },
      pageMargins: [50, 80, 50, 85],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 0]
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
        },
        margenes: {
          fontSize: 14,
          color: 'black'
        },
        signatureTitle: {
          fontSize: 12,
          alignment: 'center'
        },
        alignRight: {
          alignment: 'right'
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
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

  buildTable(header: string, data: any[], columns: string[], sumColumn: string) {
    let body = [
      [{ text: header, style: 'tableHeader', colSpan: 2 }, { text: "" }]
    ];

    body.push(...data.map((item, rowIndex) => {
      let rowData = columns.map((column, index) => {
        if (index === columns.length - 1) {
          let value = item[column];
          if (value === undefined || value === null) {
            value = 0;
          }
          let formattedNumber = Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return { text: 'L' + formattedNumber, alignment: 'left' };
        } else {
          return { text: item[column] || '', alignment: 'left' };
        }
      });
      return rowData;
    }));

    return {
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: body
      },
      layout: 'lightHorizontalLines'
    };
  }

  descargarExcel(codPlanilla: string): void {
    this.planillaService.generarExcelPlanilla(codPlanilla).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'planilla.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error('Error al descargar el Excel', error);
    });
  }

  async generarPDFDeduccionesSeparadas() {
    try {
      const base64Image = await this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg');
      this.planillaService.getDeduccionesPorPlanillaSeparadas(this.idPlanilla).subscribe(response => {
        const deduccionesInprema = response.deduccionesINPREMA || [];
        const deduccionesTerceros = response.deduccionesTerceros || [];

        const totalInprema = deduccionesInprema.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);
        const totalTerceros = deduccionesTerceros.reduce((acc: any, cur: any) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);

        const docDefinition: TDocumentDefinitions = {
          background: function (currentPage, pageSize) {
            return {
              image: base64Image,
              width: pageSize.width,
              height: pageSize.height,
              absolutePosition: { x: 0, y: 0 }
            };
          },
          pageMargins: [40, 100, 40, 60], // Adjust margins to fit content correctly
          content: [
            { text: 'Reporte de Deducciones INPREMA', style: 'header', margin: [0, 40, 0, 10] },
            this.crearTablaPDF(deduccionesInprema, 'Deducciones INPREMA', 'Total de deducciones INPREMA'),
            { text: 'Reporte de Deducciones de Terceros', style: 'header', pageBreak: 'before', margin: [0, 20, 0, 10] },
            this.crearTablaPDF(deduccionesTerceros, 'Deducciones de Terceros', 'Total de deducciones de Terceros'),
            {
              table: {
                widths: ['*', 'auto'],
                body: [
                  [{ text: 'Valor Neto', style: 'header' }, { text: `L ${(totalInprema + totalTerceros).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, style: 'totalNeto' }]
                ]
              },
              layout: 'noBorders',
              margin: [0, 40] // Increase the margin to separate the total net value
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
                  margin: [0, 20] // Reduce margin to position the signature properly
                }
              ],
              margin: [0, 20] // Add margin to avoid overlapping footer
            }
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 20, 0, 10]
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

        pdfMake.createPdf(docDefinition).download('reporte_deducciones_separadas.pdf');
      }, error => {
        console.error('Error al obtener las deducciones separadas', error);
        this.toastr.error('Error al obtener las deducciones separadas');
      });
    } catch (error) {
      console.error('Error al generar el PDF', error);
      this.toastr.error('Error al generar el PDF');
    }
  }


  crearTablaPDF(data: any[], titulo: string, totalTexto: string) {
    const total = data.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Nombre', style: 'tableHeader' }, { text: 'Total', style: 'tableHeader' }],
          ...data.map(el => {
            const nombre = el.NOMBRE_DEDUCCION || ''; // Asegurarse de que el nombre esté definido
            const total = el.TOTAL_MONTO_APLICADO ? Number(el.TOTAL_MONTO_APLICADO).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
            return [nombre, { text: "L" + total, alignment: 'right' }];
          }),
          [{ text: totalTexto + ":", style: 'tableTotal', alignment: 'right', colSpan: 1 }, { text: "L" + total, style: 'tableTotal' }]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  mostrarTotales() {
    const beneficios = [{
      nombre: "Pensión por vejez",
      total: "50000.00"
    }]
    const deducciones = [{
      nombre: "Préstamo",
      total: "16000.00"
    }]

    const data = {
      beneficios,
      deducciones
    }

    this.planillaService.getTotalesPorDedYBen(this.idPlanilla).subscribe({
      next: (res) => {
        const data = {
          beneficios: res.beneficios.map((beneficio: any) => ({
            nombre: beneficio.NOMBRE_BENEFICIO,
            total: beneficio.TOTAL_MONTO_BENEFICIO
          })),
          deducciones: res.deducciones.map((deduccion: any) => ({
            nombre: deduccion.NOMBRE_DEDUCCION,
            total: deduccion.TOTAL_MONTO_APLICADO
          }))
        }
        this.dialog.open(TotalesporbydDialogComponent, {
          width: '1000px',
          data
        });
      },
      error: (error) => {
        console.error('Error al obtener los totales', error);
        this.toastr.error('Error al obtener los totales');
      }
    });
  }




}
