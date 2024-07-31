import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  form: FormGroup;

  @Input() titulo = "";
  @Input() subtitulo = "";

  @Input() fields: FieldConfig[] = [];
  @Input() incomingForm!: FormGroup;

  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() selectChange = new EventEmitter<{ fieldName: string, value: any }>();

  selectedOption: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.form = this.createControl();
    this.form = this.mergeForms(this.form);

    this.newDatBenChange.emit(this.form);
  }

  onDatosBenChange() {
    this.newDatBenChange.emit(this.form);
  }

  onDatosBenChange1(e: any) {
    console.log(e);
    const transformedForm = this.transformFormValues(this.form!);

    this.newDatBenChange.emit(transformedForm);
  }

  createControl(): FormGroup {
    const group = this.fb.group({});

    this.fields.forEach((field: any) => {
      if (field.type === 'daterange') {
        const dateRangeGroup = this.fb.group({
          start: [field.value?.start || '', field.validations],
          end: [field.value?.end || '', field.validations]
        });
        group.addControl(field.name, dateRangeGroup);
      } else if (field.type === 'checkboxGroup') {
        const checkboxArray = this.fb.array(field.options ? field.options.map(() => this.fb.control(false)) : []);
        group.addControl(field.name, checkboxArray);
      } else if (field.type === 'radio') {
        const radioGroup = this.fb.control(field.value || '', field.validations);
        group.addControl(field.name, radioGroup);
      } else if (field.type === 'conditionalRadio') {
        const radioGroup = this.fb.control(field.value || '', field.validations);
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

  private transformFormValues(form: FormGroup): any {
    const result: any = {};

    this.fields.forEach((field: any) => {
      if (field.type === 'daterange') {
        result[field.name] = {
          start: form.get(field.name)?.value.start,
          end: form.get(field.name)?.value.end
        };
      } else if (field.type === 'checkboxGroup') {
        const checkboxArray = form.get(field.name) as FormArray;
        result[field.name] = checkboxArray.controls
          .map((control: any, index: number) => ({
            id_discapacidad: field.options[index].value,
            value: control.value
          }))
          .filter((item: any) => item.value)
          .map((item: any) => ({ id_discapacidad: item.id_discapacidad }));
      } else if (field.type === 'radio') {
        result[field.name] = form.get(field.name)?.value;
      } else if (field.type === 'conditionalRadio') {
        result[field.name] = form.get(field.name)?.value;
      } else {
        result[field.name] = form.get(field.name)?.value;
      }
    });

    return result;
  }

  mergeForms(incomingForm: FormGroup): FormGroup {
    const group = this.createControl();
    Object.keys(incomingForm.controls).forEach(key => {
      if (group.contains(key)) {
        group.setControl(key, incomingForm.get(key)!);
      } else {
        group.addControl(key, incomingForm.get(key)!);
      }
    });

    return group;
  }

  getFormValues() {
    const formValues = this.form.value;
    const result: any = {};

    this.fields.forEach((field: any) => {
      if (field.type === 'daterange') {
        result[field.name] = {
          start: formValues[field.name]?.start,
          end: formValues[field.name]?.end
        };
      } else if (field.type === 'checkboxGroup') {
        const selectedOptions = formValues[field.name]
          .map((checked: any, i: any) => checked ? field.options ? field.options[i].value : null : null)
          .filter((v: any) => v !== null);
        result[field.name] = selectedOptions;
      } else if (field.type === 'radio') {
        result[field.name] = formValues[field.name];
      } else if (field.type === 'conditionalRadio') {
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

  onSelectChange(fieldName: string, event: any) {
    this.selectChange.emit({ fieldName, value: event.value });
    if (fieldName === 'showCheckboxes') {
      this.selectedOption = event.value;
      this.updateDependentFields();
    }
  }

  updateDependentFields() {
    const selectedField = this.fields.find(field => field.name === 'showCheckboxes');
    if (selectedField && selectedField.dependentFields) {
      const dependentFields = selectedField.dependentFields[this.selectedOption!];
      if (dependentFields) {
        dependentFields.forEach(field => {
          if (!this.form.contains(field.name)) {
            if (field.type === 'checkboxGroup') {
              const checkboxArray = this.fb.array(field.options ? field.options.map(() => this.fb.control(false)) : []);
              this.form.addControl(field.name, checkboxArray);
            } else {
              this.form.addControl(field.name, this.fb.control(''));
            }
          }
        });
      }
    }
  }
}
