import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit{@Input() fields: FieldConfig[] = [];
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.form = this.createControl();
  }

  createControl(): FormGroup {
    const group = this.fb.group({});
    this.fields.forEach(field => {
      const control = this.fb.control(
        field.value ?? '',  // Usa un valor por defecto si `value` no está presente
        field.validations
      );
      group.addControl(field.name, control);
    });

    return group;
  }
}

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any;  // Agrega esta línea
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
