import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormStateService } from 'src/app/services/form-state.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateRefPerFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    primer_nombre: new FormControl(datos?.primer_nombre, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    segundo_nombre: new FormControl(datos?.segundo_nombre, [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    tercer_nombre: new FormControl(datos?.tercer_nombre, [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    primer_apellido: new FormControl(datos?.primer_apellido, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    sexo: new FormControl(datos?.sexo, [
      Validators.required,
      Validators.pattern(/^(F|M)$/)
    ]),
    direccion: new FormControl(datos?.direccion, [
      Validators.maxLength(200)
    ]),
    telefono_domicilio: new FormControl(datos?.telefono_domicilio, [
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    telefono_trabajo: new FormControl(datos?.telefono_trabajo, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    telefono_personal: new FormControl(datos?.telefono_personal, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    n_identificacion: new FormControl(datos?.n_identificacion, [
      Validators.required,
      Validators.maxLength(15)
    ]),
    tipo_identificacion: new FormControl(datos?.tipo_identificacion, [
      Validators.required
    ]),
    profesion: new FormControl(datos?.profesion, [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    discapacidad: new FormControl(datos?.discapacidad, [
      Validators.maxLength(20),
      Validators.pattern(/^(MOTRIZ|AUDITIVA|VISUAL|INTELECTUAL|MENTAL|PSICOSOCIAL|MÚLTIPLE|SENSORIAL)$/)
    ]),
    parentesco: new FormControl(datos?.parentesco, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30)
    ]),
    dependiente: new FormControl(datos?.dependiente, [
      Validators.required
    ]),
    cargoPublico: new FormControl(datos?.cargoPublico, [
      Validators.required
    ]),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento),
    es_afiliado: new FormControl(datos?.es_afiliado || false),
    trabaja: new FormControl(datos?.trabaja || false),
    tipo: new FormControl(datos?.tipo || false)
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
  sexo: any[] = [];
  tipo: any[] = [];
  tipo_identificacion: any[] = [];
  tipo_discapacidad: any[] = [];

  @Input() nombreComp?: string;
  @Input() datos?: any;
  @Output() newDatRefPerChange = new EventEmitter<any>();

  field = {
    options: [
      { value: 'si', label: 'SI' },
      { value: 'no', label: 'NO' }
    ]
  };
  dependienteEstado = {
    si: false,
    no: false
  };
  cargoEstado = {
    si: false,
    no: false
  };
  dependiente: boolean = false;
  cargoPublico: boolean = false;

  onDatosRefPerChange() {
    const data = this.formParent;
    this.newDatRefPerChange.emit(data);
    this.updateAvailableParentesco();
  }

  onDatosGeneralesDiscChange(event: any) {
    const value = event.value;
    this.dependienteEstado = {
      si: value === 'si',
      no: value === 'no'
    };
    this.dependiente = this.dependienteEstado.si;
  }
  onDatosGeneralesCargoPChange(event: any) {
    const value = event.value;
    this.cargoEstado = {
      si: value === 'si',
      no: value === 'no'
    };
    this.cargoPublico = this.cargoEstado.si;
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) {
    this.sexo = [
      { label: "MASCULINO", value: "M" },
      { label: "FEMENINO", value: "F" }
    ];
    this.tipo = [
      { label: "REFERENCIA PERSONAL", value: "REFERENCIA PERSONAL" },
      { label: "REFERENCIA FAMILIAR", value: "REFERENCIA FAMILIAR" }
    ];
    this.tipo_identificacion = [
      { label: "DNI", value: "DNI" },
      { label: "CARNET DE RESIDENCIA", value: "CARNET DE RESIDENCIA" },
      { label: "PASAPORTE", value: "PASAPORTE" }
    ];
    this.tipo_discapacidad = [
      { label: "MOTRIZ", value: "MOTRIZ" },
      { label: "AUDITIVA", value: "AUDITIVA" },
      { label: "VISUAL", value: "VISUAL" },
      { label: "INTELECTUAL", value: "INTELECTUAL" },
      { label: "MENTAL", value: "MENTAL" },
      { label: "PSICOSOCIAL", value: "PSICOSOCIAL" },
      { label: "MÚLTIPLE", value: "MÚLTIPLE" },
      { label: "SENSORIAL", value: "SENSORIAL" }
    ];
  }

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
    return parentesco === 'CÓNYUGE';
  }

  private existeConyugue(): boolean {
    const refParent = this.formParent.get('refpers') as FormArray;
    return refParent.controls.some(ctrl => ctrl.get('parentesco')?.value === 'CÓNYUGE');
  }

  private updateAvailableParentesco(): void {
    if (this.existeConyugue()) {
      this.availableParentesco = this.parentesco.filter((item: any) => item.value !== 'CÓNYUGE');
    } else {
      this.availableParentesco = this.parentesco;
    }
  }

  getAvailableParentesco(index: number): any[] {
    const refParent = this.formParent.get('refpers') as FormArray;
    const currentParentesco = refParent.at(index).get('parentesco')?.value;
    if (currentParentesco === 'CÓNYUGE') {
      return this.parentesco;
    }
    return this.availableParentesco;
  }
}
