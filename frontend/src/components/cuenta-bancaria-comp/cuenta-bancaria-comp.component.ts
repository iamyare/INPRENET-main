import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';


export function generatePuestoTrabFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    numero_cuenta: new FormControl(datos?.numero_cuenta, [
      Validators.required,
      Validators.min(1),
    ]),
    creado_por: new FormControl(datos?.creado_por, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    tipo_cuenta: new FormControl(datos?.tipo_cuenta, [
      Validators.required,
      Validators.maxLength(40),
    ])
  });
}

@Component({
  selector: 'app-cuenta-bancaria-comp',
  templateUrl: './cuenta-bancaria-comp.component.html',
  styleUrl: './cuenta-bancaria-comp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class CuentaBancariaCompComponent {
  public formParent: FormGroup = new FormGroup({});

  tipoCuenta: any = this.datosEstaticos.tipoCuenta;
  sector: any = this.datosEstaticos.sector;

  @Output() newDatDatosPuestTrab = new EventEmitter<any>()
  @Input() datos: any;
  @Input() editing?: boolean = false;

  onDatosDatosPuestTrab() {
    const data = this.formParent.value;
    this.newDatDatosPuestTrab.emit(data);
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) { }

  private formKey = 'FormTrabajo';

  ngOnInit(): void {
    this.initForm();
    const trabajoArray = this.formParent.get('trabajo') as FormArray;
    if (this.datos && this.datos.trabajo && this.datos.trabajo.length > 0 && trabajoArray.length === 0) {
      for (let i of this.datos.trabajo) {
        this.agregarTrabajo(i);
      }
    }
    this.formParent.valueChanges.subscribe(values => {
      this.newDatDatosPuestTrab.emit(values);
    });
  }

  ngOnDestroy() {
    /* if (!this.editing) {
      this.formStateService.setForm(this.formKey, this.formParent);
    } */
  }


  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        trabajo: this.fb.array([])  // Corrige aquí el nombre correcto del FormArray
      });
      /* this.formStateService.setForm(this.formKey, this.formParent); */
    }
  }


  agregarTrabajo(datos?: any): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    if (datos) {
      ref_trabajo.push(generatePuestoTrabFormGroup(datos));
    } else {
      ref_trabajo.push(generatePuestoTrabFormGroup({}));
    }
  }

  eliminarTrabajo(): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    ref_trabajo.removeAt(-1);
  }


  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  getErrors(i: number, fieldName: string): any {

    const controlesrefpers = (this.formParent.get('trabajo') as FormGroup).controls;
    const a = controlesrefpers[i].get(fieldName)!.errors

    let errors = []
    if (a) {
      if (a['required']) {
        errors.push('Este campo es requerido.');
      }
      if (a['minlength']) {
        errors.push(`Debe tener al menos ${a['minlength'].requiredLength} caracteres.`);
      }
      if (a['maxlength']) {
        errors.push(`No puede tener más de ${a['maxlength'].requiredLength} caracteres.`);
      }
      if (a['pattern']) {
        errors.push('El formato no es válido.');
      }
      return errors;
    }
  }
}
