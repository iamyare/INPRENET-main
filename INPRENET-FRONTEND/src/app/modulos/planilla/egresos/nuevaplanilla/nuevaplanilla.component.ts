import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { format } from 'date-fns';

@Component({
  selector: 'app-nuevaplanilla',
  templateUrl: './nuevaplanilla.component.html',
  styleUrls: ['./nuevaplanilla.component.scss']
})
export class NuevaplanillaComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  myFormFields: FieldConfig[] = [];
  tiposPlanilla: any[] = [];
  datosFormateados: any;
  datosForm: any;
  planillasActivas: any[] = [];

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.getPlanillasActivas();
  }

  async cargarDatosIniciales() {
    await this.getTiposPlanillas();
    this.configurarCamposFormulario();
    if (this.dynamicForm) {
      this.dynamicForm.form = this.dynamicForm.createControl();
    }
  }

  getTiposPlanillas = async () => {
    try {
      const data = await this.planillaService.findTipoPlanillaByclasePlanilla("EGRESO").toPromise();
      this.tiposPlanilla = data.map((item: any) => ({
        label: `${item.nombre_planilla}`,
        value: `${item.nombre_planilla}`
      }));
    } catch (error) {
      console.error("Error al obtener datos de Tipo Planilla", error);
      this.toastr.error("Error al cargar los tipos de planilla.");
    }
  };

  getPlanillasActivas() {
    this.planillaService.getPlanillasActivas().subscribe({
      next: (response) => {
        this.planillasActivas = response;
      },
      error: (error) => {
        console.error('Error al obtener planillas activas', error);
        this.toastr.error('Error al cargar planillas activas.');
      }
    });
  }

  configurarCamposFormulario(): void {
    this.myFormFields = [
      {
        type: 'dropdown',
        label: 'Nombre de Tipo Planilla',
        name: 'nombre_planilla',
        options: this.tiposPlanilla,
        validations: [Validators.required],
        display: true
      }
    ];

    if (this.dynamicForm) {
      this.dynamicForm.fields = this.myFormFields;
      this.dynamicForm.form = this.dynamicForm.createControl();
    }
  }

  obtenerDatos(event: any): any {
    this.datosForm = event;
    this.formatRangFech(event);
  }

  formatRangFech(event: any) {
    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;
  }

  crearPlanilla() {
    if (this.dynamicForm.form.invalid) {
      this.toastr.error('El formulario no es válido, por favor completa todos los campos requeridos.');
      return;
    }

    const nombrePlanillaSeleccionada = this.dynamicForm.form.get('nombre_planilla')?.value;
    const periodoPlanilla = this.dynamicForm.form.get('periodo_planilla')?.value;
    let datosFormulario: any = {
      nombre_planilla: nombrePlanillaSeleccionada
    };
    if (periodoPlanilla) {
      const periodoInicio = format(new Date(periodoPlanilla.start), 'dd/MM/yyyy');
      const periodoFinalizacion = format(new Date(periodoPlanilla.end), 'dd/MM/yyyy');

      datosFormulario = {
        ...datosFormulario,
        periodo_inicio: periodoInicio,
        periodo_finalizacion: periodoFinalizacion
      };
    }
    this.planillaService.createPlanilla(datosFormulario).subscribe({
      next: (response) => {
        const codPlanilla = response?.codigo_planilla || 'Desconocido';
        this.toastr.success(`Planilla creada con éxito. Código: ${codPlanilla}`);
        this.limpiarFormulario();
        this.getPlanillasActivas();
      },
      error: (error) => {
        let mensajeError = 'Error desconocido al crear la planilla';
        if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.status === 409) {
          mensajeError = 'Ya existe una planilla activa de este tipo. No se puede crear otra hasta que la planilla actual sea cerrada.';
        }
        this.toastr.error(mensajeError, 'Error');
      }
    });
  }

  limpiarFormulario(): void {
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }

  onSelectChange(event: any) {
    const selectedPlanilla = event.value;
    this.dynamicForm.form.get('nombre_planilla')?.setValue(selectedPlanilla);

    if (selectedPlanilla.includes('COMPLEMENTARIA')) {
      if (!this.myFormFields.some(field => field.name === 'periodo_planilla')) {
        this.myFormFields.push({
          type: 'daterange',
          label: 'Periodo de Planilla',
          name: 'periodo_planilla',
          validations: [Validators.required],
          display: true
        });
      }
    } else {
      this.myFormFields = this.myFormFields.filter(field => field.name !== 'periodo_planilla');
      if (this.dynamicForm.form.contains('periodo_planilla')) {
        this.dynamicForm.form.removeControl('periodo_planilla');
      }
    }
    this.dynamicForm.updateFields(this.myFormFields);
  }
}
