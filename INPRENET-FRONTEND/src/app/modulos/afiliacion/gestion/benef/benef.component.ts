import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FormStateService } from 'src/app/services/form-state.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrls: ['./benef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefComponent implements OnInit {
  public formParent: FormGroup;
  public municipios: any[] = [];
  public municipiosNacimiento: any[] = [];
  public nacionalidades: any[] = [];
  public tipo_discapacidad: any[] = [];
  sexo: { value: string; label: string }[] = [];
  generos: { value: string; label: string }[] = [];
  parentesco: any;
  departamentos: any = [];
  departamentosNacimiento: any = [];
  minDate: Date;

  @Input() datos: any;
  @Output() newDatBenChange = new EventEmitter<FormGroup>();

  private formKey = 'FormBeneficiario';

  field = {
    options: [
      { value: 'si', label: 'SI' },
      { value: 'no', label: 'NO' }
    ]
  };

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
    this.formParent = this.fb.group({
      beneficiario: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.cargarDepartamentos();
    this.cargarDepartamentosNacimiento();
    this.loadDiscapacidades();
    this.loadNacionalidades();

    this.parentesco = this.datosEstaticosService.parentesco;
    const nuevoParentesco = { value: "OTRO", label: "OTRO" };
    if (!this.parentesco.some((item: { value: string }) => item.value === nuevoParentesco.value)) {
      this.parentesco.push(nuevoParentesco);
    }

    this.generos = this.datosEstaticosService.genero;
    this.sexo = this.datosEstaticosService.sexo;

    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    if (this.datos?.value?.beneficiario?.length && beneficiariosArray.length === 0) {
      for (let ben of this.datos.value.beneficiario) {
        this.agregarBen(ben);
      }
    }
  }

  private initForm() {
    const existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        beneficiario: this.fb.array([]),
      });
      this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  initFormBeneficiario(datosBeneficiario?: any): FormGroup {
    return this.fb.group({
      id_tipo_identificacion: new FormControl(datosBeneficiario?.id_tipo_identificacion || 1),
      id_pais_nacionalidad: new FormControl(datosBeneficiario?.id_pais_nacionalidad || 1),
      n_identificacion: new FormControl(datosBeneficiario?.n_identificacion || '', [Validators.required, Validators.maxLength(40)]),
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
      discapacidades: this.fb.array(this.tipo_discapacidad.map(() => new FormControl(false)))
    });
  }

  private loadNacionalidades() {
    this.datosEstaticosService.getNacionalidad().then(data => {
      this.nacionalidades = data;
    }).catch(error => {
      console.error('Error al cargar países:', error);
    });
  }

  cargarDepartamentos() {
    this.datosEstaticosService.getDepartamentos().then(data => {
      this.departamentos = data;
    }).catch(error => {
      console.error('Error al cargar departamentos:', error);
    });
  }

  cargarDepartamentosNacimiento() {
    this.datosEstaticosService.getDepartamentos().then(data => {
      this.departamentosNacimiento = data;
    }).catch(error => {
      console.error('Error al cargar departamentos de nacimiento:', error);
    });
  }

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
        this.formParent.get('beneficiario')?.value.forEach((_: any, index: number) => {
          const discapacidadesArray = this.getDiscapacidadesFormArray(index);
          this.tipo_discapacidad.forEach(() => discapacidadesArray.push(new FormControl(false)));
        });
      },
      error: (error) => {
        console.error('Error al cargar discapacidades:', error);
      }
    });
  }

  validarSumaPorcentajes(control: AbstractControl): ValidationErrors | null {
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
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

  agregarBen(datosBeneficiario?: any): void {
    const control = this.getCtrl('beneficiario', this.formParent) as FormArray;
    control.push(this.initFormBeneficiario(datosBeneficiario));
  }

  eliminarRefPer(): void {
    const control = this.getCtrl('beneficiario', this.formParent) as FormArray;
    if (control.length > 0) {
      control.removeAt(control.length - 1);
      control.controls.forEach((control: any) => {
        const controlporcentaje = control.get('porcentaje');
        controlporcentaje.updateValueAndValidity();
      });
    }
    this.onDatosBenChange();  // Emitir evento con los datos actualizados
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  onDatosBenChange() {
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    const beneficiarios = beneficiariosArray.controls.map((control: AbstractControl, index: number) => ({
      persona: {
        id_tipo_identificacion: control.get('id_tipo_identificacion')?.value,
        id_pais_nacionalidad: control.get('id_pais_nacionalidad')?.value,
        n_identificacion: control.get('n_identificacion')?.value,
        primer_nombre: control.get('primer_nombre')?.value,
        segundo_nombre: control.get('segundo_nombre')?.value,
        tercer_nombre: control.get('tercer_nombre')?.value,
        primer_apellido: control.get('primer_apellido')?.value,
        segundo_apellido: control.get('segundo_apellido')?.value,
        genero: control.get('genero')?.value,
        sexo: control.get('sexo')?.value,
        telefono_1: control.get('telefono_1')?.value,
        telefono_2: control.get('telefono_2')?.value,
        correo_1: control.get('correo_1')?.value,
        correo_2: control.get('correo_2')?.value,
        fecha_nacimiento: control.get('fecha_nacimiento')?.value,
        direccion_residencia: control.get('direccion_residencia')?.value,
        id_municipio_residencia: control.get('id_municipio_residencia')?.value,
        discapacidades: this.getSelectedDiscapacidades(index),
        porcentaje: control.get('porcentaje')?.value
      }
    }));

    const formattedFormGroup = this.fb.group({
      beneficiarios: this.fb.array(beneficiarios.map(b => this.fb.group(b)))
    });

    this.newDatBenChange.emit(formattedFormGroup);
    this.formStateService.setForm(this.formKey, this.formParent);
  }

  getDiscapacidadesFormArray(index: number): FormArray {
    return (this.formParent.get('beneficiario') as FormArray).at(index).get('discapacidades') as FormArray;
  }

  getSelectedDiscapacidades(index: number): string[] {
    const discapacidadesArray = this.getDiscapacidadesFormArray(index);
    return discapacidadesArray.controls
      .map((control, idx) => control.value ? this.tipo_discapacidad[idx].value : null)
      .filter(value => value !== null);
  }

  onDiscapacidadChange(index: number, event: any) {
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    const beneficiarioGroup = beneficiariosArray.controls[index] as FormGroup;
    const discapacidadesArray = beneficiarioGroup.get('discapacidades') as FormArray;

    discapacidadesArray.clear();
    this.tipo_discapacidad.forEach(() => {
      discapacidadesArray.push(new FormControl(false));
    });

    if (event.value === 'si') {
    }
  }

  getErrors(index: number, controlName: string): string[] {
    const control = (this.formParent.get('beneficiario') as FormArray).at(index).get(controlName);
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
    }

    return errors;
  }

  getErrors2(index: number, controlName: string): string[] {
    const control = (this.formParent.get('beneficiario') as FormArray).at(index).get(controlName);
    const errors: string[] = [];

    if (control && control.errors) {
      if (control.errors['min']) {
        errors.push(`El valor mínimo es ${control.errors['min'].min}.`);
      }
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
      if (control.errors['invalidPorcentaje']) {
        errors.push('Valor no válido debe estar entre 0 - 100.');
      }
      if (control.errors['invalidSumaPorcentajes']) {
        errors.push('La suma de los porcentajes debe ser 100%.');
      }
    }

    return errors;
  }

  onDatosGeneralesDiscChange(event: any, index: number) {
    const value = event.value;
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    const beneficiarioGroup = beneficiariosArray.controls[index] as FormGroup;

    if (value === 'si') {
      beneficiarioGroup.get('dependiente')?.setValue(true);
    } else {
      beneficiarioGroup.get('dependiente')?.setValue(false);
    }
  }
}
