import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { startWith } from 'rxjs/operators';
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
  filteredCentrosTrabajo: any[] = [];

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
    this.setupFilterListener();
  }

  private loadCentrosTrabajo() {
    this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().subscribe({
      next: (data) => {
        this.centrosTrabajo = data.map((item) => ({
          label: item.codigo,
          value: String(item.id_centro_trabajo),
          nombreCentro: item.nombre_centro_trabajo,
          direccion: item.direccion_1 || item.direccion_2,
          sector: item.sector_economico,
        }));
        this.filteredCentrosTrabajo = [...this.centrosTrabajo];
      },
      error: (error) => {
        console.error('Error al cargar centros de trabajo:', error);
      },
    });
  }

  private setupFilterListener() {
    this.trabajosArray.controls.forEach((control, index) => {
      const nombreCentroControl = control.get('nombre_centro_trabajo');
      if (nombreCentroControl) {
        nombreCentroControl.valueChanges.pipe(startWith('')).subscribe((value) => {
          // Filtro específico para este control
          (control as FormGroup).patchValue({
            filteredCentrosTrabajo: this.centrosTrabajo.filter((centro) =>
              centro.nombreCentro.toLowerCase().includes(value.toLowerCase())
            ),
          });
        });
      }
    });
  }

  getFilteredCentrosTrabajo(index: number): any[] {
    const trabajoControl = this.trabajosArray.at(index);
    const filterValue = trabajoControl.get('nombre_centro_trabajo')?.value?.nombreCentro?.toLowerCase() ||
                        trabajoControl.get('nombre_centro_trabajo')?.value?.toLowerCase() ||
                        '';
    const selectedCentro = this.centrosTrabajo.find(
      (centro) => centro.nombreCentro.toLowerCase() === filterValue
    );

    // Si el valor actual coincide exactamente con un centro, muestra todos
    if (selectedCentro) {
      return this.centrosTrabajo;
    }

    // De lo contrario, aplica el filtro normalmente
    return this.centrosTrabajo.filter((centro) =>
      centro.nombreCentro.toLowerCase().includes(filterValue)
    );
  }


  displayFn(centro: any): string {
    return centro ? centro.nombreCentro : '';
  }

  get trabajosArray(): FormArray {
    return this.formGroup.get('trabajo') as FormArray;
  }

  agregarTrabajo(): void {
    const trabajoFormGroup = this.fb.group({
      id_centro_trabajo: ['', Validators.required],
      nombre_centro_trabajo: ['', Validators.required],
      cargo: ['', [
        Validators.required,
        Validators.maxLength(40),
        Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')
      ]],
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
      tipo_jornada: ['', Validators.required]
    }, { validators: this.fechasValidator });

    // Actualizar campos relacionados cuando se cambia `id_centro_trabajo`
    trabajoFormGroup.get('id_centro_trabajo')?.valueChanges.subscribe((value: any) => {
      const selectedCentro = this.centrosTrabajo.find((centro: any) => centro.value === value);
      if (selectedCentro) {
        trabajoFormGroup.patchValue({
          nombre_centro_trabajo: selectedCentro.nombreCentro,
          nombreCentro: selectedCentro.nombreCentro,
          direccionCentro: selectedCentro.direccion,
          sectorEconomico: selectedCentro.sector,
          showNumeroAcuerdo: selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO'
        });
        this.configurarValidacionesNumeroAcuerdo(trabajoFormGroup, selectedCentro.sector);
      }
    });

    // Actualizar campos relacionados cuando se cambia `nombre_centro_trabajo`
    trabajoFormGroup.get('nombre_centro_trabajo')?.valueChanges.subscribe((value: any) => {
      const selectedCentro = this.centrosTrabajo.find((centro: any) => centro.nombreCentro === value);
      if (selectedCentro) {
        trabajoFormGroup.patchValue({
          id_centro_trabajo: selectedCentro.value, // Actualiza automáticamente el código
          nombreCentro: selectedCentro.nombreCentro,
          direccionCentro: selectedCentro.direccion,
          sectorEconomico: selectedCentro.sector,
          showNumeroAcuerdo: selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO'
        });
        this.configurarValidacionesNumeroAcuerdo(trabajoFormGroup, selectedCentro.sector);
      } else {
        // Limpia los campos si el valor no es válido
        trabajoFormGroup.patchValue({
          id_centro_trabajo: '',
          nombreCentro: '',
          direccionCentro: '',
          sectorEconomico: '',
          showNumeroAcuerdo: false
        });
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

  private configurarValidacionesNumeroAcuerdo(trabajoFormGroup: FormGroup, sector: string) {
    const numeroAcuerdoControl = trabajoFormGroup.get('numero_acuerdo');
    if (sector === 'PUBLICO' || sector === 'PROHECO') {
      numeroAcuerdoControl?.setValidators([Validators.required, Validators.maxLength(40)]);
    } else {
      numeroAcuerdoControl?.clearValidators();
      numeroAcuerdoControl?.setValidators([Validators.maxLength(40)]);
    }
    numeroAcuerdoControl?.updateValueAndValidity();
  }
}


