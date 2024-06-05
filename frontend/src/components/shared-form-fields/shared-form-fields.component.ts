import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldArrays } from '../../app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-shared-form-fields',
  templateUrl: './shared-form-fields.component.html',
  styleUrls: ['./shared-form-fields.component.scss']
})
export class SharedFormFieldsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() fields: FieldArrays[] = [];

  ngOnInit() {
    if (!(this.parentForm instanceof FormGroup)) {
      throw new Error('parentForm is not an instance of FormGroup');
    }
  }

  getControl(name: string): FormControl {
    const control = this.parentForm.get(name);
    if (!(control instanceof FormControl)) {
      throw new Error(`Control ${name} is not an instance of FormControl`);
    }
    return control as FormControl;
  }

  getFieldsInRow(rowIndex: number): FieldArrays[] {
    return this.fields.filter((field: FieldArrays) => field.layout?.row === rowIndex);
  }

  getRowIndices(): number[] {
    const rows = new Set<number>();
    this.fields.forEach((field: FieldArrays) => rows.add(field.layout?.row ?? 0));
    return Array.from(rows).sort((a, b) => a - b);
  }
}
