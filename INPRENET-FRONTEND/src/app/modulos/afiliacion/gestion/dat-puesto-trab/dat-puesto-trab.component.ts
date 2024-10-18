import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';

@Component({
  selector: 'app-dat-puesto-trab',
  templateUrl: './dat-puesto-trab.component.html',
  styleUrls: ['./dat-puesto-trab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatPuestoTrabComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  centrosTrabajo: any[] = [];
  jornadas: any[];
  tiposJornada: any[];
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private centrosTrabSVC: CentroTrabajoService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
    this.jornadas = [
      { label: 'MATUTINA', value: 'MATUTINA' },
      { label: 'DIURNA', value: 'DIURNA' },
      { label: 'NOCTURNA', value: 'NOCTURNA' }
    ];
    this.tiposJornada = [
      { label: 'COMPLETA', value: 'COMPLETA' },
      { label: 'PARCIAL', value: 'PARCIAL' }
    ];
  }

  ngOnInit(): void {
    if (!this.formGroup.get('trabajo')) {
      this.formGroup.addControl('trabajo', this.fb.array([]));
    }
    this.loadCentrosTrabajo();
  }

  private loadCentrosTrabajo() {
    this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().subscribe({
      next: (data) => {
        this.centrosTrabajo = data.map(item => ({
          label: item.codigo,
          value: String(item.id_centro_trabajo),
          nombreCentro: item.nombre_centro_trabajo,
          direccion: item.direccion_1 || item.direccion_2 || 'No disponible',
          sector: item.sector_economico,
        }));
      },
      error: (error) => {
        console.error('Error al cargar centros de trabajo:', error);
      }
    });
  }

  get trabajosArray(): FormArray {
    return this.formGroup.get('trabajo') as FormArray;
  }

  agregarTrabajo(): void {
    const trabajoFormGroup = this.fb.group({
      id_centro_trabajo: ['', Validators.required],
      cargo: ['', [Validators.required, Validators.maxLength(40)]],
      numero_acuerdo: ['', Validators.maxLength(40)],
      salario_base: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      fecha_ingreso: ['', Validators.required],
      fecha_egreso: [''],
      sectorEconomico: [{ value: '', disabled: true }],
      estado: ['', Validators.maxLength(40)],
      nombreCentro: [{ value: '', disabled: true }],
      direccionCentro: [{ value: '', disabled: true }],
      showNumeroAcuerdo: [true],
      jornada: ['', Validators.required],
      tipoJornada: ['', Validators.required]
    }, { validators: this.fechasValidator });

    trabajoFormGroup.get('id_centro_trabajo')?.valueChanges.subscribe(value => {
      const selectedCentro = this.centrosTrabajo.find(centro => centro.value === value);
      if (selectedCentro) {
        trabajoFormGroup.patchValue({
          nombreCentro: selectedCentro.nombreCentro,
          direccionCentro: selectedCentro.direccion,
          sectorEconomico: selectedCentro.sector,
          showNumeroAcuerdo: selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO'
        });

        const numeroAcuerdoControl = trabajoFormGroup.get('numero_acuerdo');
        if (selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO') {
          numeroAcuerdoControl?.setValidators([Validators.required, Validators.maxLength(40)]);
        } else {
          numeroAcuerdoControl?.clearValidators();
          numeroAcuerdoControl?.setValidators([Validators.maxLength(40)]);
        }
        numeroAcuerdoControl?.updateValueAndValidity();
      }
    });

    this.trabajosArray.push(trabajoFormGroup);
    trabajoFormGroup.markAllAsTouched();
    this.formGroup.markAsTouched();
  }

  eliminarTrabajo(index: number): void {
    if (this.trabajosArray.length > 0) {
      this.trabajosArray.removeAt(index);
    }
  }

  getErrors(i: number, fieldName: string): string[] {
    const control:any = this.trabajosArray.at(i).get(fieldName);
    if (control && control.errors) {
      return Object.keys(control.errors).map(key => this.getErrorMessage(key, control.errors[key]));
    }
    return [];
  }

  private getErrorMessage(errorType: string, errorValue: any): string {
    const errorMessages: any = {
      required: 'Este campo es requerido.',
      minlength: `Debe tener al menos ${errorValue.requiredLength} caracteres.`,
      maxlength: `No puede tener más de ${errorValue.requiredLength} caracteres.`,
      pattern: 'El formato no es válido.'
    };
    return errorMessages[errorType] || 'Error desconocido.';
  }

  fechasValidator(control: AbstractControl): ValidationErrors | null {
    const fechaIngreso = control.get('fecha_ingreso')?.value;
    const fechaEgreso = control.get('fecha_egreso')?.value;

    if (fechaIngreso && fechaEgreso && new Date(fechaIngreso) > new Date(fechaEgreso)) {
      return { fechaIncorrecta: 'La fecha de ingreso no puede ser mayor a la fecha de egreso.' };
    }
    return null;
  }


}


