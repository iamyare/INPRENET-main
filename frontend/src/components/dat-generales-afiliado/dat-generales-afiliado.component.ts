import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { TipoIdentificacionService } from 'src/app/services/tipo-identificacion.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';

const noSpecialCharsPattern = '^[a-zA-Z0-9\\s]*$';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    n_identificacion: new FormControl(datos?.n_identificacion, [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]),
    primer_nombre: new FormControl(datos?.primer_nombre, [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(/^[^\s]+$/)
    ]),
    segundo_nombre: new FormControl(datos?.segundo_nombre, [
      Validators.maxLength(40),
      Validators.pattern(/^[^\s]+$/)
    ]),
    tercer_nombre: new FormControl(datos?.tercer_nombre, [
      Validators.maxLength(40),
      Validators.pattern(/^[^\s]+$/)
    ]),
    primer_apellido: new FormControl(datos?.primer_apellido, [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(/^[^\s]+$/)
    ]),
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
    rtn: new FormControl(datos?.rtn, [Validators.required, Validators.maxLength(14), Validators.pattern(/^[0-9]{14}$/)]),
    genero: new FormControl(datos?.genero, [Validators.required, Validators.maxLength(30)]),
    id_profesion: new FormControl(datos?.id_profesion, Validators.required),
    id_departamento_residencia: new FormControl(datos?.id_departamento_residencia, Validators.required),
    id_municipio_residencia: new FormControl(datos?.id_municipio_residencia, Validators.required),
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion, Validators.required),
    id_pais: new FormControl(datos?.id_pais, Validators.required),
    sexo: new FormControl(datos?.sexo, [Validators.required, Validators.maxLength(1), Validators.pattern(/^[FM]$/)]),
    grupo_etnico: new FormControl(datos?.grupo_etnico, [Validators.required]),
    tipo_discapacidad: new FormControl(datos?.tipo_discapacidad, [Validators.required]),
    discapacidad: new FormControl(datos?.discapacidad, [Validators.required]),
    discapacidades: new FormArray([]),  // Añadido FormArray discapacidades
    cantidad_hijos: new FormControl(datos?.cantidad_hijos, Validators.required),
    barrio_colonia: new FormControl(datos?.barrio_colonia, [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]),
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
    cargoPublico: new FormControl(datos?.cargoPublico, [
      Validators.maxLength(75)
    ]),
  });
}

