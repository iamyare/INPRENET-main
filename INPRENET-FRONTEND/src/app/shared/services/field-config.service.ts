/*import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from '../Interfaces/field-config';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root',
})
export class FieldConfigService {
  constructor(private validationService: ValidationService) {}

  getAdministradorFields(): FieldConfig[] {
    return [
      {
        name: 'n_identificacion',
        label: 'Número de identificación',
        type: 'text',
        icon: 'badge',
        value: '',
        display: true,
        readOnly: false,
        validations: [Validators.required, Validators.min(0), this.validationService.dniValidator()],
        row: 1,
        col: 6,
      },
      {
        name: 'administradorNombre',
        label: 'Nombre del Administrador',
        type: 'text',
        icon: 'person',
        value: '',
        display: true,
        readOnly: false,
        validations: [Validators.required, Validators.maxLength(40), this.validationService.namesValidator()],
        row: 1,
        col: 6,
      },
      {
        name: 'administradorTelefono',
        label: 'Teléfono 1',
        type: 'text',
        icon: 'phone',
        value: '',
        display: true,
        readOnly: false,
        validations: [Validators.required, Validators.maxLength(14), this.validationService.phoneValidator()],
        row: 1,
        col: 6,
      },
      {
        name: 'administradorCorreo',
        label: 'Correo Electrónico',
        type: 'text',
        icon: 'email',
        row: 1,
        col: 6,
        display: true,
        validations: [Validators.required, Validators.email, this.validationService.emailValidator()],
      },
    ];
  }

  getContadorFields(): FieldConfig[] {
    return [
      {
        name: 'n_identificacion',
        label: 'Número de Identificación',
        type: 'text',
        icon: 'badge',
        value: '',
        display: true,
        readOnly: false,
        validations: [Validators.required, Validators.min(0), this.validationService.dniValidator()],
        row: 1,
        col: 6,
      },
      {
        name: 'contadorNombre',
        label: 'Nombre Completo',
        type: 'text',
        icon: 'person',
        row: 1,
        col: 6,
        display: true,
        validations: [Validators.required, this.validationService.namesValidator()],
      },
      {
        name: 'contadorTelefono',
        label: 'Teléfono Fijo',
        type: 'text',
        icon: 'phone',
        row: 1,
        col: 6,
        display: true,
        validations: [Validators.required, this.validationService.phoneValidator()],
      },
      {
        name: 'contadorCorreo',
        label: 'Correo Electrónico',
        type: 'email',
        icon: 'email',
        value: '',
        display: true,
        readOnly: false,
        validations: [Validators.required, Validators.maxLength(255), Validators.email, this.validationService.emailValidator()],
        row: 1,
        col: 6,
      },
    ];
  }

}*/
