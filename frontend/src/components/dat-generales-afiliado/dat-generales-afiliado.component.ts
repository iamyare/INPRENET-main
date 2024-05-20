import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    dni: new FormControl(datos?.dni, [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]),
    primer_nombre: new FormControl(datos?.primer_nombre, [Validators.required, Validators.maxLength(40), Validators.minLength(1)]),
    segundo_nombre: new FormControl(datos?.segundo_nombre, [Validators.maxLength(40)]),
    tercer_nombre: new FormControl(datos?.tercer_nombre, [Validators.maxLength(40)]),
    primer_apellido: new FormControl(datos?.primer_apellido, [Validators.required, Validators.maxLength(40), Validators.minLength(1)]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.maxLength(40)]),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento, [Validators.required]),
    cantidad_dependientes: new FormControl(datos?.cantidad_dependientes, [Validators.pattern("^[0-9]+$"), Validators.required]),
    estado_civil: new FormControl(datos?.estado_civil, [Validators.required, Validators.maxLength(40)]),
    representacion: new FormControl(datos?.representacion, [Validators.required, Validators.maxLength(40)]),
    telefono_1: new FormControl(datos?.telefono_1, [Validators.required, Validators.maxLength(12)]),
    telefono_2: new FormControl(datos?.telefono_2, [Validators.maxLength(12)]),
    correo_1: new FormControl(datos?.correo_1, [Validators.required, Validators.maxLength(40), Validators.email]),
    correo_2: new FormControl(datos?.correo_2, [Validators.maxLength(40), Validators.email]),
    direccion_residencia: new FormControl(datos?.direccion_residencia, [Validators.required, Validators.maxLength(200)]),
    numero_carnet: new FormControl(datos?.numero_carnet, [Validators.required, Validators.maxLength(40)]),
    genero: new FormControl(datos?.genero, [Validators.required, Validators.maxLength(30)]),
    id_profesion: new FormControl(datos?.id_profesion, Validators.required),
    id_municipio_residencia: new FormControl(datos?.id_municipio_residencia, Validators.required),
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion, Validators.required),
    id_pais_nacionalidad: new FormControl(datos?.id_pais_nacionalidad, Validators.required),
    sexo: new FormControl(datos?.sexo, [Validators.required, Validators.maxLength(1), Validators.pattern(/^[FM]$/)]),
    cantidad_hijos : new FormControl(datos?.cantidad_hijos, Validators.required),
  });
}

@Component({
  selector: 'app-dat-generales-afiliado',
  templateUrl: './dat-generales-afiliado.component.html',
  styleUrls: ['./dat-generales-afiliado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class DatGeneralesAfiliadoComponent implements OnInit, OnDestroy {
  public archivo: any;
  public dataEdit: any;
  tipoIdentData: any = [];
  nacionalidades: any = [];
  municipios: any = [];
  generos: { value: string; label: string }[] = [];
  profesiones: any = [];
  sexo: { value: string; label: string }[] = [];
  tipoCotizante: any = this.datosEstaticos.tipoCotizante;
  tipoIdent: any = this.datosEstaticos.tipoIdent;
  estadoCivil: any = this.datosEstaticos.estadoCivil;
  representacion: any = this.datosEstaticos.representacion;
  estados: { value: string; label: string }[] = [];

  public formParent: FormGroup = new FormGroup({});

  @Input() useCamera: boolean = false;
  @Input() groupName = '';
  @Input() datos?: any
  @Output() imageCaptured = new EventEmitter<string>();
  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() newDatosGenerales = new EventEmitter<any>()
  private formKey = 'datGenForm';

  form: FormGroup = this.fb.group({});
  formArchivos: any;
  minDate: Date;

  onDatosGeneralesChange() {
    const data = this.formParent
    this.newDatosGenerales.emit(data)
  }
  onDatosBenChange(fecha: any) {
    this.newDatBenChange.emit(fecha._model.selection);
  }

  constructor(
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private afiliadoService: AfiliadoService,
    public direccionSer: DireccionService,
    private datosEstaticos: DatosEstaticosService) {

    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(), currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());
  }
  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        refpers: this.fb.array([])
      });
      /* this.formStateService.setForm(this.formKey, this.formParent); */
    }
  }

  ngOnInit(): void {
    this.initForm();
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    let temp = {}

    if (this.datos.value.refpers.length > 0) {
      for (let i of this.datos.value.refpers) {
        temp = i
      }
    }

    ref_RefPers.push(generateAddressFormGroup(temp))

    this.formStateService.getFotoPerfil().subscribe(foto => {
      if (foto) {
        this.form.get('FotoPerfil')?.setValue(foto);
      }
    });

    this.formStateService.getFormData().subscribe((savedForm: FormGroup | null) => {
      if (savedForm) {
        this.form.patchValue(savedForm.value, { emitEvent: false });
      }
    });

    this.cargarTiposIdentificacion();
    this.cargarNacionalidades();
    this.cargarMunicipios();
    this.cargarProfesiones();
    this.generos = this.datosEstaticos.genero;
    this.sexo = this.datosEstaticos.sexo;
  }

  ngOnDestroy() {
    /* this.formStateService.setFormData(this.form); */
  }

  cargarProfesiones() {
    this.datosEstaticos.getProfesiones().then(data => {
      this.profesiones = data;
    }).catch(error => {
      console.error('Error al cargar profesiones:', error);
    });
  }

  cargarEstados() {
    this.datosEstaticos.getEstados().then(data => {
      this.profesiones = data;
    }).catch(error => {
      console.error('Error al cargar estados:', error);
    });
  }

  cargarTiposIdentificacion() {
    this.datosEstaticos.gettipoIdent().then(data => {
      this.tipoIdentData = data;
    }).catch(error => {
      console.error('Error al cargar tipos de identificación:', error);
    });
  }

  cargarNacionalidades() {
    this.datosEstaticos.getNacionalidad().then(data => {
      this.nacionalidades = data;
    }).catch(error => {
      console.error('Error al cargar nacionalidades:', error);
    });
  }

  async cargarMunicipios() {
    await this.direccionSer.getAllMunicipios().subscribe({
      next: (data) => {
        this.municipios = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  // Método para recibir el evento de imagen capturada y emitirlo hacia el componente padre
  handleImageCaptured(image: string) {
    this.imageCaptured.emit(image);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  getErrors(i: number, fieldName: string): any {
    if (this.formParent instanceof FormGroup) {
      const controlesrefpers = (this.formParent.get('refpers') as FormGroup).controls;
      const a = controlesrefpers[i].get(fieldName)!.errors

      let errors = []
      if (a) {
        if (a['required']) {
          errors.push('Este campo es requerido.');
        }
        if (a['minlength']) {
          errors.push(`Debe tener al menos ${a['minlength'].requiredLength} caracteres.`);
        }
        if (a['maxlength']) {
          errors.push(`No puede tener más de ${a['maxlength'].requiredLength} caracteres.`);
        }
        if (a['pattern']) {
          errors.push('El formato no es válido.');
        }
        if (a['email']) {
          errors.push('Correo electrónico no válido.');
        }
        return errors;
      }
    }
  }
}
