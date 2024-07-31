import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ToastrService } from 'ngx-toastr';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-nuevaplanilla',
  templateUrl: './nuevaplanilla.component.html',
  styleUrl: './nuevaplanilla.component.scss'
})
export class NuevaplanillaComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  myFormFields: FieldConfig[] = [];
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;
  datosForm: any

  constructor(private _formBuilder: FormBuilder,
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    private svcAfilServ: AfiliadoService) {
    this.obtenerDatos1();
  }

  ngOnInit(): void { }

  getTiposPlanillas = async () => {
    try {
      const data = await this.planillaService.findTipoPlanillaByclasePlanilla("EGRESO").toPromise();
      this.filas = data.map((item: any) => {
        this.tiposPlanilla.push({ label: `${item.nombre_planilla}`, value: `${item.nombre_planilla}` })
        return {
          id: item.id_tipo_planilla,
          nombre_planilla: item.nombre_planilla,
          descripcion: item.descripcion || 'No disponible',
          periodoInicio: item.periodoInicio,
          periodoFinalizacion: item.periodoFinalizacion,
          estado: item.estado,
        };
      });
      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de Tipo Planilla", error);
    }
  };

  obtenerDatos1(): any {
    this.getTiposPlanillas()
    this.myFormFields = [
      {
        type: 'dropdown', label: 'Nombre de Tipo Planilla', name: 'nombre_planilla',
        options: this.tiposPlanilla,
        validations: [Validators.required], display: true
      },
      { type: 'number', label: 'Secuencia', name: 'secuencia', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")], display: true },
    ]
  }

  /*     getFilasBenef = async (periodoInicio: string, periodoFinalizacion: string) => {
        try {
          // Asegúrate de pasar los parámetros mes y anio a la función getDeduccionesNoAplicadas
          const data = await this.planillaService.getBeneficiosNoAplicadas(periodoInicio, periodoFinalizacion).toPromise();
          this.filasBen = data.map((item: any) => {
            return {
              id_afiliado: item.id_afiliado,
              nombre_completo: `${item.primer_nombre} ${item.segundo_nombre ? item.segundo_nombre : ''} ${item.primer_apellido} ${item.segundo_apellido}`,
              dni: item.dni,
              monto: item.monto
            };
          });

          return this.filasBen;
        } catch (error) {
          console.error("Error al obtener datos de deducciones", error);
          throw error;
        }
      } */

  obtenerDatos(event: any): any {
    this.datosForm = event;
    this.formatRangFech(event)
  }

  formatRangFech(event: any) {
    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;
    this.datosFormateados.secuencia = parseInt(datosFormateados.secuencia)
  }

  crearPlanilla() {
    console.log(this.datosFormateados);

    this.planillaService.createPlanilla(this.datosFormateados).subscribe({
      next: (response) => {
        this.toastr.success('Planilla creada con éxito');
        this.limpiarFormulario();
      },
      error: (error) => {
        let mensajeError = 'Error desconocido al crear TipoPlanilla';

        if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (typeof error.error === 'string') {
          mensajeError = error.error;
        }

        this.toastr.error(mensajeError);
      }
    });
  }
  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }
}
