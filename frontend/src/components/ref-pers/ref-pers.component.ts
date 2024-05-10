import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormStateService } from 'src/app/services/form-state.service';

export function generateRefPerFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    nombre_completo: new FormControl(datos?.nombre_completo, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    parentesco: new FormControl(datos?.parentesco, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
    ]),
    direccion: new FormControl(datos?.direccion, [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(200),
    ]),
    telefono_domicilio: new FormControl(datos?.telefono_domicilio, [
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
    telefono_trabajo: new FormControl(datos?.telefono_trabajo, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
    telefono_personal: new FormControl(datos?.telefono_personal, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
    dni: new FormControl(datos?.dni, [
      Validators.required,
      Validators.maxLength(15),
      Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/),
    ]),
  });
}

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrl: './ref-pers.component.scss'
})
export class RefPersComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});

  private formKey = 'refForm';


  @Input() nombreComp?: string
  @Input() datos?: any
  @Output() newDatRefPerChange = new EventEmitter<any>()

  onDatosRefPerChange() {
    const data = this.formParent
    this.newDatRefPerChange.emit(data)
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
    if (this.datos) {
      if (this.datos.value.refpers.length > 0) {
        for (let i of this.datos.value.refpers) {
          this.agregarRefPer(i)
        }
      }
    }
  }

  ngOnDestroy() {
    /* this.formStateService.setForm(this.formKey, this.formParent); */
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        refpers: this.fb.array([])
      });
      /* this.formStateService.setForm(this.formKey, this.formParent); */
    }
  }

  agregarRefPer(datos?: any): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos) {
      ref_RefPers.push(generateRefPerFormGroup(datos))
    } else {
      ref_RefPers.push(generateRefPerFormGroup({}))
    }
  }

  eliminarRefPer(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent
    this.newDatRefPerChange.emit(data);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  addValidation(index: number, key: string): void {
    const refParent = this.formParent.get('refpers') as FormArray;
    const refSingle = refParent.at(index).get(key) as FormGroup;

    refSingle.setValidators(
      [
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required
      ]
    )
    refSingle.updateValueAndValidity();
  }

}
