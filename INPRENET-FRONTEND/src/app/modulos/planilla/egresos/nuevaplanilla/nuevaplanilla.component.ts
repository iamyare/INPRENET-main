import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';
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

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService) {
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
    this.planillaService.createPlanilla(this.datosFormateados).subscribe({
      next: (response) => {
        this.toastr.success('Planilla creada con éxito');
        this.limpiarFormulario();
      },
      error: (error) => {
        // Revisar si el backend envía el mensaje correcto
        let mensajeError = 'Error desconocido al crear la planilla';

        // Verifica si el error proviene del backend y tiene la propiedad "message"
        if (error.error && error.error.message) {
          mensajeError = error.error.message; // Este debería ser el mensaje del backend
        } else if (typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.status === 409) {  // Si es un conflicto (error 409)
          mensajeError = 'Ya existe una planilla para este mes con la misma secuencia.';
        }

        // Mostrar el mensaje en el Toastr
        this.toastr.error(mensajeError, 'Error');
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
