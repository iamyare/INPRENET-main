import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DireccionService } from '../../../../services/direccion.service';

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
  departamentos: any[] = [];
  municipios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private centrosTrabSVC: CentroTrabajoService,
    private direccionService: DireccionService
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
    this.loadDepartamentos();
    this.setupFilterListener();

    if (this.trabajosArray.length === 0) {
      this.agregarTrabajo();
    }
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
          telefono_1: item.telefono_1,
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
          (control as FormGroup).patchValue({
            filteredCentrosTrabajo: this.centrosTrabajo.filter((centro) =>
              centro.nombreCentro.includes(value)
            ),
          });
        });
      }
    });
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
      telefono_1: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[0-9]+$')]],
      numero_acuerdo: ['', Validators.maxLength(40)],
      salario_base: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      fecha_ingreso: ['', Validators.required],
      fecha_egreso: [''],
      fecha_pago: [[Validators.required, Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]+$')]],
      sectorEconomico: [{ value: '', disabled: true }],
      estado: ['', Validators.maxLength(40)],
      nombreCentro: [{ value: '', disabled: true }],
      direccionCentro: ['', Validators.required], // Permitir edición manual
      showNumeroAcuerdo: [true],
      jornada: ['', Validators.required],
      id_departamento: ['', Validators.required],
      id_municipio: ['', Validators.required],
      tipo_jornada: ['', Validators.required]
    }, { validators: this.fechasValidator });
  
    // Suscripción a cambios en id_centro_trabajo
    trabajoFormGroup.get('id_centro_trabajo')?.valueChanges.subscribe((value: any) => {
      const selectedCentro = this.centrosTrabajo.find(
        (centro) => centro.label === value || centro.label === value?.label
      );
      
      if (selectedCentro) {
        // Limpiar dirección antes de actualizar
        trabajoFormGroup.patchValue({
          direccionCentro: '',
          nombre_centro_trabajo: selectedCentro,
          nombreCentro: selectedCentro.nombreCentro,
          sectorEconomico: selectedCentro.sector,
          telefono_1: selectedCentro.telefono_1,
          id_departamento: selectedCentro.municipio?.id_departamento || null, // 🔹 Llenar departamento
          id_municipio: selectedCentro.municipio?.id_municipio || null,
          showNumeroAcuerdo: selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO'
        }, { emitEvent: false });
      
        if (selectedCentro.municipio?.id_departamento) {
          this.loadMunicipios(selectedCentro.municipio.id_departamento, this.trabajosArray.length);
        }
        // Solo actualizar la dirección si el usuario no la ha modificado manualmente
        if (!trabajoFormGroup.get('direccionCentro')?.dirty) {
          trabajoFormGroup.patchValue({
            direccionCentro: selectedCentro.direccion,
          }, { emitEvent: false });
        }
  
        this.configurarValidacionesNumeroAcuerdo(trabajoFormGroup, selectedCentro.sector);
      } else {
        // Si no se encuentra el centro, limpiar valores dependientes
        trabajoFormGroup.patchValue({
          direccionCentro: '',
          sectorEconomico: '',
          telefono_1: '',
          id_departamento: null,
          id_municipio: null,
          showNumeroAcuerdo: false
        }, { emitEvent: false });
      }
    });
  
    // Suscripción a cambios en nombre_centro_trabajo
    trabajoFormGroup.get('nombre_centro_trabajo')?.valueChanges.subscribe((value: any) => {
      const selectedCentro = this.centrosTrabajo.find(
        (centro) => centro.nombreCentro === value || centro.nombreCentro === value?.nombreCentro
      );
  
      if (selectedCentro) {
        // Limpiar dirección antes de actualizar
        trabajoFormGroup.patchValue({
          direccionCentro: '',
          id_centro_trabajo: selectedCentro,
          nombreCentro: selectedCentro.nombreCentro,
          sectorEconomico: selectedCentro.sector,
          telefono_1: selectedCentro.telefono_1,
          showNumeroAcuerdo: selectedCentro.sector === 'PUBLICO' || selectedCentro.sector === 'PROHECO',
        }, { emitEvent: false });
  
        // Solo actualizar la dirección si el usuario no la ha modificado manualmente
        if (!trabajoFormGroup.get('direccionCentro')?.dirty) {
          trabajoFormGroup.patchValue({
            direccionCentro: selectedCentro.direccion,
          }, { emitEvent: false });
        }
  
        this.configurarValidacionesNumeroAcuerdo(trabajoFormGroup, selectedCentro.sector);
      } else {
        // Si no se encuentra el centro, limpiar valores dependientes
        trabajoFormGroup.patchValue({
          direccionCentro: '',
          sectorEconomico: '',
          telefono_1: '',
          showNumeroAcuerdo: false
        }, { emitEvent: false });
      }
    });
  
    this.trabajosArray.push(trabajoFormGroup);
    this.markAllAsTouched(trabajoFormGroup);
  }
  
  eliminarTrabajo(index: number): void {
    if (this.trabajosArray.length > 1) {
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

  fechasValidator(control: AbstractControl): ValidationErrors | null {
    const fechaIngreso = control.get('fecha_ingreso')?.value;
    const fechaEgreso = control.get('fecha_egreso')?.value;
    const fechaPago = control.get('fecha_pago')?.value;
  
    if (fechaIngreso && fechaEgreso && new Date(fechaIngreso) > new Date(fechaEgreso)) {
      control.get('fecha_egreso')?.setErrors({ fechaIncorrecta: true });
      return { fechaIncorrecta: 'La fecha de ingreso no puede ser menor a la fecha de egreso.' };
    }
  
    control.get('fecha_egreso')?.setErrors(null);
    return null;
  }
  
  public getErrorMessage(errorType: string, errorValue: any): string {
    const errorMessages: any = {
      required: 'Este campo es requerido.',
      minlength: `Debe tener al menos ${errorValue?.requiredLength} caracteres.`,
      maxlength: `No puede tener más de ${errorValue?.requiredLength} caracteres.`,
      pattern: 'El formato no es válido.',
      fechaIncorrecta: 'La fecha de egreso no debe ser menor a la fecha de ingreso.',
    };
    return errorMessages[errorType] || 'Error desconocido.';
  }
  
  private configurarValidacionesNumeroAcuerdo(trabajoFormGroup: FormGroup, sector: string): void {
    const numeroAcuerdoControl = trabajoFormGroup.get('numero_acuerdo');
    if (sector === 'PUBLICO' || sector === 'PROHECO') {
      numeroAcuerdoControl?.setValidators([Validators.required, Validators.maxLength(40)]);
    } else {
      numeroAcuerdoControl?.clearValidators();
      numeroAcuerdoControl?.setValidators([Validators.maxLength(40)]);
    }
    numeroAcuerdoControl?.updateValueAndValidity();
  }
  
  getFilteredCentrosTrabajo(index: number): any[] {
    const trabajoControl = this.trabajosArray.at(index);
    if (!trabajoControl) {
      return [];
    }
  
    const value = trabajoControl.get('nombre_centro_trabajo')?.value;
    const filterValue = value ? value.toString().toUpperCase() : '';
  
    return this.centrosTrabajo.filter((centro) =>
      centro.nombreCentro?.toUpperCase().includes(filterValue)
    );
  }
  

  getFilteredCodigosTrabajo(index: number): any[] {
    const trabajoControl = this.trabajosArray.at(index);
    if (!trabajoControl) {
      return [];
    }
  
    const value = trabajoControl.get('id_centro_trabajo')?.value;
    const filterValue = value ? value.toString().toUpperCase() : '';
  
    return this.centrosTrabajo.filter((centro) =>
      centro.label?.toUpperCase().includes(filterValue)
    );
  }
  
  
  
  displayNombre(value: any): string {
    if (!value) {
      return '';
    }
  
    if (typeof value === 'string') {
      return value; 
    }
    return value.nombreCentro || '';
  }
  
  displayCodigo(value: any): string {
    if (!value) {
      return '';
    }
  
    if (typeof value === 'string') {
      return value; 
    }
  
    return value.label || '';
  }
  
  reset(): void {
    this.trabajosArray.clear();
    this.agregarTrabajo();
    this.formGroup.reset();
  }
  
  private markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  private loadDepartamentos() {
    this.direccionService.getAllDepartments().subscribe({
      next: (data) => {
        this.departamentos = data.map((dep:any) => ({ value: dep.id_departamento, label: dep.nombre_departamento }));
      },
      error: (error) => console.error('Error al cargar departamentos:', error)
    });
  }

  private loadMunicipios(departamentoId: number, index: number) {
    this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        const municipios = data.map((mun: any) => ({
          value: mun.value,
          label: mun.label
        }));
  
        const trabajoFormGroup = this.trabajosArray.at(index) as FormGroup;
        if (trabajoFormGroup) {
          trabajoFormGroup.patchValue({ id_municipio: null }); 
          trabajoFormGroup.setControl('listaMunicipios', new FormControl(municipios));
        }
      },
      error: (error) => console.error('Error al cargar municipios:', error)
    });
  }

  onDepartamentoChange(event: any, index: number) {
    const departamentoId = event.value;
  
    if (!departamentoId) {
      return;
    }
  
    this.loadMunicipios(departamentoId, index);
    this.trabajosArray.at(index).patchValue({ id_municipio: null });
  }
}


