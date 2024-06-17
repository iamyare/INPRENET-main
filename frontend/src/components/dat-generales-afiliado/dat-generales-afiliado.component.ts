import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { TipoIdentificacionService } from 'src/app/services/tipo-identificacion.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';

const noSpecialCharsPattern = '^[a-zA-Z0-9\\s]*$';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    n_identificacion: new FormControl(datos?.n_identificacion, [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]),
    primer_nombre: new FormControl(datos?.primer_nombre, [Validators.required, Validators.maxLength(40), Validators.minLength(1)]),
    segundo_nombre: new FormControl(datos?.segundo_nombre, [Validators.maxLength(40)]),
    tercer_nombre: new FormControl(datos?.tercer_nombre, [Validators.maxLength(40)]),
    primer_apellido: new FormControl(datos?.primer_apellido, [Validators.required, Validators.maxLength(40), Validators.minLength(1)]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.maxLength(40)]),
    fallecido: new FormControl(datos?.fallecido, [Validators.maxLength(2)]),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento, [Validators.required]),
    fecha_vencimiento_ident: new FormControl(datos?.fecha_vencimiento_ident, [Validators.required]),
    cantidad_dependientes: new FormControl(datos?.cantidad_dependientes, [Validators.pattern("^[0-9]+$"), Validators.required]),
    estado_civil: new FormControl(datos?.estado_civil, [Validators.required, Validators.maxLength(40)]),
    representacion: new FormControl(datos?.representacion, [Validators.required, Validators.maxLength(40)]),
    telefono_1: new FormControl(datos?.telefono_1, [Validators.required, Validators.maxLength(12)]),
    telefono_2: new FormControl(datos?.telefono_2, [Validators.maxLength(12)]),
    correo_1: new FormControl(datos?.correo_1, [Validators.required, Validators.maxLength(40), Validators.email]),
    correo_2: new FormControl(datos?.correo_2, [Validators.maxLength(40), Validators.email]),
    direccion_residencia: new FormControl(datos?.direccion_residencia, [Validators.required, Validators.maxLength(200)]),
    rtn: new FormControl(datos?.rtn, [Validators.required, Validators.maxLength(14), Validators.pattern(/^[0-9]{14}$/)]),
    genero: new FormControl(datos?.genero, [Validators.required, Validators.maxLength(30)]),
    id_profesion: new FormControl(datos?.id_profesion, Validators.required),
    id_departamento_residencia: new FormControl(datos?.id_departamento_residencia, Validators.required),
    id_municipio_residencia: new FormControl(datos?.id_municipio_residencia, Validators.required),
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion, Validators.required),
    id_pais_nacionalidad: new FormControl(datos?.id_pais_nacionalidad, Validators.required),
    sexo: new FormControl(datos?.sexo, [Validators.required, Validators.maxLength(1), Validators.pattern(/^[FM]$/)]),
    cantidad_hijos: new FormControl(datos?.cantidad_hijos, Validators.required),
    avenida: new FormControl(datos?.avenida, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    calle: new FormControl(datos?.calle, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    sector: new FormControl(datos?.sector, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    bloque: new FormControl(datos?.bloque, [
      Validators.maxLength(25),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    numero_casa: new FormControl(datos?.numero_casa, [
      Validators.maxLength(25),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    color_casa: new FormControl(datos?.color_casa, [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    aldea: new FormControl(datos?.aldea, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
    caserio: new FormControl(datos?.caserio, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
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
export class DatGeneralesAfiliadoComponent implements OnInit {
  public estadoCargDatos: boolean = false;
  public archivo: any;
  public dataEdit: any;
  tipoIdentData: any = [];
  nacionalidades: any = [];
  municipios: any = [];
  departamentos: any = [];
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
  fallecido: any;

  onDatosGeneralesChange() {
    const data = this.formParent
    this.newDatosGenerales.emit(data)
  }
  onDatosBenChange(fecha: any) {
    this.newDatBenChange.emit(fecha._model.selection);
  }

  constructor(
    private formStateService: FormStateService,
    private tipoIdentificacionService: TipoIdentificacionService,
    private centrosTrabSVC: CentroTrabajoService,
    private fb: FormBuilder,
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
    }
  }

  ngOnInit(): void {
    this.cargarDatosEstaticos();
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
  }

  async cargarDatosEstaticos() {
    this.cargarDepartamentos();
    this.cargarTipoIdent();
    this.cargarnacionalidades();
    this.cargarprofesiones();

    this.fallecido = [{ value: "SI" }, { value: "NO" }]
    this.generos = this.datosEstaticos.genero;
    this.sexo = this.datosEstaticos.sexo;

    if (this.datos.value.refpers.length > 0) {
      this.departamentos = this.datosEstaticos.departamentos
      this.tipoIdentData = this.datosEstaticos.tipoIdent
      this.nacionalidades = this.datosEstaticos.nacionalidades
      this.profesiones = this.datosEstaticos.profesiones
      this.municipios = this.datosEstaticos.municipios
      await this.cargarMunicipios(this.datos.value.refpers[0].id_municipio_residencia);
    }

    this.estadoCargDatos = true;
  }

  cargarDepartamentos() {
    this.direccionSer.getAllDepartments().subscribe({
      next: (data) => {
        const transformedJson = data.map((departamento: { id_departamento: any; nombre_departamento: any; }) => {
          return {
            value: departamento.id_departamento,
            label: departamento.nombre_departamento
          };
        });
        this.departamentos = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      }
    });
  }

  cargarTipoIdent() {
    this.tipoIdentificacionService.obtenerTiposIdentificacion().subscribe({
      next: (data) => {
        const transformedJson = data.map((identificaion: { id_identificacion: any; tipo_identificacion: any; }) => {
          return {
            value: identificaion.id_identificacion,
            label: identificaion.tipo_identificacion
          };
        });
        this.tipoIdentData = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar las identificaciones:', error);
      }
    });
  }

  cargarnacionalidades() {
    this.direccionSer.getAllPaises().subscribe({
      next: (data) => {
        const transformedJson = data.map((item: { nacionalidad: string; id_pais: number; }) => ({
          value: item.id_pais,
          label: item.nacionalidad
        }));
        this.nacionalidades = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  cargarprofesiones() {
    this.centrosTrabSVC.obtenerTodasLasProfesiones().subscribe({
      next: (data) => {
        const transformedJson = data.map((profesion: any) => ({
          label: profesion.descripcion,
          value: profesion.idProfesion
        }));
        this.profesiones = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
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



  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
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
