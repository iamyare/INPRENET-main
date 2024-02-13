import { Component, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-nuevo-tipo-planilla',
  templateUrl: './nuevo-tipo-planilla.component.html',
  styleUrl: './nuevo-tipo-planilla.component.scss'
})
export class NuevoTipoPlanillaComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  data:any;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService
  ){

  }
  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre de planilla', name: 'nombre_planilla', validations: [Validators.required,Validators.maxLength(50)] },
    { type: 'text', label: 'Descripción de planilla', name: 'descripcion', validations: [] },
  ];

  obtenerDatos(event: any): any {

    this.data = event;
}

  insertarDatos(): void {
  this.planillaService.createTipoPlanilla(this.data.value).subscribe({
    next: (response) => {
      this.toastr.success('TipoPlanilla creada con éxito');
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
