import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
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
    sectorEconomico: new FormControl(datos?.sectorEconomico, [
      Validators.required,
      Validators.maxLength(40),
    ]),
    estado: new FormControl(datos?.estado, [
      Validators.maxLength(40),
    ]),
    showNumeroAcuerdo: new FormControl(true)
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
    private datosEstaticos: DatosEstaticosService,
    private centrosTrabSVC: CentroTrabajoService,
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
    this.cargarPuestosTrabajo();

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

  cargarPuestosTrabajo() {
    this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().subscribe({
      next: (data) => {
        const transformedJson = data!.map((item: { id_centro_trabajo: any; nombre_centro_trabajo: any; sector_economico: any }) => ({
          label: item.nombre_centro_trabajo,
          value: String(item.id_centro_trabajo),
          sector: item.sector_economico,
        }));
        this.centrosTrabajo = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        trabajo: this.fb.array([])
      });
    }
  }

  agregarTrabajo(datos?: any): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    const formGroup = generatePuestoTrabFormGroup(datos || {});
    ref_trabajo.push(formGroup);

    formGroup.get('idCentroTrabajo')?.valueChanges.subscribe(value => {
      const selectedCentro = this.centrosTrabajo.find((centro: any) => centro.value === value);
      if (selectedCentro) {
        formGroup.get('sectorEconomico')?.setValue(selectedCentro.sector);
        formGroup.get('showNumeroAcuerdo')?.setValue(selectedCentro.sector !== 'PRIVADO');
      }
    });

    this.onDatosDatosPuestTrab();
  }


  eliminarTrabajo(): void {
    const ref_trabajo = this.formParent.get('trabajo') as FormArray;
    if (ref_trabajo.length > 0) {
      ref_trabajo.removeAt(ref_trabajo.length - 1);
      this.onDatosDatosPuestTrab();
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
