import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { DynamicDialogComponent } from 'src/app/components/dinamicos/dynamic-dialog/dynamic-dialog.component';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrls: ['./asignacion-afil-plan.component.scss']
})
export class AsignacionAfilPlanComponent implements OnInit {
  convertirFecha = convertirFecha;
  dataPlan: any;
  datosFormateados: any;

  myFormFields: FieldConfig[] = [];
  myColumnsDed: TableColumn[] = [];
  datosTabl: any[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {}

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

    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required], display: true
      },
    ];
  }

  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
    console.log(event);
  }

  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            console.log(response);

            if (response.data) {
              this.detallePlanilla = response.data;

              const proceso = this.detallePlanilla.tipoPlanilla.nombre_planilla;
              this.datosTabl = await this.getFilas(proceso);

              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla} no existe.`);
            }
            if (this.ejecF) {
              this.ejecF(this.datosTabl).then(() => { });
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

  getFilas = async (proceso: string) => {
    try {
      const data = await this.planillaService.getPlanillasPreliminares(proceso).toPromise();
      console.log(data);

      this.dataPlan = data.map((item: any) => ({
        dni: item.N_IDENTIFICACION,
        NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
        "Total Beneficio": item.TOTAL_INGRESOS,
        "Total Deducciones": 0,
        "Total": item.total_ingresos
      }));
      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  manejarAccionUno(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: null });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: null });

    const openDialog = (beneficios: any) => {
      logs.push({ message: 'Datos De Beneficio:', detail: beneficios, type: 'beneficios' });
      this.dialog.open(DynamicDialogComponent, {
        width: '50%',
        data: { logs: logs }
      });
    };

    const handleError = (error: any) => {
      logs.push({ message: 'Error al obtener los beneficios:', detail: error });
      openDialog([]);
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const dni = row.dni;

    /* this.planillaService.getDesglosePersonaPorPlanillaPreliminar(tipoPlanilla, dni).subscribe({
      next: (response: any) => openDialog(response),
      error: handleError
    }); */
  }


  manejarAccionDos(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: null });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: null });

    const openDialog = (deducciones: any) => {
      logs.push({ message: 'Datos De Deduccion:', detail: deducciones });
      this.dialog.open(DynamicDialogComponent, {
        width: '50%',
        data: { logs: logs, type: 'deduccion' }
      });
    };

    const handleError = (error: any) => {
      logs.push({ message: 'Error al obtener las deducciones:', detail: error });
      openDialog([]);
    };

    const mapDeducciones = (response: any) => {
      return response.map((b: any) => ({
        NOMBRE_DEDUCCION: b.nombre_deduccion,
        MontoAplicado: b.monto_aplicado
      }));
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;

    this.planillaService.getPlanillasPreliminares(tipoPlanilla).subscribe({
      next: (response: any) => openDialog(mapDeducciones(response)),
      error: handleError
    });
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  actualizarPlanilla(): void {
    const tipo = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const idPlanilla = this.detallePlanilla.id_planilla;
    const periodoInicio = this.convertirFormatoFecha(this.detallePlanilla.periodoInicio);
    const periodoFinalizacion = this.convertirFormatoFecha(this.detallePlanilla.periodoFinalizacion);

    this.planillaService.actualizarPlanillaAPreliminar(tipo, idPlanilla, periodoInicio, periodoFinalizacion)
      .subscribe({
        next: (response) => {
          this.toastr.success('Planilla actualizada con éxito');
          this.limpiarFormulario();
        },
        error: (error) => {
          let mensajeError = 'Error al actualizar la planilla';
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          }
          this.toastr.error(mensajeError);
        }
      });
  }

  convertirFormatoFecha(fecha: string): string {
    return fecha.replace(/-/g, '.');
  }

  limpiarFormulario(): void {
    if (this.datosFormateados) {
      this.datosFormateados.reset();
      this.detallePlanilla = false;
    }
  }

  editar = (row: any) => { }
}
