import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { TipoIdentificacionService } from 'src/app/services/tipo-identificacion.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import * as moment from 'moment';
import { MatRadioChange } from '@angular/material/radio';

const noSpecialCharsPattern = '^[a-zA-Z0-9\\s]*$';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    n_identificacion: new FormControl(datos?.n_identificacion, [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
      Validators.minLength(13),
      Validators.maxLength(15)
    ]),
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
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(/^[^\s]+$/)
    ]),
    segundo_apellido: new FormControl(datos?.segundo_apellido, [Validators.maxLength(40)]),
    fallecido: new FormControl(datos?.fallecido, [Validators.maxLength(2)]),
    fecha_nacimiento: new FormControl(datos ? moment.utc(datos.fecha_nacimiento).add(1, 'days').format('YYYY-MM-DD') : "", [Validators.required]),
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
    id_departamento_nacimiento: new FormControl(datos?.id_departamento_nacimiento, Validators.required),
    id_municipio_nacimiento: new FormControl(datos?.id_municipio_nacimiento, Validators.required),
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion, Validators.required),
    id_pais: new FormControl(datos?.id_pais, Validators.required),
    sexo: new FormControl(datos?.sexo, [
      Validators.required,
      Validators.maxLength(10),
      Validators.pattern(/^(F|M|NO BINARIO|OTRO)$/)
    ]),
    grupo_etnico: new FormControl(datos?.grupo_etnico, [Validators.required]),
    discapacidad: new FormControl(datos?.discapacidad, [Validators.required]),
    discapacidades: new FormArray(datos?.discapacidades ? datos.discapacidades.map((d: any) => new FormControl(d.id_discapacidad || '')) : []),
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
    grado_academico: new FormControl(datos?.grado_academico, [
      Validators.maxLength(75)
    ]),
    peps: new FormArray([])
  });
}

