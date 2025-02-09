import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { format } from 'date-fns';
import { lastValueFrom } from 'rxjs';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';

@Component({
  selector: 'app-datos-generales',
  templateUrl: './datos-generales.component.html',
  styleUrls: ['./datos-generales.component.scss']
})
export class DatosGeneralesComponent implements OnInit {
  minDate = new Date();
  @Input() formGroup!: FormGroup;
  @Output() imageCaptured = new EventEmitter<string>();
  @Input() indicesSeleccionados: any[] = [];
  @Input() initialData!: any;
  @Input() discapacidadSeleccionada!: boolean;
  @Output() newDatosGenerales = new EventEmitter<any>();

  departamentos: { value: number, label: string }[] = [];
  municipios: { value: number, label: string }[] = [];
  departamentosNacimiento: { value: number, label: string }[] = [];
  municipiosNacimiento: { value: number, label: string }[] = [];
  estadoCivil: { label: string }[] = [];
  profesiones: { value: number, label: string }[] = [];
  representacion: { value: string, label: string }[] = [];
  tipoIdent: { value: number, label: string }[] = [];
  genero: { value: string, label: string }[] = [];
  nacionalidades: { value: number, label: string }[] = [];
  discapacidades: { label: string, value: number }[] = [];
  useCamera: boolean = true;

  private camposRequeridosIniciales: string[] = [
    'FotoPerfil',
    'id_tipo_identificacion',
    'n_identificacion',
    'rtn',
    'fecha_nacimiento',
    'genero',
    'primer_nombre',
    'primer_apellido',
    'telefono_1',
    'correo_1',
    'estado_civil',
    'cantidad_hijos',
    'cantidad_dependientes',
    'grado_academico',
    'representacion',
    'id_pais',
    'id_departamento_nacimiento',
    'id_municipio_nacimiento',
    'id_departamento_residencia',
    'id_municipio_residencia',
    'grupo_etnico',
    'archivo_identificacion',
    'fecha_afiliacion'
  ];

  constructor(private fb: FormBuilder,
    private direccionSer: DireccionService,
    private datosEstaticos: DatosEstaticosService,
    private centroTrabajoService: CentroTrabajoService, 
    
  ) { }

