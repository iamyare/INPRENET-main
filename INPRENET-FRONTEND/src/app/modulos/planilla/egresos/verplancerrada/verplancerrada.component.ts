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
        col: 'TOTAL_BENEFICIO',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Deducciones Terceros',
        col: 'DEDUCCIONES_TERCEROS',
        isEditable: true,
        moneda: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Deducciones Inprema',
        col: 'DEDUCCIONES_INPREMA',
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
            let deduccionesI = 0;
            let deduccionesT = 0;

            this.datosTabl = response.map((item: any) => {

              totalBeneficios += item.TOTAL_BENEFICIO || 0;
              deduccionesI += item.DEDUCCIONES_INPREMA || 0;
              deduccionesT += item.DEDUCCIONES_TERCEROS || 0;

              let respons: any = {
                id_afiliado: item.ID_PERSONA,
                dni: item.DNI,
                NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
                TOTAL_BENEFICIO: item.TOTAL_BENEFICIO,
                DEDUCCIONES_INPREMA: item.DEDUCCIONES_INPREMA || 0,
                DEDUCCIONES_TERCEROS: item.DEDUCCIONES_TERCEROS || 0,
                "Total": item.TOTAL_BENEFICIO - (item.DEDUCCIONES_INPREMA || 0 + item.DEDUCCIONES_TERCEROS || 0),
                tipo_afiliado: item.tipo_afiliado,
                BENEFICIOSIDS: item.BENEFICIOSIDS,
                beneficiosNombres: item.beneficiosNombres,
                fecha_cierre: item.fecha_cierre,
                correo_1: item.correo_1
              };

              return respons
            });

            this.detallePlanilla.totalBeneficios = totalBeneficios;
            this.detallePlanilla.deduccionesI = deduccionesI;
            this.detallePlanilla.deduccionesT = deduccionesT;
            this.detallePlanilla.totalNeto = totalBeneficios - (deduccionesI + deduccionesT);

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

      if (this.data) {
        this.dataPlan = this.data.map((item: any) => {
          const deducciones = item["Total Deducciones"] || 0.00
          return {
            id_afiliado: item.ID_PERSONA,
            dni: item.DNI,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            TOTAL_BENEFICIO: item.TOTAL_BENEFICIO,
            DEDUCCIONES_INPREMA: item.DEDUCCIONES_INPREMA || 0,
            DEDUCCIONES_TERCEROS: item.DEDUCCIONES_TERCEROS || 0,
            "Total": item.TOTAL_BENEFICIO - (item.DEDUCCIONES_INPREMA || 0 + item.DEDUCCIONES_TERCEROS || 0),
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            fecha_cierre: item.fecha_cierre,
            correo_1: item.correo_1
          };
        });

        return this.dataPlan;
      }

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
        this.construirPDF(row, resultados, this.backgroundImageBase64);
      },
      error: (error) => {
        console.error('Error al obtener los totales:', error);
        this.toastr.error('Error al obtener los datos para el voucher.');
      }
    });
  }


  construirPDF(row: { Total: any; NOMBRE_COMPLETO: any; dni: any; correo_1: any; fecha_cierre: any; }, resultados: any, backgroundImageBase64: string) {
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(value);

    if (resultados) {
      const persona = resultados.persona;
      const detallePersona = persona.detallePersona || [];
      const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim();
      const dni = persona.n_identificacion || 'NO PROPORCIONADO';
      const correo = persona.correo_1 || 'NO PROPORCIONADO';
      let sumaBeneficios = 0;
      let sumaDeducciones = 0;

      // Mapeo de ID_DETALLE_PERSONA a n_identificacion del padre
      const causantesMap = new Map();
      detallePersona.forEach((detalle: { ID_DETALLE_PERSONA: number; padreIdPersona: { persona: { n_identificacion: string; } }; }) => {
        if (detalle.padreIdPersona && detalle.padreIdPersona.persona && detalle.padreIdPersona.persona.n_identificacion) {
          causantesMap.set(detalle.ID_DETALLE_PERSONA, detalle.padreIdPersona.persona.n_identificacion);
        }
      });

      const data = detallePersona.map((detalle: { detalleBeneficio: any[]; ID_DETALLE_PERSONA: number; }) => {
        const beneficio = detalle.detalleBeneficio[0];
        const deducciones = beneficio.detallePagBeneficio.flatMap((pagBeneficio: { detalleDeduccion: any[]; }) => {
          return pagBeneficio.detalleDeduccion.map((deduccion) => {
            const montoDeduccion = deduccion.monto_aplicado;
            sumaDeducciones += montoDeduccion;
            return {
              NOMBRE_DEDUCCION: deduccion.deduccion.nombre_deduccion,
              TotalMontoAplicado: montoDeduccion
            };
          });
        });

        const montoPorPeriodo = beneficio.monto_por_periodo;
        sumaBeneficios += montoPorPeriodo;

        return {
          CAUSANTE: causantesMap.get(detalle.ID_DETALLE_PERSONA) || 'NO APLICA',
          NOMBRE_BENEFICIO: beneficio.beneficio.nombre_beneficio,
          MontoAPagar: montoPorPeriodo,
          DEDUCCIONES: deducciones,
          METODO_PAGO: beneficio.metodo_pago,
          NOMBRE_BANCO: beneficio.detallePagBeneficio[0].personaporbanco ? beneficio.detallePagBeneficio[0].personaporbanco.estado : 'NO PROPORCIONADO',
          NUM_CUENTA: beneficio.detallePagBeneficio[0].personaporbanco ? beneficio.detallePagBeneficio[0].personaporbanco.num_cuenta : 'NO PROPORCIONADO'
        };
      });

      const neto = sumaBeneficios - sumaDeducciones;

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
              { text: 'VOUCHER DEL MES DE: ' + obtenerNombreMes(resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.periodoInicio), style: 'subheader', alignment: 'center' },
              {
                columns: [
                  [
                    { text: 'DOCENTE', style: 'subheader' },
                    { text: 'NOMBRE: ' + nombreCompleto },
                    { text: 'DNI: ' + dni },
                    { text: 'EMAIL: ' + correo },
                  ],
                  [
                    { text: 'DETALLE DE PAGO', style: 'subheader' },
                    { text: 'PAGO TOTAL: ' + formatCurrency(neto) },
                    { text: 'MÉTODO DE PAGO: ' + (data[0]?.METODO_PAGO || 'NO PROPORCIONADO') },
                    { text: 'BANCO: ' + (data[0]?.NOMBRE_BANCO || 'NO PROPORCIONADO') },
                    { text: 'N° CUENTA: ' + (data[0]?.NUM_CUENTA || 'NO PROPORCIONADO') },
                  ]
                ],
                margin: [0, 10, 0, 0]  // Añade 5px de margen superior
              },
              {
                table: {
                  widths: ['*', '*', '*', '*', '*'],
                  body: [
                    [{ text: 'CAUSANTE', style: 'tableHeader' }, { text: 'INGRESO', style: 'tableHeader' }, { text: 'MONTO INGRESO', style: ['tableHeader', 'alignRight'] }, { text: 'DEDUCCIÓN', style: 'tableHeader' }, { text: 'MONTO DEDUCCIÓN', style: ['tableHeader', 'alignRight'] }],
                    ...data.flatMap((b: any) => {
                      if (b.DEDUCCIONES.length === 0) {
                        return [[
                          { text: b.CAUSANTE },
                          { text: b.NOMBRE_BENEFICIO },
                          { text: formatCurrency(b.MontoAPagar), style: 'alignRight' },
                          { text: '---------------', alignment: 'center' },
                          { text: formatCurrency(0), style: 'alignRight' }
                        ]];
                      } else {
                        return b.DEDUCCIONES.map((d: { NOMBRE_DEDUCCION: any; TotalMontoAplicado: number; }, index: number) => [
                          index === 0 ? { text: b.CAUSANTE, rowSpan: b.DEDUCCIONES.length } : {},
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
                    [{ text: 'TOTAL DEDUCCIONES', style: 'tableHeader' }, { text: formatCurrency(sumaDeducciones), style: ['tableHeader', 'alignRight'] }]
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
            margin: [0, 0, 0, 0]  // Establece el margen superior a 40px
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
                ]
              ]
            },
            margin: [20, 0, 20, 20]
          };
        },
        pageMargins: [50, 80, 50, 85],
        styles: {
          header: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 0]
          },
          subheader: {
            fontSize: 12,
            bold: true
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
          },
          tableExample: {
            margin: [0, 5, 0, 15]
          },
          alignRight: {
            alignment: 'right'
          },
          signatureTitle: {
            alignment: 'center',
            bold: true,
            fontSize: 12,
          }
        },
        defaultStyle: {
          fontSize: 10
        },
        pageSize: 'LETTER',
        pageOrientation: 'portrait'
      };

      pdfMake.createPdf(docDefinition).open();
    } else {
      console.log("ERROR. FALTA INFORMACIÓN");
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

  formatMonth(dateString: any) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  }


  async generarPDFDeduccionesSeparadas() {
    try {
      const base64Image = await this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg');
      this.planillaService.getDeduccionesPorPlanillaSeparadas(this.idPlanilla).subscribe(response => {
        const deduccionesInprema = response.deduccionesINPREMA || [];
        const deduccionesTerceros = response.deduccionesTerceros || [];

        const totalInprema = deduccionesInprema.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);
        const totalTerceros = deduccionesTerceros.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);
        const neto = totalInprema + totalTerceros;

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          background: function (currentPage, pageSize) {
            return {
              image: base64Image,
              width: pageSize.width,
              height: pageSize.height,
              absolutePosition: { x: 0, y: 0 }
            };
          },
          pageMargins: [40, 150, 40, 100], // Aumentado el espacio en el footer
          header: (currentPage, pageCount, pageSize) => {
            return [
              {
                text: `DESGLOSE DE DEDUCCIONES PARA PLANILLA ${this.detallePlanilla?.nombre_planilla || 'Desconocido'}`,
                style: 'header',
                alignment: 'center',
                margin: [50, 80, 50, 0]
              },
              {
                columns: [
                  {
                    width: '50%',
                    text: [
                      { text: 'Código de Planilla: ', bold: true },
                      `${this.detallePlanilla?.codigo_planilla || 'N/A'}\n`,
                      { text: 'Mes de la Planilla: ', bold: true },
                      `${this.formatMonth(this.detallePlanilla?.fecha_apertura) || 'N/A'}`,
                    ],
                    alignment: 'left'
                  },
                  {
                    width: '50%',
                    text: [
                      { text: 'Neto Total: ', bold: true },
                      `L ${neto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                    ],
                    alignment: 'right'
                  }
                ],
                margin: [40, 5, 40, 10]
              }
            ];
          },
          content: [
            { text: 'Deducciones INPREMA', style: 'subheader', margin: [0, 0, 0, 5] },
            this.crearTablaPDF(deduccionesInprema, 'Deducciones INPREMA', `Total de deducciones INPREMA: L ${totalInprema.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, [0, 0, 0, 10]),
            { text: 'Deducciones de Terceros', style: 'subheader', pageBreak: 'before', margin: [0, 10, 0, 5] },
            this.crearTablaPDF(deduccionesTerceros, 'Deducciones de Terceros', `Total de deducciones de Terceros: L ${totalTerceros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, [0, 0, 0, 10]),
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 240, y2: 0,
                  lineWidth: 1.5
                }
              ],
              alignment: 'center',
              margin: [0, 60, 0, 5]  // Aumentado el espacio entre la última tabla y la línea de firma
            },
            {
              text: 'Firma:',
              style: 'signature',
              alignment: 'center',
              margin: [0, 20, 0, 20]  // Espaciado después de la línea de firma
            }
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true
            },
            subheader: {
              fontSize: 14,
              bold: false,
              margin: [0, 5, 0, 10]
            },
            signature: {
              fontSize: 16,
              bold: true
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



  crearTablaPDF(data: any[], titulo: string, totalTexto: string, margin: [number, number, number, number]) {
    const total = data.reduce((acc, cur) => acc + (cur.TOTAL_MONTO_APLICADO ? parseFloat(cur.TOTAL_MONTO_APLICADO) : 0), 0);
    const formatAmount = (amount: number) => amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const formattedTotalText = `Total de ${titulo}: L ${formatAmount(total)}`; // Formatea aquí también para usar en el PDF

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Nombre', style: 'tableHeader' }, { text: 'Total', style: 'tableHeader' }],
          ...data.map(el => {
            const nombre = el.NOMBRE_DEDUCCION || '';
            const totalFormatted = el.TOTAL_MONTO_APLICADO ? formatAmount(parseFloat(el.TOTAL_MONTO_APLICADO)) : '0.00';
            return [nombre, { text: `L ${totalFormatted}`, alignment: 'right' }];
          }),
          [{ text: formattedTotalText, style: 'tableTotal', alignment: 'right', colSpan: 2 }, {}] // Asegura el formato aquí
        ]
      },
      layout: 'lightHorizontalLines',
      margin: margin
    };
  }



  mostrarTotales() {
    this.planillaService.getTotalesPorDedYBen(this.idPlanilla).subscribe({
      next: (res) => {
        const dialogData = {
          beneficios: res.beneficios.map((b: any) => ({
            nombre: b.NOMBRE_BENEFICIO,
            total: b.TOTAL_MONTO_BENEFICIO
          })),
          deducciones: res.deducciones.map((d: any) => ({
            nombre: d.NOMBRE_DEDUCCION,
            total: d.TOTAL_MONTO_APLICADO
          })),
          codigoPlanilla: this.detallePlanilla?.codigo_planilla || 'N/A',
          nombrePlanilla: this.detallePlanilla?.nombre_planilla || 'Desconocido',
          mesPlanilla: this.formatMonth(this.detallePlanilla?.fecha_apertura)
        };

        this.dialog.open(TotalesporbydDialogComponent, {
          width: '1000px',
          data: dialogData
        });
      },
      error: (error) => {
        console.error('Error al obtener los totales', error);
        this.toastr.error('Error al obtener los totales');
      }
    });
  }


  async generarPDFMontosPorBanco() {
    try {
      const codigo_planilla = this.datosFormateados?.value?.codigo_planilla;

      if (!codigo_planilla) {
        this.toastr.error('Debe proporcionar un código de planilla válido');
        return;
      }

      const base64Image = await this.convertirImagenABase64('../../assets/images/HOJA-MEMBRETADA.jpg');
      this.planillaService.getMontosPorBanco(codigo_planilla).subscribe(response => {
        const montosPorBanco = response || [];

        const totalMonto = montosPorBanco.reduce((acc, cur) => acc + (cur.TotalPagado ? parseFloat(cur.TotalPagado) : 0), 0);

        const docDefinition: TDocumentDefinitions = {
          pageSize: 'LETTER',
          background: function (currentPage, pageSize) {
            return {
              image: base64Image,
              width: pageSize.width,
              height: pageSize.height,
              absolutePosition: { x: 0, y: 0 }
            };
          },
          pageMargins: [40, 150, 40, 100], // Aumentado el espacio en el footer
          header: (currentPage, pageCount, pageSize) => {
            return [
              {
                columns: [
                  {
                    width: '*',
                    text: ''
                  },
                  {
                    width: 'auto',
                    text: `MONTOS POR BANCO PARA PLANILLA ${this.detallePlanilla?.nombre_planilla}`,
                    style: 'header',
                    alignment: 'center',
                    margin: [50, 80, 50, 0]
                  },
                  {
                    width: '*',
                    text: ''
                  }
                ]
              },
              {
                columns: [
                  {
                    width: '50%',
                    text: [
                      { text: 'Código de Planilla: ', bold: true },
                      `${codigo_planilla}\n`,
                    ],
                    alignment: 'left'
                  },
                  {
                    width: '50%',
                    text: [
                      { text: 'Monto Total: ', bold: true },
                      `L ${totalMonto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                    ],
                    alignment: 'right'
                  }
                ],
                margin: [40, 5, 40, 10]
              }
            ];
          },
          content: [
            { text: 'Montos Pagados por Banco', style: 'subheader', margin: [0, 0, 0, 5] },
            this.crearTablaMontosPorBanco(montosPorBanco, 'Montos Pagados por Banco', `Total de montos pagados: L ${totalMonto.toFixed(2)}`, [0, 0, 0, 10]),
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true
            },
            subheader: {
              fontSize: 14,
              bold: false,
              margin: [0, 5, 0, 10]
            },
            signature: {
              fontSize: 16,
              bold: true
            }
          }
        };

        pdfMake.createPdf(docDefinition).download('montos_por_banco.pdf');
      }, error => {
        console.error('Error al obtener los montos por banco', error);
        this.toastr.error('Error al obtener los montos por banco');
      });
    } catch (error) {
      console.error('Error al generar el PDF', error);
      this.toastr.error('Error al generar el PDF');
    }
  }

  crearTablaMontosPorBanco(data: any[], titulo: string, totalTexto: string, margin: [number, number, number, number]) {
    const formatAmount = (amount: number) => amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const formattedTotalText = `Total de ${titulo}: L ${formatAmount(data.reduce((acc, cur) => acc + (cur.TotalPagado ? parseFloat(cur.TotalPagado) : 0), 0))}`;

    return {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Nombre del Banco', style: 'tableHeader' }, { text: 'Monto Pagado', style: 'tableHeader' }],
          ...data.map(el => {
            const nombre = el.NombreBanco || 'NO TIENE CUENTA';
            const totalFormatted = el.TotalPagado ? formatAmount(parseFloat(el.TotalPagado)) : '0.00';
            return [nombre, { text: `L ${totalFormatted}`, alignment: 'right' }];
          }),
          [{ text: formattedTotalText, style: 'tableTotal', alignment: 'right', colSpan: 2 }, {}]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: margin
    };
  }




}
