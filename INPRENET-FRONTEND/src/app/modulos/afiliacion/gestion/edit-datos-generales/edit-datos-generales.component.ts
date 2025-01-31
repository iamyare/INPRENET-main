import { Component, Input, OnInit, ChangeDetectorRef  } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from '../../../../../../src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { PermisosService } from '../../../../../../src/app/services/permisos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AfiliacionService } from '../../../../services/afiliacion.service';

@Component({
  selector: 'app-edit-datos-generales',
  templateUrl: './edit-datos-generales.component.html',
  styleUrls: ['./edit-datos-generales.component.scss']
})
export class EditDatosGeneralesComponent implements OnInit {
  autoResize($event: Event) {
    throw new Error('Method not implemented.');
  }

  datosGen: any;
  municipios: any = [];
  departamentos: any = [];
  unirNombres: any = unirNombres;
  CausaFallecimiento: any[] = [];
  estado: any[] = [];
  //public mostrarBotonGuardar: boolean = false;
  mostrarBotonGuardar: boolean = false;
  image: any;
  datos!: any;
  form: any;
  datosGeneralesForm: FormGroup;

  estadoAfiliacion: any;
  fallecido: any;
  minDate: Date;
  public loading: boolean = false;

  // -------------------------------------------
  // FORMULARIOS
  // -------------------------------------------
  @Input() Afiliado!: any;
  certificadoDefuncionUrl: SafeResourceUrl | null = null;
  archivoIdentificacionUrl: SafeResourceUrl | null = null;

  certificadoDefuncionFile: File | null = null; // Variable para almacenar el archivo adjunto
  
  initialData = {};
  indicesSeleccionados: any[] = [];
  discapacidadSeleccionada!: boolean;

  tiposPersona: any[] = [
    { ID_TIPO_PERSONA: 1, TIPO_PERSONA: 'AFILIADO' }
  ];
  tipoPersonaSeleccionada: number | null = null;

  tiposIdentificacion: any[] = [];
  profesiones: any[] = [];
  direccionValida: boolean = true;
  direccionCompleta: string = '';

  dniCausante: string = '';
  displayedColumns: string[] = ['ID_PERSONA', 'ID_CAUSANTE', 'ID_CAUSANTE_PADRE', 'ID_DETALLE_PERSONA', 'ID_ESTADO_AFILIACION', 'DNICausante', 'TipoPersona', 'EstadoAfiliacion', 'Observacion'];

  tableData: any[] = [];
  formObservacion = new FormControl('');

