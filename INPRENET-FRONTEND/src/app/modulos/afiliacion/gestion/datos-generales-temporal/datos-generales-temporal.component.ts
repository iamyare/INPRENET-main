import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { ChangeDetectorRef } from '@angular/core';
import { CamaraComponent } from 'src/app/components/camara/camara.component';
import { FormStateService } from 'src/app/services/form-state.service'; // Importar el servicio

@Component({
  selector: 'app-datos-generales-temporal',
  templateUrl: './datos-generales-temporal.component.html',
  styleUrl: './datos-generales-temporal.component.scss'
})

export class DatosGeneralesTemporalComponent implements OnInit {
  minDate = new Date();
  @Input() formGroup!: FormGroup;
  @Output() imageCaptured = new EventEmitter<string>();
  @Input() indicesSeleccionados: any[] = [];
  @Input() initialData!: any;
  @Input() discapacidadSeleccionada!: boolean;
  @Output() newDatosGenerales = new EventEmitter<any>();
  @ViewChild(CamaraComponent, { static: false }) camaraComponent!: CamaraComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  opcion: string = 'NO';

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
  height: number = 0;

  constructor(private fb: FormBuilder,
    private direccionSer: DireccionService,
    private datosEstaticos: DatosEstaticosService,
    private formStateService: FormStateService,

    private cdr: ChangeDetectorRef, // -> 'Inyectamos ChangeDetectorRef'
    private centroTrabajoService: CentroTrabajoService) { }
    
//-----------------------------------

validarMayorDe18Anios(): Validators {
  return (control: FormControl) => {
    if (!control.value) return null;

    const fechaNacimiento = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - fechaNacimiento.getFullYear();
    const monthDiff = today.getMonth() - fechaNacimiento.getMonth();
    const dayDiff = today.getDate() - fechaNacimiento.getDate();

    if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      return { menorDeEdad: true };
    }
    return null;
  };
}


