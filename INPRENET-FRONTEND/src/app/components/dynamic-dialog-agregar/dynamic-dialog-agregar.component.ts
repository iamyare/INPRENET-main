import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

type ValidatorConfig = string | { name: string, args: any[] };

@Component({
  selector: 'app-dynamic-dialog-agregar',
  templateUrl: './dynamic-dialog-agregar.component.html',
  styleUrls: ['./dynamic-dialog-agregar.component.scss']
})
export class DynamicDialogAgregarComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DynamicDialogAgregarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.data.fields.forEach((field: any) => {
      const control = new FormControl(
        '',
        field.validators ? this.mapValidators(field.validators) : []
      );
      this.form.addControl(field.name, control);
    });
  }

  mapValidators(validators: ValidatorConfig[]): any[] {
    const map: { [key: string]: any } = {
      required: Validators.required,
      minLength: Validators.minLength,
      maxLength: Validators.maxLength,
      pattern: Validators.pattern,
      email: Validators.email,
      // Agrega más validadores aquí según sea necesario
    };

    return validators.map(validator => {
      if (typeof validator === 'string') {
        return map[validator];
      } else if (typeof validator === 'object' && 'name' in validator && 'args' in validator) {
        return map[validator.name](...validator.args);
      }
      return null;
    }).filter(v => v !== null);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.value);
  }
}
