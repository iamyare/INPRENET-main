import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, MinLengthValidator } from '@angular/forms';
import { kMaxLength } from 'buffer';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { ValidationService } from 'src/app/shared/services/validation.service'; // Importa el servicio

@Component({
  selector: 'app-sociedad',
  templateUrl: './sociedad.component.html',
  styleUrls: ['./sociedad.component.scss']
})
export class SociedadComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();

constructor (private validationService: ValidationService){}

  fields: FieldConfig[] = [
    {label: 'Nombre',name: 'nombre',type: 'text',icon: 'person',row: 1,col: 6,display: true,validations: [this.validationService.namesValidator()],},
    {label: 'RTN',name: 'rtn',type: 'text',icon: 'business',row: 1,col: 6,display: true,validations: [Validators.maxLength(14),this.validationService.rtnValidator(), ],},
    {label: 'Teléfono',name: 'telefono',type: 'number',icon: 'phone',row: 2,col: 6,display: true,validations: [this.validationService.numberValidator()],},
    {label: 'Correo Electrónico',name: 'correo_electronico',type: 'email',icon: 'email',row: 2,col: 6,display: true,validations: [Validators.email, this.validationService.emailValidator()],}
  ];

  ngOnInit() {
    this.addControlsToForm();
  }

  get formControls() {
    return this.parentForm.controls;
  }

  addControlsToForm() {
    this.fields.forEach(field => {
      if (!this.parentForm.contains(field.name)) {
        this.parentForm.addControl(field.name, new FormControl(field.value, field.validations));
      } else {
        const control = this.parentForm.get(field.name) as FormControl;
        control.setValue(control.value || field.value);
      }
    });
    this.formUpdated.emit(this.parentForm.value);
  }

  onDatosBenChange(form: any) {
    this.formUpdated.emit(form);
  }
}
