import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-tipo-planilla',
  templateUrl: './nuevo-tipo-planilla.component.html',
  styleUrl: './nuevo-tipo-planilla.component.scss'
})
export class NuevoTipoPlanillaComponent {

  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre de planilla', name: 'nombre_planilla', validations: [] },
    { type: 'text', label: 'Descripcion de planilla', name: 'descripcion', validations: [] },
    { type: 'text', label: 'Estado', name: 'estado', validations: [] },
    { type: 'daterange', label: 'Periodo', name: 'periodo', validations: []}
  ];


  obtenerDatos(event:any):any{
    console.log(event.value);
  }
}

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any | { start: Date; end: Date };
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}

/* { type: 'text', label: 'Nombre', name: 'nombre', validations: [] },
  { type: 'text', label: 'Apellido', name: 'apellido', validations: [] },
  { type: 'email', label: 'Correo Electrónico', name: 'email', validations: [] },
  { type: 'number', label: 'Edad', name: 'edad', validations: [] },
  { type: 'password', label: 'Contraseña', name: 'password', validations: [] },
  { type: 'date', label: 'sisoy', name: 'sisoy', validations: [] },
  { type: 'dropdown', label: 'Género', name: 'genero',
  options: [
      { label: 'Femenino', value: 'femenino' },
      { label: 'Masculino', value: 'masculino' },
      { label: 'Otro', value: 'otro' }
    ],
  validations: []
  },
  {
    type: 'date',
    label: 'Fecha de Nacimiento',
    name: 'fechaNacimiento',
    validations: [Validators.required]
  } */
