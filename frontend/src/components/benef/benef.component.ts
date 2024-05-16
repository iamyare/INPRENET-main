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
  minDate: Date;
  private formKey = 'FormBeneficiario';
  public formParent: FormGroup;
  public municipios: any[] = [];
  public nacionalidades: any[] = [];
  representacion: any = this.datosEstaticosService.representacion;

  @Input() datos: any;
  @Output() newDatBenChange = new EventEmitter<FormGroup>();

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private datosEstaticosService: DatosEstaticosService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
    this.formParent = this.fb.group({
      beneficiario: this.fb.array([]),
    });
  }

  ngOnInit(): void {


    this.initForm();
    this.loadMunicipios();
    this.loadNacionalidades();
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
        cantidad_dependientes: new FormControl(datosBeneficiario?.cantidad_dependientes || 0),
        representacion: new FormControl(datosBeneficiario?.representacion || ''),
        telefono1: new FormControl(datosBeneficiario?.telefono1 || ''),
        fechaNacimiento: new FormControl(datosBeneficiario?.fechaNacimiento || '', Validators.required),
        direccionResidencia: new FormControl(datosBeneficiario?.direccionResidencia || ''),
        id_pais_nacionalidad: new FormControl(datosBeneficiario?.id_pais_nacionalidad || null, Validators.required),
        idMunicipioResidencia: new FormControl(datosBeneficiario?.idMunicipioResidencia || null, Validators.required),
        porcentaje: new FormControl(datosBeneficiario?.porcentaje, [
          Validators.required,
          Validators.maxLength(5),
          /* this.validarPorcentaje.bind(this) */ // Agrega la validación personalizada
        ]),
      }),
    }, /* { validators: this.validarSumaPorcentajes.bind(this) } */);
  }

  // Función para validar el campo porcentaje
  /* validarPorcentaje(control: AbstractControl): ValidationErrors | null {
    const porcentaje = parseInt(control.value, 10);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      return { invalidPorcentaje: true };
    }
    return null;
  }

  // Función para validar la suma de porcentajes
  validarSumaPorcentajes(formGroup: FormGroup): ValidationErrors | null {
    console.log("ENTRO");
    console.log(formGroup.get('datosBeneficiario'));

    const porcentajeTotal = Object.values(formGroup.get('datosBeneficiario')!.value).reduce((total: number, valor: any) => {
      console.log(total);
      console.log(valor);

      return total + (parseInt(valor.porcentaje, 10) || 0);
    }, 0);

    if (porcentajeTotal !== 100) {
      return { invalidSumaPorcentajes: true };
    }
    return null;
  } */

  agregarBen(datosBeneficiario?: any): void {
    const control = this.getCtrl('beneficiario', this.formParent) as FormArray;
    control.push(this.initFormBeneficiario(datosBeneficiario));
  }

  eliminarRefPer(): void {
    const control = this.getCtrl('beneficiario', this.formParent) as FormArray;
    if (control.length > 0) {
      control.removeAt(control.length - 1);
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
    if (this.formParent instanceof FormGroup) {
      const controlesrefpers = (this.formParent.get('beneficiario') as FormGroup).controls;
      /* const temp = controlesrefpers[i].get("datosBeneficiario")!.get(fieldName)!.errors

      let errors = []
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
        return errors;
      } */
    }
  }
}
