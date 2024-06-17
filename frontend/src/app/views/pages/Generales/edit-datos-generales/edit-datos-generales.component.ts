import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha, convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-datos-generales',
  templateUrl: './edit-datos-generales.component.html',
  styleUrl: './edit-datos-generales.component.scss'
})
export class EditDatosGeneralesComponent {
  datosGen: any;
  public myFormFields: FieldConfig[] = []
  municipios: any = [];
  departamentos: any = [];
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  TipoDefuncion: any[] = [];
  estado: any[] = [];

  estadoAfiliacion: any;
  fallecido: any;

  minDate: Date;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  datos!: any;

  form1 = this.fb.group({
    estado: ["", [Validators.required]],
    certificado_defuncion: ["", [Validators.required]],
    tipo_defuncion: ["", [Validators.required]],
    observaciones: ["", [Validators.required]],
    fecha_defuncion: ["", [Validators.required]],
    id_departamento_defuncion: ["", [Validators.required]],
    id_municipio_defuncion: ["", [Validators.required]]
  });

  form: any;
  formDatosGenerales: any = new FormGroup({
    refpers: new FormArray([], [Validators.required]),
  },
  );

  @Input() Afiliado: any;
  constructor(
    private fb: FormBuilder,
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticos: DatosEstaticosService,
    public direccionSer: DireccionService,
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(), currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());
  }
  ngOnInit(): void {
    console.log(this.Afiliado);


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
    this.TipoDefuncion = [
      { value: "ACCIDENTAL" },
      { value: "ASESINATO" },
      { value: "HOMICIDIO" },
      { value: "NATURAL" },
      { value: "SUICIDIO" },
    ]
    this.cargarEstadosAfiliado();
    this.previsualizarInfoAfil();
    this.cargarDepartamentos();
  }

  async cargarEstadosAfiliado() {
    const response = await this.svcAfiliado.getAllEstados().toPromise();
    this.estado = response.map((estado: { codigo: any; nombre_estado: any; }) => ({
      label: estado.nombre_estado,
      value: estado.codigo
    }));
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
    /* this.datosEstaticos.getDepartamentos((result) => {
      this.departamentos = result// Aquí puedes trabajar con los datos
    }); */
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


  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  setDatosGenerales(datosGenerales: any) {
    this.formDatosGenerales = datosGenerales
    this.fallecido = this.formDatosGenerales.value.refpers[0].fallecido
  }

  async previsualizarInfoAfil() {
    if (this.Afiliado) {
      await this.svcAfiliado.getAfilByParam(this.Afiliado.n_identificacion).subscribe(
        (result) => {
          this.datos = result;
          this.Afiliado = result;
          this.estadoAfiliacion = result.estadoAfiliacion
          this.fallecido = result.fallecido

          console.log(result);


          this.formDatosGenerales.value.refpers[0] = {
            n_identificacion: result.n_identificacion,
            rtn: result.RTN,
            primer_nombre: result.PRIMER_NOMBRE,
            segundo_nombre: result.SEGUNDO_NOMBRE,
            primer_apellido: result.PRIMER_APELLIDO,
            segundo_apellido: result.SEGUNDO_APELLIDO,
            tercer_nombre: result.TERCER_NOMBRE,
            fecha_nacimiento: result.FECHA_NACIMIENTO,
            fecha_vencimiento_ident: result.fecha_vencimiento_ident,
            cantidad_dependientes: result.CANTIDAD_DEPENDIENTES,
            cantidad_hijos: result.CANTIDAD_HIJOS,
            telefono_1: result.TELEFONO_1,
            telefono_2: result.TELEFONO_2,
            correo_1: result.CORREO_1,
            correo_2: result.CORREO_2,
            direccion_residencia: result.DIRECCION_RESIDENCIA,
            numero_carnet: result.NUMERO_CARNET,
            genero: result.GENERO,
            estado_civil: result.ESTADO_CIVIL,
            representacion: result.REPRESENTACION,
            sexo: result.SEXO,
            id_pais_nacionalidad: result.ID_PAIS,
            id_tipo_identificacion: result.ID_IDENTIFICACION,
            id_profesion: result.ID_PROFESION,
            id_departamento_residencia: result.id_departamento_residencia,
            id_municipio_residencia: result.ID_MUNICIPIO,
            fallecido: result.fallecido,
          };

          if (result.ID_MUNICIPIO_DEFUNCION) {
            this.cargarMunicipios(result.ID_MUNICIPIO_DEFUNCION);
          }

          /* this.form1.controls.fecha_vencimiento_ident.setValue(result.fecha_vencimiento_ident); */
          this.form1.controls.estado.setValue(result.estadoAfiliacion);
          this.form1.controls.observaciones.setValue(result.observaciones);
          this.form1.controls.tipo_defuncion.setValue(result.tipo_defuncion);
          this.form1.controls.fecha_defuncion.setValue(result.fecha_defuncion);
          this.form1.controls.id_departamento_defuncion.setValue(result.ID_DEPARTAMENTO_DEFUNCION);
          this.form1.controls.id_municipio_defuncion.setValue(result.ID_MUNICIPIO_DEFUNCION);
          this.form1.controls.certificado_defuncion.setValue(result.certificado_defuncion);

          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);

        },
        (error) => {
          this.toastr.error(`Error: ${error.error.message}`);
        });
    }
  }
  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.Afiliado = {};
  }

  GuardarInformacion() {
    this.formDatosGenerales.value.refpers[0].fecha_nacimiento = convertirFechaInputs(this.formDatosGenerales.value.refpers[0].fecha_nacimiento)

    const a = this.formDatosGenerales.value.refpers[0] = {
      ...this.formDatosGenerales.value.refpers[0],
      estado: this.form1.value.estado,
      tipo_defuncion: this.form1.value.tipo_defuncion,
      fecha_defuncion: convertirFechaInputs(this.form1.value.fecha_defuncion!),
      observaciones: this.form1.value.observaciones,
      id_departamento_defuncion: this.form1.value.id_departamento_defuncion,
      id_municipio_defuncion: this.form1.value.id_municipio_defuncion,
      certificado_defuncion: this.form1.value.certificado_defuncion
    }

    this.svcAfiliado.updateDatosGenerales(this.Afiliado.ID_PERSONA, this.formDatosGenerales.value.refpers[0]).subscribe(
      async (result) => {
        this.toastr.success(`Datos generales modificados correctamente`);

      },
      (error) => {

        this.toastr.error(`Error: ${error.error.message}`);
      })
  }

  getErrors(fieldName: string): any {
  }

  mostrarCamposFallecido(e: any) {
    this.estadoAfiliacion = e.value
  }
}
