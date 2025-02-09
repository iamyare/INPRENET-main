import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
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
    private beneficiosService: BeneficiosService,
    private cdr: ChangeDetectorRef
  ) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    // Verificamos si ya existen los form controls,
    // si no, los creamos.
    if (!this.formGroup.get('refpers')) {
      this.formGroup.addControl('refpers', this.fb.array([]));
    }

    if (!this.formGroup.get('conyuge')) {
      this.formGroup.addControl('conyuge', this.initFormConyuge());
    }

    this.cargarDatosEstaticos();
  }

  // ---------------------------------------------
  //  GETTERS y Métodos para Referencias
  // ---------------------------------------------

  get referencias(): FormArray {
    return this.formGroup.get('refpers') as FormArray;
  }

  // Inicializa el formGroup de Cónyuge.
  private initFormConyuge(): FormGroup {
    const form = this.fb.group({
      primer_nombre: [
        '',
        [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]
      ],
      segundo_nombre: [
        '',
        [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]
      ],
      tercer_nombre: [
        '',
        [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]
      ],
      primer_apellido: [
        '',
        [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]
      ],
      segundo_apellido: [
        '',
        [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]
      ],
      n_identificacion: [
        '',
        [
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(13),
          Validators.maxLength(13),
          this.validarIdentificacionUnica()
        ]
      ],
      fecha_nacimiento: ['', []],
      telefono_domicilio: [
        '',
        [Validators.pattern(/^[0-9]*$/), Validators.maxLength(12)]
      ],
      telefono_celular: [
        '',
        [Validators.pattern(/^[0-9]*$/), Validators.maxLength(12)]
      ],
      telefono_trabajo: [
        '',
        [Validators.pattern(/^[0-9]*$/), Validators.maxLength(12)]
      ],
      trabaja: ['NO'],
      es_afiliado: ['', []]
    });
  
    form.get('n_identificacion')?.valueChanges.subscribe(value => {
      if (value && value.length === 13) {
        this.setConyugeFieldsRequired(form);
        if (!form.get('trabaja')?.value) {
          form.get('trabaja')?.setValue('NO', { emitEvent: false });
        }
      } else {
        this.clearConyugeFieldsValidation(form);
        form.get('trabaja')?.setValue('', { emitEvent: false }); 
      }
    });
  
    return form;
  }

  // Función para hacer que los campos sean requeridos
  private setConyugeFieldsRequired(form: FormGroup): void {
    form.get('primer_nombre')?.setValidators([Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]);
    form.get('primer_apellido')?.setValidators([Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]);
    form.get('fecha_nacimiento')?.setValidators([Validators.required]);
    form.get('telefono_celular')?.setValidators([Validators.required, Validators.pattern(/^[0-9]*$/), Validators.maxLength(12)]);
  
    // Marcar como tocados para que aparezcan los errores inmediatamente
    form.get('primer_nombre')?.markAsTouched();
    form.get('primer_apellido')?.markAsTouched();
    form.get('fecha_nacimiento')?.markAsTouched();
    form.get('telefono_celular')?.markAsTouched();
  
    // Actualizar validaciones
    form.get('primer_nombre')?.updateValueAndValidity();
    form.get('primer_apellido')?.updateValueAndValidity();
    form.get('fecha_nacimiento')?.updateValueAndValidity();
    form.get('telefono_celular')?.updateValueAndValidity();
  }
  

