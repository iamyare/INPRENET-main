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
    {label:"definido", value:"Definido"}] },

    { type: 'number', label: 'Prioridad', name: 'prioridad', validations: [Validators.pattern("^\\d*\\.?\\d+$")] },
    { type: 'number', label: 'monto', name: 'monto_beneficio', validations: [Validators.pattern("^\\d*\\.?\\d+$")] },
    { type: 'number', label: 'porcentaje', name: 'porcentaje_beneficio', validations: [Validators.pattern("^\\d*\\.?\\d+$")] },
    { type: 'number', label: 'Años de duración', name: 'anio_duracion', validations: [Validators.pattern("^\\d*\\.?\\d+$")]},
    { type: 'number', label: 'Meses de duración', name: 'mes_duracion', validations: [Validators.pattern("^\\d*\\.?\\d+$")] },
    { type: 'number', label: 'Dias de duración', name: 'dia_duracion', validations: [Validators.pattern("^\\d*\\.?\\d+$")] }
  ];

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoBeneficio(){
    this.SVCBeneficios.newTipoBeneficio(this.data).subscribe(
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
