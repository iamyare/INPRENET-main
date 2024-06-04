import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateReferenciaFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    tipoReferencia: new FormControl(datos?.tipoReferencia || '', Validators.required),
    nombre: new FormControl(datos?.nombre || '', Validators.required)
  });
}

@Component({
  selector: 'app-referencias-bancarias-comerciales',
  templateUrl: './referencias-bancarias-comerciales.component.html',
  styleUrls: ['./referencias-bancarias-comerciales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ReferenciasBancariasComercialesComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});
  private formKey = 'referenciasForm';

  @Input() editing?: boolean = false;
  @Input() datos?: any;
  @Output() newDataReferencia = new EventEmitter<any>();

  onDatosReferenciaChange() {
    const formArray = this.formParent?.get('Referencias') as FormArray;
    if (formArray) {
      const data = formArray.value;
      this.newDataReferencia.emit(data);
    } else {
      console.error('FormArray "Referencias" no está disponible');
    }
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.datos) {
      if (this.datos.value.Referencias.length > 0) {
        for (let i of this.datos.value.Referencias) {
          this.agregarReferencia(i);
        }
      }
    }
  }

  ngOnDestroy() {
    if (!this.editing) {
      // this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  private initForm() {
    this.formParent = this.fb.group({
      Referencias: this.fb.array([])
    });
  }

  agregarReferencia(datos?: any): void {
    const referencias = this.formParent.get('Referencias') as FormArray;
    const newFormGroup = generateReferenciaFormGroup(datos || {});
    referencias.push(newFormGroup);
    this.onDatosReferenciaChange();
  }

  eliminarReferencia(index: number): void {
    const referencias = this.formParent.get('Referencias') as FormArray;
    if (referencias.length > 0) {
      referencias.removeAt(index);
      this.onDatosReferenciaChange();
    }
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  addValidation(index: number, key: string): void {
    const referencias = this.formParent.get('Referencias') as FormArray;
    const referencia = referencias.at(index).get(key) as FormControl;
    referencia.setValidators(Validators.required);
    referencia.updateValueAndValidity();
  }

  getErrors(i: number, fieldName: string): any[] {
    const formArray = this.formParent.get('Referencias') as FormArray;
    const control = formArray.at(i).get(fieldName);
    if (control && control.errors) {
      return Object.keys(control.errors).map((key) => {
        if (key === 'required') return 'Este campo es requerido.';
        if (key === 'pattern') return 'El formato no es válido.';
        if (key === 'email') return 'El formato del correo no es válido.';
        return '';
      });
    }
    return [];
  }
}
