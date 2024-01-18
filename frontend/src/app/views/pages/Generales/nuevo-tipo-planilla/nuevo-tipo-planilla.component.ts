import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-tipo-planilla',
  templateUrl: './nuevo-tipo-planilla.component.html',
  styleUrl: './nuevo-tipo-planilla.component.scss'
})
export class NuevoTipoPlanillaComponent {

  myFormFields: FieldConfig[] = [
    { type: 'text', label: 'Nombre', name: 'nombre', validations: [] },
    { type: 'text', label: 'Apellido', name: 'apellido', validations: [] },
    { type: 'email', label: 'Correo Electrónico', name: 'email', validations: [] },
    { type: 'number', label: 'Edad', name: 'edad', validations: [] },
    { type: 'password', label: 'Contraseña', name: 'password', validations: [] },
    { type: 'text', label: 'sisoy', name: 'sisoy', validations: [Validators.email] },
  ];
}

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any;  // Agrega esta línea
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
