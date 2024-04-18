import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '@docs-components/dynamic-dialog/dynamic-dialog.component';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { BeneficiosService } from '../../app/services/beneficios.service';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
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

  detallePlanilla: any
  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private beneficiosService: BeneficiosService,
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
    ]
  }

  /* Se ejecuta cuando un valor del formulario cambia */
  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
  }

  /* Se ejecuta cuando da click en previsualizar datos planilla */
  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response.data) {
              this.detallePlanilla = response.data;

              const periodoInicioFormatoNuevo = this.convertirFormatoFecha(response.data.periodoInicio);
              const periodoFinalizacionFormatoNuevo = this.convertirFormatoFecha(response.data.periodoFinalizacion);
              this.datosTabl = await this.getFilas(periodoInicioFormatoNuevo, periodoFinalizacionFormatoNuevo);

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

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    const serviceCalls: any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPlanillaOrdinariaAfiliados,
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPlanillaOrdinariaBeneficiarios,
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPlanillaComplementariaAfiliados,
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPlanillaComplementariaBeneficiarios,
    };

    const mapData = (item: any) => ({
      dni: item.DNI,
      NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
      periodoInicio: periodoInicio,
      periodoFinalizacion: periodoFinalizacion,
      "Total Beneficio": item["Total Beneficio"],
      "Total Deducciones": item["Total Deducciones"],
      "Total": item["Total Beneficio"] - item["Total Deducciones"],
    });

    try {
      const serviceName = this.detallePlanilla.tipoPlanilla.nombre_planilla;
      const serviceFunction = serviceCalls[serviceName];

      if (serviceFunction) {
        const data = await serviceFunction.bind(this.planillaService)(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.data.map(mapData);
      } else {
        console.error('Servicio no definido para el tipo de planilla:', serviceName);
      }
      return this.dataPlan;

    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  editar = (row: any) => { }

  /* Maneja los beneficios */
  manejarAccionUno(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: null });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: null });

    const openDialog = (beneficios: any) => {
      logs.push({ message: 'Datos De Beneficio:', detail: beneficios });
      this.dialog.open(DynamicDialogComponent, {
        width: '50%',
        data: { logs: logs, type: 'beneficio' }
      });
    };

    const handleError = (error: any) => {
      logs.push({ message: 'Error al obtener los beneficios:', detail: error });
      openDialog([]);
    };

    const mapBeneficios = (response: any) => {
      return response.data.map((b: any) => ({
        NOMBRE_BENEFICIO: b.NOMBRE_BENEFICIO,
        MontoAPagar: b.MontoAPagar
      }));
    };

    const serviceActions: any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPagoBeneficioOrdiAfil.bind(this.planillaService),
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPagoBeneficioOrdiBenef.bind(this.planillaService),
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPagoBeneficioCompleAfil.bind(this.planillaService),
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPagoBeneficioCompleBenef.bind(this.planillaService),
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const serviceCall = serviceActions[tipoPlanilla];

    if (serviceCall) {
      serviceCall(row.dni, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response: any) => openDialog(mapBeneficios(response)),
        error: handleError
      });
    } else {
      console.error('No existe una acción para este tipo de planilla:', tipoPlanilla);
    }
  }

  /* Maneja las deducciones */
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
      return response.data.map((b: any) => ({
        NOMBRE_DEDUCCION: b.NOMBRE_DEDUCCION,
        MontoAplicado: b.MontoAplicado
      }));
    };

    const serviceActions: any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPagoDeduccionesOrdiAfil.bind(this.planillaService),
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPagoDeduccionesOrdiBenef.bind(this.planillaService),
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPagoDeduccionesCompleAfil.bind(this.planillaService),
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPagoDeduccionesCompleBenef.bind(this.planillaService),
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const serviceCall = serviceActions[tipoPlanilla];

    if (serviceCall) {
      serviceCall(row.dni, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response: any) => openDialog(mapDeducciones(response)),
        error: handleError
      });
    } else {
      console.error('No existe una acción para este tipo de planilla:', tipoPlanilla);
    }
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
          this.limpiarFormulario()
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
      this.detallePlanilla = false
    }
  }
}
