import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';

@Component({
  selector: 'app-datos-generales',
  templateUrl: './datos-generales.component.html',
  styleUrls: ['./datos-generales.component.scss']
})
export class DatosGeneralesComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Output() imageCaptured = new EventEmitter<string>();

  departamentos: { value: number, label: string }[] = [];
  municipios: { value: number, label: string }[] = [];
  departamentosNacimiento: { value: number, label: string }[] = [];
  municipiosNacimiento: { value: number, label: string }[] = [];
  estadoCivil: {label: string }[] = [];
  profesiones: { value: number, label: string }[] = [];
  representacion: { value: string, label: string }[] = [];
  tipoIdent: { value: number, label: string }[] = [];
  genero: { value: string, label: string }[] = [];
  nacionalidades: { value: number, label: string }[] = [];
  discapacidades: { label: string, value: number }[] = [];
  discapacidadSeleccionada: boolean = false;
  useCamera: boolean = true;

  constructor(private fb: FormBuilder,
              private direccionSer: DireccionService,
              private datosEstaticos: DatosEstaticosService,
              private centroTrabajoService: CentroTrabajoService) {}

  ngOnInit(): void {
    const noSpecialCharsPattern = '^[a-zA-Z0-9\\s]*$';

    if (!this.formGroup) {
      this.formGroup = this.fb.group({
        peps: this.fb.array([]),
        discapacidades: this.fb.array([]),
        FotoPerfil: new FormControl(null, Validators.required)
      });
    } else {
      this.formGroup.addControl('FotoPerfil', new FormControl(null, Validators.required));
    }

    this.formGroup.addControl('discapacidad', new FormControl(false, Validators.required));
    this.cargarDiscapacidades();

    this.formGroup.get('discapacidad')?.valueChanges.subscribe(value => {
      this.onDiscapacidadChange({ value });
    });

    this.formGroup.addControl('n_identificacion', new FormControl('', [Validators.required]));
    this.formGroup.addControl('primer_nombre', new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('segundo_nombre', new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('tercer_nombre', new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('primer_apellido', new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('segundo_apellido', new FormControl('', [Validators.maxLength(40)]));
    this.formGroup.addControl('fecha_nacimiento', new FormControl('', [Validators.required]));
    this.formGroup.addControl('fecha_vencimiento_ident', new FormControl('', [Validators.required]));
    this.formGroup.addControl('cantidad_dependientes', new FormControl('', [Validators.pattern("^[0-9]+$"), Validators.required]));
    this.formGroup.addControl('estado_civil', new FormControl('', [Validators.required, Validators.maxLength(40)]));
    this.formGroup.addControl('representacion', new FormControl('', [Validators.required, Validators.maxLength(40)]));
    this.formGroup.addControl('telefono_1', new FormControl('', [Validators.required, Validators.maxLength(12)]));
    this.formGroup.addControl('telefono_2', new FormControl('', [Validators.maxLength(12)]));
    this.formGroup.addControl('correo_1', new FormControl('', [Validators.required, Validators.maxLength(40), Validators.email]));
    this.formGroup.addControl('correo_2', new FormControl('', [Validators.maxLength(40), Validators.email]));
    this.formGroup.addControl('rtn', new FormControl('', [Validators.required, Validators.maxLength(14), Validators.pattern(/^[0-9]{14}$/)]));
    this.formGroup.addControl('genero', new FormControl('', [Validators.required, Validators.maxLength(30)]));
    this.formGroup.addControl('id_profesion', new FormControl('', Validators.required));
    this.formGroup.addControl('id_departamento_residencia', new FormControl('', Validators.required));
    this.formGroup.addControl('id_municipio_residencia', new FormControl('', Validators.required));
    this.formGroup.addControl('id_departamento_nacimiento', new FormControl('', Validators.required));
    this.formGroup.addControl('id_municipio_nacimiento', new FormControl('', Validators.required));
    this.formGroup.addControl('id_tipo_identificacion', new FormControl('', Validators.required));
    this.formGroup.addControl('id_pais', new FormControl('', Validators.required));
    this.formGroup.addControl('grupo_etnico', new FormControl('', [Validators.required]));
    this.formGroup.addControl('cantidad_hijos', new FormControl('', Validators.required));
    this.formGroup.addControl('barrio_colonia', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('avenida', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('calle', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('sector', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('bloque', new FormControl('', [
      Validators.maxLength(25),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('numero_casa', new FormControl('', [
      Validators.maxLength(25),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('color_casa', new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('aldea', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('caserio', new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(noSpecialCharsPattern)
    ]));
    this.formGroup.addControl('grado_academico', new FormControl('', [
      Validators.maxLength(75)
    ]));

    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.cargarDepartamentos();
    this.cargarEstadoCivil();
    await this.cargarProfesiones();
    this.cargarRepresentacion();
    await this.cargarTiposIdentificacion();
    this.cargarGenero();
    await this.cargarNacionalidades();
  }

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

  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  onDepartamentoNacimientoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipiosNacimiento(departamentoId);
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
        this.departamentosNacimiento = transformedJson; // Cargar en ambos select
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      }
    });
  }

  cargarMunicipios(departamentoId: number) {
    this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data: { value: number; label: string }[]) => {
        this.municipios = data.map(municipio => ({
          value: municipio.value,
          label: municipio.label
        }));
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  cargarMunicipiosNacimiento(departamentoId: number) {
    this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data: { value: number; label: string }[]) => {
        this.municipiosNacimiento = data.map(municipio => ({
          value: municipio.value,
          label: municipio.label
        }));
      },
      error: (error) => {
        console.error('Error al cargar municipios de nacimiento:', error);
      }
    });
  }

  cargarEstadoCivil() {
    this.estadoCivil = this.datosEstaticos.estadoCivil.map((estado: { label: string}) => {
      return {
        label: estado.label
      };
    });
  }

  async cargarProfesiones() {
    try {
      const response = await this.centroTrabajoService.obtenerTodasLasProfesiones().toPromise() || [];
      this.profesiones = response.map((profesion: { descripcion: string, id_profesion: number }) => ({
        label: profesion.descripcion,
        value: profesion.id_profesion
      }));
    } catch (error) {
      console.error('Error al obtener las profesiones', error);
      this.profesiones = [];
    }
  }

  cargarRepresentacion() {
    this.representacion = this.datosEstaticos.representacion.map((item: { value: string; label: string }) => {
      return {
        value: item.value,
        label: item.label
      };
    });
  }

  cargarGenero() {
    this.genero = this.datosEstaticos.genero.map((item: { value: string; label: string }) => {
      return {
        value: item.value,
        label: item.label
      };
    });
  }

  async cargarNacionalidades() {
    try {
      const response = await this.datosEstaticos.getNacionalidad();
      this.nacionalidades = response;
    } catch (error) {
      console.error('Error al obtener nacionalidades:', error);
    }
  }

  async cargarTiposIdentificacion() {
    try {
      const response = await this.datosEstaticos.gettipoIdent();
      this.tipoIdent = response;
    } catch (error) {
      console.error('Error al obtener los tipos de identificación', error);
    }
  }

  cargarDiscapacidades() {
    this.datosEstaticos.getDiscapacidades().subscribe(discapacidades => {
      this.discapacidades = discapacidades;
      this.resetDiscapacidadesFormArray();
    });
  }

  onDiscapacidadChange(event: any) {
    this.discapacidadSeleccionada = event.value;
    if (this.discapacidadSeleccionada) {
      this.resetDiscapacidadesFormArray();
    } else {
      this.formGroup.get('discapacidades')?.clearValidators();
      this.formGroup.get('discapacidades')?.updateValueAndValidity();
      this.formGroup.setControl('discapacidades', this.fb.array([]));
    }
  }

  resetDiscapacidadesFormArray() {
    const discapacidadesArray = this.fb.array(this.discapacidades.map(() => new FormControl(false)));
    this.formGroup.setControl('discapacidades', discapacidadesArray);
  }

  transformarDiscapacidadesSeleccionadas(): void {
    const discapacidadesArray = this.formGroup.get('discapacidades') as FormArray;

    const discapacidadesSeleccionadas = discapacidadesArray.controls
      .map((control, idx) => control.value ? { id_discapacidad: this.discapacidades[idx].value } : null)
      .filter(discapacidad => discapacidad !== null);

    const nuevaDiscapacidadesArray = this.fb.array(discapacidadesSeleccionadas);

    this.formGroup.setControl('discapacidades', nuevaDiscapacidadesArray);
  }

  handleImageCaptured(image: string): void {
    this.formGroup.patchValue({ FotoPerfil: image });
    this.imageCaptured.emit(image);
  }

  get isPhotoInvalid(): boolean {
    const control = this.formGroup.get('FotoPerfil');
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

}
