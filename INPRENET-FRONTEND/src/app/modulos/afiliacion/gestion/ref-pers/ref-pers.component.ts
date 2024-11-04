import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrls: ['./ref-pers.component.scss']
})
export class RefPersComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  public parentesco: any[] = [];
  public tipo_referencia: any[] = [];
  public maxDate!: Date;

  esAfiliadoText: string = '';

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService,
    private beneficiosService: BeneficiosService
  ) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    if (!this.formGroup.get('conyuge')) {
      this.formGroup.addControl('conyuge', this.initFormConyuge());
    }
    if (!this.formGroup.get('refpers')) {
      const referenciasArray = this.fb.array([]);
      referenciasArray.setValidators(this.identidadUnicaValidator.bind(this));
      this.formGroup.addControl('refpers', referenciasArray);
    }
    this.cargarDatosEstaticos();
  }

  verificarAfiliadoBlur(): void {
    const nIdentificacionControl = this.formGroup.get('conyuge')?.get('n_identificacion');
    const n_identificacion = nIdentificacionControl?.value;

    if (n_identificacion) {``
      this.verificarAfiliado(n_identificacion);
    } else {
      this.esAfiliadoText = 'NO';
    }
  }

  get referencias(): FormArray {
    return this.formGroup.get('refpers') as FormArray;
  }

  // Función para inicializar el FormGroup de cónyuge
  private initFormConyuge(): FormGroup {
    return this.fb.group({
      primer_nombre: ['', []],
      segundo_nombre: [''],
      tercer_nombre: [''],
      primer_apellido: ['', []],
      segundo_apellido: [''],
      n_identificacion: ['', [
        Validators.pattern(/^[0-9]*$/),
        Validators.minLength(13),
        Validators.maxLength(13),
        this.validarIdentificacionUnica()
      ]],
      fecha_nacimiento: ['', []],
      telefono_domicilio: ['', [
        Validators.pattern(/^[0-9]*$/),
        Validators.maxLength(12)
      ]],
      telefono_celular: ['', [
        Validators.pattern(/^[0-9]*$/),
        Validators.maxLength(12)
      ]],
      telefono_trabajo: ['', [
        Validators.pattern(/^[0-9]*$/),
        Validators.maxLength(12)
      ]],
      trabaja: ['', []],
      es_afiliado: ['', []]
    });
  }

  verificarAfiliado(n_identificacion: string): void {
    this.beneficiosService.verificarSiEsAfiliado(n_identificacion).subscribe({
      next: (esAfiliado) => {
        this.esAfiliadoText = esAfiliado ? 'SÍ' : 'NO';
      },
      error: (error) => {
        this.esAfiliadoText = 'NO';
        console.error('Error al verificar si es afiliado', error);
      }
    });
  }

  // Función para agregar una nueva referencia personal
  agregarReferencia(datos?: any): void {
    const referenciaForm = this.fb.group({
      tipo_referencia: [datos?.tipo_referencia || '', [Validators.required]],
      primer_nombre: [datos?.primer_nombre || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      segundo_nombre: [datos?.segundo_nombre || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      tercer_nombre: [datos?.tercer_nombre || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      primer_apellido: [datos?.primer_apellido || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      segundo_apellido: [datos?.segundo_apellido || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      direccion: [datos?.direccion || '', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      telefono_domicilio: [datos?.telefono_domicilio || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      telefono_trabajo: [datos?.telefono_trabajo || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      telefono_personal: [datos?.telefono_personal || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      parentesco: [datos?.parentesco || '', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      n_identificacion: [datos?.n_identificacion || '', [
        Validators.pattern(/^[0-9]*$/),
        Validators.minLength(13),
        Validators.maxLength(13),
        this.validarIdentificacionUnica()
      ]],
    });
    this.referencias.push(referenciaForm);
    this.markAllAsTouched(referenciaForm);

    referenciaForm.get('tipo_referencia')?.valueChanges.subscribe(value => {
      this.cambiarListadoParentesco(value, referenciaForm);
    });
  }

  cambiarListadoParentesco(tipoReferencia: string, referenciaForm: FormGroup) {
    if (tipoReferencia === 'REFERENCIA FAMILIAR') {
      this.parentesco = this.datosEstaticosService.parentesco;
    } else if (tipoReferencia === 'REFERENCIA PERSONAL') {
      this.parentesco = this.datosEstaticosService.parentescoReferenciasPersonales;
    }

    referenciaForm.get('parentesco')?.setValue(''); // Resetear el parentesco cuando cambia el tipo de referencia
  }

  // Función para eliminar una referencia personal
  eliminarReferencia(index: number): void {
    if (this.referencias.length > 0) {
      this.referencias.removeAt(index);
    }
  }

  // Cargar datos estáticos (parentesco, sexo, tipo_referencia, tipo_identificacion)
  private cargarDatosEstaticos(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.tipo_referencia = [
      { label: "REFERENCIA PERSONAL", value: "REFERENCIA PERSONAL" },
      { label: "REFERENCIA FAMILIAR", value: "REFERENCIA FAMILIAR" }
    ];
  }

  // Función para marcar todos los controles como "tocados"
  markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  // Obtener errores para un control específico
  getErrors(index: number, controlName: string): string[] {
    const control = (this.referencias.at(index) as FormGroup).get(controlName);
    const errors: string[] = [];

    if (control && control.errors) {
      if (control.errors['required']) {
        errors.push('Este campo es obligatorio.');
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
    }

    return errors;
  }

  // Método para manejar cambios en el formulario
  onDatosRefPerChange(): void {
    const data = this.formGroup.value;

    const conyugeData = {
      parentesco: 'CÓNYUGE',
      persona_referencia: {
        primer_nombre: data.conyuge.primer_nombre,
        segundo_nombre: data.conyuge.segundo_nombre,
        tercer_nombre: data.conyuge.tercer_nombre,
        primer_apellido: data.conyuge.primer_apellido,
        segundo_apellido: data.conyuge.segundo_apellido,
        n_identificacion: data.conyuge.n_identificacion,
        telefono_1: data.conyuge.telefono_domicilio,
        telefono_2: data.conyuge.telefono_celular,
        direccion_residencia: '',
      }
    };

    const formattedData = this.formatData(data.refpers);

    this.formGroup.setValue({
      referencias: [...formattedData],
      conyuge: conyugeData
    });
  }

  formatData(refpersArray: any[]): any[] {
    return refpersArray.map(ref => ({
      tipo_referencia: ref.tipo_referencia,
      parentesco: ref.parentesco,
      persona_referencia: {
        primer_nombre: ref.primer_nombre,
        segundo_nombre: ref.segundo_nombre,
        tercer_nombre: ref.tercer_nombre,
        primer_apellido: ref.primer_apellido,
        segundo_apellido: ref.segundo_apellido,
        telefono_personal: ref.telefono_personal,
        telefono_trabajo: ref.telefono_trabajo,
        telefono_domicilio: ref.telefono_domicilio,
        direccion: ref.direccion,
        n_identificacion: ref.n_identificacion
      }
    }));
  }

  identidadUnicaValidator(control: AbstractControl): { [key: string]: any } | null {
    const formArray = control as FormArray;
    const identificaciones = formArray.controls
      .map(ref => ref.get('n_identificacion')?.value)
      .filter(value => value !== null && value !== '');
    const duplicados = identificaciones.filter((item, index) => identificaciones.indexOf(item) !== index);
    return duplicados.length > 0 ? { identidadDuplicada: true } : null;
  }

  validarIdentificacionUnica(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control?.parent?.parent as FormGroup; // Acceder al grupo de la referencia personal
      const afiliadoIdentificacion = formGroup?.root?.get('datosGenerales')?.get('n_identificacion')?.value; // Obtener identificación del afiliado

      const nIdentificacionReferencia = control.value;
      if (!nIdentificacionReferencia || nIdentificacionReferencia !== afiliadoIdentificacion) {
        return null;
      }
      return { identificacionDuplicada: true };
    };
  }


}
