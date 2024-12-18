import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { PermisosService } from 'src/app/services/permisos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-datos-generales',
  templateUrl: './edit-datos-generales.component.html',
  styleUrls: ['./edit-datos-generales.component.scss']
})
export class EditDatosGeneralesComponent implements OnInit {
  datosGen: any;
  municipios: any = [];
  departamentos: any = [];
  unirNombres: any = unirNombres;
  CausaFallecimiento: any[] = [];
  estado: any[] = [];
  public mostrarBotonGuardar: boolean = false;
  image:any;
  datos!: any;
  estadoAfiliacion: any;
  fallecido: any;
  minDate: Date;
  public loading: boolean = false;
  form: any;
  @Input() Afiliado!: any;
  certificadoDefuncionUrl: SafeResourceUrl | null = null;
  archivoIdentificacionUrl: SafeResourceUrl | null = null;
  initialData = {}
  indicesSeleccionados: any[] = []
  discapacidadSeleccionada!: boolean
  tiposPersona: any[] = [
    { ID_TIPO_PERSONA: 1, TIPO_PERSONA: 'AFILIADO' }
  ];
  direccionValida: boolean = true;
  direccionCompleta: string = '';

  form1 = this.fb.group({
    causa_fallecimiento: ["", [Validators.required]],
    estado: ["", [Validators.required]],
    fecha_defuncion: ["", [Validators.required]],
    id_departamento_defuncion: ["", [Validators.required]],
    id_municipio_defuncion: ["", [Validators.required]],
    tipo_persona: ["", [Validators.required]],
    fallecido: ["", [Validators.required]],
    voluntario: ["NO", [Validators.required]]
    //certificado_defuncion: ["", [Validators.required]],
    //observaciones: ["", [Validators.required]],
  });

  formDatosGenerales: any = new FormGroup({
    refpers: new FormArray([], [Validators.required]),
  });

