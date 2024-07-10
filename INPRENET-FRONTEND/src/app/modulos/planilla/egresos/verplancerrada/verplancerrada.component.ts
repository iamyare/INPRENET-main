import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
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

  calcularTotales = async (cod_planilla: string) => {
    try {
      if (!cod_planilla) {
        this.toastr.error('Debe proporcionar un código de planilla válido');
        return;
      }

      this.planillaService.getPersPlanillaDefin(cod_planilla).subscribe(
        {
          next: (response) => {
            let totalBeneficios = 0;
            let totalDeducciones = 0;

            this.datosTabl = response.map((item: any) => {
              totalBeneficios += item["Total Beneficio"] || 0;
              totalDeducciones += item["Total Deducciones"] || 0;

              return {
                id_afiliado: item.ID_PERSONA,
                dni: item.DNI,
                NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
                "Total Beneficio": item["Total Beneficio"],
                "Total Deducciones": item["Total Deducciones"],
                "Total": item["Total Beneficio"] - item["Total Deducciones"],
                tipo_afiliado: item.tipo_afiliado,
                BENEFICIOSIDS: item.BENEFICIOSIDS,
                beneficiosNombres: item.beneficiosNombres,
                fecha_cierre: item.fecha_cierre,
                correo_1: item.correo_1
              };
            });

            this.detallePlanilla.totalBeneficios = totalBeneficios;
            this.detallePlanilla.totalDeducciones = totalDeducciones;
            this.detallePlanilla.totalNeto = totalBeneficios - totalDeducciones;

            this.verDat = true;
          },
          error: (error) => {
            console.error("Error al obtener datos de Tipo Planilla", error);
            this.toastr.error('Error al obtener datos de la planilla');
          }
        }
      );
    } catch (error) {
      console.error("Error al calcular totales", error);
      this.toastr.error('Error al calcular totales');
    }
  };





  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaDefin(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.getFilas(response.codigo_planilla).then(() => this.cargar());
              this.calcularTotales(this.datosFormateados.value.codigo_planilla)
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
        return {
          id_afiliado: item.ID_PERSONA,
          dni: item.DNI,
          NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
          "Total Beneficio": item["Total Beneficio"],
          "Total Deducciones": item["Total Deducciones"],
          "Total": item["Total Beneficio"] - item["Total Deducciones"],
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

    // Llama al servicio para obtener los totales de beneficios y deducciones

    /*  const beneficios = [{
       ID_BENEFICIO: 1,
       NOMBRE_BENEFICIO: "Pensión por Jubilación",
       "Total Monto Beneficio": row["Total Beneficio"]
     }]
     const deducciones = [{
       ID_DEDUCCION: 1,
       NOMBRE_DEDUCCION: "Préstamo",
       "Total Monto Aplicado": row["Total Deducciones"],
     }] */

    //this.construirPDF(row, beneficios, deducciones);

    this.afiliadoService.generarVoucher(idPlanilla, dni).subscribe({
      next: (resultados) => {
        // Aquí manejas la respuesta
        const { beneficios, deducciones } = resultados;

        // Construye el documento PDF usando los datos obtenidos
        this.construirPDF(row, beneficios, deducciones);
      },
      error: (error) => {
        console.error('Error al obtener los totales:', error);
        this.toastr.error('Error al obtener los datos para el voucher.');
      }
    });
  }

  construirPDF(row: any, beneficios: any[], deducciones: any[]) {
    let formattedNumber = Number(row.Total || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Comprobante de Pago', style: 'header' },
        { text: 'Nº Orden: ' + (row.id_afiliado || 'Desconocido'), style: 'subheader' },
        {
          image: this.backgroundImageBase64,
          width: 595,
          height: 842,
          absolutePosition: { x: 0, y: 0 },
        },
        {
          columns: [
            [
              { text: 'Cliente', style: 'subheader' },
              { text: 'Nombre: ' + (row.NOMBRE_COMPLETO || 'Desconocido') },
              { text: 'DNI: ' + (row.dni || 'Desconocido') },
              { text: 'Email: ' + (row.correo_1 || 'No proporcionado') },
            ],
            [
              { text: 'Pago', style: 'subheader' },
              { text: 'Medio de Pago: No especificado' },
              { text: 'Pago Total: ' + 'L' + formattedNumber, style: 'subheader' },
              { text: 'Fecha de pago: ' + (row.fecha_cierre || 'No especificada') },
            ]
          ]
        },
        this.buildTable('Ingresos', beneficios.map(b => ({ nombre_ingreso: b.NOMBRE_BENEFICIO, monto: b['Total Monto Beneficio'] })), ['nombre_ingreso', 'monto'], 'monto'),
        this.buildTable('Deducciones', deducciones.map(d => ({ nombre_deduccion: d.NOMBRE_DEDUCCION, total_deduccion: d['Total Monto Aplicado'] })), ['nombre_deduccion', 'total_deduccion'], 'total_deduccion'),

        this.buildTable('', deducciones.map(d => ({ Total: "Total", valor_total: row.Total })), ['Total', 'valor_total'], 'valor_total')
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
