import { FormStateService } from "src/app/services/form-state.service";
import { DatosEstaticosService } from "src/app/services/datos-estaticos.service";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

export function generateRefPerFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    tipo_referencia: new FormControl(datos?.tipo_referencia || '', [
      Validators.required
    ]),
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion || '', [
      Validators.required
    ]),
    n_identificacion: new FormControl(datos?.n_identificacion || '', [
      Validators.required,
      Validators.maxLength(15)
    ]),
    primer_nombre: new FormControl(datos?.primer_nombre || '', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    segundo_nombre: new FormControl(datos?.segundo_nombre || '', [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    tercer_nombre: new FormControl(datos?.tercer_nombre || '', [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    primer_apellido: new FormControl(datos?.primer_apellido || '', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    segundo_apellido: new FormControl(datos?.segundo_apellido || '', [
      Validators.maxLength(50),
      Validators.pattern(/^[^0-9]*$/)
    ]),
    sexo: new FormControl(datos?.sexo || '', [
      Validators.required,
      Validators.pattern(/^(F|M)$/)
    ]),
    direccion: new FormControl(datos?.direccion || '', [
      Validators.maxLength(200)
    ]),
    telefono_domicilio: new FormControl(datos?.telefono_domicilio || '', [
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    telefono_trabajo: new FormControl(datos?.telefono_trabajo || '', [
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    telefono_personal: new FormControl(datos?.telefono_personal || '', [
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern(/^[0-9]*$/)
    ]),
    parentesco: new FormControl(datos?.parentesco || '', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30)
    ]),
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
  tipo_referencia: any[] = [];
  tipo_identificacion: any[] = [];

  @Input() nombreComp?: string;
  @Input() datos?: any;
  @Output() newDatRefPerChange = new EventEmitter<any>();

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) {
    this.sexo = [
      { label: "MASCULINO", value: "M" },
      { label: "FEMENINO", value: "F" }
    ];
    this.tipo_referencia = [
      { label: "REFERENCIA PERSONAL", value: "REFERENCIA PERSONAL" },
      { label: "REFERENCIA FAMILIAR", value: "REFERENCIA FAMILIAR" }
    ];
    this.tipo_identificacion = [
      { label: "DNI", value: 1 },
      { label: "CARNET DE RESIDENCIA", value: 2 },
      { label: "PASAPORTE", value: 3 }
    ];
  }

  ngOnInit(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.initForm();;

    this.formParent.valueChanges.subscribe(values => {
      this.onDatosRefPerChange();
    });

    if (this.datos) {
      if (this.datos.value.refpers.length > 0) {
        for (let i of this.datos.value.refpers) {
          this.agregarRefPer(i);
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
        conyuge: new FormGroup({
          primer_nombre: new FormControl('', [Validators.required]),
          segundo_nombre: new FormControl(''),
          tercer_nombre: new FormControl(''),
          primer_apellido: new FormControl('', [Validators.required]),
          segundo_apellido: new FormControl(''),
          n_identificacion: new FormControl('', [Validators.required]),
          fecha_nacimiento: new FormControl('', [Validators.required]),
          telefono_domicilio: new FormControl('', [Validators.required]),
          telefono_celular: new FormControl('', [Validators.required]),
          telefono_trabajo: new FormControl(''),
          trabaja: new FormControl('', [Validators.required]),
          es_afiliado: new FormControl('', [Validators.required])
        }),
        refpers: this.fb.array([])
      });
    }
  }

  agregarRefPer(datos?: any): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    const formGroup = generateRefPerFormGroup(datos);

    ref_RefPers.push(formGroup);
  }

  eliminarRefPer(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    this.onDatosRefPerChange();
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
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


  onDatosRefPerChange(): void {
    const data = this.formParent.value;
    const formattedData = this.formatData(data.refpers);
    this.newDatRefPerChange.emit({ referencias: formattedData });
  }

  formatData(refpersArray: any[]): any[] {
    return refpersArray.map(ref => ({
      tipo_referencia: ref.tipo_referencia,
      parentesco: ref.parentesco,
      persona_referencia: {
        id_tipo_identificacion: ref.id_tipo_identificacion,
        n_identificacion: ref.n_identificacion,
        primer_nombre: ref.primer_nombre,
        segundo_nombre: ref.segundo_nombre,
        tercer_nombre: ref.tercer_nombre,
        primer_apellido: ref.primer_apellido,
        segundo_apellido: ref.segundo_apellido,
        sexo: ref.sexo,
        telefono_1: ref.telefono_personal,
        telefono_2: ref.telefono_trabajo,
        direccion_residencia: ref.direccion,
      }
    }));
  }
}
