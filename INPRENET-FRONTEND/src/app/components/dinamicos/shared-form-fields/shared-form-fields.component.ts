import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-shared-form-fields',
  templateUrl: './shared-form-fields.component.html',
  styleUrls: ['./shared-form-fields.component.scss']
})
export class SharedFormFieldsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() fields: FieldArrays[] = [];
  @Output() selectChange = new EventEmitter<{ fieldName: string, value: any, formGroup: FormGroup }>();

  ngOnInit() {
    if (!(this.parentForm instanceof FormGroup)) {
      throw new Error('parentForm is not an instance of FormGroup');
    }

    // Aplicamos validadores a los campos configurados
    this.applyUniqueValidators();
  }

  // Obtiene un control del formulario
  getControl(name: any): FormControl {
    const control = this.parentForm.get(name);
    if (!(control instanceof FormControl)) {
      throw new Error(`Control ${name} is not an instance of FormControl`);
    }
    return control as FormControl;
  }

  // Aplica validadores de unicidad si están configurados
  applyUniqueValidators() {
    this.fields.forEach((field) => {
      if (field.validations?.includes('unique')) {
        const control = this.getControl(field.name);
        control.setValidators([...control.validator ? [control.validator] : [], this.uniqueFieldValidator(field.name)]);
        control.updateValueAndValidity();
      }
    });
  }

  // Validador personalizado para verificar la unicidad del campo
  uniqueFieldValidator(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const controls = this.parentForm.controls;
      let count = 0;

      Object.keys(controls).forEach((key) => {
        const fieldControl = this.parentForm.get(key);
        if (fieldControl && fieldControl.value === control.value && key !== fieldName) {
          count++;
        }
      });

      return count > 0 ? { fieldNotUnique: true } : null;
    };
  }

  // Obtiene los campos que pertenecen a una fila específica
  getFieldsInRow(rowIndex: number): FieldArrays[] {
    return this.fields.filter((field: FieldArrays) => field.layout?.row === rowIndex);
  }

  // Obtiene los índices de filas en el formulario
  getRowIndices(): number[] {
    const rows = new Set<number>();
    this.fields.forEach((field: FieldArrays) => rows.add(field.layout?.row ?? 0));
    return Array.from(rows).sort((a, b) => a - b);
  }

  // Manejador de cambio en select
  onSelectChange(fieldName: string, event: any) {
    this.selectChange.emit({ fieldName, value: event.value, formGroup: this.parentForm });
  }
}
