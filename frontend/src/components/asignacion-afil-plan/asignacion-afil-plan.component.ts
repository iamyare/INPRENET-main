import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '@docs-components/dynamic-dialog/dynamic-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/views/shared/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';
import * as moment from 'moment';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { BeneficiosService } from '../../app/services/beneficios.service';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
})
export class AsignacionAfilPlanComponent implements OnInit{
  dataPlan : any;
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;

  myFormFields: FieldConfig[] = [];
  myColumnsDed: TableColumn[] = [];
  datosTabl:  any[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla:any
  constructor( private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionesService : DeduccionesService,
    private beneficiosService : BeneficiosService
    ) {
  }

  ngOnInit(): void {
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
      /* {
        header: 'Tipo',
        col: 'tipo_afiliado',
        isEditable: true
      }, */
      {
        header: 'Total de Ingresos',
        col: 'Total Beneficio',
        isEditable: true
      },
      {
        header: 'Total de deducciones',
        col: 'Total Deducciones',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      }
    ];

    this.myFormFields = [
      {
        type: 'string', label: 'Codigo De Planilla', name: 'codigo_planilla', validations: [Validators.required]
      },
    ]
  }

  /* Se ejecuta cuando un valor del formulario cambia */
  obtenerDatosForm(event:any):any{
    this.datosFormateados = event.value;
  }

  /* Se ejecuta cuando da click en previsualizar datos planilla */
  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.datosTabl = await this.getFilas(response.periodoInicio, response.periodoFinalizacion);
              this.verDat = true;

            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.codigo_planilla}  no existe `);
            }
            this.ejecF(this.datosTabl).then(() => { });
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

 convertirFecha(fechaStr: string): string {
    // Parsear la fecha utilizando moment.js
    const fecha = moment.utc(fechaStr);
    // Formatear la fecha en el formato deseado
    const fechaFormateada = fecha.format('DD-MM-YYYY h:mm:ss A');
    return fechaFormateada;
}

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    try {

      if (this.detallePlanilla.nombre_planilla == "COMPLEMENTARIA"){
        const data = await this.planillaService.getDatosComplementaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "ORDINARIA"){
        const data = await this.planillaService.getDatosOrdinaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "EXTRAORDINARIA"){
        const data = await this.planillaService.getDatosExtraordinaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          console.log(item);

          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
          };
        });

      }

      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data:any) => Promise<void>) {
    this.ejecF = funcion;
  }

  editar = (row: any) => {}

  manejarAccionUno(row: any) {
    console.log(row);

    let logs: any[] = []; // Array para almacenar logs

    logs.push({ message: 'Información de la fila seleccionada:', detail: row });

    // Función auxiliar para abrir el diálogo una vez que todos los datos están listos
    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%', // o el ancho que prefieras
      data: { logs: logs, type: 'deduccion' } // Asegúrate de pasar el 'type' adecuado
    });


    if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
      // Utilizar findInconsistentDeduccionesByAfiliado si el estado de aplicación es 'INCONSISTENCIA'
      this.deduccionesService.findInconsistentDeduccionesByAfiliado(row.id_afiliado).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos de deducciones inconsistentes:', detail: response });
          openDialog(); // Abre el Mat Dialog una vez que se recibe la respuesta
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
          openDialog(); // Abre el Mat Dialog incluso si hay un error
        }
      });
    } else {

      // Utilizar findByDates en otro caso
      this.deduccionesService.getDetalleDeduccionesPorRango(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos de deducciones:', detail: response });
          openDialog(); // Abre el Mat Dialog una vez que se recibe la respuesta
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones:', detail: error });
          openDialog(); // Abre el Mat Dialog incluso si hay un error
        }
      });
    }
  }

  manejarAccionDos(row: any) {

    let logs: any[] = []; // Array para almacenar logs
    logs.push({ message: 'Información de la fila seleccionada:', detail: row });

    // Función auxiliar para abrir el diálogo una vez que todos los datos están listos
    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%', // o el ancho que prefieras
      data: { logs: logs, type: 'beneficio' } // Asegúrate de pasar el 'type' adecuado
    });

    if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
      // Utilizar findInconsistentBeneficiosByAfiliado para beneficios inconsistentes
      this.beneficiosService.findInconsistentBeneficiosByAfiliado(row.id_afiliado).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos de beneficios inconsistentes:', detail: response });
          openDialog(); // Abre el Mat Dialog una vez que se recibe la respuesta
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener los beneficios inconsistentes:', detail: error });
          openDialog(); // Abre el Mat Dialog incluso si hay un error
        }
      });
    } else {
      // Utilizar el servicio de beneficios para obtener el desglose por rango de fechas
      this.beneficiosService.obtenerDetallesBeneficio(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos de beneficios:', detail: response });
          openDialog(); // Abre el Mat Dialog una vez que se recibe la respuesta
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener los beneficios:', detail: error });
          openDialog(); // Abre el Mat Dialog incluso si hay un error
        }
      });
    }
  }





  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs } // Asegúrate de que esto coincida con la estructura de datos esperada en LogDialogComponent
    });
  }


}