@Component({
  selector: 'app-dat-generales-afiliado',
  templateUrl: './dat-generales-afiliado.component.html',
  styleUrls: ['./dat-generales-afiliado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatGeneralesAfiliadoComponent implements OnInit {
  public estadoCargDatos: boolean = false;
  tipoIdentData: any = [];
  nacionalidades: any = [];
  municipios: any = [];
  municipiosNacimiento: any = [];
  departamentos: any = [];
  departamentosNacimiento: any = [];
  generos: { value: string; label: string }[] = [];
  profesiones: any = [];
  sexo: { value: string; label: string }[] = [];
  tipoCotizante: any = this.datosEstaticos.tipoCotizante;
  tipoIdent: any = this.datosEstaticos.tipoIdent;
  estadoCivil: any = this.datosEstaticos.estadoCivil;
  representacion: any = this.datosEstaticos.representacion;
  estados: { value: string; label: string }[] = [];
  tipo_discapacidad: any = [];

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

  grado_academico = [
    { "label": "PRIMARIA", "value": "PRIMARIA" },
    { "label": "EDUCACIÓN MEDIA", "value": "EDUCACIÓN MEDIA" },
    { "label": "PRE-GRADO", "value": "PRE-GRADO" },
    { "label": "POST-GRADO", "value": "POST-GRADO" },
  ];

  formParent: FormGroup = this.fb.group({
    refpers: this.fb.array([])
  });

  @Input() useCamera: boolean = false;
  @Input() groupName = '';
  @Input() datos?: any;
  @Output() imageCaptured = new EventEmitter<string>();
  @Output() newDatosGenerales = new EventEmitter<any>();
  @Output() pepsDataChange = new EventEmitter<any>();
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

  form: FormGroup = this.fb.group({});
  minDate: Date = new Date(); // Hoy
  maxDate: Date = new Date(this.minDate.getFullYear() + 80, this.minDate.getMonth(), this.minDate.getDate());
  fallecido: any;
  discapacidad: boolean = false;
  cargoPublico: boolean = false;

  onDatosGeneralesChange() {
    const data = this.formParent.value;
    const departamentoResidencia = this.departamentos.find((d: any) => d.value === data.refpers[0].id_departamento_residencia)?.label || 'N/A';
    const municipioResidencia = this.municipios.find((m: any) => m.value === data.refpers[0].id_municipio_residencia)?.label || 'N/A';
    const dataToEmit = {
      ...data,
      departamentoResidencia,
      municipioResidencia,
    };
    this.newDatosGenerales.emit(dataToEmit);
  }


  onDatosGeneralesDiscChange(event: MatRadioChange, i: number) {
    const isChecked = event.value === 'SI';
    this.discapacidadEstado = {
      si: isChecked,
      no: !isChecked
    };
    this.discapacidad = this.discapacidadEstado.si;

    const refpersArray = this.formParent.get('refpers') as FormArray;
    const firstRefpersGroup = refpersArray.controls[i] as FormGroup;
    const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

    if (isChecked) {
      this.tipo_discapacidad.forEach((d: any) => {
        if (!discapacidadesArray.controls.some(control => control.value === d.id)) {
          discapacidadesArray.push(new FormControl(d.id));
        }
      });
    } else {
      discapacidadesArray.clear();
    }

    this.onDatosGeneralesChange();
  }

  onDatosGeneralesCargChange(event: any) {
    const value = event.value;
    this.cargoPublicoEstado = {
      si: value === 'SI',
      no: value === 'NO'
    };
    this.cargoPublico = this.cargoPublicoEstado.si;

    if (!this.cargoPublico) {
      const refpersArray = this.formParent.get('refpers') as FormArray;
      refpersArray.controls.forEach((group: AbstractControl) => {
        const pepsArray = (group as FormGroup).get('peps') as FormArray;
        pepsArray.clear();
      });

      this.pepsDataChange.emit([]);
    }
  }

  onDatosBenChange(fecha: any) {
    this.pepsDataChange.emit(fecha._model.selection);
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

    if (this.datos && this.datos.value && this.datos.value.refpers && this.datos.value.refpers.length > 0) {
      this.datos.value.refpers.forEach((i: any) => {
        const addressGroup = generateAddressFormGroup(i);
        const discapacidadesArray = addressGroup.get('discapacidades') as FormArray;

        if (i.discapacidades && i.discapacidades.length > 0) {
          i.discapacidades.forEach((discapacidad: any) => {
            discapacidadesArray.push(new FormControl(discapacidad.id_discapacidad));
          });
        }

        if (i.peps && i.peps.length > 0) {
          const pepsArray = addressGroup.get('peps') as FormArray;
          i.peps.forEach((pep: any) => {
            const pepGroup = this.fb.group({
              pep_cargo_desempenado: [pep.pep_cargo_desempenado, Validators.required],
              startDate: [pep.startDate, Validators.required],
              endDate: [pep.endDate, Validators.required],
            });
            pepsArray.push(pepGroup);
          });
        }

        ref_RefPers.push(addressGroup);
      });
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

  async cargarDatosEstaticos() {
    this.cargarDepartamentos();
    this.cargarTipoIdent();
    this.cargarnacionalidades();
    this.cargarprofesiones();

    this.fallecido = [{ value: "SI" }, { value: "NO" }];
    this.generos = this.datosEstaticos.genero;
    this.sexo = this.datosEstaticos.sexo;

    this.datosEstaticos.getDiscapacidades().subscribe((data) => {
      this.tipo_discapacidad = data;
    }, (error) => {
      console.error('Error al cargar discapacidades', error);
    });

    if (this.datos && this.datos.value && this.datos.value.refpers && this.datos.value.refpers.length > 0) {
      this.departamentos = this.datosEstaticos.departamentos;
      this.tipoIdentData = this.datosEstaticos.tipoIdent;
      this.nacionalidades = this.datosEstaticos.nacionalidades;
      this.profesiones = this.datosEstaticos.profesiones;
      this.municipios = this.datosEstaticos.municipios;
      await this.cargarMunicipios(this.datos.value.refpers[0].id_municipio_residencia);
    }

    this.tipo_discapacidad = await this.datosEstaticos.getDiscapacidades();

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

    this.direccionSer.getAllDepartments().subscribe({
      next: (data) => {
        const transformedJson = data.map((departamento: { id_departamento: any; nombre_departamento: any; }) => {
          return {
            value: departamento.id_departamento,
            label: departamento.nombre_departamento
          };
        });
        this.departamentosNacimiento = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar departamentos de nacimiento:', error);
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
          value: profesion.id_profesion
        }));
        this.profesiones = transformedJson;
      },
      error: (error) => {
        console.error('Error al cargar profesiones:', error);
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

    this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        this.municipiosNacimiento = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios de nacimiento:', error);
      }
    });
  }

  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  onDepartamentoNacimientoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  handleImageCaptured(image: string) {
    this.imageCaptured.emit(image);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  getErrors(i: number, fieldName: string): any[] {
    const formArray = this.formParent.get('refpers') as FormArray;
    const control = formArray.at(i).get(fieldName);

    if (control && control.errors) {
      const errors = [];
      if (control.errors['required']) {
        errors.push('Este campo es requerido.');
      }
      if (control.errors['minlength']) {
        errors.push(`Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`);
      }
      if (control.errors['maxlength']) {
        errors.push(`No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`);
      }
      if (control.errors['pattern']) {
        errors.push('Solo se permiten números.');
      }
      return errors;
    }

    return [];
  }


  isChecked(idDiscapacidad: number): boolean {
    const refpersArray = this.formParent.get('refpers') as FormArray;
    const firstRefpersGroup = refpersArray.controls[0] as FormGroup;
    const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

    return discapacidadesArray.controls.some(control => control.value === idDiscapacidad);
  }

  onDiscapacidadChange(event: Event, i: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const refpersArray = this.formParent.get('refpers') as FormArray;
    const firstRefpersGroup = refpersArray.controls[i] as FormGroup;
    const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

    if (isChecked) {
      this.tipo_discapacidad.forEach((d: any) => {
        if (!discapacidadesArray.controls.some(control => control.value === d.id)) {
          discapacidadesArray.push(new FormControl(d.id));
        }
      });
    } else {
      discapacidadesArray.clear();
    }

    this.onDatosGeneralesChange();
  }

  onPepsDataChange(data: any): void {
    if (data && typeof data === 'object') {
      const { peps, familiares } = data;

      if (Array.isArray(peps)) {
        const validPeps = peps.filter((pep: any) => {
          return Object.values(pep).some(value => value !== null && value !== '');
        });
        this.pepsDataChange.emit(validPeps);
      }

      if (Array.isArray(familiares)) {
        const validFamiliares = familiares.filter((familiar: any) => {
          return Object.values(familiar).some(value => value !== null && value !== '');
        });
        this.pepsDataChange.emit(validFamiliares); // O puedes emitir ambos arrays juntos como necesites
      }
      //console.log(familiares);

    } else {
      console.error('Data no es el formato esperado:', data);
    }
  }
}
