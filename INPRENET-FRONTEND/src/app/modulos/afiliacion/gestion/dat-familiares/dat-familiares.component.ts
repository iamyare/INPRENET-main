import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateFamiliarFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    primer_nombre: new FormControl(datos?.primer_nombre, [Validators.required, Validators.maxLength(40)]),
    segundo_nombre: new FormControl(datos?.segundo_nombre, [Validators.maxLength(40)]),
    primer_apellido: new FormControl(datos?.primer_apellido, [Validators.required, Validators.maxLength(40)]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.maxLength(40)]),
    n_identificacion: new FormControl(datos?.n_identificacion, [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]),
    parentesco: new FormControl(datos?.parentesco, [Validators.required, Validators.maxLength(30)])
  });
}

@Component({
  selector: 'app-dat-familiares',
  templateUrl: './dat-familiares.component.html',
  styleUrls: ['./dat-familiares.component.scss']
})
export class DatFamiliaresComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formParent = this.fb.group({
      familiares: this.fb.array([])
    });
  }

  agregarFamiliar(datos?: any): void {
    const familiaresArray = this.formParent.get('familiares') as FormArray;
    familiaresArray.push(generateFamiliarFormGroup(datos || {}));
  }

  eliminarFamiliar(): void {
    const familiaresArray = this.formParent.get('familiares') as FormArray;
    if (familiaresArray.length > 0) {
      familiaresArray.removeAt(familiaresArray.length - 1);
    }
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  getErrors(i: number, fieldName: string): any {
    const controlesFamiliares = (this.formParent.get('familiares') as FormArray).controls;
    const errors = controlesFamiliares[i].get(fieldName)!.errors;
    if (errors) {
      let errorMessages = [];
      if (errors['required']) {
        errorMessages.push('Este campo es requerido.');
      }
      if (errors['maxlength']) {
        errorMessages.push(`No puede tener más de ${errors['maxlength'].requiredLength} caracteres.`);
      }
      if (errors['pattern']) {
        errorMessages.push('El formato no es válido.');
      }
      return errorMessages;
    }
  }

  onDatosFamiliaresChange(): void {
    console.log(this.formParent.value);
  }
}
