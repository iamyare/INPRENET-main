import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { BeneficiosService } from '../../../../services/beneficios.service';
import { ToastrService } from 'ngx-toastr';
import { FieldConfig } from 'src/app/views/shared/shared/Interfaces/field-config';
@Component({
  selector: 'app-nuevo-beneficio',
  templateUrl: './nuevo-beneficio.component.html',
  styleUrl: './nuevo-beneficio.component.scss'
})
export class NuevoBeneficioComponent {
  data:any

  constructor(private SVCBeneficios:BeneficiosService, private toastr: ToastrService ,){}

  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre de beneficio', name: 'nombre_beneficio', validations: [] },
    { type: 'text', label: 'Descripción de beneficio', name: 'descripcion_beneficio', validations: [] },
    { type: 'number', label: 'numero de rentas maximas', name: 'numero_rentas_max', validations: [] },

    { type: 'dropdown', label: 'Estado', name: 'estado', validations: [], options:[{label:"vitalicio", value:"vitalicio"},
    {label:"definido", value:"Definido"}] }
  ];

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoBeneficio(){
    const formValues = { ...this.data.value };
    this.myFormFields.forEach(field => {
      if (field.type === 'number' && formValues[field.name] !== null && formValues[field.name] !== undefined) {
        this.data.value[field.name] = + formValues[field.name];
      }
    });

    this.SVCBeneficios.newTipoBeneficio(this.data.value).subscribe(
      {
        next: (response) => {
          this.toastr.success('tipo de beneficio creado con éxito');
        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear tipo de beneficio';
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
}
