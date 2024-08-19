import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ControlContainer } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateConyugeFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    parentesco: new FormControl('Cónyuge', [Validators.required]),
    primer_nombre: new FormControl(datos?.primer_nombre, [Validators.required]),
    segundo_nombre: new FormControl(datos?.segundo_nombre),
    tercer_nombre: new FormControl(datos?.tercer_nombre),
    primer_apellido: new FormControl(datos?.primer_apellido, [Validators.required]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.required]),
    n_identificacion: new FormControl(datos?.n_identificacion, [Validators.required]),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento, [Validators.required]),
    telefono_casa: new FormControl(datos?.telefono_casa, [Validators.pattern(/^[0-9]{8,12}$/)]),
    telefono_celular: new FormControl(datos?.telefono_celular, [Validators.required, Validators.pattern(/^[0-9]{8,12}$/)]),
    telefono_trabajo: new FormControl(datos?.telefono_trabajo, [Validators.pattern(/^[0-9]{8,12}$/)])
  });
}

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
  availableParentescos: any[] = [];

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) {}

  ngOnInit(): void {
    this.initForm();
    this.forceValidation();
    this.loadParentescos();
  }

  private loadParentescos() {
    this.availableParentescos = this.datosEstaticosService.parentesco;
  }

  private initForm() {
    let existingForm = this.parentForm.get('familiares') as FormArray;
    if (!existingForm) {
      this.parentForm.setControl('familiares', this.fb.array([]));
    }

    // Agregar siempre un grupo de controles para el cónyuge
    this.addConyugeGroup();
  }

  private addConyugeGroup(datos?: any) {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    const conyugeGroup = generateConyugeFormGroup(datos);
    refFamiliares.push(conyugeGroup);
  }

  agregarFamiliar(datos?: any): void {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    const formGroup = generateFamiliaresFormGroup(datos || {});
    refFamiliares.push(formGroup);
    this.onDatosFamiliaresChange();
  }

  eliminarFamiliar(): void {
    const refFamiliares = this.parentForm.get('familiares') as FormArray;
    if (refFamiliares.length > 1) { // No eliminar el grupo del cónyuge
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

  getErrors(i: number, fieldName: string): string[] {
    const formArray = this.parentForm.get('familiares') as FormArray;
    const control = formArray.at(i).get(fieldName);

    let errorMessages: string[] = [];
    if (control && control.errors) {
      if (control.errors['required']) {
        errorMessages.push('Este campo es requerido.');
      }
      if (control.errors['minlength']) {
        errorMessages.push(`Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`);
      }
      if (control.errors['maxlength']) {
        errorMessages.push(`No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`);
      }
      if (control.errors['pattern']) {
        errorMessages.push('El formato no es válido.');
      }
    }
    return errorMessages;
  }


  private forceValidation() {
    const formArray = this.parentForm.get('familiares') as FormArray;
    formArray.controls.forEach(control => {
      control.markAsTouched(); // Marca todos los controles como tocados
      control.updateValueAndValidity(); // Forzar la validación
    });
  }
}
