import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { DialogDesgloseComponent } from '../dialog-desglose/dialog-desglose.component';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { DynamicDialogComponent } from 'src/app/components/dinamicos/dynamic-dialog/dynamic-dialog.component';

@Component({
  selector: 'app-verplanprelcomp',
  templateUrl: './verplanprelcomp.component.html',
  styleUrls: ['./verplanprelcomp.component.scss']
})
export class VerplanprelcompComponent implements OnInit {
  convertirFecha = convertirFecha;
  idPlanilla: any = "";
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
    public dialog: MatDialog,
    private deduccionSVC: DeduccionesService
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
        header: 'Banco',
        col: 'nombre_banco',
        isEditable: true
      },
      {
        header: 'Número de cuenta',
        col: 'num_cuenta',
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
    try {
      this.planillaService.getPlanillaPrelimiar(this.codigoPlanilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.calcularTotales(this.codigoPlanilla)

              this.detallePlanilla = response;
              this.getFilas(response.codigo_planilla).then(() => this.cargar());
              this.idPlanilla = response.id_planilla;
              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla:${this.codigoPlanilla}  no existe `);
            }
            if (this.ejecF) {
              this.getFilas("").then(async () => {
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
      console.error("Error al obtener datos de Tipo Planilla", error);
    }
  };

  calcularTotales = async (cod_planilla: string) => {
    try {
      if (!cod_planilla) {
        this.toastr.error('Debe proporcionar un código de planilla válido');
        return;
      }

      this.planillaService.getPlanillasPreliminares(cod_planilla).subscribe(
        {
          next: (response) => {
            let totalBeneficios = 0;
            let deduccionesI = 0;
            let deduccionesT = 0;
            let totalDeducciones = 0

            this.datosTabl = response.map((item: any) => {
              totalBeneficios += item.TOTAL_BENEFICIOS || 0;
              deduccionesI += item.TOTAL_DEDUCCIONES_INPREMA || 0;
              deduccionesT += item.TOTAL_DEDUCCIONES_TERCEROS || 0;
              totalDeducciones = deduccionesI + deduccionesT;

              let respons: any = {
                id_afiliado: item.ID_PERSONA,
                dni: item.DNI,
                NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
                TOTAL_BENEFICIOS: item.TOTAL_BENEFICIOS,
                TOTAL_DEDUCCIONES_INPREMA: item.TOTAL_TOTAL_DEDUCCIONES_INPREMA || 0,
                TOTAL_DEDUCCIONES_TERCEROS: item.TOTAL_DEDUCCIONES_TERCEROS || 0,
                fecha_cierre: item.fecha_cierre,
                tipo_afiliado: item.tipo_afiliado,
                "total": item.TOTAL_NETO,

                //correo_1: item.correo_1
                //beneficiosNombres: item.beneficiosNombres,
                //BENEFICIOSIDS: item.BENEFICIOSIDS,
              };

              return respons
            });

            this.detallePlanilla.totalBeneficios = totalBeneficios;
            this.detallePlanilla.deduccionesI = deduccionesI;
            this.detallePlanilla.deduccionesT = deduccionesT;
            this.detallePlanilla.totalNeto = totalBeneficios - (totalDeducciones);

            this.verDat = true;
          },
          error: (error) => {
            console.error("Error al obtener datos de Tipo Planilla", error);
            this.toastr.error('Error al obtener datos de la planilla');
          }
        }
      );
    } catch (error) {
      console.error("Error al calcular totales", error);
      this.toastr.error('Error al calcular totales');
    }
  };

  /* getPlanilla = async () => {
    this.getFilas([]).then(async () => {
      const temp = await this.cargar();
      this.verDat = true;
      return temp;
    });

    try {
      this.planillaService.getPlanillasPreliminares(this.codigoPlanilla).subscribe(
        {
          next: async (response) => {
            console.log(response);

            if (response && response.length > 0) {
              this.detallePlanilla = response[0];
              this.datosTabl = await this.getFilas(this.codigoPlanilla);
              console.log(this.datosTabl);

              this.codigoPlanilla = response[0]?.codigo_planilla || '';

              this.verDat = true;
            } else {
              this.detallePlanilla = null;
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.codigoPlanilla} no existe`);
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
  }; */

  getFilas = async (cod_planilla: string) => {
    try {
      this.dataPlan = [];
      this.data = await this.planillaService.getPlanillasPreliminares(cod_planilla).toPromise();
      if (this.data) {
        this.dataPlan = this.data.map((item: any) => {

          const deduccionesI: number = parseFloat(item.TOTAL_DEDUCCIONES_INPREMA) || 0
          const deduccionesT: number = parseFloat(item.TOTAL_DEDUCCIONES_TERCEROS) || 0
          const deducciones: number = deduccionesI + deduccionesT

          return {
            id_afiliado: item.ID_PERSONA,
            n_identificacion: item.N_IDENTIFICACION,
            TIPO_PERSONA: item.TIPO_PERSONA,
            nombre_completo: item.NOMBRE_COMPLETO,
            total_beneficios: item.TOTAL_BENEFICIOS,
            total_deducciones_inprema: item.TOTAL_DEDUCCIONES_INPREMA || 0,
            total_deducciones_terceros: item.TOTAL_DEDUCCIONES_TERCEROS || 0,
            "total": item.TOTAL_NETO,
            correo_1: item.correo_1,
            fecha_cierre: item.fecha_cierre,
            num_cuenta: item.NUM_CUENTA,
            nombre_banco: item.NOMBRE_BANCO

            /* BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres, */
          };
        });
        return this.dataPlan;
      }

    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }


  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
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
    let logs: any[] = [];
    this.planillaService.getDesglosePorPersonaPlanilla(row.id_afiliado, this.codigoPlanilla).subscribe({
      next: (response) => {
        const { beneficios } = response;

        const data = beneficios;

        logs.push({ message: 'Datos De Beneficios:', detail: data || [], type: 'beneficios' });

        const dialogRef = this.dialog.open(DynamicDialogComponent, {
          width: '50%',
          data: { cod_planilla: this.codigoPlanilla, logs: logs, type: 'beneficios', mostrarAccion: true, }
        });

        // Escuchar el evento deduccionEliminada para refrescar los datos
        dialogRef.componentInstance.deduccionEliminada.subscribe(() => {
          this.getFilas(this.codigoPlanilla).then(() => this.cargar());
        });

      },
      error: (error) => {
        console.error('Error al obtener desglose por persona', error);
        this.toastr.error('Error al obtener desglose por persona');
      }
    });
  }

  manejarAccionDos(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI:${row.n_identificacion}`, detail: row });
    logs.push({ message: `Nombre Completo:${row.nombre_completo}`, detail: row });

    this.deduccionSVC.getDeduccionesByPersonaAndBenef(row.id_afiliado, row.ID_BENEFICIO, this.idPlanilla).subscribe({
      next: (response1) => {
        if (response1) {
          const data = response1;

          logs.push({ message: 'Datos De Deducciones:', detail: data || [], type: 'deducciones' });

          const dialogRef = this.dialog.open(DynamicDialogComponent, {
            width: '50%',
            data: { logs: logs, type: 'deduccion', mostrarAccion: true, }
          });

          // Escuchar el evento deduccionEliminada para refrescar los datos
          dialogRef.componentInstance.deduccionEliminada.subscribe(() => {

            this.getFilas(this.codigoPlanilla).then(() => this.cargar());
          });
        }
      },
    });


    /* this.planillaService.getDeduccionesDefinitiva(this.idPlanilla, row.id_afiliado).subscribe({
      next: (response) => {
        logs.push({ message: 'Datos De Deducciones:', detail: response });
      },
      error: (error) => {
        logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
      }
    }); */
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DialogDesgloseComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  actualizarFechaCierrePlanilla(): void {
    this.updatePlanillaACerrada(this.codigoPlanilla);
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

  getElemSeleccionados(event: any) {
    this.codigoPlanilla = event.codigo_planilla;
    this.getPlanilla()
  }
}
