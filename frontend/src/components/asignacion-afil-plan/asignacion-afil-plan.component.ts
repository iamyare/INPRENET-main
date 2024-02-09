import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '@docs-components/dynamic-dialog/dynamic-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/views/shared/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
})
export class AsignacionAfilPlanComponent implements OnInit{
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
    public dialog: MatDialog
    ) {
  }

  ngOnInit(): void {
    this.myColumnsDed = [
      {
        header: 'dni',
        col: 'dni',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'primer_nombre',
        col: 'primer_nombre',
        isEditable: true
      },
      {
        header: 'Nombres de Beneficios',
        col: 'beneficiosNombres',
        isEditable: true
      },
      {
        header: 'Nombres de deducciones',
        col: 'deduccionesNombres',
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
              this.toastr.error(`La planilla con el codigo de planilla: ${this.datosFormateados.codigo_planilla}  no existe `);
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

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    let dataPlan = []
    try {

      if (this.detallePlanilla.nombre_planilla == "COMPLEMENTARIA"){
        const data = await this.planillaService.getDatosComplementaria(periodoInicio, periodoFinalizacion).toPromise();
        dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            primer_nombre: item.primer_nombre,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "ORDINARIA"){
        const data = await this.planillaService.getDatosOrdinaria(periodoInicio, periodoFinalizacion).toPromise();
        dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            primer_nombre: item.primer_nombre,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "EXTRAORDINARIA"){
        const data = await this.planillaService.getDatosExtraordinaria(periodoInicio, periodoFinalizacion).toPromise();
        dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            primer_nombre: item.primer_nombre,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion
          };
        });

      }

      return dataPlan;
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
    this.svcAfilServ.getAfilByParam(row.dni).subscribe({
      next: (afilData) => {
        console.log(afilData);
        const dialogRef = this.dialog.open(DynamicDialogComponent, {
          width: '250px', // Ajusta según tus necesidades
          data: { afilData } // Pasando los datos obtenidos del servicio al dialog

        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('La modal fue cerrada');
          // Aquí puedes manejar lo que sucede después de cerrar la modal
        });
      },
      error: (error) => {
        console.error('Error al obtener datos del afiliado', error);
        // Manejo de errores, por ejemplo, mostrar un mensaje al usuario
      }
    });
  }

  manejarAccionDos(row: any) {
    // Lógica para manejar la acción del segundo botóns
  }

}
