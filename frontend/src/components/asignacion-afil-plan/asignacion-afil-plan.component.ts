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
  filasT: any[] = [];
  datosTabl: any;

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
        col: 'afil_dni',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'primer_nombre',
        col: 'afil_primer_nombre',
        isEditable: true
      },
      {
        header: 'IDs de beneficios',
        col: 'BENEFICIOSIDS',
        isEditable: true
      },
      {
        header: 'Nombres de Beneficios',
        col: 'BENEFICIOSNOMBRES',
        isEditable: true
      },
      {
        header: 'deduccionesIds',
        col: 'DEDUCCIONESIDS',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Nombres de deducciones',
        col: 'DEDUCCIONESNOMBRES',
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
      await this.planillaService.getPlanillaBy(this.datosFormateados.codigo_planilla).subscribe(
        {
          next: (response) => {
            if (response){
              this.detallePlanilla = response
              this.previsualizarDatos(response.periodoInicio, response.periodoFinalizacion);
              return this.filas;
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

  /* Previsualiza los datos en la tabla. */
  previsualizarDatos = async (periodoInicio:string, periodoFinal:string) => {
    this.datosTabl = await this.getFilas(periodoInicio, periodoFinal)
    this.verDat = true
    this.filasT = this.datosTabl;

    this.ejecF(this.filasT).then(()=>{})

    return this.datosTabl
  }

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    try {
      // Asegúrate de pasar los parámetros mes y anio a la función getDeduccionesNoAplicadas
      const data = await this.planillaService.getDeduccionesNoAplicadas(periodoInicio, periodoFinalizacion).toPromise();
      this.filasT = data.map((item: any) => {
        return {
          afil_id_afiliado: item.afil_id_afiliado,
          afil_dni: item.afil_dni,
          afil_primer_nombre: item.afil_primer_nombre,
          BENEFICIOSIDS: item.BENEFICIOSIDS,
          BENEFICIOSNOMBRES: item.BENEFICIOSNOMBRES,
          DEDUCCIONESIDS: item.DEDUCCIONESIDS,
          DEDUCCIONESNOMBRES: item.DEDUCCIONESNOMBRES,
          periodoInicio : periodoInicio,
          periodoFinalizacion : periodoFinalizacion
        };
      });

      return this.filasT;
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
    this.svcAfilServ.getAfilByParam(row.afil_dni).subscribe({
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
    // Lógica para manejar la acción del segundo botón
  }

}
