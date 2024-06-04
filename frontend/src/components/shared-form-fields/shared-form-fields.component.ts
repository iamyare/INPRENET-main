import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-shared-form-fields',
  templateUrl: './shared-form-fields.component.html',
  styleUrls: ['./shared-form-fields.component.scss']
})
export class SharedFormFieldsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() fieldNames: string[] = [];
  @Input() fieldLabels: { [key: string]: string } = {};
  @Input() icons: { [key: string]: string } = {};
  @Input() fieldLayout: { [key: string]: { row: number; col: number } } = {};

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

  getFieldsInRow(rowIndex: number): string[] {
    return this.fieldNames.filter((name, index) => {
      const layout = this.fieldLayout[name];
      return layout && layout.row === rowIndex;
    });
  }
}
