import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
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
    this.newDatBenChange.emit(this.getFormValues());
  }

  onDatosBenChange() {
    this.newDatBenChange.emit(this.getFormValues());
  }

  createControl(): FormGroup {
    const group = this.fb.group({});

    this.fields.forEach((field:any) => {
      if (field.type === 'daterange') {
        const dateRangeGroup = this.fb.group({
          start: [field.value?.start || '', field.validations],
          end: [field.value?.end || '', field.validations]
        });
        group.addControl(field.name, dateRangeGroup);
      } else if (field.type === 'checkboxGroup') {
        const checkboxArray = this.fb.array(field.options.map(() => this.fb.control(false)));
        group.addControl(field.name, checkboxArray);
      } else if (field.type === 'radio') {
        const radioGroup = this.fb.group({
          [field.name]: [field.value || '', field.validations]
        });
        group.addControl(field.name, radioGroup);
      } else {
        const control = field.type === 'number'
          ? this.fb.control(
            +field.value || null,
            field.validations
          )
          : this.fb.control(
            field.type === 'checkbox' ? field.value || false : field.value || '',
            field.validations
          );
        group.addControl(field.name, control);
      }
    });

    return group;
  }

  getFormValues() {
    const formValues = this.form.value;
    const result:any = {};

    this.fields.forEach((field:any) => {
      if (field.type === 'daterange') {
        result[field.name] = {
          start: formValues[field.name]?.start,
          end: formValues[field.name]?.end
        };
      } else if (field.type === 'checkboxGroup') {
        const selectedOptions = formValues[field.name]
          .map((checked:any, i:any) => checked ? field.options[i].value : null)
          .filter((v:any) => v !== null);
        result[field.name] = selectedOptions;
      } else if (field.type === 'radio') {
        result[field.name] = formValues[field.name];
      } else {
        result[field.name] = formValues[field.name];
      }
    });

    return result;
  }

  getRangeFormGroup(fieldName: string): FormGroup {
    const control = this.form.get(fieldName);
    if (control instanceof FormGroup) {
      return control as FormGroup;
    } else {
      throw new Error(`Control with name '${fieldName}' is not a FormGroup`);
    }
  }

  getCheckboxArray(fieldName: string): FormArray {
    const control = this.form.get(fieldName);
    if (control instanceof FormArray) {
      return control as FormArray;
    } else {
      throw new Error(`Control with name '${fieldName}' is not a FormArray`);
    }
  }
}
