import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarPuestTrabComponent } from '@docs-components/agregar-puest-trab/agregar-puest-trab.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
@Component({
  selector: 'app-edit-perfil-puest-trab',
  templateUrl: './edit-perfil-puest-trab.component.html',
  styleUrl: './edit-perfil-puest-trab.component.scss'
})
export class EditPerfilPuestTrabComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil:boolean = false;

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
        header: 'Número de Acuerdo',
        col: 'numero_acuerdo',
        isEditable: true
      },
      {
        header: 'Salario Base',
        col: 'salario_base',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Fecha Ingreso',
        col: 'fecha_ingreso',
        isEditable: true
      },
      {
        header: 'Cargo',
        col: 'cargo',
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

  previsualizarInfoAfil() {
    if (this.form.value.dni) {

      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
          this.resetDatos();
        })
    }
  }
  resetDatos(){
    if (this.form){
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado){
      try {
        const data = await this.svcAfiliado.getAllPerfCentroTrabajo(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_perf_pers_centro_trab,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numero_acuerdo: item.numero_acuerdo || 'No disponible',
          salario_base: item.salario_base,
          fecha_ingreso: item.fecha_ingreso,
          cargo: item.cargo,
          sector_economico: item.sector_economico,
          clase_cliente: item.clase_cliente,
        }));
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
      }
    }else{
      this.resetDatos()
    }
  
  }

  /* editar = (row: any) => {
    const PerfCentTrabData = {
        nombre_centro_trabajo: row.nombre_centro_trabajo,
        numero_acuerdo: row.numero_acuerdo || 'No disponible',
        salario_base: row.salario_base,
        fecha_ingreso: row.fecha_ingreso,
        actividad_economica: row.actividad_economica,
        sector_economico: row.sector_economico,
        clase_cliente: row.clase_cliente,
    };

    console.log(PerfCentTrabData);
    
    this.svcAfiliado.updatePerfCentroTrabajo(row.id, PerfCentTrabData).subscribe(
      response => {
        this.toastr.success('perfil de la persona en el centro de trabajo editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar el perfil de la persona en el centro de trabajo');
      }
    );
  }; */

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'nombre_centro_trabajo', tipo: 'text', requerido: true, etiqueta: 'Nombre Centro Trabajo', editable: true },
      { nombre: 'numero_acuerdo', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true },
      { nombre: 'salario_base', tipo: 'number', requerido: true, etiqueta: 'salario_base', editable: true },
      { nombre: 'fecha_ingreso', tipo: 'text', requerido: false, etiqueta: 'Fecha Ingreso', editable: false },
      { nombre: 'cargo', tipo: 'text', requerido: false, etiqueta: 'Cargo', editable: false },
      { nombre: 'sector_economico', tipo: 'text', requerido: false, etiqueta: 'Sector Económico', editable: false },
      { nombre: 'clase_cliente', tipo: 'text', requerido: false, etiqueta: 'Clase Cliente', editable: false }
    ];

    this.openDialog(campos, row);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        /* console.log(this.selectedTipoPlanilla);
        this.planillaIngresosService.eliminarDetallePlanillaIngreso(row.id_detalle_plan_Ing).subscribe({
          next: (response) => {
            this.toastr.success(response.message);
            
            if (this.selectedTipoPlanilla) {
              this.obtenerDetallesPlanilla(this.idCentroTrabajo, this.selectedTipoPlanilla);
              this.obtenerDetallesPlanillaAgrupCent(this.idCentroTrabajo, this.selectedTipoPlanilla);
            } else {
              console.error('selectedTipoPlanilla está indefinido o no es un array válido.');
              this.toastr.error('Ocurrió un error debido a un problema con el tipo de planilla seleccionado.');
            }
          },
          error: (error) => {
            console.error('Error al eliminar el detalle de la planilla ingreso:', error);
            this.toastr.error('Ocurrió un error al eliminar el detalle de la planilla ingreso.');
          }
        }); */
      }
    });
    /* const campos = [
      { nombre: 'dni', tipo: 'text', requerido: true, etiqueta: 'Nombre Centro Trabajo', editable: true },
      { nombre: 'genero', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true },
      { nombre: 'fecha_nacimiento', tipo: 'number', requerido: true, etiqueta: 'salario_base', editable: true }
    ];

    this.openDialog(campos, row); */
  }

  AgregarPuestoTrabajo(){
    const dialogRef = this.dialog.open(AgregarPuestTrabComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });
  }
  
  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    
    dialogRef.afterClosed().subscribe(async (result: any) => {
      this.svcAfiliado.updatePerfCentroTrabajo(row.id, result).subscribe(
        async (result) => {
          
        },
        (error) => {
      })
    
    });

  }
}