  constructor(
    private fb: FormBuilder,
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    public direccionSer: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
    private permisosService: PermisosService,
    private sanitizer: DomSanitizer
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(), currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());
  }

  ngOnInit(): void {
    this.mostrarBotonGuardar = this.permisosService.userHasPermission(
      'AFILIACIÓN',
      'afiliacion/buscar-persona',
      'editar'
    );

    this.cargarCausasFallecimiento();
    this.cargarEstadosAfiliado();
    this.previsualizarInfoAfil();
    this.cargarDepartamentos();
  }

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
    console.log(this.initialData);
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
      n_identificacion: [dato?.N_IDENTIFICACION, Validators.required],
      rtn: [dato?.RTN, Validators.required],
      primer_nombre: [dato?.PRIMER_NOMBRE, Validators.required],
      segundo_nombre: [dato?.SEGUNDO_NOMBRE],
      tercer_nombre: [dato?.TERCER_NOMBRE],
      primer_apellido: [dato?.PRIMER_APELLIDO, Validators.required],
      segundo_apellido: [dato?.SEGUNDO_APELLIDO],
      fecha_nacimiento: [dato?.FECHA_NACIMIENTO, Validators.required],
      fecha_vencimiento_ident: [dato?.fecha_vencimiento_ident],
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
      id_tipo_identificacion: [dato?.ID_IDENTIFICACION],
      id_profesion: [dato?.ID_PROFESION],
      id_departamento_residencia: [dato?.id_departamento_residencia],
      id_municipio_residencia: [dato?.ID_MUNICIPIO_RESIDENCIA],
      id_departamento_nacimiento: [dato?.id_departamento_nacimiento],
      id_municipio_nacimiento: [dato?.ID_MUNICIPIO_NACIMIENTO],
      fallecido: [dato?.fallecido],
      grupo_etnico: [dato?.GRUPO_ETNICO],
      grado_academico: [dato?.GRADO_ACADEMICO],
      discapacidad: [dato?.TIPO_DISCAPACIDAD ? "SI" : "NO", Validators.required],
      discapacidades: this.fb.array(dato.discapacidades ? dato.discapacidades.map((d: any) => new FormControl(d?.id_discapacidad)) : [])
    });
  }

  async previsualizarInfoAfil() {
    if (this.Afiliado) {
        this.loading = true;
        await this.svcAfiliado.getAfilByParam(this.Afiliado.n_identificacion).subscribe(
            (result) => {
                this.datos = result;
                this.Afiliado = result;

                this.certificadoDefuncionUrl = this.datos?.certificado_defuncion
                ? this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${this.datos.certificado_defuncion}`)
                : null;

              this.archivoIdentificacionUrl = this.datos?.archivo_identificacion
                ? this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${this.datos.archivo_identificacion}`)
                : null;

                this.estadoAfiliacion = result.estadoAfiliacion;
                this.fallecido = result.fallecido;

                if (result.FOTO_PERFIL) {
                    this.image = this.dataURItoBlob(`data:image/jpeg;base64,${result.FOTO_PERFIL}`);
                }
                if (result.DIRECCION_RESIDENCIA_ESTRUCTURADA) {
                    const jsonObj = result.DIRECCION_RESIDENCIA_ESTRUCTURADA.split(',').reduce((acc: any, curr: any) => {
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
                        barrio_colonia: jsonObj["BARRIO_COLONIA"] || '',
                        numero_casa: jsonObj["N° DE CASA"] || '',
                        color_casa: jsonObj["COLOR CASA"] || ''
                    };
                } else {
                    this.direccionCompleta = result.DIRECCION_RESIDENCIA?.trim();
                }
                this.initialData = {
                    ...this.initialData,
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
                    id_tipo_identificacion: result?.ID_PROFESION
                };

                if (result?.discapacidades?.length > 0) {
                    this.discapacidadSeleccionada = true;
                    this.indicesSeleccionados = result?.discapacidades;
                }

                this.form1.controls.fecha_defuncion.setValue(result?.fecha_defuncion);
                this.form1.controls.causa_fallecimiento.setValue(result?.ID_CAUSA_FALLECIMIENTO);
                this.form1.controls.id_departamento_defuncion.setValue(result?.ID_DEPARTAMENTO_DEFUNCION);
                this.form1.controls.id_municipio_defuncion.setValue(result?.ID_MUNICIPIO_DEFUNCION);
                this.form1.controls.tipo_persona.setValue(result?.ID_TIPO_PERSONA);
                this.form1.controls.estado.setValue(result?.estadoAfiliacion?.codigo);
                this.form1.controls.voluntario.setValue(result?.VOLUNTARIO || "NO");

                this.loading = false;
            },
            (error) => {
                this.toastr.error(`Error: ${error.error.message}`);
                this.loading = false;
            }
        );
    }
}

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
    if (this.form) {
      this.form.reset();
    }
    this.Afiliado = {};
  }

  GuardarInformacion(): void {
    const refpersData = this.formDatosGenerales.get('refpers')?.value?.[0] || {};

    const datosActualizados: any = {
    ...refpersData,
    causa_fallecimiento: this.form1.value.causa_fallecimiento,
    fecha_defuncion: convertirFechaInputs(this.form1.value.fecha_defuncion!),
    id_departamento_defuncion: this.form1.value.id_departamento_defuncion,
    id_municipio_defuncion: this.form1.value.id_municipio_defuncion,
    estado: this.form1.value.estado,
    tipo_persona: this.form1.value.tipo_persona,
    certificado_defuncion: this.formDatosGenerales.value.archivoCertDef,
    voluntario: this.form1.value.voluntario,
    archivo_identificacion: this.formDatosGenerales.value.archivo_identificacion,
  };
  console.log(datosActualizados);

  if (this.image) {
    datosActualizados.FotoPerfil = this.image;
  }
    this.svcAfiliado.updateDatosGenerales(this.Afiliado.ID_PERSONA, datosActualizados).subscribe(
      async (result) => {
        this.toastr.success(`Datos generales modificados correctamente`);
      },
      (error) => {
        this.toastr.error(`Error: ${error.error.message}`);
      }
    );
  }

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

  getArchivoDef(event: File): any {
    if (!this.formDatosGenerales?.contains('archivoCertDef')) {
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

  dataURItoBlob(dataURI: string | null): Blob | null {
    if (!dataURI) {
      console.error('dataURI is null or undefined');
      return null;
    }
    const byteString = atob(dataURI.split(',')[1] || '');
    const mimeString = dataURI.split(',')[0]?.split(':')[1]?.split(';')[0] || 'image/jpeg';
    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);
    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([buffer], { type: mimeString });
  }
}
