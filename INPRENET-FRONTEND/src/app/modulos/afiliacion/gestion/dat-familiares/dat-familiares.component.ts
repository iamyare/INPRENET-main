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
}
