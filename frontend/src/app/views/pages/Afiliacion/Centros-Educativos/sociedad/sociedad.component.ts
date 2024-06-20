import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-sociedad',
  templateUrl: './sociedad.component.html',
  styleUrls: ['./sociedad.component.scss']
})
export class SociedadComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();

  fields: FieldConfig[] = [
    {
      label: 'Nombre',
      name: 'nombre',
      value: "prueba@gmail.com",
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
      value: "12345678912345",
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
      value: "22255636",
      type: 'tel',
      icon: 'phone',
      row: 2,
      col: 6,
      display: true,
      validations: [],
    },
    {
      label: 'Correo Electrónico',
      value: "prueba@gmail.com",
      name: 'correo_electronico',
      type: 'email',
      icon: 'email',
      row: 2,
      col: 6,
      display: true,
      validations: [Validators.email],
    }
  ];

  ngOnInit() {
    this.addControlsToForm();
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
