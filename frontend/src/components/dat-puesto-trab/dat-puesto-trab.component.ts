import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generatePuestoTrabFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    idCentroTrabajo: new FormControl(datos?.idCentroTrabajo, [
      Validators.required,
      Validators.min(1),
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
  styleUrl: './dat-puesto-trab.component.scss',
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

  centrosTrabajo: any = this.datosEstaticos.centrosTrabajo;
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

}
