import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-datos-generales',
  templateUrl: './edit-datos-generales.component.html',
  styleUrls: ['./edit-datos-generales.component.scss']
})
export class EditDatosGeneralesComponent implements OnInit {
  datosGen: any;
  public myFormFields: FieldConfig[] = [];
  municipios: any = [];
  departamentos: any = [];
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  CausaFallecimiento: any[] = [];
  estado: any[] = [];

  tiposPersona: any[] = [
    { ID_TIPO_PERSONA: 1, TIPO_PERSONA: 'AFILIADO' },
    { ID_TIPO_PERSONA: 5, TIPO_PERSONA: 'VOLUNTARIO' }
  ];

  estadoAfiliacion: any;
  fallecido: any;

  minDate: Date;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  public loading: boolean = false;

  datos!: any;

  form1 = this.fb.group({
    causa_fallecimiento: ["", [Validators.required]],
    estado: ["", [Validators.required]],
    fecha_defuncion: ["", [Validators.required]],
    id_departamento_defuncion: ["", [Validators.required]],
    id_municipio_defuncion: ["", [Validators.required]],
    /* tipo_persona: ["", [Validators.required]] */
    //certificado_defuncion: ["", [Validators.required]],
    //observaciones: ["", [Validators.required]],
  });

  form: any;
  formDatosGenerales: any = new FormGroup({
    refpers: new FormArray([], [Validators.required]),
  });

  @Input() Afiliado!: any;
  cargada: any = false;
  initialData = {}
  indicesSeleccionados: any[] = []
  discapacidadSeleccionada!: boolean

