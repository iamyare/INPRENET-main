import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { AuthService } from 'src/app/services/auth.service';
import { obtenerNombreMes } from 'src/app/shared/functions/formatoFecha';/*
import { obtenerRangoMeses } from 'src/app/shared/functions/obtenerRangoMeses'; */
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ValidationService } from 'src/app/shared/services/validation.service';
import * as QRCode from 'qrcode';
import { obtenerRangoMeses } from '../../../shared/functions/formatoFecha';

@Component({
  selector: 'app-voucher-general-mens',
  templateUrl: './voucher-general-mens.component.html',
  styleUrl: './voucher-general-mens.component.scss'
})
export class VoucherGeneralMensComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  myColumns: TableColumn[] = [];
  myFormFields: FieldConfig[] = [];
  datosForm: any;
  datosFormateados: any;
  ejecF: any;
  filas: any[] = [];
  data: any[] = [];

  backgroundImageBase64: string = '';
  detallePlanilla: any;
  cuentaB: any;
  existB: any;

  constructor(
    private afiliacionService: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private validationService: ValidationService,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.convertirImagenABase64('../assets/images/membratadoFinal.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al convertir la imagen a Base64', error);
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.myColumns = [
      {
        header: 'Código de planilla',
        col: 'codigo_planilla',
        isEditable: false
      },
      {
        header: 'Fecha de apertura',
        col: 'fecha_apertura',
        isEditable: true
      },
      {
        header: 'Secuencia',
        col: 'secuencia',
        isEditable: true
      },
      {
        header: 'Estado',
        col: 'estado',
        isEditable: true
      },
      {
        header: 'Fecha de inicio',
        col: 'periodoInicio',
        isEditable: false
      },
      {
        header: 'Fecha de finalización',
        col: 'periodoFinalizacion',
        isEditable: false
      },
      {
        header: 'Tipo de planilla',
        col: 'nombre_planilla',
        isEditable: true
      },
      {
        header: 'Fecha de cierre',
        col: 'fecha_cierre',
        isEditable: true
      },
      {
        header: 'Total de Ingresos',
        col: 'totalBeneficio',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total de deducciones',
        col: 'totalDeducciones',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total de la Planilla',
        col: 'totalPlanilla',
        moneda: true,
        isEditable: false
      },
    ];
  }

  obtenerInformacion() {
    this.getFilas(this.datosForm.value.n_identificacion, this.datosForm.value.mes, this.datosForm.value.anio).then(() =>
      this.cargar()
    );
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

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  async cargarDatosIniciales() {
    this.configurarCamposFormulario();
    if (this.dynamicForm) {
      this.dynamicForm.form = this.dynamicForm.createControl();
    }
  }

  configurarCamposFormulario(): void {
    this.myFormFields = [
      {
        type: 'text',
        label: 'N° DE IDENTIFICACIÓN',
        name: 'n_identificacion',
        validations: [Validators.required],
        display: true
      },
      {
        type: 'number',
        label: 'NÚMERO DE MES',
        name: 'mes',
        validations: [
          Validators.required,
          this.validationService.monthValidator() // Agregamos la validaciÃ³n personalizada
        ],
        display: true
      },
      {
        type: 'number',
        label: 'AÑO',
        name: 'anio',
        validations: [Validators.required, this.validationService.yearValidator()],
        display: true
      }
    ];

    if (this.dynamicForm) {
      this.dynamicForm.fields = this.myFormFields;
      this.dynamicForm.form = this.dynamicForm.createControl();
    }
  }

  obtenerDatos(event: any): any {
    this.datosForm = event;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => { });
    }
  }

  getFilas = async (dni: string, mes: number, anio: number) => {
    this.filas = [];
    try {
      await this.afiliacionService.generar_voucher_by_mes(dni, mes, anio).subscribe({
        next: (resultados) => {
          if (!resultados.persona) {
            this.existB = true;
            this.cuentaB = false;
          } else if (!resultados.persona?.detallePersona[0]?.detalleBeneficio[0]?.detallePagBeneficio[0]?.personaporbanco) {
            this.cuentaB = true;
            this.existB = false;
          } else if (resultados.persona?.detallePersona[0]?.detalleBeneficio[0]?.detallePagBeneficio[0]?.personaporbanco) {
            this.construirPDFBen(resultados, this.backgroundImageBase64);
            this.existB = false;
            this.cuentaB = false;
          }
        },
        error: (error) => {
          console.error('Error al obtener los totales:', error);
          this.toastr.error('Error al obtener los datos para el voucher.');
        }
      });
      //return this.filas; // Asegúrate de retornar las filas incluso si están vacías
    } catch (error) {
      throw error;
    }
  };

  async construirPDFBen(resultados: any, backgroundImageBase64: string) {
    const token = sessionStorage.getItem('token');
    let dataToken;
    if (token) {
      dataToken = this.authService.decodeToken(token);
    }

    const user = dataToken.correo.split("@")[0];

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(value);

    if (resultados) {
      const persona = resultados.persona;
      if (persona) {
        const detallePersona = persona.detallePersona || [];
        const nombreCompleto = `${persona.primer_apellido} ${persona.segundo_apellido || ''} ${persona.primer_nombre} ${persona.segundo_nombre || ''}`.trim();
        const dni = persona.n_identificacion || 'NO PROPORCIONADO';
        const correo = persona.correo_1 || 'NO PROPORCIONADO';
        const dniPersona = persona.n_identificacion || 'NO PROPORCIONADO';

        let sumaBeneficios = 0;
        let sumaDeducciones = 0;

        const causantesMap = new Map();
        detallePersona.forEach((detalle: { ID_DETALLE_PERSONA: number; padreIdPersona: { persona: { n_identificacion: string; } }; }) => {
          if (detalle.padreIdPersona && detalle.padreIdPersona.persona && detalle.padreIdPersona.persona.n_identificacion) {
            causantesMap.set(detalle.ID_DETALLE_PERSONA, detalle.padreIdPersona.persona.n_identificacion);
          }
        });
        const mesAnio = obtenerNombreMes(resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.fecha_cierre)

        const meses = obtenerRangoMeses(resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.periodoInicio,
          resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.periodoFinalizacion
        )
        //let meses = obtenerRangoMeses(resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.fecha_cierre)
        let data: any[] = [];
        detallePersona.forEach((detalle: { detalleBeneficio: any[]; ID_DETALLE_PERSONA: number; }) => {
          detalle.detalleBeneficio.forEach((beneficio: any) => {
            beneficio.detallePagBeneficio.forEach((detallePago: any) => {
              const montoPorPeriodo = detallePago.monto_a_pagar;
              sumaBeneficios += montoPorPeriodo;
              data.push({
                TIPO_PLANILLA: `${detallePago.planilla.tipoPlanilla.nombre_planilla} - ${meses}`,
                CAUSANTE: causantesMap.get(detalle.ID_DETALLE_PERSONA) || '-----------------------',
                NOMBRE_BENEFICIO: beneficio.beneficio.nombre_beneficio,
                MontoAPagar: montoPorPeriodo,
                METODO_PAGO: beneficio.metodo_pago,
                NOMBRE_BANCO: detallePago.personaporbanco ? detallePago.personaporbanco.banco.nombre_banco : 'NO PROPORCIONADO',
                NUM_CUENTA: detallePago.personaporbanco ? detallePago.personaporbanco.num_cuenta : 'NO PROPORCIONADO'
              });
            });
          });
        });

        let tablaDed: any = {};
        if (resultados.deduccion) {
          let dataDed = resultados.deduccion.detalleDeduccion.map((deduccion: any) => {
            const montoDeduccion = deduccion.monto_aplicado;
            sumaDeducciones += montoDeduccion;
            return {
              TIPO_PLANILLA: deduccion.planilla.tipoPlanilla.nombre_planilla,
              NOMBRE_INSTITUCION: deduccion.deduccion.centroTrabajo.nombre_centro_trabajo,
              NOMBRE_DEDUCCION: deduccion.deduccion.nombre_deduccion,
              TotalMontoAplicado: montoDeduccion
            };
          });

          // Función para agrupar por TIPO_PLANILLA
          function agruparPorTipoPlanilla(dataDed: any[]) {
            const agrupado: { [key: string]: any[] } = {};

            dataDed.forEach((item) => {
              if (!agrupado[item.TIPO_PLANILLA]) {
                agrupado[item.TIPO_PLANILLA] = [];
              }
              agrupado[item.TIPO_PLANILLA].push(item);
            });

            return Object.entries(agrupado); // Retorna un array de [TIPO_PLANILLA, items[]]
          }

          tablaDed = {
            table: {
              widths: ['*', '*', '*', '*'],
              body: [
                // Encabezados
                [
                  { text: 'TIPO PLANILLA', style: 'tableHeader' },
                  { text: 'INSTITUCIÓN', style: 'tableHeader' },
                  { text: 'DEDUCCIÓN', style: 'tableHeader' },
                  { text: 'MONTO DEDUCCIÓN', style: ['tableHeader', 'alignRight'] },
                ],
                // Datos agrupados, filtrados y procesados
                ...agruparPorTipoPlanilla(dataDed).flatMap(([tipoPlanilla, items]) => {
                  // Filtrar para excluir filas con TotalMontoAplicado = 0.00
                  const filteredItems = items.filter((b) => b.TotalMontoAplicado !== 0.00);
                  return filteredItems.map((b, index) => {
                    return [
                      index === 0
                        ? { text: `${tipoPlanilla} - ${meses}`, rowSpan: filteredItems.length } // Combinar celdas para TIPO_PLANILLA
                        : {}, // Celdas vacías para las filas combinadas
                      { text: b.NOMBRE_INSTITUCION },
                      { text: b.NOMBRE_DEDUCCION },
                      { text: formatCurrency(b.TotalMontoAplicado), style: 'alignRight' },
                    ];
                  });
                }),
              ],
            },
            margin: [0, 5, 0, 0],
            style: 'tableExample',
          };


        }


        const neto = sumaBeneficios - sumaDeducciones;
        let mesAnioArray: string[] = []; // Definir como un array de strings
        mesAnioArray = mesAnio.split(" ");

        const qrData = `https://script.google.com/macros/s/AKfycbwkPhOJeCFvI2dvsU_o6m3d5pn_1XJoJzGhMoom7FeORLeIU_LovB-2fNeHwf1Hgl6wzQ/exec?name=${encodeURIComponent(
          nombreCompleto
        )}&dni=${encodeURIComponent(dniPersona)}&mes=${encodeURIComponent(mesAnioArray[0])}&Anio=${encodeURIComponent(mesAnioArray[1])}`;


        const qrImage = await QRCode.toDataURL(qrData);

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
                { text: 'VOUCHER DEL MES DE ' + mesAnio, style: 'subheader', alignment: 'center', margin: [0, 10, 0, 0] },
                {
                  columns: [
                    [
                      { text: 'BENEFICIARIO', style: 'subheader' },
                      { text: 'NOMBRE: ' + nombreCompleto },
                      { text: 'DNI: ' + dni },
                    ],
                    [
                      { text: 'DETALLE DE PAGO', style: 'subheader' },
                      { text: 'PAGO TOTAL: ' + formatCurrency(neto) },
                      { text: 'MÉTODO DE PAGO: ' + (data[0]?.METODO_PAGO || 'NO PROPORCIONADO') },
                      { text: 'BANCO: ' + (data[0]?.NOMBRE_BANCO || 'NO PROPORCIONADO') },
                    ],
                    [
                      {
                        image: qrImage,
                        width: 80, // Reducir el tamaño del QR
                        margin: [0, -30, 0, 0], // Agregar un margen negativo para subir 25px
                        alignment: 'center',
                      },
                    ]
                  ],
                  margin: [0, 10, 0, 0]
                },
                {
                  table: {
                    widths: ['*', '*', '*', '*'],
                    body: [
                      // Encabezados
                      [
                        { text: 'TIPO PLANILLA', style: 'tableHeader' },
                        { text: 'CAUSANTE', style: 'tableHeader' },
                        { text: 'INGRESO', style: 'tableHeader' },
                        { text: 'MONTO INGRESO', style: ['tableHeader', 'alignRight'] },
                      ],
                      // Datos agrupados y procesados
                      ...this.agruparPorTipoPlanilla(data).flatMap(([tipoPlanilla, items]) => {
                        return items.map((b, index) => {
                          return [
                            index === 0
                              ? { text: tipoPlanilla, rowSpan: items.length } // Combinar celdas para TIPO_PLANILLA
                              : {}, // Celdas vacías para las filas combinadas
                            { text: b.CAUSANTE, alignment: 'center' },
                            { text: b.NOMBRE_BENEFICIO },
                            { text: formatCurrency(b.MontoAPagar), style: 'alignRight' },
                          ];
                        });
                      }),
                    ],
                  },
                  margin: [0, 5, 0, 0],
                  style: 'tableExample'
                },
                tablaDed,
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

              ],
              margin: [0, 0, 0, 0]
            }
          ],
          footer: function (currentPage, pageCount) {
            return {
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'Fecha y Hora:' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], style: { fontSize: 8 }, },
                    { text: `Generó: ${user}`, alignment: 'left', border: [false, false, false, false], style: { fontSize: 8 }, },
                    { text: 'Página:' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: { fontSize: 8 }, }
                  ]
                ]
              },
              margin: [20, 0, 20, 20]
            };
          },
          pageMargins: [50, 80, 50, 85],
          styles: {
            header: {
              fontSize: 13,
              bold: true,
              margin: [0, 0, 0, 0]
            },
            subheader: {
              fontSize: 10,
              bold: true
            },
            tableHeader: {
              bold: true,
              fontSize: 10,
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
              fontSize: 9,
            }
          },
          defaultStyle: {
            fontSize: 9
          },
          pageSize: 'LETTER',
          pageOrientation: 'portrait'
        };
        pdfMake.createPdf(docDefinition).open();
      } else {
        this.toastr.warning("No se ha encontrado el registro en el mes brindado")
      }
    }
  }

  agruparPorTipoPlanilla(data: any[]) {
    const agrupado: { [key: string]: any[] } = {};

    data.forEach((item) => {
      if (!agrupado[item.TIPO_PLANILLA]) {
        agrupado[item.TIPO_PLANILLA] = [];
      }
      agrupado[item.TIPO_PLANILLA].push(item);
    });

    return Object.entries(agrupado); // Retorna un array de [TIPO_PLANILLA, items[]]
  }


}