  // ----------------------------
  // Form principal (form1)
  // ----------------------------
  form1: FormGroup = this.fb.group({
    fallecido: ['NO', Validators.required],
    causa_fallecimiento: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ],
    fecha_defuncion: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ],
    id_departamento_defuncion: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ],
    id_municipio_defuncion: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ],
    tipo_persona: [''],
    estado: [''],
    voluntario: ['NO', Validators.required],

    // <-- NUEVO: Campo para la fecha del reporte del fallecimiento
    fecha_reporte_fallecido: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ],

    // <-- NUEVO: Campo para número certificado de defunción
    numero_certificado_defuncion: [
      '',
      this.conditionalValidator(
        () => this.form1?.get('fallecido')?.value === 'SI',
        Validators.required
      )
    ]
  });

  // ----------------------------
  // Form para datos generales
  // ----------------------------
  formDatosGenerales: FormGroup = this.fb.group({
    refpers: this.fb.array([], [Validators.required]),

    // <-- NUEVO: Campos para adjuntar archivos (requeridos u opcionales).
    // Si quieres que ambos sean siempre obligatorios, usa Validators.required.
    // Si uno depende de si está fallecido, se podría meter una validación condicional.
    archivoCertDef: [null],        // Certificado defunción
    archivo_identificacion: [null] // Archivo identificación
  });

  constructor(
    private fb: FormBuilder,
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    public direccionSer: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
    private permisosService: PermisosService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private afiliacionService: AfiliacionService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(
      currentYear.getFullYear(),
      currentYear.getMonth(),
      currentYear.getDate(),
      currentYear.getHours(),
      currentYear.getMinutes(),
      currentYear.getSeconds()
    );
    this.datosGeneralesForm = this.fb.group({
      // Campo para tomar foto
      FotoPerfil: [null, Validators.required],
  
      // Datos de identificación
      //id_tipo_identificacion: ['', Validators.required],
      n_identificacion: ['', [ Validators.required, Validators.minLength(13), Validators.maxLength(15), Validators.pattern(/^[0-9]+$/)]],
      rtn: ['', [ Validators.required, Validators.maxLength(14), Validators.pattern(/^[0-9]{14}$/)]],
  
      // Datos personales
      fecha_nacimiento: ['', Validators.required],
      fecha_afiliacion: ['', Validators.required],
      genero: ['', Validators.required],
      primer_nombre: ['', [ Validators.required, Validators.maxLength(40)]],
      primer_apellido: ['', [ Validators.required, Validators.maxLength(40), Validators.minLength(1), Validators.pattern('^[a-zA-Z0-9\\s]*$')]],
  
      // Contacto
      telefono_1: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern("^[0-9]*$")]],
      correo_1: ['', [ Validators.required, Validators.maxLength(40), Validators.email]],
  
      // Estado civil y dependientes
      estado_civil: ['', [ Validators.required, Validators.maxLength(40)]],
      cantidad_hijos: ['', [ Validators.required, Validators.pattern("^[0-9]+$")]],
      cantidad_dependientes: ['', [ Validators.required, Validators.pattern("^[0-9]+$")]],
  
      // Educación y representación
      grado_academico: ['', Validators.required],
      representacion: ['', Validators.required],
  
      // Nacionalidad y ubicación
      id_pais: ['', Validators.required],
      id_departamento_nacimiento: ['', Validators.required],
      id_municipio_nacimiento: ['', Validators.required],
      id_departamento_residencia: ['', Validators.required],
      id_municipio_residencia: ['', Validators.required],
  
      // Grupo étnico
      grupo_etnico: ['', Validators.required],
  
      // Archivo de identificación
      archivo_identificacion: [null, Validators.required],
  
      // **Discapacidades** - Agregar este control
      discapacidades: this.fb.group({}) // Inicialmente vacío, se llenará dinámicamente
    });
  }

  ngOnInit(): void {
    // Permisos

    
    setTimeout(() => {
      this.mostrarBotonGuardar = this.permisosService.userHasPermission(
        'AFILIACIONES',
        'afiliacion/buscar-persona',
        'editar'
      );
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, 0);
    
    if (this.dniCausante) {
      // this.cargarDesignadosOBeneficiarios(this.dniCausante);
    }

    this.cargarCausasFallecimiento();
    this.cargarEstadosAfiliado();
    this.previsualizarInfoAfil();
    this.cargarDepartamentos();

    this.svcAfiliado.buscarDetPersona(this.Afiliado.n_identificacion).subscribe(
      (detalles: any[]) => {
        
        this.tableData = detalles;
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar movimientos:', error);
        this.loading = false;
      }
    );

    // --------------------------------
    // Escucha cambios en fallecido
    // --------------------------------
    this.form1.get('fallecido')?.valueChanges.subscribe((value) => {
      if (value === 'NO') {
        // Limpiar campos de fallecimiento
        this.form1.patchValue({
          causa_fallecimiento: '',
          fecha_defuncion: '',
          id_departamento_defuncion: '',
          id_municipio_defuncion: '',
          fecha_reporte_fallecido: '',
          numero_certificado_defuncion: ''
        });
    
        // Deshabilitar campos relacionados con fallecimiento
        this.form1.get('causa_fallecimiento')?.disable();
        this.form1.get('fecha_defuncion')?.disable();
        this.form1.get('id_departamento_defuncion')?.disable();
        this.form1.get('id_municipio_defuncion')?.disable();
        this.form1.get('fecha_reporte_fallecido')?.disable();
        this.form1.get('numero_certificado_defuncion')?.disable();
    
        // Eliminar el archivo adjunto si existe
        this.eliminarCertificadoDefuncion();
    
        // Deshabilitar y limpiar validadores del campo de archivo de certificado de defunción
        this.formDatosGenerales.get('archivoCertDef')?.disable();
        this.formDatosGenerales.get('archivoCertDef')?.clearValidators();
        this.formDatosGenerales.get('archivoCertDef')?.updateValueAndValidity();
      } else {
        // Habilitar campos relacionados con fallecimiento
        this.form1.get('causa_fallecimiento')?.enable();
        this.form1.get('fecha_defuncion')?.enable();
        this.form1.get('id_departamento_defuncion')?.enable();
        this.form1.get('id_municipio_defuncion')?.enable();
        this.form1.get('fecha_reporte_fallecido')?.enable();
        this.form1.get('numero_certificado_defuncion')?.enable();
    
        // Habilitar y agregar validadores al campo de archivo de certificado de defunción
        this.formDatosGenerales.get('archivoCertDef')?.enable();
        this.formDatosGenerales.get('archivoCertDef')?.setValidators([Validators.required]);
        this.formDatosGenerales.get('archivoCertDef')?.updateValueAndValidity();
      }
    });

    // Importante: Si inicias con "NO", deshabilita al cargar
    if (this.form1.get('fallecido')?.value === 'NO') {
      this.form1.get('causa_fallecimiento')?.disable();
      this.form1.get('fecha_defuncion')?.disable();
      this.form1.get('id_departamento_defuncion')?.disable();
      this.form1.get('id_municipio_defuncion')?.disable();
      this.form1.get('fecha_reporte_fallecido')?.disable();
      this.form1.get('numero_certificado_defuncion')?.disable();
    }
  }
  // --------------------------------
  // Validador condicional reusado
  // --------------------------------
  conditionalValidator(predicate: () => boolean, validator: any): any {
    return (control: FormControl) => {
      if (!control.parent) {
        return null;
      }
      return predicate() ? validator(control) : null;
    };
  }

  // --------------------------------
  // Métodos de carga inicial
  // --------------------------------
  onImageCaptured(image: string): void {
    if (image) {
      const imageBlob = this.dataURItoBlob(image);
      if (imageBlob) {
        this.image = new File([imageBlob], 'perfil.jpg', { type: 'image/jpeg' });
      }
    }
  }

  cargarCausasFallecimiento() {
    this.datosEstaticosService.getCausasFallecimiento().subscribe({
      next: (data) => {
        this.CausaFallecimiento = data.map((item: any) => ({
          label: item.label,
          value: item.value
        }));
      },
      error: (error) => {
        console.error('Error al cargar causas de fallecimiento:', error);
      }
    });
  }

  async cargarEstadosAfiliado() {
    const response = await this.svcAfiliado.getAllEstados().toPromise();
    this.estado = response.map((estado: { codigo: any; nombre_estado: any; }) => ({
      label: estado.nombre_estado,
      value: estado.codigo
    }));
    this.form1.valueChanges.subscribe((value) => {
      this.updateDatosGenerales(value);
    });
  }

  updateDatosGenerales(value: any) {
    this.initialData = { ...this.initialData, ...value };
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
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  cargarMunicipios(departamentoId: number) {
    this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
      next: (data) => {
        this.municipios = data;
      }, error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }

  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  // ---------------------------------------------
  // Método que setea la data en formDatosGenerales
  // ---------------------------------------------
  setDatosGenerales(datosGenerales: any) {
    if (!datosGenerales || typeof datosGenerales !== 'object') {
      console.error('datosGenerales no es un objeto válido:', datosGenerales);
      return;
    }

    if (!this.formDatosGenerales) {
      this.formDatosGenerales = this.fb.group({
        refpers: this.fb.array([])
      });
    }

    const refpersArray = this.formDatosGenerales.get('refpers') as FormArray;
    refpersArray.clear();
    const dato = datosGenerales;

    const newGroup = this.fb.group({
      dato,
    });

    refpersArray.push(newGroup);
  }

  createRefpersGroup(dato: any): FormGroup {
    return this.fb.group({
      id_tipo_identificacion: [dato?.ID_IDENTIFICACION],
      n_identificacion: [dato?.N_IDENTIFICACION, Validators.required],
      rtn: [dato?.RTN, Validators.required],
      primer_nombre: [dato?.PRIMER_NOMBRE, Validators.required],
      segundo_nombre: [dato?.SEGUNDO_NOMBRE],
      tercer_nombre: [dato?.TERCER_NOMBRE],
      primer_apellido: [dato?.PRIMER_APELLIDO, Validators.required],
      segundo_apellido: [dato?.SEGUNDO_APELLIDO],
      fecha_nacimiento: [dato?.FECHA_NACIMIENTO, Validators.required],
      fecha_afiliacion: [dato?.FECHA_AFILIACION, Validators.required],
      cantidad_dependientes: [dato?.CANTIDAD_DEPENDIENTES],
      cantidad_hijos: [dato?.CANTIDAD_HIJOS],
      telefono_1: [dato?.TELEFONO_1],
      telefono_2: [dato?.TELEFONO_2],
      correo_1: [dato?.CORREO_1],
      correo_2: [dato?.CORREO_2],
      direccion_residencia: [dato?.DIRECCION_RESIDENCIA],
      numero_carnet: [dato?.NUMERO_CARNET],
      genero: [dato?.GENERO],
      estado_civil: [dato?.ESTADO_CIVIL],
      representacion: [dato?.REPRESENTACION],
      sexo: [dato?.SEXO],
      id_pais: [dato?.ID_PAIS],
      id_profesion: [dato?.ID_PROFESION],
      id_departamento_residencia: [dato?.id_departamento_residencia],
      id_municipio_residencia: [dato?.ID_MUNICIPIO_RESIDENCIA],
      id_departamento_nacimiento: [dato?.id_departamento_nacimiento],
      id_municipio_nacimiento: [dato?.ID_MUNICIPIO_NACIMIENTO],
      fallecido: [dato?.fallecido],
      grupo_etnico: [dato?.GRUPO_ETNICO],
      grado_academico: [dato?.GRADO_ACADEMICO],
      discapacidad: [dato?.TIPO_DISCAPACIDAD ? 'SI' : 'NO', Validators.required],
      discapacidades: this.fb.array(
        dato.discapacidades
          ? dato.discapacidades.map((d: any) => new FormControl(d?.id_discapacidad))
          : []
      )
    });
  }
  // previsualizarInfoAfil
  // ---------------------------------------------
  async previsualizarInfoAfil() {
    if (this.Afiliado) {
        this.loading = true;

        // 1) Llamar primero a getAfilByParam(...) para obtener la data principal
        this.svcAfiliado.getAfilByParam(this.Afiliado.n_identificacion).subscribe(
            (result) => {
                this.datos = result;
                this.Afiliado = result;

                // Manejo PDFs
                this.certificadoDefuncionUrl = this.datos?.certificado_defuncion
                    ? this.sanitizer.bypassSecurityTrustResourceUrl(
                        `data:application/pdf;base64,${this.datos.certificado_defuncion}`
                    )
                    : null;

                this.archivoIdentificacionUrl = this.datos?.archivo_identificacion
                    ? this.sanitizer.bypassSecurityTrustResourceUrl(
                        `data:application/pdf;base64,${this.datos.archivo_identificacion}`
                    )
                    : null;

                // Validación dinámica del archivo de identificación
                const archivoIdentificacionControl = this.formDatosGenerales.get('archivo_identificacion');
                

                  if (result?.archivo_identificacion) {
                      archivoIdentificacionControl?.clearValidators();
                      archivoIdentificacionControl?.updateValueAndValidity();
                      this.formDatosGenerales.patchValue({ archivo_identificacion: result.archivo_identificacion });
                  } else {
                      archivoIdentificacionControl?.setValidators([Validators.required]);
                      archivoIdentificacionControl?.updateValueAndValidity();
                  }

                // Otras propiedades globales
                this.estadoAfiliacion = result.estadoAfiliacion;
                this.fallecido = result.fallecido;

                // Imagen de perfil
                if (result.FOTO_PERFIL) {
                    this.image = this.dataURItoBlob(
                        `data:image/jpeg;base64,${result.FOTO_PERFIL}`
                    );
                }

                // Dirección estructurada
                if (result.DIRECCION_RESIDENCIA_ESTRUCTURADA) {
                    const jsonObj = result.DIRECCION_RESIDENCIA_ESTRUCTURADA
                        .split(',')
                        .reduce((acc: any, curr: any) => {
                            const [key, value] = curr.split(':').map((s: string) => s.trim());
                            acc[key] = value;
                            return acc;
                        }, {});

                    this.initialData = {
                        ...this.initialData,
                        avenida: jsonObj.AVENIDA || '',
                        calle: jsonObj.CALLE || '',
                        sector: jsonObj.SECTOR || '',
                        bloque: jsonObj.BLOQUE || '',
                        aldea: jsonObj.ALDEA || '',
                        caserio: jsonObj.CASERIO || '',
                        barrio_colonia: jsonObj['BARRIO_COLONIA'] || '',
                        numero_casa: jsonObj['N° DE CASA'] || '',
                        color_casa: jsonObj['COLOR CASA'] || ''
                    };
                } else {
                    this.direccionCompleta = result.DIRECCION_RESIDENCIA?.trim();
                }

                this.formDatosGenerales.markAllAsTouched();
                this.form1.markAllAsTouched();
                
                // Llenar initialData con datos globales
                this.initialData = {
                    ...this.initialData,
                    id_tipo_identificacion: result?.ID_TIPO_IDENTIFICACION,
                    n_identificacion: result?.N_IDENTIFICACION,
                    primer_nombre: result?.PRIMER_NOMBRE,
                    segundo_nombre: result?.SEGUNDO_NOMBRE,
                    tercer_nombre: result?.TERCER_NOMBRE,
                    primer_apellido: result?.PRIMER_APELLIDO,
                    segundo_apellido: result?.SEGUNDO_APELLIDO,
                    fecha_nacimiento: result?.FECHA_NACIMIENTO,
                    fecha_vencimiento_ident: result?.fecha_vencimiento_ident,
                    cantidad_dependientes: result?.CANTIDAD_DEPENDIENTES,
                    representacion: result?.REPRESENTACION,
                    telefono_1: result?.TELEFONO_1,
                    telefono_2: result?.TELEFONO_2,
                    correo_1: result?.CORREO_1,
                    correo_2: result?.CORREO_2,
                    rtn: result?.RTN,
                    genero: result?.GENERO,
                    grupo_etnico: result?.GRUPO_ETNICO,
                    grado_academico: result?.GRADO_ACADEMICO,
                    estado_civil: result?.ESTADO_CIVIL,
                    cantidad_hijos: result?.CANTIDAD_HIJOS,
                    id_profesion: result?.ID_PROFESION,
                    id_pais: result?.ID_PAIS,
                    id_departamento_residencia: result?.id_departamento_residencia,
                    id_municipio_residencia: result?.ID_MUNICIPIO,
                    id_departamento_nacimiento: result?.id_departamento_nacimiento,
                    id_municipio_nacimiento: result?.ID_MUNICIPIO_NACIMIENTO,
                    discapacidad: result?.discapacidades?.length > 0 ? true : false,
                    fecha_afiliacion: result?.FECHA_AFILIACION,
                };

                // Discapacidades
                if (result?.discapacidades?.length > 0) {
                    this.discapacidadSeleccionada = true;
                    this.indicesSeleccionados = result?.discapacidades;
                }

                // Rellenar valores de form1
                this.form1.patchValue({
                    fallecido: result?.fallecido,
                    fecha_defuncion: result?.fecha_defuncion,
                    causa_fallecimiento: result?.ID_CAUSA_FALLECIMIENTO,
                    id_departamento_defuncion: result?.ID_DEPARTAMENTO_DEFUNCION,
                    id_municipio_defuncion: result?.ID_MUNICIPIO_DEFUNCION,
                    tipo_persona: result?.ID_TIPO_PERSONA,
                    estado: result?.estadoAfiliacion?.codigo,
                    voluntario: result?.VOLUNTARIO || 'NO',
                    numero_certificado_defuncion: result?.NUMERO_CERTIFICADO_DEFUNCION,
                    fecha_reporte_fallecido: result?.FECHA_REPORTE_FALLECIDO
                });

                // Parchar el FormGroup con los datos recibidos
                this.datosGeneralesForm.patchValue({
                    FotoPerfil: result?.FOTO_PERFIL ? `data:image/jpeg;base64,${result.FOTO_PERFIL}` : null,
                    id_tipo_identificacion: result?.ID_TIPO_IDENTIFICACION,
                    n_identificacion: result?.N_IDENTIFICACION,
                    primer_nombre: result?.PRIMER_NOMBRE,
                    segundo_nombre: result?.SEGUNDO_NOMBRE,
                    tercer_nombre: result?.TERCER_NOMBRE,
                    primer_apellido: result?.PRIMER_APELLIDO,
                    segundo_apellido: result?.SEGUNDO_APELLIDO,
                    fecha_nacimiento: result?.FECHA_NACIMIENTO,
                    fecha_vencimiento_ident: result?.fecha_vencimiento_ident,
                    cantidad_dependientes: result?.CANTIDAD_DEPENDIENTES,
                    representacion: result?.REPRESENTACION,
                    telefono_1: result?.TELEFONO_1,
                    telefono_2: result?.TELEFONO_2,
                    correo_1: result?.CORREO_1,
                    correo_2: result?.CORREO_2,
                    rtn: result?.RTN,
                    genero: result?.GENERO,
                    grupo_etnico: result?.GRUPO_ETNICO,
                    grado_academico: result?.GRADO_ACADEMICO,
                    estado_civil: result?.ESTADO_CIVIL,
                    cantidad_hijos: result?.CANTIDAD_HIJOS,
                    id_profesion: result?.ID_PROFESION,
                    id_pais: result?.ID_PAIS,
                    id_departamento_residencia: result?.id_departamento_residencia,
                    id_municipio_residencia: result?.ID_MUNICIPIO,
                    id_departamento_nacimiento: result?.id_departamento_nacimiento,
                    id_municipio_nacimiento: result?.ID_MUNICIPIO_NACIMIENTO,
                    discapacidad: result?.discapacidades?.length > 0 ? true : false,
                    archivoIdentificacionUrl: result?.archivo_identificacion,
                    fecha_afiliacion: result?.FECHA_AFILIACION,
                });

                // Marcar todos los controles como tocados para mostrar errores
                this.datosGeneralesForm.markAllAsTouched();
                this.form1.markAllAsTouched();

                const refpersArray = this.formDatosGenerales.get('refpers') as FormArray;
                refpersArray.clear();
                refpersArray.push(this.createRefpersGroup(result));
                
                this.cdr.detectChanges(); // <-- Añadir esta línea
                this.loading = false;
            },
            (error) => {
                this.toastr.error(`Error: ${error.error.message}`);
                this.loading = false;
            }
        );
    }
}
  
  // ---------------------------------------------
  // Manejo de discapacidades
  // ---------------------------------------------
  updateDiscapacidades(discapacidadesSeleccionadas: any[]) {
    const refpersArray = this.formDatosGenerales.get('refpers') as FormArray;
    if (refpersArray.length > 0) {
      const firstRefpersGroup = refpersArray.controls[0] as FormGroup;
      const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;
      discapacidadesArray.clear();
      discapacidadesSeleccionadas.forEach((id: number) => {
        discapacidadesArray.push(new FormControl(id));
      });
    }
  }

  resetDatos() {
    if (this.form1) {
      this.form1.reset();
    }
    this.Afiliado = {};
  }

  // ---------------------------------------------
  // GUARDAR (con validaciones)
  // ---------------------------------------------
  GuardarInformacion(): void {
    this.datosGeneralesForm.markAllAsTouched();
    this.form1.markAllAsTouched();
    this.formDatosGenerales.markAllAsTouched();

    if (this.formDatosGenerales.invalid || this.form1.invalid) {
        this.checkFormErrors();
        this.toastr.error('Por favor complete los campos requeridos');
        return;
    }

    const refpersData = this.formDatosGenerales.get('refpers')?.value?.[0] || {};

    const formValues = this.form1.value;

    let archivoIdentificacion = this.formDatosGenerales.get('archivo_identificacion')?.value;

  // Si no hay archivo nuevo pero existe uno registrado
  if (!archivoIdentificacion && this.datos?.archivo_identificacion) {
    // Convertir base64 a File usando función existente
    const base64Data = this.datos.archivo_identificacion;
    const blob = this.dataURItoBlob(`data:application/pdf;base64,${base64Data}`);
    
    if (blob) {
      archivoIdentificacion = new File([blob], 'identificacion_existente.pdf', {
        type: 'application/pdf'
      });
    }
  }
    // Construcción del objeto a enviar
    const datosActualizados: any = {
        ...refpersData,
        fallecido: formValues.fallecido,
        causa_fallecimiento: formValues.causa_fallecimiento,
        fecha_defuncion: convertirFechaInputs(formValues.fecha_defuncion),
        id_departamento_defuncion: formValues.id_departamento_defuncion,
        id_municipio_defuncion: formValues.id_municipio_defuncion,
        estado: formValues.estado,
        tipo_persona: formValues.tipo_persona,
        voluntario: formValues.voluntario,
        numero_certificado_defuncion: formValues.numero_certificado_defuncion,
        fecha_reporte_fallecido: convertirFechaInputs(formValues.fecha_reporte_fallecido),
        fecha_afiliacion: convertirFechaInputs(refpersData.fecha_afiliacion) ,
        // Archivos
        certificado_defuncion: this.formDatosGenerales.value.archivoCertDef,
        archivo_identificacion: archivoIdentificacion,

        // Foto perfil
        FotoPerfil: this.image ? this.image : undefined,

        // Tabla o detalles adicionales
        detalles: this.tableData
    };

    console.log('Payload a enviar =>', datosActualizados);

    // Llamada al servicio para actualizar
    this.svcAfiliado.updateDatosGenerales(this.Afiliado.ID_PERSONA, datosActualizados)
        .subscribe(
            async (result) => {
                this.toastr.success('Datos generales modificados correctamente');
            },
            (error) => {
                this.toastr.error(`Error: ${error.error.message}`);
            }
        );
  }

  formatFechaYYYYMMDD(fecha: any): string {
    if (!fecha) return '';

    const date = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(date.getTime())) return ''; // Verifica que la fecha sea válida

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegura 2 dígitos en el mes
    const day = String(date.getDate()).padStart(2, '0'); // Asegura 2 dígitos en el día

    return `${year}-${month}-${day}`;
}


  guardarEstadoAfiliacion(element: any) {
    const payload = {
      idPersona: element.ID_PERSONA,
      idCausante: element.ID_CAUSANTE,
      idCausantePadre: element.ID_CAUSANTE_PADRE,
      idDetallePersona: element.ID_DETALLE_PERSONA,
      idEstadoAfiliacion: element.ID_ESTADO_AFILIACION,
      dniCausante: element.dniCausante,
      estadoAfiliacion: element.estadoAfiliacion?.trim(),
      observacion: element.observacion || ''
    };

    this.svcAfiliado.updateEstadoAfiliacionPorDni(payload).subscribe(
      (response) => {
        this.toastr.success('Estado actualizado correctamente');
      },
      (error) => {
        this.toastr.error(
          `Error: ${error.error.message || 'No se pudo actualizar el estado'}`
        );
      }
    );
  }

  // ---------------------------------------------
  // Mostrar mensajes de error en HTML
  // ---------------------------------------------
  getErrors(fieldName: string): string[] {
    const control = this.form1.get(fieldName);
    if (control && control.errors && (control.dirty || control.touched)) {
      const errors: string[] = [];
      if (control.hasError('required')) {
        errors.push('Este campo es obligatorio.');
      }
      if (control.hasError('maxlength')) {
        errors.push('El campo excede el máximo de caracteres permitidos.');
      }
      if (control.hasError('pattern')) {
        errors.push('Formato inválido.');
      }
      return errors;
    }
    return [];
  }
  
  // ---------------------------------------------
  // Métodos para adjuntar archivos al form
  // ---------------------------------------------
  getArchivoDef(event: File): any {
    if (!this.formDatosGenerales.contains('archivoCertDef')) {
      this.formDatosGenerales.addControl('archivoCertDef', new FormControl('', []));
    }
    this.formDatosGenerales.get('archivoCertDef')?.setValue(event);
  }

  getArchivoIdentificacion(event: File): void {
    if (!this.formDatosGenerales.contains('archivo_identificacion')) {
      this.formDatosGenerales.addControl('archivo_identificacion', new FormControl('', []));
    }
    this.formDatosGenerales.get('archivo_identificacion')?.setValue(event);
  }

  getArchivoFoto(event: File): void {
    if (!this.formDatosGenerales.contains('foto_empleado')) {
      this.formDatosGenerales.addControl('foto_empleado', new FormControl('', []));
    }
    this.formDatosGenerales.get('foto_empleado')?.setValue(event);
  }

  // ---------------------------------------------
  // Util: convertir dataURI a Blob
  // ---------------------------------------------
  dataURItoBlob(dataURI: string | null): Blob | null {
    if (!dataURI) {
      console.error('dataURI is null or undefined');
      return null;
    }
    const byteString = atob(dataURI.split(',')[1] || '');
    const mimeString = dataURI.split(',')[0]
      ?.split(':')[1]
      ?.split(';')[0] || 'image/jpeg';
    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);
    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([buffer], { type: mimeString });
  }

  getErrorsDatosGenerales(fieldName: string): string[] {
    const control = this.formDatosGenerales.get(fieldName);
    if (control && control.errors && (control.dirty || control.touched)) {
      const errors: string[] = [];
      if (control.hasError('required')) {
        errors.push('Este archivo es obligatorio.');
      }
      return errors;
    }
    return [];
  }
  
  checkFormErrors(): void {
    console.log('Validando form1...');
    Object.keys(this.form1.controls).forEach(field => {
      const control = this.form1.get(field);
      if (control && control.invalid) {
        console.log(`Campo '${field}' tiene errores:`, control.errors);
      }
    });
  
    console.log('Validando formDatosGenerales...');
    Object.keys(this.formDatosGenerales.controls).forEach(field => {
      const control = this.formDatosGenerales.get(field);
      if (control && control.invalid) {
        console.log(`Campo '${field}' tiene errores:`, control.errors);
      }
    });
  
    const archivoCertDef = this.formDatosGenerales.get('archivoCertDef');
    const archivoIdentificacion = this.formDatosGenerales.get('archivo_identificacion');
  
    if (archivoCertDef?.invalid) {
      console.log('El archivo "Certificado de Defunción" es inválido:', archivoCertDef.errors);
    }
  
    if (archivoIdentificacion?.invalid) {
      console.log('El archivo "Identificación" es inválido:', archivoIdentificacion.errors);
    }
  }
 
  eliminarCertificadoDefuncion(): void {
    this.certificadoDefuncionFile = null;
    this.formDatosGenerales.get('archivoCertDef')?.setValue(null); // Limpiar el valor del control
    this.formDatosGenerales.get('archivoCertDef')?.markAsTouched(); // Marcar como tocado
    this.formDatosGenerales.get('archivoCertDef')?.updateValueAndValidity(); // Forzar la validación
    this.certificadoDefuncionUrl = null; // Limpiar la URL de previsualización
  }

  onCertificadoDefuncionChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Obtener el input de archivo
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Obtener el archivo seleccionado
      this.certificadoDefuncionFile = file;
      this.formDatosGenerales.get('archivoCertDef')?.setValue(file); // Actualizar el valor del control
      this.formDatosGenerales.get('archivoCertDef')?.markAsTouched(); // Marcar como tocado
      this.formDatosGenerales.get('archivoCertDef')?.updateValueAndValidity(); // Forzar la validación
      this.certificadoDefuncionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    }
  }
  
  tieneTipoPersona(): boolean {
    if (!this.tableData || this.tableData.length === 0) {
      return false;
    }
  
    const tiposPermitidos = ["BENEFICIARIO", "BENEFICIARIO SIN CAUSANTE", "DESIGNADO"];
  
    const tieneOtroTipo = this.tableData.some(item => !tiposPermitidos.includes(item.tipoPersona));
  
    return tieneOtroTipo;
  }
  

  obtenerNombreTipoPersona(): string {
    const tipo = this.tiposPersona.find(tp => tp.ID_TIPO_PERSONA === this.tipoPersonaSeleccionada);
    return tipo ? tipo.TIPO_PERSONA : 'AFILIADO';
  }
  

  convertirEnAfiliado() {
    if (!this.tipoPersonaSeleccionada || !this.Afiliado?.ID_PERSONA) {
      this.toastr.warning('Debe seleccionar un tipo de persona antes de continuar.');
      return;
    }
  
    const payload = {
      idPersona: this.Afiliado.ID_PERSONA, 
      idTipoPersona: this.tipoPersonaSeleccionada
    };
  
    this.afiliacionService.convertirEnAfiliado(payload).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Persona convertida exitosamente.');
        this.tieneTipoPersona = () => true;
        this.svcAfiliado.buscarDetPersona(this.Afiliado.n_identificacion).subscribe(
          (detalles: any[]) => {
            this.tableData = detalles;
          }
        );
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al convertir en afiliado.');
      }
    });
  }
  
  
}