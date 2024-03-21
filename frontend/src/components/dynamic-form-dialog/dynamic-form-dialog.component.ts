import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-dynamic-form-dialog',
  templateUrl: './dynamic-form-dialog.component.html',
  styleUrl: './dynamic-form-dialog.component.scss'
})
export class DynamicFormDialogComponent implements OnInit{

  form: FormGroup;
  dialogTitle: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DynamicFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fields: FieldConfig[], title: string }) {
    this.form = this.fb.group({});
    this.dialogTitle = data.title;
  }

  ngOnInit(): void {
    this.data.fields.forEach(field => {
      const control = new FormControl('', field.validations || []);
      this.form.addControl(field.name, control);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(this.form.value)) {
      const typedValue = value as string | number;
      result[key] = this.data.fields.find(field => field.name === key && field.type === 'number') ? +typedValue : typedValue;
    }
    this.dialogRef.close(result);
  }


}
