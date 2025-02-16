import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
    private direccionService: DireccionService,
    private changeDetectorRef: ChangeDetectorRef
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
     this.cargarDepartamentos();

    if (this.trabajosArray.length === 0) {
      this.agregarTrabajo();
    }
  }

  get trabajosArray(): FormArray {
    return this.formGroup.get('trabajo') as FormArray;
  }

  buscarCentroTrabajoAPI(index: number): void {
    const trabajoControl = this.trabajosArray.at(index) as FormGroup;
    const searchValue = trabajoControl.get('buscarCentro')?.value;
  
    if (!searchValue) {
      trabajoControl.patchValue({ centrosFiltrados: [], noResults: false }, { emitEvent: false });
      return;
    }
  
    this.centrosTrabSVC.buscarCentroTrabajo(searchValue).subscribe({
      next: (centros) => {
        trabajoControl.patchValue({ 
          centrosFiltrados: centros, 
          noResults: centros.length === 0 // ✅ Si no hay centros, actualizar noResults
        }, { emitEvent: false });
  
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar centro de trabajo:', error);
        trabajoControl.patchValue({ centrosFiltrados: [], noResults: true }, { emitEvent: false });
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  
  async seleccionarCentro(index: number, centro: any): Promise<void> {
    
    const trabajoControl = this.trabajosArray.at(index) as FormGroup;
    const municipio = centro.municipio || {};
    const departamento = municipio.departamento || {};
  
    const esPublicoOProheco = centro.sector_economico === 'PUBLICO' || centro.sector_economico === 'PROHECO';
  
    // 🔹 Asignar valores correctamente
    trabajoControl.patchValue({
      codigo: centro.codigo,
      id_centro_trabajo: centro.id_centro_trabajo,
      nombre_centro_trabajo: centro.nombre_centro_trabajo,
      telefono_1: centro.telefono_1,
      sectorEconomico: centro.sector_economico,
      direccionCentro: centro.direccion_1 || centro.direccion_2,
      id_departamento: departamento.id_departamento || '',
      id_municipio: null,
      showNumeroAcuerdo: esPublicoOProheco,
      centroSeleccionado: true,
    });
  
    // 🔹 Forzar la actualización del input `numero_acuerdo`
    this.configurarValidacionesNumeroAcuerdo(trabajoControl, centro.sector_economico);
  
    if (departamento.id_departamento) {
      this.direccionService.getMunicipiosPorDepartamentoId(departamento.id_departamento).subscribe({
        next: (data: any) => {
          trabajoControl.setControl('municipiosDisponibles', new FormControl(data));
  
          const municipioEncontrado = data.find((m: any) => m.value === municipio.id_municipio);
          if (municipioEncontrado) {
            trabajoControl.patchValue({ id_municipio: municipioEncontrado.value });
          }
  
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar municipios:', error);
        }
      });
    } else {
      trabajoControl.patchValue({ id_municipio: null });
      trabajoControl.setControl('municipiosDisponibles', new FormControl([]));
    }
  
    trabajoControl.patchValue({ centrosFiltrados: [] }, { emitEvent: false });
    this.changeDetectorRef.detectChanges();
  }
  
  
  agregarTrabajo(): void {
    const trabajoFormGroup = this.fb.group({
      buscarCentro: [''],
      centroSeleccionado: [false, Validators.requiredTrue],
      centrosFiltrados: [[]],
      noResults: [false],
      codigo: [''],
      id_centro_trabajo: [''],
      nombre_centro_trabajo: [{ value: '', disabled: true }, Validators.required],
        cargo: ['', [
          Validators.required,
          Validators.maxLength(40),
          Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')
        ]],
      telefono_1: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      numero_acuerdo: ['', Validators.maxLength(40)],
      salario_base: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      fecha_ingreso: ['', Validators.required],
      fecha_egreso: [''],
      fecha_pago: ['', [Validators.required, Validators.min(1), Validators.max(31), Validators.pattern('^[0-9]+$')]],
      sectorEconomico: [{ value: '', disabled: true }],
      estado: ['', Validators.maxLength(40)],
      nombreCentro: [{ value: '', disabled: true }],
      direccionCentro: ['', Validators.required],
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
      
        /* if (selectedCentro.municipio?.id_departamento) {
          this.loadMunicipios(selectedCentro.municipio.id_departamento, this.trabajosArray.length);
        } */
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
    const esPublicoOProheco = sector === 'PUBLICO' || sector === 'PROHECO';
  
    if (esPublicoOProheco) {
      numeroAcuerdoControl?.setValidators([Validators.required, Validators.maxLength(40)]);
    } else {
      numeroAcuerdoControl?.clearValidators();
      numeroAcuerdoControl?.setValidators([Validators.maxLength(40)]);
    }
  
    // 🔹 Importante: actualizar visibilidad en el formulario
    trabajoFormGroup.patchValue({ showNumeroAcuerdo: esPublicoOProheco });
    numeroAcuerdoControl?.updateValueAndValidity();
    
    this.changeDetectorRef.detectChanges(); // ✅ Forzar actualización de la vista
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

  async cargarDepartamentos() {
    return new Promise<void>((resolve) => {
      this.direccionService.getAllDepartments().subscribe({
        next: (data: any) => {
          this.departamentos = data.map((dep: any) => ({
            value: dep.id_departamento,
            label: dep.nombre_departamento
          }));
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar departamentos:', error);
          resolve();
        }
      });
    });
  }

  async cargarMunicipios(departamentoId: number, index: number) {
    return new Promise<void>((resolve) => {
      this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
        next: (data: any) => {
          const trabajoControl = this.trabajosArray.at(index) as FormGroup;
          trabajoControl.patchValue({ id_municipio: null });
          trabajoControl.setControl('municipiosDisponibles', new FormControl(data));
          this.changeDetectorRef.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar municipios:', error);
          resolve();
        }
      });
    });
  }
  
  onDepartamentoChange(event: any, index: number) {
    const departamentoId = event.value;
    if (!departamentoId) return;
    const trabajoControl = this.trabajosArray.at(index) as FormGroup;
    trabajoControl.patchValue({ id_municipio: null });
    this.cargarMunicipios(departamentoId, index);
  }
  
}


