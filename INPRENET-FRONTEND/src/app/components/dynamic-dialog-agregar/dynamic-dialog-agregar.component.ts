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
  dynamicOptions: { [key: string]: any[] } = {};

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
      
      if (field.options) {
        this.dynamicOptions[field.name] = field.options;
      }

      // Si un campo depende de otro, agregar listener dinámico
      if (field.dependsOn) {
        this.form.get(field.dependsOn)?.valueChanges.subscribe((parentValue) => {
          this.updateDependentOptions(field.name, field.dependsOn, parentValue);
        });
      }
    });
  }

  mapValidators(validators: ValidatorConfig[]): any[] {
    const map: { [key: string]: any } = {
      required: Validators.required,
      minLength: Validators.minLength,
      maxLength: Validators.maxLength,
      pattern: Validators.pattern,
      email: Validators.email,
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

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.hasError('maxlength')) return `No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`;
    if (control.hasError('pattern')) return 'Solo se permiten letras y espacios.';

    return 'Error desconocido.';
  }

  updateDependentOptions(childFieldName: string, parentFieldName: string, parentValue: any): void {
    const childField = this.data.fields.find((f: any) => f.name === childFieldName);
    if (childField && childField.options) {
      this.dynamicOptions[childFieldName] = childField.options.filter(
        (option: any) => option[parentFieldName] === parentValue
      );
      this.form.get(childFieldName)?.setValue(null); // Resetear selección al cambiar dependencia
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
