import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { DialogDesgloseComponent } from '../dialog-desglose/dialog-desglose.component';

@Component({
  selector: 'app-verplanprelcomp',
  templateUrl: './verplanprelcomp.component.html',
  styleUrls: ['./verplanprelcomp.component.scss']
})
export class VerplanprelcompComponent implements OnInit {
  convertirFecha = convertirFecha;

  dataPlan: any;
  codigoPlanilla = "";
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];

  datosTabl: any[] = [];
  myColumnsDed: TableColumn[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any;

  data: any[] = [];
  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required], display: true
      },
    ];

    this.myColumnsDed = [
      {
        header: 'DNI',
        col: 'n_identificacion',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true
      },
      {
        header: 'Total de Ingresos',
        col: 'total_beneficios',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total De Deducciones Aplicadas De INPREMA',
        col: 'total_deducciones_inprema',
        isEditable: true,
        moneda: true
      },
      {
        header: 'Total De Deducciones Aplicadas De Terceros',
        col: 'total_deducciones_terceros',
        isEditable: true,
        moneda: true
      },
      {
        header: 'Neto',
        col: 'total',
        moneda: true,
        isEditable: true
      },
    ];
  }

  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
  }

  getPlanilla = async () => {
    this.getFilas([]).then(async () => {
      const temp = await this.cargar();
      this.verDat = true;
      return temp;
    });

    try {
      this.planillaService.getPlanillasPreliminares(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response && response.length > 0) {
              this.detallePlanilla = response[0];
              this.datosTabl = await this.getFilas(response);
              this.codigoPlanilla = response[0]?.codigo_planilla || '';

              this.verDat = true;
            } else {
              this.detallePlanilla = null;
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla} no existe`);
            }

            if (this.ejecF) {
              this.getFilas(response).then(async () => {
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
      console.error("Error al obtener datos de la planilla", error);
    }
  };

  getFilas = async (data: any) => {

    try {
      if (!data) {
        throw new Error('Datos no disponibles');
      }

      this.dataPlan = data.map((item: any) => {
        return {
          id_afiliado: item.ID_PERSONA,
          n_identificacion: item.N_IDENTIFICACION,
          nombre_completo: item.NOMBRE_COMPLETO,
          total_beneficios: item.TOTAL_BENEFICIOS,
          total_deducciones_terceros: item.TOTAL_DEDUCCIONES_TERCEROS,
          total_deducciones_inprema: item.TOTAL_DEDUCCIONES_INPREMA,
          total: item.total_beneficios - (item.total_deducciones_terceros + item.total_deducciones_inprema)
        };
      });
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

  /* Maneja los beneficios y deducciones */
  manejarAccionUno(row: any) {
    this.planillaService.getDesglosePorPersonaPlanilla(row.id_afiliado, this.datosFormateados.value.codigo_planilla).subscribe({
      next: (response) => {
        const { beneficios, deduccionesInprema, deduccionesTerceros } = response;
        const data = {
          beneficios,
          deduccionesInprema,
          deduccionesTerceros
        };
        this.dialog.open(DialogDesgloseComponent, {
          width: '70%',
          data: data
        });
      },
      error: (error) => {
        console.error('Error al obtener desglose por persona', error);
        this.toastr.error('Error al obtener desglose por persona');
      }
    });
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DialogDesgloseComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  actualizarFechaCierrePlanilla(): void {
    this.updatePlanillaACerrada(this.datosFormateados.value.codigo_planilla);
  }

  updatePlanillaACerrada(codigo_planilla: string): void {
    this.planillaService.updatePlanillaACerrada(codigo_planilla).subscribe({
      next: () => {
        this.toastr.success('Estado de la planilla actualizado con éxito');
        this.detallePlanilla.estado = 'CERRADA';
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al actualizar el estado de la planilla', error);
        this.toastr.error('Error al actualizar el estado de la planilla');
      }
    });
  }

  limpiarFormulario(): void {
    if (this.datosFormateados) {
      this.datosFormateados.reset();
      this.detallePlanilla = false;
    }
  }

  actualizarEstadoDeducciones(nuevoEstado: string) {
    /* if (!this.idPlanilla) {
      this.toastr.error('ID de la planilla no está definido');
      return;
    }

    this.deduccionesService.actualizarEstadoDeduccion(this.idPlanilla, nuevoEstado).subscribe({
      next: _ => this.toastr.success('Estado de todas las deducciones actualizado con éxito'),
      error: error => {
        console.error('Error al actualizar el estado de las deducciones', error);
        this.toastr.error('Error al actualizar el estado de las deducciones');
      }
    }); */
  }

  actualizarEstadoBeneficios(nuevoEstado: string) {
    /* if (!this.idPlanilla) {
      this.toastr.error('ID de la planilla no está definido');
      return;
    }

    this.beneficiosService.actualizarEstado(this.idPlanilla, nuevoEstado).subscribe({
      next: _ => this.toastr.success('Estado de todos los beneficios actualizado con éxito'),
      error: error => {
        console.error('Error al actualizar el estado de los beneficios', error);
        this.toastr.error('Error al actualizar el estado de los beneficios');
      }
    }); */
  }
}