  constructor(
    private fb: FormBuilder,
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    public direccionSer: DireccionService,
    private datosEstaticosService: DatosEstaticosService
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(), currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());
  }

  ngOnInit(): void {

    this.myFormFields = [
      { type: 'text', label: 'N_IDENTIFICACION del afiliado', name: 'n_identificacion', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'Nombre del Centro Trabajo',
        col: 'nombre_centro_trabajo',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Número Acuerdo',
        col: 'numero_acuerdo',
        isEditable: true
      },
      {
        header: 'Salario Base',
        col: 'salario_base',
        isEditable: true
      },
      {
        header: 'Fecha Ingreso',
        col: 'fecha_ingreso',
        isEditable: true
      },
      {
        header: 'Actividad Económica',
        col: 'nacionalidad',
        isEditable: true
      }
    ];

    this.cargarCausasFallecimiento();
    this.cargarEstadosAfiliado();
    this.previsualizarInfoAfil();
    this.cargarDepartamentos();
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

    // Suscribirse a los cambios del formulario
    this.form1.valueChanges.subscribe((value) => {
      this.updateDatosGenerales(value);
    });
  }

  updateDatosGenerales(value: any) {
    // Aquí puedes procesar los datos y actualizarlos en `initialData`
    this.initialData = { ...this.initialData, ...value }; // O ajusta según sea necesario
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

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  setDatosGenerales(datosGenerales: any) {
    // Verifica que `datosGenerales` es un objeto válido
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

    // Supongamos que `datosGenerales` es un objeto, no un arreglo
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
          this.estadoAfiliacion = result.estadoAfiliacion;
          this.fallecido = result.fallecido;

          const refpersArray = this.formDatosGenerales.get('refpers') as FormArray;
          //refpersArray.clear();

          const jsonObj: any = result.DIRECCION_RESIDENCIA
            ? result.DIRECCION_RESIDENCIA.split(',').reduce((acc: any, curr: any) => {
              const [key, value] = curr.split(':').map((s: string) => s.trim());
              acc[key] = value;
              return acc;
            }, {} as { [key: string]: string })
            : {}; // Si no existe DIRECCION_RESIDENCIA, asigna un objeto vacío

          this.initialData = {
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

            discapacidad: result?.discapacidades.length > 0 ? true : false,
            id_tipo_identificacion: result?.ID_PROFESION,

            avenida: jsonObj?.AVENIDA || "",
            calle: jsonObj?.CALLE || "",
            sector: jsonObj?.SECTOR || "",
            bloque: jsonObj?.BLOQUE || "",
            aldea: jsonObj?.ALDEA || "",
            caserio: jsonObj?.CASERIO || "",

            barrio_colonia: jsonObj?.["BARRIO_COLONIA"] || "",
            numero_casa: jsonObj?.["N° DE CASA"] || "",
            color_casa: jsonObj?.["COLOR CASA"] || ""
          };

          if (result?.discapacidades.length > 0) {
            this.discapacidadSeleccionada = true
            this.indicesSeleccionados = result?.discapacidades
          }

          this.form1.controls.fecha_defuncion.setValue(result?.fecha_defuncion)
          this.form1.controls.causa_fallecimiento.setValue(result?.ID_CAUSA_FALLECIMIENTO);
          this.form1.controls.id_departamento_defuncion.setValue(result?.ID_DEPARTAMENTO_DEFUNCION);
          this.form1.controls.id_municipio_defuncion.setValue(result?.ID_MUNICIPIO_DEFUNCION);
          /* this.form1.controls.tipo_persona.setValue(result?.ID_TIPO_PERSONA) */
          //this.form1.controls.estado.setValue('ACTIVO');

          //this.form1.controls.certificado_defuncion.setValue(result?.certificado_defuncion)
          //this.form1.controls.observaciones.setValue("Ninguna")

          this.cargada = true

          //this.form1.controls.id_departamento_defuncion.setValue("COLON")
          //console.log(this.form1.controls.id_departamento_defuncion )
          /* this.form1.setValue({
            estado: 'ACTIVO',
            causa_fallecimiento: '1',
            id_departamento_defuncion: '1',
            id_municipio_defuncion: '860'
          }); */


          //refpersArray.push(newGroup);

          //this.updateDiscapacidades();

          this.Afiliado.nameAfil = this.unirNombres(result?.PRIMER_NOMBRE, result?.SEGUNDO_NOMBRE, result?.TERCER_NOMBRE, result?.PRIMER_APELLIDO, result?.SEGUNDO_APELLIDO);
          this.loading = false;
        },
        (error) => {
          this.toastr.error(`Error: ${error.error.message}`);
          this.loading = false;
        }
      );
    }
  }

  updateDiscapacidades() {
    const refpersArray = this.formDatosGenerales.get('refpers') as FormArray;
    if (refpersArray.length > 0) {
      const firstRefpersGroup = refpersArray.controls[0] as FormGroup;
      const discapacidadesArray = firstRefpersGroup.get('discapacidades') as FormArray;

      if (discapacidadesArray) {
        const selectedDiscapacidades = discapacidadesArray.value;
        discapacidadesArray.clear();
        selectedDiscapacidades.forEach((id: number) => {
          discapacidadesArray.push(new FormControl(id));
        });
      }
    }
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.Afiliado = {};
  }

  GuardarInformacion() {
    //this.formDatosGenerales.value.refpers[0].fecha_nacimiento = convertirFechaInputs(this.formDatosGenerales.value.refpers[0].fecha_nacimiento);
    let a: any
    if (this.formDatosGenerales.value.refpers[0]) {
      a = {
        ...this.formDatosGenerales.value.refpers[0],
        /*  estado: this.form1.value.estado, */
        causa_fallecimiento: this.form1.value.causa_fallecimiento,
        fecha_defuncion: convertirFechaInputs(this.form1.value.fecha_defuncion!),
        id_departamento_defuncion: this.form1.value.id_departamento_defuncion,
        id_municipio_defuncion: this.form1.value.id_municipio_defuncion,
        certificado_defuncion: this.formDatosGenerales.value.archivoCertDef,
        /* tipo_persona: this.form1.value.tipo_persona, */
        //certificado_defuncion: this.form1.value.certificado_defuncion
        //observaciones: this.form1.value.observaciones,
      };
    } else {
      a = {
        dato: {
          ...this.initialData
        },
        ...this.formDatosGenerales.value.refpers[0],
        estado: this.form1.value.estado,
        causa_fallecimiento: this.form1.value.causa_fallecimiento,
        fecha_defuncion: convertirFechaInputs(this.form1.value.fecha_defuncion!),
        id_departamento_defuncion: this.form1.value.id_departamento_defuncion,
        id_municipio_defuncion: this.form1.value.id_municipio_defuncion,
        certificado_defuncion: this.formDatosGenerales.value.archivoCertDef,
        /* tipo_persona: this.form1.value.tipo_persona */
        //certificado_defuncion: this.form1.value.certificado_defuncion
        //observaciones: this.form1.value.observaciones,
      };
    }
    this.svcAfiliado.updateDatosGenerales(this.Afiliado.ID_PERSONA, a).subscribe(
      async (result) => {
        this.toastr.success(`Datos generales modificados correctamente`);
      },
      (error) => {
        this.toastr.error(`Error: ${error.error.message}`);
      }
    );
  }

  getErrors(fieldName: string): any {
    // Implementar lógica para manejar errores de validación
  }

  mostrarCamposFallecido(e: any) {
    //this.estadoAfiliacion = e.value;
  }

  getArchivoDef(event: File): any {
    // Si no lo has agregado aún, puedes agregar el control aquí
    if (!this.formDatosGenerales?.contains('archivoCertDef')) {
      this.formDatosGenerales.addControl('archivoCertDef', new FormControl('', []));
    }
    // Asignar el archivo al control del formulario
    this.formDatosGenerales.get('archivoCertDef')?.setValue(event);
  }
}
