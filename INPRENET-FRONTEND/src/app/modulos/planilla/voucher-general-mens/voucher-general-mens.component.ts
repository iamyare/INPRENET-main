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
import { obtenerNombreMes } from 'src/app/shared/functions/formatoFecha';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

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
          Validators.min(1),
          Validators.max(12)
        ],
        display: true
      },
      {
        type: 'number',
        label: 'AÑO',
        name: 'anio',
        validations: [Validators.required, Validators.min(1)],
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

  construirPDFBen(resultados: any, backgroundImageBase64: string) {
    const token = sessionStorage.getItem('token');
    let dataToken
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
        let sumaBeneficios = 0;
        let sumaDeducciones = 0;

        const causantesMap = new Map();
        detallePersona.forEach((detalle: { ID_DETALLE_PERSONA: number; padreIdPersona: { persona: { n_identificacion: string; } }; }) => {
          if (detalle.padreIdPersona && detalle.padreIdPersona.persona && detalle.padreIdPersona.persona.n_identificacion) {
            causantesMap.set(detalle.ID_DETALLE_PERSONA, detalle.padreIdPersona.persona.n_identificacion);
          }
        });

        let data: any[] = [];
        detallePersona.forEach((detalle: { detalleBeneficio: any[]; ID_DETALLE_PERSONA: number; }) => {
          detalle.detalleBeneficio.forEach((beneficio: any) => {
            const montoPorPeriodo = beneficio.detallePagBeneficio[0].monto_a_pagar;
            sumaBeneficios += montoPorPeriodo;

            data.push({
              CAUSANTE: causantesMap.get(detalle.ID_DETALLE_PERSONA) || 'NO APLICA',
              NOMBRE_BENEFICIO: beneficio.beneficio.nombre_beneficio,
              MontoAPagar: montoPorPeriodo,
              METODO_PAGO: beneficio.metodo_pago,
              NOMBRE_BANCO: beneficio.detallePagBeneficio[0].personaporbanco ? beneficio.detallePagBeneficio[0].personaporbanco.banco.nombre_banco : 'NO PROPORCIONADO',
              NUM_CUENTA: beneficio.detallePagBeneficio[0].personaporbanco ? beneficio.detallePagBeneficio[0].personaporbanco.num_cuenta : 'NO PROPORCIONADO'
            });
          });
        });

        let tablaDed: any = {};
        if (resultados.deduccion) {
          let dataDed = resultados.deduccion.detalleDeduccion.map((deduccion: any) => {
            const montoDeduccion = deduccion.monto_aplicado;
            sumaDeducciones += montoDeduccion;

            return {
              NOMBRE_INSTITUCION: deduccion.deduccion.centroTrabajo.nombre_centro_trabajo,
              NOMBRE_DEDUCCION: deduccion.deduccion.nombre_deduccion,
              TotalMontoAplicado: montoDeduccion
            };
          });

          tablaDed = {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [{ text: 'INSTITUCIÓN', style: 'tableHeader' }, { text: 'DEDUCCIÓN', style: 'tableHeader' }, { text: 'MONTO DEDUCCIÓN', style: ['tableHeader', 'alignRight'] }],
                ...dataDed.flatMap((b: any) => {
                  if (b.length === 0) {
                    return [[
                      { text: '---------------', alignment: 'center' },
                      { text: '---------------', alignment: 'center' },
                      { text: formatCurrency(0), style: 'alignRight' },
                    ]];
                  } else {
                    return [[
                      { text: b.NOMBRE_INSTITUCION },
                      { text: b.NOMBRE_DEDUCCION },
                      { text: formatCurrency(b.TotalMontoAplicado), style: 'alignRight' }
                    ]];
                  }
                })
              ]
            },
            margin: [0, 5, 0, 0],
            style: 'tableExample'
          }
        }

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
                { text: 'VOUCHER DEL MES DE: ' + obtenerNombreMes(resultados.persona.detallePersona[0].detalleBeneficio[0].detallePagBeneficio[0].planilla.periodoInicio), style: 'subheader', alignment: 'center', margin: [0, 10, 0, 0] },
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
                    ]
                  ],
                  margin: [0, 10, 0, 0]
                },
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: [
                      [{ text: 'CAUSANTE', style: 'tableHeader' }, { text: 'INGRESO', style: 'tableHeader' }, { text: 'MONTO INGRESO', style: ['tableHeader', 'alignRight'] }],
                      ...data.flatMap((b: any) => {
                        return [[
                          { text: b.CAUSANTE },
                          { text: b.NOMBRE_BENEFICIO },
                          { text: formatCurrency(b.MontoAPagar), style: 'alignRight' },
                        ]];
                      })
                    ]
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
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 70, 0, 10] },
                { text: 'FIRMA UNIDAD DE PLANILLAS', style: 'signatureTitle', margin: [0, 5, 0, 0] }
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
        this.toastr.warning("No se ha encontrado el registro en el mes brindado")
      }
    }

  }

}