  ngOnInit(): void {
    const noSpecialCharsPattern = '^[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]*$';
    const addressPattern = /^[a-zA-Z0-9\s.]*$/;

    if (!this.formGroup) {
        if (this.initialData) {
            this.formGroup = this.fb.group({
                discapacidades: this.fb.array([]),
                ...this.initialData
            });
            console.log(this.initialData);
            

            if (this.initialData.fecha_nacimiento) {
                const fechaNacimiento = new Date(this.initialData.fecha_nacimiento + 'T00:00:00');
                this.formGroup.patchValue({ fecha_nacimiento: fechaNacimiento });
            }
            if (this.initialData.fecha_afiliacion) {
              const fechaNacimiento = new Date(this.initialData.fecha_afiliacion + 'T00:00:00');
              this.formGroup.patchValue({ fecha_afiliacion: fechaNacimiento });
          }
        } else {
            this.formGroup = this.fb.group({
                discapacidades: this.fb.array([]),
                FotoPerfil: new FormControl(null, Validators.required)
            });
        }
    } else {
        this.formGroup.addControl('FotoPerfil', new FormControl(null, Validators.required));
    }

    this.formGroup.addControl('id_tipo_identificacion', new FormControl('', Validators.required));

  // 📌 Se suscribe a los cambios en el tipo de identificación para aplicar las validaciones correspondientes
  this.formGroup.get('id_tipo_identificacion')?.valueChanges.subscribe((value) => {
    this.onTipoIdentificacionChange(value);
  });

  this.formGroup.addControl('n_identificacion', new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(15),
      Validators.pattern(/^[0-9]+$/)
  ]));

    this.formGroup.addControl('discapacidad', new FormControl(false, Validators.required));

    // Si la persona tiene discapacidades, marcar el campo de discapacidad en true
    if (this.initialData?.discapacidad === true || (this.initialData?.discapacidades && this.initialData.discapacidades.length > 0)) {
        this.formGroup.patchValue({ discapacidad: true });
        this.discapacidadSeleccionada = true;
    }

    this.cargarDiscapacidades();

    this.formGroup.get('discapacidad')?.valueChanges.subscribe(value => {
        this.onDiscapacidadChange({ value });
    });

    this.formGroup.addControl('n_identificacion', new FormControl('', [
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(15),
        Validators.pattern(/^[0-9]+$/)
    ]));
    this.formGroup.addControl('primer_nombre', new FormControl('', [Validators.required, Validators.maxLength(40)]));
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
    this.formGroup.addControl('fecha_afiliacion', new FormControl('', [Validators.required]));
    this.formGroup.addControl('cantidad_dependientes', new FormControl('', [Validators.pattern("^[0-9]+$"), Validators.required]));
    this.formGroup.addControl('estado_civil', new FormControl('', [Validators.required, Validators.maxLength(40)]));
    this.formGroup.addControl('representacion', new FormControl('', [Validators.required, Validators.maxLength(40)]));
    this.formGroup.addControl('telefono_1', new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern("^[0-9]*$")
    ]));
    this.formGroup.addControl('telefono_2', new FormControl('', [
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern("^[0-9]*$")
    ]));
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
    this.formGroup.addControl('cantidad_hijos', new FormControl('', [Validators.pattern("^[0-9]+$"), Validators.required]));
    this.formGroup.addControl('barrio_colonia', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('avenida', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('calle', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('sector', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('bloque', new FormControl('', [Validators.maxLength(25), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('numero_casa', new FormControl('', [Validators.maxLength(25), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('color_casa', new FormControl('', [Validators.maxLength(40), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('aldea', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('caserio', new FormControl('', [Validators.maxLength(75), Validators.pattern(addressPattern)]));
    this.formGroup.addControl('grado_academico', new FormControl('', [Validators.maxLength(75)]));
    
    // Agregar el control para el archivo de identificación con Validators.required
    this.formGroup.addControl('archivo_identificacion', new FormControl(null, Validators.required));

    // Lista de campos que mostrarán errores desde el inicio
    this.camposRequeridosIniciales.forEach(campo => {
        const control = this.formGroup.get(campo);
        if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
    });

    this.formGroup.markAllAsTouched();

    this.cargarDatosIniciales();

    this.formGroup.valueChanges.subscribe(() => {
        this.onDatosGeneralesChange();
    });
  }

  async cargarDatosIniciales() {
    await this.cargarDepartamentos();
    if (this.formGroup.get('id_departamento_nacimiento')?.value) {
      this.cargarMunicipiosNacimiento(this.formGroup.get('id_departamento_nacimiento')?.value);
    }
    if (this.formGroup.get('id_departamento_residencia')?.value) {
      this.cargarMunicipios(this.formGroup.get('id_departamento_residencia')?.value);
    }
  
    this.cargarEstadoCivil();
    await this.cargarProfesiones();
    this.cargarRepresentacion();
    await this.cargarTiposIdentificacion();
    this.cargarGenero();
    await this.cargarNacionalidades();
    
    this.formGroup.patchValue({
      id_profesion: this.initialData?.id_profesion || '',
      id_tipo_identificacion: this.initialData?.id_tipo_identificacion || '',
      id_municipio_nacimiento: this.initialData?.id_municipio_nacimiento || '',
      segundo_nombre: this.initialData?.segundo_nombre || '',
      tercer_nombre: this.initialData?.tercer_nombre || '',
      segundo_apellido: this.initialData?.segundo_apellido || '',
      aldea: this.initialData?.aldea || '',
      avenida: this.initialData?.avenida || '',
      barrio_colonia: this.initialData?.barrio_colonia || '',
      bloque: this.initialData?.bloque || '',
      calle: this.initialData?.calle || '',
      caserio: this.initialData?.caserio || '',
      color_casa: this.initialData?.color_casa || '',
      numero_casa: this.initialData?.numero_casa || '',
      sector: this.initialData?.sector || '',
      correo_2: this.initialData?.correo_2 || '',
      telefono_2: this.initialData?.telefono_2 || '',
    });
  }
  
  onDatosGeneralesChange(): void {
    try {
      const data = { ...this.formGroup.value };
      
      if (data.fecha_nacimiento) {
        data.fecha_nacimiento = format(new Date(data.fecha_nacimiento), 'yyyy-MM-dd');
      }
      if (data.fecha_afiliacion) {
        data.fecha_afiliacion = format(new Date(data.fecha_afiliacion), 'yyyy-MM-dd');
      }
      this.newDatosGenerales.emit(data);
    } catch (error) {
      console.error('Error al procesar los datos:', error);
    }
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

  onTipoIdentificacionChange(tipoIdentificacion: number) {
    const control = this.formGroup.get('n_identificacion');
  
    if (!control) return;
  
    if (tipoIdentificacion === 2) {
      // Pasaporte: permite letras y números, mínimo 9 caracteres
      control.setValidators([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(15),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]);
    } else if (tipoIdentificacion === 1) {
      // DNI: solo números, exactamente 13 caracteres
      control.setValidators([
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
        Validators.pattern(/^[0-9]+$/)
      ]);
    } else {
      // Otro tipo: valores predeterminados (solo números, 13-15 caracteres)
      control.setValidators([
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(15),
        Validators.pattern(/^[0-9]+$/)
      ]);
    }
  
    control.updateValueAndValidity(); // ⚠️ Importante: actualizar el estado del campo
  }
  

  setValidacionesIdentificacion(permitirLetras: boolean) {
    const control = this.formGroup.get('n_identificacion');
    if (permitirLetras) {
      control?.setValidators([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(15),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]);
    } else {
      control?.setValidators([
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(15),
        Validators.pattern(/^[0-9]+$/)
      ]);
    }
    control?.updateValueAndValidity();
  }
  
  setValidacionesDNI() {
    const control = this.formGroup.get('n_identificacion');
    control?.setValidators([
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13),
      Validators.pattern(/^[0-9]+$/)
    ]);
    control?.updateValueAndValidity();
  }

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
        this.departamentosNacimiento = transformedJson;
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
    this.estadoCivil = this.datosEstaticos.estadoCivil.map((estado: { label: string }) => {
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
      if (this.initialData?.id_profesion) {
        this.formGroup.patchValue({ id_profesion: this.initialData.id_profesion });
      }
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
      if (this.initialData?.id_tipo_identificacion) {
        this.formGroup.patchValue({ id_tipo_identificacion: this.initialData.id_tipo_identificacion });
      }
    } catch (error) {
      console.error('Error al obtener los tipos de identificación', error);
    }
  }

  cargarDiscapacidades() {
    this.datosEstaticos.getDiscapacidades().subscribe(discapacidades => {
      this.discapacidades = discapacidades;
      if (this.formGroup.get('discapacidad')?.value === true && this.discapacidades.length > 0) {
        this.discapacidadSeleccionada = true;
        this.resetDiscapacidadesFormArray();
      } else {
        this.discapacidadSeleccionada = false;
      }
    });
  }
  
  onDiscapacidadChange(event: any) {
    this.discapacidadSeleccionada = event.value === true && this.discapacidades.length > 0;
  
    if (this.discapacidadSeleccionada) {
      this.resetDiscapacidadesFormArray();
      this.formGroup.markAsDirty();
    } else {
      this.formGroup.get('discapacidades')?.clearValidators();
      this.formGroup.get('discapacidades')?.updateValueAndValidity();
      this.formGroup.setControl('discapacidades', this.fb.array([]));
      this.formGroup.markAsDirty();
    }
  }

  resetDiscapacidadesFormArray() {
    const discapacidadesGroup = this.fb.group({});
    
    this.discapacidades.forEach(discapacidad => {
      const isSelected = this.indicesSeleccionados.some(
        indice => indice.tipo === discapacidad.label
      );
      discapacidadesGroup.addControl(discapacidad.label, new FormControl(isSelected));
    });
  
    this.formGroup.setControl('discapacidades', discapacidadesGroup);
  }
  
  handleImageCaptured(image: string): void {
    this.formGroup.patchValue({ FotoPerfil: image });
    this.imageCaptured.emit(image);
  }

  get isPhotoInvalid(): boolean {
    const control = this.formGroup.get('FotoPerfil');
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  //nuevo cambio
  getArchivo(event: File): void {
    if (this.formGroup && !this.formGroup.contains('archivo_identificacion')) {
      this.formGroup.addControl('archivo_identificacion', new FormControl('', []));
    }
    this.formGroup?.get('archivo_identificacion')?.setValue(event);
  }

  //---------------------------------------------Adicion
  getErrorMessage(controlName: string): string {
    const control = this.formGroup.get(controlName);
    if (!control) return '';
    
    if (control.hasError('required')) return `${controlName} es requerido`;
    if (control.hasError('minlength')) return `${controlName} debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres`;
    if (control.hasError('maxlength')) return `${controlName} no puede tener más de ${control.errors?.['maxlength'].requiredLength} caracteres`;
    if (control.hasError('pattern')) return `${controlName} tiene formato incorrecto`;
    if (control.hasError('email')) return `${controlName} debe ser un correo válido`;
    
    return '';
  }
  
  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();  // Marca todos los controles como "tocados"
      return;
    }
  }
}
