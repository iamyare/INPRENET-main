import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormStateService } from 'src/app/services/form-state.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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
      Validators.maxLength(15),
      Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/),
    ]),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento),
    es_afiliado: new FormControl(datos?.es_afiliado || false),
    trabaja: new FormControl(datos?.trabaja || false),
  });
}

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrls: ['./ref-pers.component.scss']
})
export class RefPersComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});
  private formKey = 'refForm';
  parentesco: any;
  availableParentesco: any[] = [];

  @Input() nombreComp?: string;
  @Input() datos?: any;
  @Output() newDatRefPerChange = new EventEmitter<any>();

  onDatosRefPerChange() {
    const data = this.formParent;
    this.newDatRefPerChange.emit(data);
    this.updateAvailableParentesco();
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) { }

  ngOnInit(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.initForm();
    this.updateAvailableParentesco();

    if (this.datos) {
      if (this.datos.value.refpers.length > 0) {
        for (let i of this.datos.value.refpers) {
          this.agregarRefPer(i);
        }
      }
    }
  }

  ngOnDestroy() { }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        refpers: this.fb.array([])
      });
    }
  }

  agregarRefPer(datos?: any): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos) {
      ref_RefPers.push(generateRefPerFormGroup(datos));
    } else {
      ref_RefPers.push(generateRefPerFormGroup({}));
    }
    this.updateAvailableParentesco();
  }

  eliminarRefPer(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent;
    this.newDatRefPerChange.emit(data);
    this.updateAvailableParentesco();
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  addValidation(index: number, key: string): void {
    const refParent = this.formParent.get('refpers') as FormArray;
    const refSingle = refParent.at(index).get(key) as FormGroup;

    refSingle.setValidators(
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ]
    );
    refSingle.updateValueAndValidity();
  }

  getErrors(i: number, fieldName: string): any {
    if (this.formParent instanceof FormGroup) {
      const controlesrefpers = (this.formParent.get('refpers') as FormGroup).controls;
      const a = controlesrefpers[i].get(fieldName)!.errors;

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

  isConyugue(index: number): boolean {
    const refParent = this.formParent.get('refpers') as FormArray;
    const parentesco = refParent.at(index).get('parentesco')?.value;
    return parentesco === 'CONYUGUE';
  }

  private existeConyugue(): boolean {
    const refParent = this.formParent.get('refpers') as FormArray;
    return refParent.controls.some(ctrl => ctrl.get('parentesco')?.value === 'CONYUGUE');
  }

  private updateAvailableParentesco(): void {
    if (this.existeConyugue()) {
      this.availableParentesco = this.parentesco.filter((item: any) => item.value !== 'CONYUGUE');
    } else {
      this.availableParentesco = this.parentesco;
    }
  }

  getAvailableParentesco(index: number): any[] {
    const refParent = this.formParent.get('refpers') as FormArray;
    const currentParentesco = refParent.at(index).get('parentesco')?.value;
    if (currentParentesco === 'CONYUGUE') {
      return this.parentesco;
    }
    return this.availableParentesco;
  }
}
