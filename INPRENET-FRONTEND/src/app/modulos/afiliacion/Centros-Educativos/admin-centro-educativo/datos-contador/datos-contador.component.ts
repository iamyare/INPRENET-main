import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { CentroEducativoService } from 'src/app/services/centro-educativo.service'; // Importar el servicio compartido

@Component({
  selector: 'app-datos-contador',
  templateUrl: './datos-contador.component.html',
  styleUrls: ['./datos-contador.component.scss']
})
export class DatosContadorComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  fields: FieldConfig[] = [
    {name: 'n_identificacionContador',label: 'Numero de identificación',type: 'text',icon: 'badge',value: '',display: true,readOnly: false,validations: [Validators.required, Validators.min(0), this.validationService.dniValidator()],row: 1,col: 6},
    {name: 'contadorNombre',label: 'Nombre del Contador',type: 'text',icon: 'person',value: '',display: true,readOnly: false,validations: [Validators.required, Validators.maxLength(40), this.validationService.namesValidator()],row: 1,col: 6},
    {name: 'contadorTelefono',label: 'Teléfono',type: 'text',icon: 'phone',value: '',display: true,readOnly: false,validations: [Validators.required, Validators.maxLength(14), this.validationService.phoneValidator()],row: 1,col: 6},
    {name: 'contadorCorreo',label: 'Correo Electrónico',type: 'text',icon: 'email',row: 1,col: 6,display: true,options: [],validations: [Validators.required, Validators.email, this.validationService.emailValidator()]}
  ];

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private centroEducativoService: CentroEducativoService // Inyectar el servicio compartido
  ) {}

  ngOnInit() {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({});
    }

    if (this.fields) {
      this.addControlsToForm();
    }

    // Suscribirse a los cambios en el formulario y actualizar el servicio si el formulario es válido
    this.parentForm.valueChanges.subscribe(value => {
      if (this.parentForm.valid) { // Solo actualizar el servicio si el formulario es válido
        console.log('Actualizando datos del Contador en el servicio:', value);
        this.centroEducativoService.updateContadorData(value); // Actualizar el servicio
      }
    });
  }

  addControlsToForm() {
    if (!this.parentForm) { // Verificar que parentForm esté definido
      return;
    }
    this.fields.forEach(field => {
      if (!this.parentForm.contains(field.name)) {
        this.parentForm.addControl(field.name, new FormControl(field.value, field.validations));
      } else {
        const control = this.parentForm.get(field.name) as FormControl;
        control.setValue(control.value || field.value);
      }
    });
  }
}
