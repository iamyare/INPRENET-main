import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '@docs-components/dynamic-dialog/dynamic-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verplancerrada',
  templateUrl: './verplancerrada.component.html',
  styleUrl: './verplancerrada.component.scss'
})
export class VerplancerradaComponent {
  convertirFecha = convertirFecha;

  dataPlan: any;
  idPlanilla = ""
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];

  datosTabl: any[] = [];
  myColumnsDed: TableColumn[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any

  data: any[] = [];
  backgroundImageBase64: string = '';

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private http: HttpClient,
    private afiliadoService: AfiliadoService
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
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
      this.getFilas("").then(async () => {
        const temp = await this.cargar()
        this.verDat = true;
        return temp
      });
      this.planillaService.getPlanillaDefin(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.datosTabl = await this.getFilas(response.codigo_planilla);
              this.idPlanilla = response.id_planilla
              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla:${this.datosFormateados.value.codigo_planilla}  no existe `);
            }
            if (this.ejecF) {
              this.getFilas("").then(async () => {
                const temp = await this.cargar()
                this.verDat = true;
                return temp
              });
            }
          },
          error: (error) => {
            let mensajeError = 'Error desconocido al buscar la planilla';

            // Verifica si el error tiene una estructura específica
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              // Para errores que vienen como un string simple
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
      this.ejecF(this.dataPlan).then(() => {
      });
    }
  }

  getFilas = async (cod_planilla: string) => {
    try {
      this.dataPlan = [
        {
          "id_afiliado": "1",
          "dni": "0801199912345",
          "NOMBRE_COMPLETO": "Juan Carlos Antonio Pérez Gómez",
          "Total Beneficio": 15000,
          "Total Deducciones": 1000,
          "Total": 15000 - 1000,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "2",
          "dni": "0802199912346",
          "NOMBRE_COMPLETO": "Ana María Rodríguez López",
          "Total Beneficio": 12000,
          "Total Deducciones": 900,
          "Total": 12000 - 900,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "3",
          "dni": "0803199912347",
          "NOMBRE_COMPLETO": "Carlos Alberto Sánchez Díaz",
          "Total Beneficio": 14000,
          "Total Deducciones": 1100,
          "Total": 14000 - 1100,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "4",
          "dni": "0804199912348",
          "NOMBRE_COMPLETO": "Luisa Fernanda Martínez Ruiz",
          "Total Beneficio": 13000,
          "Total Deducciones": 950,
          "Total": 13000 - 950,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "5",
          "dni": "0805199912349",
          "NOMBRE_COMPLETO": "Pedro José Hernández Pérez",
          "Total Beneficio": 16000,
          "Total Deducciones": 1050,
          "Total": 16000 - 1050,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "6",
          "dni": "0806199912350",
          "NOMBRE_COMPLETO": "María Alejandra Ramírez Sánchez",
          "Total Beneficio": 12500,
          "Total Deducciones": 800,
          "Total": 12500 - 800,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "7",
          "dni": "0807199912351",
          "NOMBRE_COMPLETO": "Luis Eduardo Pérez Rodríguez",
          "Total Beneficio": 13500,
          "Total Deducciones": 920,
          "Total": 13500 - 920,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "8",
          "dni": "0808199912352",
          "NOMBRE_COMPLETO": "Sofía Isabel Gómez Fernández",
          "Total Beneficio": 14500,
          "Total Deducciones": 960,
          "Total": 14500 - 960,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "9",
          "dni": "0809199912353",
          "NOMBRE_COMPLETO": "José Antonio López García",
          "Total Beneficio": 15500,
          "Total Deducciones": 1020,
          "Total": 15500 - 1020,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "10",
          "dni": "0810199912354",
          "NOMBRE_COMPLETO": "Ana Sofía Jiménez Romero",
          "Total Beneficio": 14800,
          "Total Deducciones": 980,
          "Total": 14800 - 980,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "11",
          "dni": "0811199912355",
          "NOMBRE_COMPLETO": "Miguel Ángel Torres Ruiz",
          "Total Beneficio": 13200,
          "Total Deducciones": 950,
          "Total": 13200 - 950,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "12",
          "dni": "0812199912356",
          "NOMBRE_COMPLETO": "Laura Patricia Flores Ortega",
          "Total Beneficio": 14200,
          "Total Deducciones": 980,
          "Total": 14200 - 980,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "13",
          "dni": "0813199912357",
          "NOMBRE_COMPLETO": "Diego Armando Mendoza Morales",
          "Total Beneficio": 13800,
          "Total Deducciones": 960,
          "Total": 13800 - 960,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "14",
          "dni": "0814199912358",
          "NOMBRE_COMPLETO": "Gabriela Elena Castillo Vargas",
          "Total Beneficio": 14900,
          "Total Deducciones": 1010,
          "Total": 14900 - 1010,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        },
        {
          "id_afiliado": "15",
          "dni": "0815199912359",
          "NOMBRE_COMPLETO": "Daniel Alejandro Ríos Gómez",
          "Total Beneficio": 13600,
          "Total Deducciones": 940,
          "Total": 13600 - 940,
          "tipo_afiliado": "BENEFICIARIO",
          "BENEFICIOSIDS": "",
          "beneficiosNombres": ""
        }
      ]

      /* this.data = await this.planillaService.getPersPlanillaDefin(cod_planilla).toPromise();
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
      }); */
      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  /* Maneja las deducciones */
  manejarAccionDos(row: any) {
    let logs: any[] = []; // Array para almacenar logs
    logs.push({ message: `DNI:${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo:${row.NOMBRE_COMPLETO}`, detail: row });

    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%',
      data: { logs: logs, type: 'deduccion' } // Asegúrate de pasar el 'type' adecuado
    });

    const response = [
      {
        ID_DED_DEDUCCION: "1",
        NOMBRE_DEDUCCION: "PRESTAMOS",
        ID_PERSONA: "1",
        ID_DEDUCCION: "1",
        ID_CENTRO_TRABAJO: "1",
        MONTO_TOTAL: row["Total Deducciones"],
        MontoAplicado: row["Total Deducciones"],
        ANIO: "2024",
        MES: "5",
        FECHA_APLICADO: "",
        ID_PLANILLA: "1",
      }
    ]

    logs.push({ message: 'Datos De Deducciones:', detail: response });
    openDialog();
    /* this.planillaService.getDeduccionesDefinitiva(this.idPlanilla, row.id_afiliado).subscribe({
      next: (response) => {
        logs.push({ message: 'Datos De Deducciones Inconsistentes:', detail: response });
        openDialog();
      },
      error: (error) => {
        logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
        openDialog();
      }
    }); */

  }

  /* Maneja los beneficios */
  manejarAccionUno(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI:${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo:${row.NOMBRE_COMPLETO}`, detail: row });
    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%',
      data: { logs: logs, type: 'beneficio' }
    });

    const response = [{
      NOMBRE_BENEFICIO: "JUBILACION VOLUNTARIA",
      ID_PERSONA: "1",
      ID_CAUSANTE: "1",
      ID_BENEFICIO: "1",
      ID_BENEFICIO_PLANILLA: "1",
      ESTADO: "",
      METODO_PAGO: "",
      MontoAPagar: row["Total Beneficio"],
      NUM_RENTAS_APLICADAS: "1",
      PERIODO_INICIO: "01/06/2024",
      PERIODO_FINALIZACION: "30/06/2024",
    }]

    logs.push({ message: 'Datos De Beneficios:', detail: response });
    openDialog();

    /*  this.planillaService.getBeneficiosDefinitiva(this.idPlanilla, row.id_afiliado).subscribe({
       next: (response) => {
         logs.push({ message: 'Datos De Beneficios Inconsistentes:', detail: response });
         openDialog();
       },
       error: (error) => {
         logs.push({ message: 'Error al obtener los beneficios inconsistentes:', detail: error });
         openDialog();
       }
     }); */
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  manejarAccionTres(row: any) {
    // Obtén el idPlanilla y el dni del afiliado de la fila actual
    const idPlanilla = this.idPlanilla; // Asumiendo que esta propiedad ya tiene el valor adecuado
    const dni = row.dni;

    // Llama al servicio para obtener los totales de beneficios y deducciones

    const beneficios = [{
      ID_BENEFICIO: 1,
      NOMBRE_BENEFICIO: "Pensión por Jubilación",
      "Total Monto Beneficio": row["Total Beneficio"]
    }]
    const deducciones = [{
      ID_DEDUCCION: 1,
      NOMBRE_DEDUCCION: "Préstamo",
      "Total Monto Aplicado": row["Total Deducciones"],
    }]

    this.construirPDF(row, beneficios, deducciones);

    /* this.afiliadoService.generarVoucher(idPlanilla, dni).subscribe({
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
    }); */
  }

  construirPDF(row: any, beneficios: any[], deducciones: any[]) {
    let formattedNumber = Number(row.Total || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
              { text: 'Medio de Pago: No especificado' }, // Asumiendo que este dato no está disponible
              { text: 'Pago Total: ' + 'L' + formattedNumber, style: 'subheader' },
              { text: 'Fecha de pago: ' + (row.fecha_cierre || 'No especificada') },
            ]
          ]
        },
        this.buildTable('Ingresos', beneficios.map(b => ({ nombre_ingreso: b.NOMBRE_BENEFICIO, monto: b['Total Monto Beneficio'] })), ['nombre_ingreso', 'monto'], 'monto'),
        this.buildTable('Deducciones', deducciones.map(d => ({ nombre_deduccion: d.nombre_deduccion, total_deduccion: d['Total Monto Aplicado'] })), ['nombre_deduccion', 'total_deduccion'], 'total_deduccion'),

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
          // Aplicar formato de miles al número
          let formattedNumber = Number(item[column]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return { text: 'L' + formattedNumber, alignment: 'left' }; // Se cambió alignment a 'left'
        } else {
          return { text: item[column], alignment: 'left' };
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

  /* calculateNet(ingresos: any[], deducciones: any[]): number {
    const totalIngresos = ingresos.reduce((acc: any, curr: any) => acc + curr.monto, 0);
    const totalDeducciones = deducciones.reduce((acc: any, curr: any) => acc + curr.total_deduccion, 0);
    return totalIngresos - totalDeducciones;
  } */
}
