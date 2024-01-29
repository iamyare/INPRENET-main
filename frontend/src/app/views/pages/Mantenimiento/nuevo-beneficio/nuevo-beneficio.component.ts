import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { BeneficiosService } from '../../../../services/beneficios.service';
import { ToastrService } from 'ngx-toastr';
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

    { type: 'dropdown', label: 'Estado', name: 'estado', validations: [], options:[{label:"vitalicio", value:"vitalicio"},
    {label:"definido", value:"Definido"}] }
  ];

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoBeneficio(){
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

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any;
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
