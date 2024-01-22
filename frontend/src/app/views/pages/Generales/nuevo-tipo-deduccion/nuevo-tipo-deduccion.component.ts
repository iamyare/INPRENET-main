import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-tipo-deduccion',
  templateUrl: './nuevo-tipo-deduccion.component.html',
  styleUrl: './nuevo-tipo-deduccion.component.scss'
})
export class NuevoTipoDeduccionComponent {
  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre', name: 'nombre', validations: [] },
    { type: 'text', label: 'Descripción', name: 'descripcion', validations: [] },
    { type: 'number', label: 'prioridad', name: 'prioridad', validations: [] },
    { type: 'dropdown', label: 'Tipo de deducción', name: 'tipo_deduccion',
    options: [
        { label: 'Terceros', value: 'Terceros' },
        { label: 'Inprema', value: 'Inprema' },
        { label: 'Otro', value: 'otro' }
      ],
    validations: []
    },
  ];

  obtenerDatos(event:any):any{
    console.log(event.value);
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
