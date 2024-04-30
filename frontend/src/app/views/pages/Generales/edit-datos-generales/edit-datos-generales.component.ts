import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-datos-generales',
  templateUrl: './edit-datos-generales.component.html',
  styleUrl: './edit-datos-generales.component.scss'
})
export class EditDatosGeneralesComponent {
  datosGen:any;
  public myFormFields: FieldConfig[] = []
  Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  
  datos!:any;
  
  form1 = this.fb.group({
    DatosGenerales: generateAddressFormGroup(this.datos),
  });

  form: any;
  
  constructor(
    private fb: FormBuilder, 
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
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
        col: 'actividad_economica',
        isEditable: true
      },
      {
        header: 'Sector Económico',
        col: 'sector_economico',
        isEditable: true
      },
      {
        header: 'Clase Cliente',
        col: 'clase_cliente',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  previsualizarInfoAfil() {
    if (this.form.value.dni) {

      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.datos = result;
          this.Afiliado = result;
          this.form1 = this.fb.group({
            DatosGenerales: this.fb.group({
              dni: [result.DNI ],
              primer_nombre: [result.PRIMER_NOMBRE],
              segundo_nombre: [result.SEGUNDO_NOMBRE],
              primer_apellido: [result.PRIMER_APELLIDO],
              segundo_apellido: [result.SEGUNDO_APELLIDO],
              tercer_nombre: [result.TERCER_NOMBRE],
              fecha_nacimiento: [result.FECHA_NACIMIENTO],
              cantidad_dependientes: [result.CANTIDAD_DEPENDIENTES],
              cantidad_hijos: [result.CANTIDAD_HIJOS],
              telefono_1: [result.TELEFONO_1],
              telefono_2: [result.TELEFONO_2],
              correo_1: [result.CORREO_1],
              correo_2: [result.CORREO_2],
              direccion_residencia: [result.DIRECCION_RESIDENCIA],
              numero_carnet: [result.NUMERO_CARNET],
              genero: [result.GENERO],
              estado_civil: [result.ESTADO_CIVIL],
              representacion: [result.REPRESENTACION],
              
              id_profesion: [result.DESCRIPCION],
              
              id_municipio_residencia: [result.ID_MUNICIPIO],
              nacionalidad: [result.ID_PAIS],
              id_tipo_identificacion: [result.ID_IDENTIFICACION],
            })
          });
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.resetDatos();
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
        })
    }
  }
  resetDatos(){
    if (this.form){
      this.form.reset();
    }
    this.Afiliado = {};
  }
  async getFilas() {
    if (this.Afiliado){
      try {
        /* const data = await this.svcAfiliado.getAllPerfCentroTrabajo(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_beneficio,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numero_acuerdo: item.numero_acuerdo || 'No disponible',
          salario_base: item.salario_base,
          fecha_ingreso: item.fecha_ingreso,
          actividad_economica: item.actividad_economica,
          sector_economico: item.sector_economico,
          clase_cliente: item.clase_cliente,
        })); */
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
      }
    }else{
      this.resetDatos()
    }
  
  }

  GuardarInformacion(){
    
  }

}