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

@Component({
  selector: 'app-verplancerrada',
  templateUrl: './verplancerrada.component.html',
  styleUrl: './verplancerrada.component.scss'
})
export class VerplancerradaComponent {
  convertirFecha = convertirFecha;

  dataPlan : any;
  idPlanilla = ""
  tiposPlanilla: any[] = [];
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];

  datosTabl:  any[] = [];
  myColumnsDed: TableColumn[] = [];
  filas: any;

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla:any
  datosFilasDeduccion : any;
  datosFilasBeneficios : any;

  data: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionesService : DeduccionesService,
    private beneficiosService : BeneficiosService
    ) {
  }

  ngOnInit(): void {
    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required], display:true
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
        isEditable: true
      },
      {
        header: 'Total De Deducciones Aplicadas',
        col: 'Total Deducciones',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Neto',
        col: 'Total',
        isEditable: true
      },
    ];
  }

  obtenerDatosForm(event:any):any{
    this.datosFormateados = event;
  }

  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaDefin(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.datosTabl = await this.getFilas(response.id_planilla);
              this.idPlanilla = response.id_planilla
              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla}  no existe `);
            }
            if (this.ejecF) {
              this.ejecF(this.datosTabl).then(() => { });
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
        this.data = await this.planillaService.getPlanillaPrelimiar(id_planilla).toPromise();
        this.dataPlan = this.data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            "Total": item["Total Beneficio"] - item["Total Deducciones"],
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
          };
        });
      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data:any) => Promise<void>) {
    this.ejecF = funcion;
  }

  /* Maneja las deducciones */
  manejarAccionDos(row: any) {
    let logs: any[] = []; // Array para almacenar logs
    logs.push({ message: `DNI: ${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: row });

    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%', // o el ancho que prefieras
      data: { logs: logs, type: 'deduccion' } // Asegúrate de pasar el 'type' adecuado
    });

      this.planillaService.getDeduccionesPrelimiar(this.idPlanilla, row.id_afiliado ).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos De Deducciones Inconsistentes:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
          openDialog();
        }
      });

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

      this.planillaService.getBeneficiosPrelimiar(this.idPlanilla, row.id_afiliado).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos De Beneficios Inconsistentes:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener los beneficios inconsistentes:', detail: error });
          openDialog();
        }
      });


  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs }
    });
  }

}
