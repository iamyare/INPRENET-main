import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-beneficio',
  templateUrl: './nuevo-beneficio.component.html',
  styleUrl: './nuevo-beneficio.component.scss'
})
export class NuevoBeneficioComponent {

  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre de beneficio', name: 'nombre_planilla', validations: [] },
    { type: 'text', label: 'Descripcion de beneficio', name: 'descripcion', validations: [] },
    { type: 'text', label: 'Estado', name: 'estado', validations: [] },
    { type: 'text', label: 'Prioridad', name: 'prioridad', validations: [] },
    { type: 'text', label: 'Duracion', name: 'periodoInicio', validations: [] },
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