ngOnInit(): void {
  this.opcion = 'NO';
  const today = new Date();
  this.minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());


  // Asegurar que el formGroup existe
  if (!this.formGroup) {
    this.formGroup = this.fb.group({});
  }

  // Agregar campo fotoPerfil
  this.formGroup.addControl('fotoPerfil', new FormControl(null, Validators.required));

  // Agregar el control de discapacidad
  this.formGroup.addControl('discapacidad', new FormControl(false, Validators.required));

  if (this.initialData && typeof this.initialData.discapacidad === 'boolean') {
    this.formGroup.patchValue({
      discapacidad: this.initialData.discapacidad
    });
  } else {
    this.formGroup.patchValue({
      discapacidad: false  // “NO” por defecto
    });
  }

  // ===========================================
  // NUEVO: Agregar el control archivo_identificacion como obligatorio
  // ===========================================
  if (!this.formGroup.contains('archivo_identificacion')) {
    this.formGroup.addControl(
      'archivo_identificacion',
      new FormControl('', [Validators.required])
    );
  }

  // Resetear la cámara si el componente de cámara existe
  if (this.camaraComponent) {
    this.camaraComponent.resetCamera();
  }

  // Limpiar la foto de perfil desde el servicio
  if (this.formStateService) {
    this.formStateService.resetFotoPerfil();
    this.formStateService.getFotoPerfil().subscribe((fotoPerfil) => {
      this.formGroup.patchValue({ fotoPerfil });
    });
  }

  // Suscripción a los cambios de discapacidad
  this.formGroup.get('discapacidad')?.valueChanges.subscribe((value) => {
    this.onDiscapacidadChange({ value });
  });

  const noSpecialCharsPattern = '^[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]*$';
  const addressPattern = /^[a-zA-Z0-9\s.]*$/;

  // Inicializar controles adicionales del formulario
  this.formGroup.addControl('id_tipo_identificacion', new FormControl('', Validators.required));

  this.formGroup.get('id_tipo_identificacion')?.valueChanges.subscribe((value) => {
    this.onTipoIdentificacionChange(value);
  });

  this.setValidacionesIdentificacion(false);

  if (!this.formGroup) {
    if (this.initialData) {
      this.formGroup = this.fb.group({
        peps: this.fb.array([]),
        discapacidades: this.fb.array([]),
        discapacidad: [false, Validators.required],
        ...this.initialData
      });
      this.cargarDiscapacidades();
    } else {
      this.formGroup = this.fb.group({
        peps: this.fb.array([]),
        discapacidades: this.fb.array([]),
        discapacidad: [false, Validators.required],
        fotoPerfil: new FormControl(null, Validators.required)
      });
    }
  } else {
    this.formGroup.reset({
      discapacidad: false,
      fotoPerfil: null
    });
  }

  // Llamada para cargar discapacidades
  this.cargarDiscapacidades();

  // Inicialización de controles adicionales
  this.formGroup.addControl(
    'n_identificacion',
    new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(15),
      Validators.pattern(/^[0-9]+$/)
    ])
  );

  this.formGroup.addControl(
    'primer_nombre',
    new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(noSpecialCharsPattern)
    ])
  );

  this.formGroup.addControl(
    'segundo_nombre',
    new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ])
  );

  this.formGroup.addControl(
    'tercer_nombre',
    new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(noSpecialCharsPattern)
    ])
  );

  this.formGroup.addControl(
    'primer_apellido',
    new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
      Validators.minLength(1),
      Validators.pattern(noSpecialCharsPattern)
    ])
  );

  this.formGroup.addControl(
    'segundo_apellido',
    new FormControl('', [Validators.maxLength(40)])
  );
  
  this.formGroup.addControl(
    'fecha_nacimiento',
    new FormControl('', {
      validators: [
        Validators.required,
        this.validarMayorDe18Anios()
      ]
    } as any) // Agregar 'as any' si sigue marcando error
  );

  this.formGroup.addControl(
    'cantidad_dependientes',
    new FormControl('', [
      Validators.pattern('^[0-9]+$'),
      Validators.required
    ])
  );

  this.formGroup.addControl(
    'estado_civil',
    new FormControl('', [Validators.required, Validators.maxLength(40)])
  );

  this.formGroup.addControl(
    'representacion',
    new FormControl('', [Validators.required, Validators.maxLength(40)])
  );

  this.formGroup.addControl(
    'telefono_1',
    new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern('^[0-9]*$')
    ])
  );

  this.formGroup.addControl(
    'telefono_2',
    new FormControl('', [
      Validators.minLength(8),
      Validators.maxLength(12),
      Validators.pattern('^[0-9]*$')
    ])
  );

  this.formGroup.addControl(
    'correo_1',
    new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
      Validators.email
    ])
  );

  this.formGroup.addControl(
    'correo_2',
    new FormControl('', [
      Validators.maxLength(40),
      Validators.email
    ])
  );

  this.formGroup.addControl(
    'rtn',
    new FormControl('', [
      Validators.required,
      Validators.maxLength(14),
      Validators.pattern(/^[0-9]{14}$/)
    ])
  );

  this.formGroup.addControl(
    'genero',
    new FormControl('', [Validators.required, Validators.maxLength(30)])
  );

  this.formGroup.addControl('id_profesion', new FormControl(''));

  this.formGroup.addControl(
    'id_departamento_residencia',
    new FormControl('', Validators.required)
  );

  this.formGroup.addControl(
    'id_municipio_residencia',
    new FormControl('', Validators.required)
  );

  this.formGroup.addControl(
    'id_departamento_nacimiento',
    new FormControl('', Validators.required)
  );

  this.formGroup.addControl(
    'id_municipio_nacimiento',
    new FormControl('', Validators.required)
  );

  this.formGroup.addControl('id_tipo_identificacion', new FormControl('', Validators.required));

  this.formGroup.addControl(
    'id_pais',
    new FormControl('', Validators.required)
  );

  this.formGroup.addControl(
    'grupo_etnico',
    new FormControl('', [Validators.required])
  );

  this.formGroup.addControl(
    'cantidad_hijos',
    new FormControl('', [
      Validators.pattern('^[0-9]+$'),
      Validators.required
    ])
  );

  this.formGroup.addControl(
    'barrio_colonia',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'avenida',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'calle',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'sector',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'bloque',
    new FormControl('', [
      Validators.maxLength(25),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'numero_casa',
    new FormControl('', [
      Validators.maxLength(25),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'color_casa',
    new FormControl('', [
      Validators.maxLength(40),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'aldea',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'caserio',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.pattern(addressPattern)
    ])
  );

  this.formGroup.addControl(
    'grado_academico',
    new FormControl('', [
      Validators.maxLength(75),
      Validators.required
    ])
  );

  // Cargar datos iniciales
  this.cargarDatosIniciales();

  this.marcarCamposComoTocados();

  // Forzar detección de cambios
  setTimeout(() => {
    this.height =200// Actualizas la propiedad

    this.cdr.detectChanges();
  }, 0);
  
}
//-----------------------------------------------------
  async cargarDatosIniciales() {
    this.cargarDepartamentos();
    this.cargarEstadoCivil();
    await this.cargarProfesiones();
    this.cargarRepresentacion();
    await this.cargarTiposIdentificacion();
    this.cargarGenero();
    await this.cargarNacionalidades();
  }

  onDatosGeneralesChange() {
    const data = this.formGroup;
    this.newDatosGenerales.emit(data);
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
  resetForm(): void {
    this.formGroup.reset({
      discapacidad: false,
      FotoPerfil: null
    });
  
    this.formGroup.setControl('discapacidades', this.fb.array([]));
  
    this.cargarDiscapacidades();
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
    const discapacidadesGroup = this.fb.group({});

    this.discapacidades.forEach(discapacidad => {
      const match = this.indicesSeleccionados.some(
        indice => indice.tipo === discapacidad.label
      );
      discapacidadesGroup.addControl(discapacidad.label, new FormControl(match));
    });

    this.formGroup.setControl('discapacidades', discapacidadesGroup);
  }

  handleImageCaptured(image: string): void {
    if (this.formGroup.get('fotoPerfil')) {
      this.formGroup.get('fotoPerfil')?.setValue(image); // Asigna la imagen al campo fotoPerfil
      this.formGroup.get('fotoPerfil')?.markAsDirty();
      this.formGroup.get('fotoPerfil')?.markAsTouched(); // Marca el campo como modificado
    } else {
      console.error('El formulario no contiene el campo Foto de Perfil');
    }
  }
  
  get isPhotoInvalid(): boolean {
    const control = this.formGroup.get('FotoPerfil');
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  // Función modificada: getArchivo()
  getArchivo(event: File): void {
    // Validar tipo y tamaño
    if (event.type !== 'application/pdf') {
      this.formGroup.get('archivo_identificacion')?.setErrors({ invalidType: true });
      return;
    }

    if (event.size > 5 * 1024 * 1024) { // 5MB
      this.formGroup.get('archivo_identificacion')?.setErrors({ maxSize: true });
      return;
    }

    this.formGroup.get('archivo_identificacion')?.setValue(event);
  }

  removeArchivoIdentificacion() {
    // Limpia el FormControl
    this.formGroup.get('archivo_identificacion')?.setValue(null);
  
    // Limpia el valor del input file para que reaccione si suben el mismo archivo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onTipoIdentificacionChange(tipoIdentificacion: number) {
    if (tipoIdentificacion === 2) {
      this.setValidacionesIdentificacion(true);
    } else if (tipoIdentificacion === 1) {
      this.setValidacionesDNI();
    } else {
      this.setValidacionesIdentificacion(false);
    }
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

  blockManualInput(event: KeyboardEvent): void {
    event.preventDefault();
  }

  clearManualInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = '';
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.formGroup.controls).forEach(field => {
      const control = this.formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.markAsDirty();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        Object.keys(control.controls).forEach(subField => {
          const subControl = control.get(subField);
          subControl?.markAsTouched();
          subControl?.markAsDirty();
        });
      }
    });
  }
 
  ngAfterViewInit() {
    setTimeout(() => {
      this.height = 200;
    }, 0);
  }  
}

const observer = new ResizeObserver(entries => {
  try {
    entries.forEach(entry => {
      // Lógica de manejo de cambios...
    });
  } catch (error) {
    console.error("Error en ResizeObserver:", error);
  }
});

const resizeObserverLoopErrSilencer = () => {
  const resizeObserverErr = /ResizeObserver loop limit exceeded/;
  window.addEventListener('error', (event) => {
    if (resizeObserverErr.test(event.message)) {
      event.stopImmediatePropagation();
    }
  });
};
resizeObserverLoopErrSilencer();