import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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
  public departamentosNacimiento: any = [];
  public minDate: Date;

  fieldOptions = [
    { value: 'si', label: 'SI' },
    { value: 'no', label: 'NO' }
  ];

  constructor(
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private datosEstaticosService: DatosEstaticosService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
  }

  ngOnInit(): void {
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
      primer_nombre: new FormControl(datosBeneficiario?.primer_nombre || '', [Validators.required, Validators.maxLength(40)]),
      segundo_nombre: new FormControl(datosBeneficiario?.segundo_nombre || '', [Validators.maxLength(40)]),
      tercer_nombre: new FormControl(datosBeneficiario?.tercer_nombre || ''),
      primer_apellido: new FormControl(datosBeneficiario?.primer_apellido || '', [Validators.required, Validators.maxLength(40)]),
      segundo_apellido: new FormControl(datosBeneficiario?.segundo_apellido || ''),
      genero: new FormControl(datosBeneficiario?.genero || ''),
      telefono_1: new FormControl(datosBeneficiario?.telefono_1 || ''),
      telefono_2: new FormControl(datosBeneficiario?.telefono_2 || ''),
      correo_1: new FormControl(datosBeneficiario?.correo_1 || ''),
      correo_2: new FormControl(datosBeneficiario?.correo_2 || ''),
      fecha_nacimiento: new FormControl(datosBeneficiario?.fecha_nacimiento || '', Validators.required),
      direccion_residencia: new FormControl(datosBeneficiario?.direccion_residencia || ''),
      id_municipio_residencia: new FormControl(datosBeneficiario?.id_municipio_residencia || null, Validators.required),
      id_departamento_residencia: new FormControl(datosBeneficiario?.id_departamento_residencia || null, Validators.required),
      id_departamento_nacimiento: new FormControl(datosBeneficiario?.id_departamento_nacimiento || null, Validators.required),
      id_municipio_nacimiento: new FormControl(datosBeneficiario?.id_municipio_nacimiento || null, Validators.required),
      porcentaje: new FormControl(datosBeneficiario?.porcentaje, [
        Validators.required,
        Validators.maxLength(5),
        Validators.min(1),
        this.validarSumaPorcentajes.bind(this)
      ]),
      parentesco: new FormControl(datosBeneficiario?.parentesco, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
      discapacidad: new FormControl(datosBeneficiario?.discapacidad || 'no', [Validators.required]),
      discapacidades: discapacidadesFormArray,
      archivo_identificacion: [null] // Control para el archivo
    });

    this.beneficiarios.push(beneficiarioForm);
    this.markAllAsTouched(beneficiarioForm);
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
    if (this.beneficiarios.length > 0) {
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

  // Cargar discapacidades
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

  // Método para manejar el cambio de discapacidad
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

  // Validación personalizada para asegurar que la suma de porcentajes sea 100
  validarSumaPorcentajes(control: AbstractControl): ValidationErrors | null {
    const beneficiariosArray = this.beneficiarios;
    if (!beneficiariosArray) {
      return null;
    }

    let porcentajeTotal = 0;

    beneficiariosArray.controls.forEach((control: any) => {
      const controlporcentaje = control.get('porcentaje');
      const porcentaje = controlporcentaje?.value;

      if (porcentaje !== undefined) {
        porcentajeTotal += porcentaje;
      }
    });

    if (porcentajeTotal !== 100) {
      return { invalidSumaPorcentajes: true };
    } else {
      beneficiariosArray.controls.forEach((control: any) => {
        const controlporcentaje = control.get('porcentaje');
        if (controlporcentaje.errors) {
          const { invalidSumaPorcentajes, ...otherErrors } = controlporcentaje.errors;
          controlporcentaje.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      });
    }
    return null;
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

}
