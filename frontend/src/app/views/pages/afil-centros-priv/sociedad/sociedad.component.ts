import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-sociedad',
  templateUrl: './sociedad.component.html',
  styleUrls: ['./sociedad.component.scss']
})
export class SociedadComponent {

  fields: FieldConfig[] = [
    {
      label: 'Nombre',
      name: 'nombre',
      type: 'text',
      icon: 'person',
      row: 1,
      col: 6,
      display: true,
      validations: [],
    },
    {
      label: 'RTN',
      name: 'rtn',
      type: 'text',
      icon: 'business',
      row: 1,
      col: 6,
      display: true,
      validations: [],
    },
    {
      label: 'Teléfono',
      name: 'telefono',
      type: 'tel',
      icon: 'phone',
      row: 2,
      col: 6,
      display: true,
      validations: [],
    },
    {
      label: 'Correo Electrónico',
      name: 'correo_electronico',
      type: 'email',
      icon: 'email',
      row: 2,
      col: 6,
      display: true,
      validations: [Validators.email],
    }
  ];

  onDatosBenChange(form: any) {
    console.log('Valores del formulario:', form);
  }
}