export function uniqueDisabilityValidator(disabilityArray: string[], currentIndex: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const currentValue = control.value;
    const isDuplicate = disabilityArray.some((val: string, index: number) => index !== currentIndex && val === currentValue);

    return isDuplicate ? { 'duplicateDisability': { value: currentValue } } : null;
  };
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

  grupo_etnico = [
    { "label": "MESTIZO", "value": "MESTIZO" },
    { "label": "LENCA", "value": "LENCA" },
    { "label": "MISKITO", "value": "MISKITO" },
    { "label": "GARÍFUNA", "value": "GARÍFUNA" },
    { "label": "TOLUPAN", "value": "TOLUPAN" },
    { "label": "CHORTÍ", "value": "CHORTÍ" },
    { "label": "PECH", "value": "PECH" },
    { "label": "TAWAHKA", "value": "TAWAHKA" },
    { "label": "AFROHONDUREÑO", "value": "AFROHONDUREÑO" },
    { "label": "BLANCO", "value": "BLANCO" },
    { "label": "ÁRABE", "value": "ÁRABE" },
  ];

  public formParent: FormGroup = new FormGroup({});

  @Input() useCamera: boolean = false;
  @Input() groupName = '';
  @Input() datos?: any
  @Output() imageCaptured = new EventEmitter<string>();
  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() newDatosGenerales = new EventEmitter<any>()
  private formKey = 'datGenForm';

  field = {
    options: [
      { value: 'SI', label: 'SI' },
      { value: 'NO', label: 'NO' }
    ]
  };
  discapacidadEstado = {
    si: false,
    no: false
  };

  cargoPublicoEstado = {
    si: false,
    no: false
  };

  tipo_discapacidad = [
    { "label": "MOTRIZ", "value": "MOTRIZ" },
    { "label": "AUDITIVA", "value": "AUDITIVA" },
    { "label": "VISUAL", "value": "VISUAL" },
    { "label": "INTELECTUAL", "value": "INTELECTUAL" },
    { "label": "MENTAL", "value": "MENTAL" },
    { "label": "PSICOSOCIAL", "value": "PSICOSOCIAL" },
    { "label": "MÚLTIPLE", "value": "MÚLTIPLE" },
    { "label": "SENSORIAL", "value": "SENSORIAL" }
  ]


  form: FormGroup = this.fb.group({});
  formArchivos: any;
  minDate: Date;
  fallecido: any;
  discapacidad: boolean = false;
  cargoPublico: boolean = false;

  onDatosGeneralesChange() {
    const data = this.formParent
    this.newDatosGenerales.emit(data)
  }

  onDatosGeneralesDiscChange(event: any, i: number) {
    const value = event.value;
    this.discapacidadEstado = {
      si: value === 'SI',
      no: value === 'NO'
    };
    this.discapacidad = this.discapacidadEstado.si;

    // Si se selecciona 'Sí', inicializar el FormArray de discapacidades
    if (this.discapacidad) {
      const refpersArray = this.formParent.get('refpers') as FormArray;
      const firstRefpersGroup = refpersArray.controls[i] as FormGroup;
      const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

      if (discapacidadesArray) {
        discapacidadesArray.clear();  // Limpiar cualquier selección anterior
        discapacidadesArray.push(new FormControl(''));  // Agregar un control vacío inicialmente
      }
    }
  }

  onDatosGeneralesCargChange(event: any) {
    const value = event.value;
    this.cargoPublicoEstado = {
      si: value === 'SI',
      no: value === 'NO'
    };
    this.cargoPublico = this.cargoPublicoEstado.si
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

    if (this.datos && this.datos.value && this.datos.value.refpers && this.datos.value.refpers.length > 0) {
      for (let i of this.datos.value.refpers) {
        temp = this.splitDireccionResidencia(i);

        if (i.discapacidad == "SI") {
          this.discapacidad = true;
        } else if (i.discapacidad == "NO") {
          this.discapacidad = false
        }

        const addressGroup = generateAddressFormGroup(temp);
        const discapacidadesArray = addressGroup.get('discapacidades') as FormArray;
        if (i.discapacidades) {
          i.discapacidades.forEach((discapacidad: any) => {
            discapacidadesArray.push(new FormControl(discapacidad));
          });
        }
        ref_RefPers.push(addressGroup);
      }
    } else {
      ref_RefPers.push(generateAddressFormGroup());
    }

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

  splitDireccionResidencia(datos: any): any {
    const direccion = datos.direccion_residencia;
    if (direccion) {
      const partes = direccion.split(', ');
      return {
        ...datos,
        barrio_colonia: partes[0]?.split(': ')[1] || '',
        avenida: partes[1]?.split(': ')[1] || '',
        calle: partes[2]?.split(': ')[1] || '',
        sector: partes[3]?.split(': ')[1] || '',
        bloque: partes[4]?.split(': ')[1] || '',
        numero_casa: partes[5]?.split(': ')[1] || '',
        color_casa: partes[6]?.split(': ')[1] || '',
        aldea: partes[7]?.split(': ')[1] || '',
        caserio: partes[8]?.split(': ')[1] || '',
      };
    } else {
      return {
        ...datos,
      }
    }
  }

  async cargarDatosEstaticos() {
    this.cargarDepartamentos();
    this.cargarTipoIdent();
    this.cargarnacionalidades();
    this.cargarprofesiones();

    this.fallecido = [{ value: "SI" }, { value: "NO" }]
    this.generos = this.datosEstaticos.genero;
    this.sexo = this.datosEstaticos.sexo;

    if (this.datos && this.datos.value && this.datos.value.refpers && this.datos.value.refpers.length > 0) {
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

  // Método para agregar una discapacidad al FormArray
  agregarDiscapacidad(i: number) {
    const refpersArray = this.formParent.get('refpers') as FormArray;
    const firstRefpersGroup = refpersArray.controls[i] as FormGroup;
    const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

    const newDisabilityControl = new FormControl('', Validators.required);

    discapacidadesArray.push(newDisabilityControl);

    newDisabilityControl.valueChanges.subscribe(() => {
      discapacidadesArray.controls.forEach((control: AbstractControl, index: number) => {
        control.setValidators([
          Validators.required,
          uniqueDisabilityValidator(discapacidadesArray.value, index)
        ]);
        control.updateValueAndValidity({ emitEvent: false });
      });
    });
  }



  getAvailableDisabilities(discapacidadesArray: FormArray, currentIndex: number): { label: string; value: string }[] {
    const selectedValues = discapacidadesArray.value.map((val: any, index: number) => index !== currentIndex ? val : null);
    return this.tipo_discapacidad.filter(d => !selectedValues.includes(d.value));
  }



  // Método para eliminar una discapacidad del FormArray
  eliminarDiscapacidad(i: number, index: number) {
    const refpersArray = this.formParent.get('refpers') as FormArray;
    const firstRefpersGroup = refpersArray.controls[i] as FormGroup;
    const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;
    discapacidadesArray.removeAt(index);

    discapacidadesArray.controls.forEach((control: AbstractControl, idx: number) => {
      control.setValidators([
        Validators.required,
        uniqueDisabilityValidator(discapacidadesArray.value, idx)
      ]);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }



}