// Función para remover la validación de obligatorio
private clearConyugeFieldsValidation(form: FormGroup): void {
  form.get('primer_nombre')?.clearValidators();
  form.get('primer_apellido')?.clearValidators();
  form.get('fecha_nacimiento')?.clearValidators();
  form.get('telefono_celular')?.clearValidators();

  // Mantener otros validadores si es necesario
  form.get('telefono_celular')?.setValidators([Validators.pattern(/^[0-9]*$/), Validators.maxLength(12)]);

  // Actualizar el estado de los controles
  form.get('primer_nombre')?.updateValueAndValidity();
  form.get('primer_apellido')?.updateValueAndValidity();
  form.get('fecha_nacimiento')?.updateValueAndValidity();
  form.get('telefono_celular')?.updateValueAndValidity();
}

  

  verificarAfiliadoBlur(): void {
    const nIdentificacionControl =
      this.formGroup.get('conyuge')?.get('n_identificacion');
    const n_identificacion = nIdentificacionControl?.value;

    if (n_identificacion) {
      this.verificarAfiliado(n_identificacion);
    } else {
      this.esAfiliadoText = 'NO';
    }
  }

  verificarAfiliado(n_identificacion: string): void {
    const conyugeControl = this.formGroup.get('conyuge') as FormGroup;
    conyugeControl.patchValue(
      {
        primer_nombre: '',
        segundo_nombre: '',
        tercer_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        n_identificacion: n_identificacion,
        fecha_nacimiento: '',
        telefono_domicilio: '',
        telefono_celular: '',
        telefono_trabajo: '',
        trabaja: '',
        es_afiliado: ''
      },
      { emitEvent: false } 
    );

    const identControl = conyugeControl.get('n_identificacion');
    if (identControl) {
      identControl.markAsTouched();
      identControl.updateValueAndValidity();
    }

    this.beneficiosService.verificarSiEsAfiliado(n_identificacion).subscribe({
      next: (response: any) => {
        const esAfiliadoResponse = response?.esAfiliado;
        const datosPersona = esAfiliadoResponse?.datosPersona;
        if (datosPersona) {
          this.esAfiliadoText = esAfiliadoResponse.esAfiliado ? 'SÍ' : 'NO';
          conyugeControl.patchValue({
            primer_nombre: datosPersona.primer_nombre,
            segundo_nombre: datosPersona.segundo_nombre,
            tercer_nombre: datosPersona.tercer_nombre,
            primer_apellido: datosPersona.primer_apellido,
            segundo_apellido: datosPersona.segundo_apellido,
            fecha_nacimiento: datosPersona.fecha_nacimiento,
            telefono_domicilio: datosPersona.telefono_domicilio,
            telefono_celular: datosPersona.telefono_celular,
            telefono_trabajo: datosPersona.telefono_trabajo,
            trabaja: datosPersona.trabaja
          });
        } else {
          this.esAfiliadoText = 'NO';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al verificar afiliado:', error);
        this.esAfiliadoText = 'NO';
      }
    });
  }

  // ---------------------------------------------
  //   Métodos para agregar/eliminar Referencias
  // ---------------------------------------------

  agregarReferencia(datos?: any): void {
    const referenciaForm = this.fb.group({
      tipo_referencia: [
        datos?.tipo_referencia || '',
        [Validators.required]
      ],
      primer_nombre: [
        datos?.primer_nombre || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[^0-9]*$/)
        ]
      ],
      segundo_nombre: [
        datos?.segundo_nombre || '',
        [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]
      ],
      tercer_nombre: [
        datos?.tercer_nombre || '',
        [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]
      ],
      primer_apellido: [
        datos?.primer_apellido || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[^0-9]*$/)
        ]
      ],
      segundo_apellido: [
        datos?.segundo_apellido || '',
        [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]
      ],
      direccion: [
        datos?.direccion || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
      ],
      telefono_domicilio: [
        datos?.telefono_domicilio || '',
        [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]
      ],
      telefono_trabajo: [
        datos?.telefono_trabajo || '',
        [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]
      ],
      telefono_personal: [
        datos?.telefono_personal || '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]
      ],
      parentesco: [
        datos?.parentesco || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(30)]
      ],
      n_identificacion: [
        datos?.n_identificacion || '',
        [
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(13),
          Validators.maxLength(13),
          this.validarIdentificacionUnicaReferencia()
        ]
      ]
    });

    this.referencias.push(referenciaForm);
    this.markAllAsTouched(referenciaForm);
    referenciaForm.get('tipo_referencia')?.valueChanges.subscribe((value) => {
      this.cambiarListadoParentesco(value, referenciaForm);
    });
  }

  eliminarReferencia(index: number): void {
    if (this.referencias.length > 0) {
      this.referencias.removeAt(index);
    }
  }

  cambiarListadoParentesco(tipoReferencia: string, referenciaForm: FormGroup) {
    if (tipoReferencia === 'REFERENCIA FAMILIAR') {
      this.parentesco = this.datosEstaticosService.parentesco;
      console.log(this.parentesco);
      
    } else if (tipoReferencia === 'REFERENCIA PERSONAL') {
      this.parentesco = this.datosEstaticosService.parentescoReferenciasPersonales;
    }
    referenciaForm.get('parentesco')?.setValue('');
  }

  markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((ctrl) => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  getErrorMessageForIdentificacion(index: number): string {
    const control = this.referencias.at(index).get('n_identificacion');
    if (control?.hasError('identificacionDuplicadaReferencia')) {
      return 'El número de identificación ya existe en otra referencia.';
    }
    if (control?.hasError('identificacionDuplicada')) {
      return 'No puede ser igual al del Afiliado.';
    }
    if (control?.hasError('pattern')) {
      return 'Solo se permiten números.';
    }
    if (control?.hasError('minlength')) {
      return 'Debe tener exactamente 13 dígitos.';
    }
    if (control?.hasError('maxlength')) {
      return 'No puede tener más de 13 dígitos.';
    }
    return '';
  }

  getErrors(index: number, controlName: string): string[] {
    const control = (this.referencias.at(index) as FormGroup).get(controlName);
    const errors: string[] = [];

    if (control && control.errors) {
      if (control.errors['required']) {
        errors.push('Este campo es obligatorio.');
      }
      if (control.errors['minlength']) {
        errors.push(
          `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`
        );
      }
      if (control.errors['maxlength']) {
        errors.push(
          `No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`
        );
      }
      if (control.errors['pattern']) {
        errors.push('El formato no es válido.');
      }
    }
    return errors;
  }

  getErrorMessageForConyugeIdentificacion(): string {
    const control = this.formGroup.get('conyuge')?.get('n_identificacion');

    if (control?.hasError('identificacionDuplicada')) {
      return 'No puede ser igual al del Afiliado.';
    }
    if (control?.hasError('pattern')) {
      return 'Solo se permiten números.';
    }
    if (control?.hasError('minlength')) {
      return 'Debe tener exactamente 13 dígitos.';
    }
    if (control?.hasError('maxlength')) {
      return 'No puede tener más de 13 dígitos.';
    }
    return '';
  }

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
        direccion_residencia: ''
      }
    };

    const formattedData = this.formatData(data.refpers || []);

    this.formGroup.patchValue({
      refpers: formattedData,
      conyuge: {
        primer_nombre: data.conyuge.primer_nombre,
        segundo_nombre: data.conyuge.segundo_nombre,
        tercer_nombre: data.conyuge.tercer_nombre,
        primer_apellido: data.conyuge.primer_apellido,
        segundo_apellido: data.conyuge.segundo_apellido,
        n_identificacion: data.conyuge.n_identificacion,
        fecha_nacimiento: data.conyuge.fecha_nacimiento,
        telefono_domicilio: data.conyuge.telefono_domicilio,
        telefono_celular: data.conyuge.telefono_celular,
        telefono_trabajo: data.conyuge.telefono_trabajo,
        trabaja: data.conyuge.trabaja,
        es_afiliado: data.conyuge.es_afiliado
      }
    });
  }

  formatData(refpersArray: any[]): any[] {
    return refpersArray.map((ref) => ({
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

  validarIdentificacionUnica(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control?.parent?.parent as FormGroup;
      const afiliadoIdentificacion =
        formGroup?.root?.get('datosGenerales')?.get('n_identificacion')?.value;
      const nIdentificacionConyuge = control.value;

      if (nIdentificacionConyuge && nIdentificacionConyuge === afiliadoIdentificacion) {
        return { identificacionDuplicada: true };
      }
      return null;
    };
  }

  private validarIdentificacionUnicaReferencia(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control?.parent?.parent as FormGroup;
      const afiliadoIdentificacion =
        formGroup?.root?.get('datosGenerales')?.get('n_identificacion')?.value;

      const nIdentificacionReferencia = control.value;
      const referencias = this.referencias.controls.map(
        (ref) => ref.get('n_identificacion')?.value
      );
      const isDuplicated = referencias.filter((id) => id === nIdentificacionReferencia).length > 1;
      const isSameAsAfiliado =
        nIdentificacionReferencia && nIdentificacionReferencia === afiliadoIdentificacion;

      if (isDuplicated) {
        return { identificacionDuplicadaReferencia: true };
      }
      if (isSameAsAfiliado) {
        return { identificacionDuplicada: true };
      }

      return null;
    };
  }

  reset(): void {
    this.referencias.clear();

    this.formGroup.get('conyuge')?.patchValue({
      primer_nombre: '',
      segundo_nombre: '',
      tercer_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      n_identificacion: '',
      fecha_nacimiento: '',
      telefono_domicilio: '',
      telefono_celular: '',
      telefono_trabajo: '',
      trabaja: '',
      es_afiliado: ''
    });

    this.formGroup.reset();
  }
  blockManualInput(event: KeyboardEvent): void {
    event.preventDefault();
  }

  private cargarDatosEstaticos(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.tipo_referencia = [
      { label: 'REFERENCIA PERSONAL', value: 'REFERENCIA PERSONAL' },
      { label: 'REFERENCIA FAMILIAR', value: 'REFERENCIA FAMILIAR' }
    ];
  }
}
