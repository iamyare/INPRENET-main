import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DireccionService } from '../../../../services/direccion.service';
import { DatosEstaticosService } from '../../../../services/datos-estaticos.service';
import { BeneficiosService } from '../../../../services/beneficios.service';
@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrls: ['./benef.component.scss']
})
export class BenefComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  public municipios: any[] = [];
  public municipiosNacimiento: any[] = [];
  public tipo_discapacidad: any[] = [];
  public parentesco: any;
  public departamentos: any = [];
  public genero: any = [];
  public departamentosNacimiento: any = [];
  public minDate: Date;
  @Input() porcentajeDisponible!: number;

  fieldOptions = [
    { value: 'si', label: 'SI' },
    { value: 'no', label: 'NO' }
  ];

  constructor(
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
    private beneficiosService: BeneficiosService,
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
  }

  ngOnInit(): void {

    if (this.porcentajeDisponible == null || this.porcentajeDisponible == undefined) {
      this.porcentajeDisponible = 100;
    }

    if (!this.formGroup.get('beneficiario')) {
      this.formGroup.addControl('beneficiario', this.fb.array([]));
    }

    this.genero = this.datosEstaticosService.genero;

    if (!this.formGroup.get('beneficiario')) {
      const beneficiariosArray = this.fb.array([]);
      beneficiariosArray.setValidators(this.identidadUnicaValidator.bind(this));
      this.formGroup.addControl('beneficiario', beneficiariosArray);
    }

    this.cargarDepartamentos();
    this.cargarDepartamentosNacimiento();
    this.loadDiscapacidades();

    this.parentesco = this.datosEstaticosService.parentesco;
    const nuevoParentesco = { value: "OTRO", label: "OTRO" };
    if (!this.parentesco.some((item: { value: string }) => item.value === nuevoParentesco.value)) {
      this.parentesco.push(nuevoParentesco);
    }

    if (this.beneficiarios.length === 0) {
      this.agregarBeneficiario();
    }
    this.beneficiarios.valueChanges.subscribe(() => {
      /* this.revalidarPorcentajes(); */
    });
  }

  revalidarPorcentajes(): void {
    this.beneficiarios.controls.forEach((control, index) => {
      this.validarPorcentaje(index);
    });
  }


  validarPorcentaje(index: number): void {
    const control = this.beneficiarios.at(index).get('porcentaje');

    if (control) {
      const valorIngresado = Number(control.value) || 0;

      // Sumar los porcentajes de todos los beneficiarios excepto el actual
      const totalAsignado = this.beneficiarios.controls.reduce((acc, beneficiario, i) => {
        if (i !== index) {
          const porcentaje = Number(beneficiario.get('porcentaje')?.value) || 0;
          return acc + porcentaje;
        }
        return acc;
      }, 0);

      const disponible = this.porcentajeDisponible - totalAsignado;

      // Validar que el porcentaje ingresado no exceda el disponible
      if (valorIngresado > disponible) {
        control.setErrors({ excedeTotal: true });
      }
      // Validar que el mínimo permitido es exactamente el disponible si es el último beneficiario
      else if (disponible === valorIngresado) {
        control.setErrors(null);
      }
      // Si aún queda espacio, pero el usuario ingresa menos del disponible, forzarlo a usarlo todo
      else if (valorIngresado < 1) {
        control.setErrors({ minimoInvalido: true });
      }
      else if (totalAsignado + valorIngresado !== 100) {
        control.setErrors({ noCumpleTotal: true });
      }
      else {
        control.setErrors(null);
      }
    }
  }



  // Getter para obtener el FormArray de beneficiarios
  get beneficiarios(): FormArray {
    return this.formGroup.get('beneficiario') as FormArray;
  }

  // Función para agregar un nuevo beneficiario
  agregarBeneficiario(datosBeneficiario?: any): void {
    const discapacidadesFormArray = this.fb.array(this.tipo_discapacidad.map(() => new FormControl(false)));
    const beneficiarioForm = this.fb.group({
      id_tipo_identificacion: new FormControl(datosBeneficiario?.id_tipo_identificacion || 1),
      id_pais_nacionalidad: new FormControl(datosBeneficiario?.id_pais_nacionalidad || 1),
      n_identificacion: new FormControl(datosBeneficiario?.n_identificacion || '', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(13),
        Validators.maxLength(13),
        this.validarIdentificacionUnica()
      ]),
      primer_nombre: new FormControl(datosBeneficiario?.primer_nombre || '', [Validators.maxLength(40)]),
      segundo_nombre: new FormControl(datosBeneficiario?.segundo_nombre || '', [Validators.maxLength(40)]),
      tercer_nombre: new FormControl(datosBeneficiario?.tercer_nombre || ''),
      primer_apellido: new FormControl(datosBeneficiario?.primer_apellido || '', [Validators.maxLength(40)]),
      segundo_apellido: new FormControl(datosBeneficiario?.segundo_apellido || ''),
      genero: new FormControl(datosBeneficiario?.genero || '', [Validators.required]),
      telefono_1: new FormControl('', [Validators.required]),
      correo_1: new FormControl(''),
      correo_2: new FormControl(''),
      fecha_nacimiento: new FormControl('', [Validators.required]),
      direccion_residencia: new FormControl('', [Validators.required]),
      id_municipio_residencia: new FormControl(null, [Validators.required]),
      id_departamento_residencia: new FormControl(null, [Validators.required]),
      id_departamento_nacimiento: new FormControl(null, [Validators.required]),
      id_municipio_nacimiento: new FormControl(null, [Validators.required]),
      porcentaje: new FormControl('', [
        Validators.required,
        Validators.min(1),
        /* this.validarPorcentajeDisponible() */
      ]),
      parentesco: new FormControl(datosBeneficiario?.parentesco || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ]),
      discapacidad: new FormControl('no', [Validators.required]),
      discapacidades: discapacidadesFormArray,
      archivo_identificacion: [null]
    });

    // Escuchar cambios en `n_identificacion`
    beneficiarioForm.get('n_identificacion')?.valueChanges.subscribe(value => {
      if (value) {
        this.verificarAfiliadoBeneficiario(value, beneficiarioForm);
      } else {
        this.limpiarCamposBeneficiario(beneficiarioForm);
      }
    });

    this.beneficiarios.push(beneficiarioForm);
    this.markAllAsTouched(beneficiarioForm);
  }

  validarPorcentajeDisponible(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.value) return null;

      const nuevoPorcentaje = Number(control.value);
      if (isNaN(nuevoPorcentaje) || nuevoPorcentaje < 1) return { minimoInvalido: true };

      // Calcular cuánto porcentaje ya ha sido asignado
      const totalAsignado = this.beneficiarios.controls.reduce((acc, b) => {
        const porcentaje = Number(b.get('porcentaje')?.value) || 0;
        return acc + porcentaje;
      }, 0);

      const disponible = this.porcentajeDisponible - (totalAsignado - nuevoPorcentaje);

      if (nuevoPorcentaje > disponible) return { excedeTotal: true };
      if (nuevoPorcentaje < disponible) return { noCumpleTotal: true };

      return null;
    };
  }



  limpiarCamposBeneficiario(beneficiarioForm: FormGroup): void {
    beneficiarioForm.patchValue({
      primer_nombre: '',
      segundo_nombre: '',
      tercer_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      genero: '',
      telefono_1: '',
      correo_1: '',
      correo_2: '',
      fecha_nacimiento: '',
      direccion_residencia: '',
      id_municipio_residencia: null,
      id_departamento_residencia: null,
      id_departamento_nacimiento: null,
      id_municipio_nacimiento: null,
      porcentaje: '',
      parentesco: '',
      discapacidad: 'no'
    });

    // Limpiar FormArray de discapacidades
    const discapacidadesArray = beneficiarioForm.get('discapacidades') as FormArray;
    discapacidadesArray.clear();
    this.tipo_discapacidad.forEach(() => discapacidadesArray.push(new FormControl(false)));
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

  // Función para eliminar un beneficiario
  eliminarBeneficiario(index: number): void {
    if (this.beneficiarios.length > 1) { // Solo permite eliminar si hay más de un beneficiario
      this.beneficiarios.removeAt(index);
    }
  }

  // Cargar departamentos
  cargarDepartamentos() {
    this.datosEstaticosService.getDepartamentos().then(data => {
      this.departamentos = data;
    }).catch(error => {
      console.error('Error al cargar departamentos:', error);
    });
  }

  // Cargar departamentos de nacimiento
  cargarDepartamentosNacimiento() {
    this.datosEstaticosService.getDepartamentos().then(data => {
      this.departamentosNacimiento = data;
    }).catch(error => {
      console.error('Error al cargar departamentos de nacimiento:', error);
    });
  }

  // Cargar municipios según el departamento seleccionado
  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  onDepartamentoNacimientoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipiosNacimiento(departamentoId);
  }

  cargarMunicipios(departamentoId: number) {
    this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        this.municipios = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  cargarMunicipiosNacimiento(departamentoId: number) {
    this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        this.municipiosNacimiento = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios de nacimiento:', error);
      }
    });
  }

  loadDiscapacidades() {
    this.datosEstaticosService.getDiscapacidades().subscribe({
      next: (data) => {
        this.tipo_discapacidad = data.map((discapacidad: { label: string, value: string }) => ({
          label: discapacidad.label,
          value: discapacidad.value
        }));
        const beneficiariosArray = this.beneficiarios;
        beneficiariosArray.controls.forEach((_, index: number) => {
          const discapacidadesArray = this.getDiscapacidadesFormArray(index);
          this.tipo_discapacidad.forEach(() => discapacidadesArray.push(new FormControl(false)));
        });
      },
      error: (error) => {
        console.error('Error al cargar discapacidades:', error);
      }
    });
  }

  onDiscapacidadChange(index: number, event: any) {
    const beneficiariosArray = this.beneficiarios;
    const beneficiarioGroup = beneficiariosArray.controls[index] as FormGroup;
    const discapacidadesArray = beneficiarioGroup.get('discapacidades') as FormArray;

    discapacidadesArray.clear();
    this.tipo_discapacidad.forEach(() => {
      discapacidadesArray.push(new FormControl(false));
    });

    if (event.value === 'si') {
      // Aquí puedes agregar lógica adicional si es necesario
    }
  }

  getDiscapacidadesFormArray(index: number): FormArray {
    return (this.beneficiarios.at(index).get('discapacidades') as FormArray);
  }

  // Método para obtener errores de un control específico
  getErrors(index: number, controlName: string): string[] {
    const control = this.beneficiarios.at(index).get(controlName);
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
      if (control.errors['email']) {
        errors.push('Correo electrónico no válido.');
      }
      if (control.errors['min']) {
        errors.push(`El valor mínimo es ${control.errors['min'].min}.`);
      }
      if (control.errors['invalidPorcentaje']) {
        errors.push('Valor no válido debe estar entre 0 - 100.');
      }
      if (control.errors['invalidSumaPorcentajes']) {
        errors.push('La suma de los porcentajes debe ser 100%.');
      }
    }
    return errors;
  }

  getArchivo(index: number, event: any) {
    if (event) {
      const beneficiarios = this.formGroup.get('beneficiario') as FormArray;
      const group = beneficiarios.at(index) as FormGroup;

      const archivo = event ? event : null;
      (group.get('archivo_identificacion') as FormControl)?.setValue(archivo);
    }
  }


  validarIdentificacionUnica(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control?.parent?.parent as FormGroup;
      const datosGeneralesIdentificacion = formGroup?.root?.get('datosGenerales')?.get('n_identificacion')?.value;

      const nIdentificacionBeneficiario = control.value;
      if (!nIdentificacionBeneficiario || nIdentificacionBeneficiario !== datosGeneralesIdentificacion) {
        return null;
      }
      return { identificacionDuplicada: true };
    };
  }

  identidadUnicaValidator(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    const identificaciones = formArray.controls
      .map(benef => benef.get('n_identificacion')?.value)
      .filter(value => value !== null && value !== '');
    identificaciones.forEach((identificacion, index) => {
      const duplicados = identificaciones.filter((item, idx) => item === identificacion && idx !== index);

      const controlIdentificacion = formArray.at(index).get('n_identificacion');
      if (duplicados.length > 0) {
        controlIdentificacion?.setErrors({ identidadDuplicada: true });
      } else {
        if (controlIdentificacion?.hasError('identidadDuplicada')) {
          controlIdentificacion.setErrors(null);
        }
      }
    });

    return null;
  }

  reset(): void {
    this.beneficiarios.clear();
    this.formGroup.reset();
    this.cargarDepartamentos();
    this.cargarDepartamentosNacimiento();
    this.loadDiscapacidades();
    this.agregarBeneficiario();
  }

  verificarAfiliadoBeneficiario(n_identificacion: string, beneficiarioForm: FormGroup): void {
    if (!n_identificacion) return;

    this.beneficiosService.verificarSiEsAfiliado(n_identificacion).subscribe({
      next: (response: any) => {
        const datosPersona = response?.esAfiliado?.datosPersona;
        if (datosPersona) {
          const fechaAjustada = datosPersona.fecha_nacimiento
            ? new Date(datosPersona.fecha_nacimiento + 'T00:00:00')
            : null;

          beneficiarioForm.patchValue({
            primer_nombre: datosPersona.primer_nombre,
            segundo_nombre: datosPersona.segundo_nombre,
            tercer_nombre: datosPersona.tercer_nombre,
            primer_apellido: datosPersona.primer_apellido,
            segundo_apellido: datosPersona.segundo_apellido,
            fecha_nacimiento: fechaAjustada,
            telefono_1: datosPersona.telefono_domicilio,
          });
        } else {
          this.limpiarCamposBeneficiario(beneficiarioForm);
        }
      },
      error: (error) => {
        console.error('Error al verificar afiliado:', error);
        this.limpiarCamposBeneficiario(beneficiarioForm);
      }
    });
  }

  getGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  get beneficiariosControls(): FormGroup[] {
    return this.beneficiarios.controls as FormGroup[];
  }


}
