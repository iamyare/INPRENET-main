import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  minDate: Date;
  private formKey = 'FormBeneficiario';
  public formParent: FormGroup;
  public municipios: any[] = [];
  public nacionalidades: any[] = [];
  sexo: { value: string; label: string }[] = [];
  generos: { value: string; label: string }[] = [];
  parentesco: any;
  departamentos: any = [];
  @Input() datos: any;
  @Output() newDatBenChange = new EventEmitter<FormGroup>();

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
    public direccionSer: DireccionService,
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
    this.loadNacionalidades();
    /* this.loadMunicipios(); */

    this.parentesco = this.datosEstaticosService.parentesco;
    const nuevoParentesco = { value: "OTRO", label: "OTRO" };
    const existe = this.parentesco.some((item: { value: string; }) => item.value === nuevoParentesco.value);
    if (!existe) {
      this.parentesco.push(nuevoParentesco);
    }

    this.generos = this.datosEstaticosService.genero;
    this.sexo = this.datosEstaticosService.sexo;
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    if (this.datos && this.datos.value && this.datos.value.beneficiario && this.datos.value.beneficiario.length > 0 && beneficiariosArray.length === 0) {
      for (let i of this.datos.value.beneficiario) {
        this.agregarBen(i);
      }
    }
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
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
      datosBeneficiario: this.fb.group({
        dni: new FormControl(datosBeneficiario?.dni || '', [Validators.required, Validators.maxLength(40)]),
        primer_nombre: new FormControl(datosBeneficiario?.primer_nombre || '', [Validators.required, Validators.maxLength(40)]),
        segundo_nombre: new FormControl(datosBeneficiario?.segundo_nombre || '', [Validators.maxLength(40)]),
        tercer_nombre: new FormControl(datosBeneficiario?.tercer_nombre || ''),
        primer_apellido: new FormControl(datosBeneficiario?.primer_apellido || '', [Validators.required, Validators.maxLength(40)]),
        segundo_apellido: new FormControl(datosBeneficiario?.segundo_apellido || ''),
        genero: new FormControl(datosBeneficiario?.genero || ''),
        telefono_1: new FormControl(datosBeneficiario?.telefono_1 || ''),
        sexo: new FormControl(datosBeneficiario?.sexo || ''),
        fecha_nacimiento: new FormControl(datosBeneficiario?.fecha_nacimiento || '', Validators.required),
        direccion_residencia: new FormControl(datosBeneficiario?.direccion_residencia || ''),
        id_pais: new FormControl(datosBeneficiario?.id_pais || null, Validators.required),
        id_municipio_residencia: new FormControl(datosBeneficiario?.id_municipio_residencia || null, Validators.required),
        id_departamento_residencia: new FormControl(datosBeneficiario?.id_departamento_residencia || null, Validators.required),
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
      }),
    });
  }

  cargarDepartamentos() {
    this.datosEstaticosService.getDepartamentos().then(data => {
      this.departamentos = data;
    }).catch(error => {
      console.error('Error al cargar departamentos:', error);
    });
  }

  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  cargarMunicipios(departamentoId: number) {
    this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        this.municipios = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  // Función para validar la suma de porcentajes
  validarSumaPorcentajes(control: AbstractControl): ValidationErrors | null {
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    if (!beneficiariosArray) {
      return null; // No se puede validar si el grupo 'beneficiario' no existe
    }

    let porcentajeTotal = 0;

    beneficiariosArray.controls.forEach(control => {
      const controlporcentaje = control.get('datosBeneficiario')?.get('porcentaje')!;
      const porcentaje = controlporcentaje?.value;

      if (porcentaje !== undefined) {
        porcentajeTotal += porcentaje;
      }
    });

    if (porcentajeTotal !== 100) {
      return { invalidSumaPorcentajes: true };
    } else {
      // Eliminar el error de invalidSumaPorcentajes si existe
      beneficiariosArray.controls.forEach(control => {
        const controlporcentaje = control.get('datosBeneficiario')?.get('porcentaje')!;
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
      control.controls.forEach(control => {
        const controlporcentaje = control.get('datosBeneficiario')?.get('porcentaje')!;
        controlporcentaje.updateValueAndValidity(); // Actualizar la validación del porcentaje
      });
    }
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  onDatosBenChange() {
    this.newDatBenChange.emit(this.formParent);
    this.formStateService.setForm(this.formKey, this.formParent);
  }

  private loadMunicipios() {
    this.direccionService.getAllMunicipios().subscribe({
      next: (data) => {
        this.municipios = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  private loadNacionalidades() {
    this.datosEstaticosService.getNacionalidad().then(data => {
      this.nacionalidades = data;
    }).catch(error => {
      console.error('Error al cargar países:', error);
    });
  }

  getErrors(i: number, fieldName: string): any {
    const controlesrefpers = (this.formParent.get('beneficiario') as FormArray).controls;
    const temp = controlesrefpers[i].get("datosBeneficiario")!.get(fieldName)!.errors;

    let errors = [];
    if (temp) {
      if (temp['required']) {
        errors.push('Este campo es requerido.');
      }
      if (temp['minlength']) {
        errors.push(`Debe tener al menos ${temp['minlength'].requiredLength} caracteres.`);
      }
      if (temp['maxlength']) {
        errors.push(`No puede tener más de ${temp['maxlength'].requiredLength} caracteres.`);
      }
      if (temp['pattern']) {
        errors.push('El formato no es válido.');
      }
      if (temp['email']) {
        errors.push('Correo electrónico no válido.');
      }
      if (temp['invalidPorcentaje']) {
        errors.push('Valor no válido debe estar entre 0 - 100.');
      }
      if (temp['invalidSumaPorcentajes']) {
        errors.push('La suma de los porcentajes debe ser 100%.');
      }
    }

    return errors;
  }

  getErrors2(i: number, fieldName: string): any {
    const controlesrefpers = (this.formParent.get('beneficiario') as FormArray).controls;
    const temp = controlesrefpers[i].get("datosBeneficiario")!.get(fieldName)!.errors;

    let errors = [];
    if (temp) {
      if (temp['min']) {
        errors.push(`El valor mínimo es 1.`);
      }
      if (temp['required']) {
        errors.push('Este campo es requerido.');
      }
      if (temp['minlength']) {
        errors.push(`Debe tener al menos ${temp['minlength'].requiredLength} caracteres.`);
      }
      if (temp['maxlength']) {
        errors.push(`No puede tener más de ${temp['maxlength'].requiredLength} caracteres.`);
      }
      if (temp['pattern']) {
        errors.push('El formato no es válido.');
      }
      if (temp['email']) {
        errors.push('Correo electrónico no válido.');
      }
      if (temp['invalidPorcentaje']) {
        errors.push('Valor no válido debe estar entre 0 - 100.');
      }
    }
    if (temp && temp['invalidSumaPorcentajes'] && fieldName == "porcentaje") {
      errors.push('La suma de los porcentajes debe ser 100%.');
    }
    return errors;
  }
}
