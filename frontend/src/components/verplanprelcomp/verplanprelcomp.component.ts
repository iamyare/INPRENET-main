import { Component, OnInit } from '@angular/core';
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
import { TotalesporbydDialogComponent } from '../totalesporbydDialog/totalesporbydDialog.component';

@Component({
  selector: 'app-verplanprelcomp',
  templateUrl: './verplanprelcomp.component.html',
  styleUrl: './verplanprelcomp.component.scss'
})
export class VerplanprelcompComponent implements OnInit {
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
  constructor(
    private _formBuilder: FormBuilder,
    private planillaService: PlanillaService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionesService: DeduccionesService,
    private beneficiosService: BeneficiosService
  ) {
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

  /* Se ejecuta cuando da click en previsualizar datos planilla */
  getPlanilla = async () => {
    this.getFilas("").then(async () => {
      const temp = await this.cargar()
      this.verDat = true;
      return temp
    });

    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response.data;
              this.datosTabl = await this.getFilas(response.data.codigo_planilla);
              this.idPlanilla = response.data.id_planilla

            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla}  no existe `);
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

  getFilas = async (id_planilla: string) => {
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


      /* this.data = await this.planillaService.getPlanillaPrelimiar(id_planilla).toPromise(); */
      /* this.dataPlan = this.data.map((item: any) => {
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

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.dataPlan).then(() => {
      });
    }
  }

  /* Maneja las deducciones */
  manejarAccionDos(row: any) {
    let logs: any[] = []; // Array para almacenar logs
    logs.push({ message: `DNI: ${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: row });

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

    /* this.planillaService.getDeduccionesPrelimiar(this.idPlanilla, row.id_afiliado).subscribe({
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
    logs.push({ message: `DNI: ${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: row });

    // Función auxiliar para abrir el diálogo una vez que todos los datos están listos
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

    /* this.planillaService.getBeneficiosPrelimiar(this.idPlanilla, row.id_afiliado).subscribe({
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

  actualizarFechaCierrePlanilla(): void {
    this.cerrarPagos();
  }

  actualizarEstadoDeducciones(nuevoEstado: string) {
    if (!this.idPlanilla) {
      this.toastr.error('ID de la planilla no está definido');
      return;
    }

    this.deduccionesService.actualizarEstadoDeduccion(this.idPlanilla, nuevoEstado).subscribe({
      next: _ => this.toastr.success('Estado de todas las deducciones actualizado con éxito'),
      error: error => {
        console.error('Error al actualizar el estado de las deducciones', error);
        this.toastr.error('Error al actualizar el estado de las deducciones');
      }
    });
  }

  actualizarEstadoBeneficios(nuevoEstado: string) {
    if (!this.idPlanilla) {
      this.toastr.error('ID de la planilla no está definido');
      return;
    }

    this.beneficiosService.actualizarEstado(this.idPlanilla, nuevoEstado).subscribe({
      next: _ => this.toastr.success('Estado de todos los beneficios actualizado con éxito'),
      error: error => {
        console.error('Error al actualizar el estado de los beneficios', error);
        this.toastr.error('Error al actualizar el estado de los beneficios');
      }
    });
  }

  cerrarPagos() {
    const fechaActual = new Date().toISOString().split('T')[0];
    const estadoActualizado = 'CERRADA';
    const datosActualizados = {
      fecha_cierre: fechaActual,
      estado: estadoActualizado
    };

    this.planillaService.updatePlanilla(this.idPlanilla, datosActualizados).subscribe({
      next: (data) => {

        this.toastr.success('Planilla actualizada con éxito');
        this.actualizarEstadoDeducciones('COBRADA');
        this.actualizarEstadoBeneficios('PAGADA');
        this.limpiarFormulario();
        this.detallePlanilla = false;
      },
      error: (error) => {
        this.toastr.error('Error al actualizar la planilla');
        console.error('Error al actualizar la planilla', error);
      }
    });
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
        /* const data = {
          beneficios: res.beneficios.map((beneficio: any) => ({
            nombre: beneficio.NOMBRE_BENEFICIO,
            total: beneficio.TOTAL_MONTO_BENEFICIO
          })),
          deducciones: res.deducciones.map((deduccion: any) => ({
            nombre: deduccion.NOMBRE_DEDUCCION,
            total: deduccion.TOTAL_MONTO_APLICADO
          }))
        } */
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

  limpiarFormulario(): void {
    if (this.datosFormateados) {
      this.datosFormateados.reset();
      this.detallePlanilla = false
    }
  }
}
