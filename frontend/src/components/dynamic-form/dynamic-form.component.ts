import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit{
  form: FormGroup;

  @Input() fields: FieldConfig[] = [];
  @Input() titulo = "";
  @Input() subtitulo = "";
  @Output() newDatBenChange = new EventEmitter<any>()

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.form = this.createControl();
    this.newDatBenChange.emit(this.form);
  }

  onDatosBenChange() {
  const formValues = { ...this.form.value };
  this.fields.forEach(field => {
    if (field.type === 'number' && formValues[field.name] !== null && formValues[field.name] !== undefined) {
      this.form.value[field.name] = + formValues[field.name];
    }
  });
  this.newDatBenChange.emit(this.form);

}

  createControl(): FormGroup {
    const group = this.fb.group({});
    this.fields.forEach(field => {
      if (field.type === 'daterange') {
        const dateRangeGroup = this.fb.group({
          start: [field.value?.start || '', field.validations],
          end: [field.value?.end || '', field.validations]
        });
        group.addControl(field.name, dateRangeGroup);
      } else {
        // Modificación aquí
        const control = field.type === 'number'
          ? this.fb.control(
              // Utilizamos el operador + para convertir la cadena a número
              +field.value || null,
              field.validations
            )
          : this.fb.control(
              field.value || '',
              field.validations
            );
        group.addControl(field.name, control);
      }
    });

    return group;
  }

  getRangeFormGroup(fieldName: string): FormGroup {
    const control = this.form.get(fieldName);
    if (control instanceof FormGroup) {
      return control;
    } else {
      throw new Error(`Control with name '${fieldName}' is not a FormGroup`);
    }
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
