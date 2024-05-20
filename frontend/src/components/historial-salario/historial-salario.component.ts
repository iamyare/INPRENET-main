import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generateHistSalFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    idBanco: new FormControl(datos.idBanco, Validators.required),
    numCuenta: new FormControl(datos.numCuenta, Validators.required),
  });
}

@Component({
  selector: 'app-historial-salario',
  templateUrl: './historial-salario.component.html',
  styleUrls: ['./historial-salario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class HistorialSalarioComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});

  Bancos: any;
  private formKey = 'FormBanco';

  @Output() newDatHistSal = new EventEmitter<any>()
  @Input() datos: any;

  onDatosHistSal() {
    const data = this.formParent;
    this.newDatHistSal.emit(data);
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) {
    this.datosEstaticos.getBancos();
    this.Bancos = this.datosEstaticos.Bancos;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.datos) {
      if (this.datos.value.banco && this.datos.value.banco.length > 0) {
        for (let i of this.datos.value.banco) {
          this.agregarBanco(i);
        }
      }
    }
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        banco: this.fb.array([])
      });
    }
  }

  agregarBanco(datos?: any): void {
    const ref_banco = this.formParent.get('banco') as FormArray;
    if (datos) {
      ref_banco.push(generateHistSalFormGroup(datos));
    } else {
      ref_banco.push(generateHistSalFormGroup({}));
    }
    this.onDatosHistSal();
  }

  eliminarBanco(): void {
    const ref_banco = this.formParent.get('banco') as FormArray;
    if (ref_banco.length > 0) {
      ref_banco.removeAt(ref_banco.length - 1);
    }
    this.onDatosHistSal();
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  addValidation(index: number, key: string): void {
    const colParent = this.formParent.get('banco') as FormArray;
    const colSingle = colParent.at(index).get(key) as FormControl;
    colSingle.setValidators(Validators.required);
    colSingle.updateValueAndValidity();
  }

  getErrors(i: number, fieldName: string): any {
    if (this.formParent instanceof FormGroup) {
      const controlesBanco = (this.formParent.get('banco') as FormGroup).controls;
      const a = controlesBanco[i].get(fieldName)!.errors

      let errors = [];
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
}
