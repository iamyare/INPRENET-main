import { Component, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { ToastrService } from 'ngx-toastr';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
@Component({
  selector: 'app-nuevo-tipo-deduccion',
  templateUrl: './nuevo-tipo-deduccion.component.html',
  styleUrl: './nuevo-tipo-deduccion.component.scss'
})
export class NuevoTipoDeduccionComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  myFormFields: FieldConfig[] = [
    { type: 'dropdown', label: 'Tipo de deducción', name: 'tipo_deduccion',
    options: [
        { label: 'Terceros', value: 'Terceros' },
        { label: 'Inprema', value: 'Inprema' },
        { label: 'Otro', value: 'otro' }
      ],
    validations: []
    },
    { type: 'text', label: 'Nombre', name: 'nombre_deduccion', validations: [] },
    { type: 'text', label: 'Descripción', name: 'descripcion_deduccion', validations: [] },
    { type: 'text', label: 'Codigo de deduccion', name: 'codigo_deduccion', validations: [] },
    { type: 'number', label: 'prioridad', name: 'prioridad', validations: [] },
  ];

  data:any

  constructor(private SVCDeduccion:DeduccionesService, private toastr: ToastrService ){}

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoDeduccion():any{

    this.SVCDeduccion.newTipoDeduccion(this.data.value).subscribe(
      {
        next: (response) => {
          this.toastr.success('tipo de deduccion creado con éxito');
          this.limpiarFormulario()
        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear tipo de deduccion';

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
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }

}
