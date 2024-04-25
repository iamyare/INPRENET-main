import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  public myFormFields: FieldConfig[] = []
  form: any;
  Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }
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
    this.Afiliado.nameAfil = ""
    if (this.form.value.dni) {

      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.Afiliado = result
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

}