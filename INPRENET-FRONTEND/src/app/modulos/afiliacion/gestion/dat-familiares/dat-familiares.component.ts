import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ControlContainer } from '@angular/forms';

export function generateFamiliaresFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    primer_nombre: new FormControl(datos?.primer_nombre, [Validators.required]),
    segundo_nombre: new FormControl(datos?.segundo_nombre),
    tercer_nombre: new FormControl(datos?.tercer_nombre),
    primer_apellido: new FormControl(datos?.primer_apellido, [Validators.required]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.required]),
    n_identificacion: new FormControl(datos?.n_identificacion, [Validators.required]),
    parentesco: new FormControl(datos?.parentesco, [Validators.required]),
  });
}

@Component({
  selector: 'app-dat-familiares',
  templateUrl: './dat-familiares.component.html',
  styleUrls: ['./dat-familiares.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class DatFamiliaresComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() newDatosFamiliares = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.forceValidation();
  }

  private initForm() {
    let existingForm = this.parentForm.get('familiares') as FormArray;
    if (!existingForm) {
      this.parentForm.setControl('familiares', this.fb.array([]));
    }
  }

  agregarFamiliar(datos?: any): void {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    const formGroup = generateFamiliaresFormGroup(datos || {});
    refFamiliares.push(formGroup);
    this.onDatosFamiliaresChange();
  }

  eliminarFamiliar(): void {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    if (refFamiliares.length > 0) {
      refFamiliares.removeAt(refFamiliares.length - 1);
      this.onDatosFamiliaresChange();
    }
  }

  onDatosFamiliaresChange() {
    const data = this.parentForm.get('familiares')?.value;
    this.newDatosFamiliares.emit(data);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  getErrors(i: number, fieldName: string): any {
    if (this.parentForm instanceof FormGroup) {
      const controlesFamiliares = (this.parentForm.get('familiares') as FormArray).controls;
      const errors = controlesFamiliares[i].get(fieldName)!.errors;

      let errorMessages = [];
      if (errors) {
        if (errors['required']) {
          errorMessages.push('Este campo es requerido.');
        }
        if (errors['minlength']) {
          errorMessages.push(`Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`);
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
  }

  private forceValidation() {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    refFamiliares.controls.forEach(control => {
      control.updateValueAndValidity();
    });
  }
}
