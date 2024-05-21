import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generatePuestoTrabFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    idCentroTrabajo: new FormControl(datos?.idCentroTrabajo, [
      Validators.required
    ]),
    cargo: new FormControl(datos?.cargo, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    numeroAcuerdo: new FormControl(datos?.numeroAcuerdo, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    salarioBase: new FormControl(datos?.salarioBase, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
    ]),
    fechaIngreso: new FormControl(datos?.fechaIngreso, [
      Validators.required,
    ]),
    fechaEgreso: new FormControl(datos?.fechaEgreso, [
    ]),
    claseCliente: new FormControl(datos?.claseCliente, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    sectorEconomico: new FormControl(datos?.sectorEconomico, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    estado: new FormControl(datos?.estado, [
      Validators.maxLength(40),
    ]),
  });
}

@Component({
  selector: 'app-dat-puesto-trab',
  templateUrl: './dat-puesto-trab.component.html',
  styleUrls: ['./dat-puesto-trab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class DatPuestoTrabComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});
  private formKey = 'FormTrabajo';

  centrosTrabajo: any;
  sector: any;
  minDate: Date;
  @Input() datos: any;
  @Input() editing?: boolean = false;
  @Output() newDatDatosPuestTrab = new EventEmitter<any>()

  onDatosDatosPuestTrab() {
    const data = this.formParent;
    this.newDatDatosPuestTrab.emit(data);
  }

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private datosEstaticos: DatosEstaticosService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
    this.centrosTrabajo = this.datosEstaticos.centrosTrabajo;
    this.sector = this.datosEstaticos.sector;
  }

  ngOnInit(): void {
    this.initForm();
    const trabajoArray = this.formParent.get('trabajo') as FormArray;
    if (this.datos && this.datos.value && Array.isArray(this.datos.value.trabajo)) {
      if (this.datos.value.trabajo.length > 0) {
        for (let i of this.datos.value.trabajo) {
          this.agregarTrabajo(i);
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
        trabajo: this.fb.array([])  // Asegúrate de que el nombre del FormArray sea correcto
      });
      // this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  agregarTrabajo(datos?: any): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    ref_trabajo.push(generatePuestoTrabFormGroup(datos || {}));
    this.onDatosDatosPuestTrab(); // Emite los datos actualizados
  }

  eliminarTrabajo(): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    if (ref_trabajo.length > 0) {
      ref_trabajo.removeAt(ref_trabajo.length - 1);
      this.onDatosDatosPuestTrab(); // Emite los datos actualizados
    }
  }


  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  getErrors(i: number, fieldName: string): any {
    const controlestrabajo = (this.formParent.get('trabajo') as FormArray).controls;
    const a = controlestrabajo[i].get(fieldName)!.errors;
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
