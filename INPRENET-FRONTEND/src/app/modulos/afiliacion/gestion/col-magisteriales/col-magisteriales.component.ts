import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generateColegMagistFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    id_colegio: new FormControl(datos?.id_colegio || '', Validators.required)
  });
}

@Component({
  selector: 'app-col-magisteriales',
  templateUrl: './col-magisteriales.component.html',
  styleUrls: ['./col-magisteriales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ColMagisterialesComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});
  colegio_magisterial: any[] = [];
  private formKey = 'colMagForm';

  @Input() editing?: boolean = false;
  @Input() nombreComp?: string;
  @Input() datos?: any;
  @Output() newDataColegioMagisterial = new EventEmitter<any>();

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private datosEstaticosSVC: DatosEstaticosService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.datosEstaticosSVC.getColegiosMagisteriales().subscribe(colegios => {
      this.colegio_magisterial = colegios;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.subscribeToChanges();
    if (this.datos && this.datos.value.ColMags.length > 0) {
      for (let i of this.datos.value.ColMags) {
        this.agregarColMag(i);
      }
    }
  }

  ngOnDestroy() {
    if (!this.editing) {
      this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        ColMags: this.fb.array([]),
      });
    }
  }

  agregarColMag(datos?: any): void {
    const col_ColMags = this.formParent.get('ColMags') as FormArray;
    const newFormGroup = generateColegMagistFormGroup(datos);
    col_ColMags.push(newFormGroup);

    // Actualiza el estado de validez del formulario
    this.formParent.updateValueAndValidity();

    this.onDatosColMagChange();
  }

  eliminarColMag(): void {
    const col_ColMags = this.formParent.get('ColMags') as FormArray;
    if (col_ColMags.length > 0) {
      col_ColMags.removeAt(col_ColMags.length - 1);

      // Actualiza el estado de validez del formulario
      this.formParent.updateValueAndValidity();

      this.onDatosColMagChange();
    }
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  getAvailableColegios(index: number): any[] {
    const selectedColegios = (this.formParent.get('ColMags') as FormArray).controls
      .map(control => control.get('id_colegio')?.value);
    return this.colegio_magisterial.filter(colegio => !selectedColegios.includes(colegio.value) || selectedColegios[index] === colegio.value);
  }

  subscribeToChanges(): void {
    const col_ColMags = this.formParent.get('ColMags') as FormArray;
    col_ColMags.controls.forEach((group, index) => {
      group.get('id_colegio')?.valueChanges.subscribe(() => {
        this.onDatosColMagChange();
      });
    });
  }

  onDatosColMagChange() {
    console.log("Estado del formulario:", this.formParent.status);
    console.log("Errores en los controles:", this.formParent.controls);

    const formArray = this.formParent?.get('ColMags') as FormArray;
    if (formArray) {
      const data = formArray.value;
      this.newDataColegioMagisterial.emit(data);
    } else {
      console.error('FormArray "ColMags" no está disponible');
    }

    // Forzar detección de cambios
    this.changeDetectorRef.detectChanges();
  }

  getErrors(i: number, fieldName: string): string[] {
    const control = (this.formParent.get('ColMags') as FormArray).controls[i].get(fieldName);
    if (control && control.errors) {
      const errors = [];
      if (control.errors['required']) {
        errors.push('Este campo es requerido.');
      }
      if (control.errors['minlength']) {
        errors.push(`Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`);
      }
      if (control.errors['maxlength']) {
        errors.push(`No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`);
      }
      if (control.errors['pattern']) {
        errors.push('El formato no es válido.');
      }
      // Añade aquí más mensajes de error si hay más validaciones.
      return errors;
    }
    return [];
  }
}
