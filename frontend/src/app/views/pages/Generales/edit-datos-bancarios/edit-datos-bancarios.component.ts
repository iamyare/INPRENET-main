import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDatBancCompComponent } from '@docs-components/agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-datos-bancarios',
  templateUrl: './edit-datos-bancarios.component.html',
  styleUrl: './edit-datos-bancarios.component.scss'
})
export class EditDatosBancariosComponent {
  public myFormFields: FieldConfig[] = []
  form: any;
  Afiliado!: any;
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
        header: 'Nombre del banco',
        col: 'nombre_banco',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Número de cuenta',
        col: 'numero_cuenta',
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

      this.svcAfiliado.getAllPersonas(this.form.value.dni).subscribe(
        async (result) => {
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

  /* FALTA */
  async getFilas() {
    if (this.Afiliado){
      try {
        const data = await this.svcAfiliado.getAllPersonaPBanco(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_af_banco,
          nombre_banco: item.banco.nombre_banco,
          numero_cuenta: item.num_cuenta
        }));
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
      }
    }else{
      this.resetDatos()
    }
  
  }

  editar = (row: any) => {
    const datosBancarios = {
        nombre_banco: row.nombre_banco,
        numero_cuenta: row.numero_cuenta
    };

    this.svcAfiliado.updatePerfCentroTrabajo(row.id, datosBancarios).subscribe(
      response => {
        this.toastr.success('perfil de la persona en el centro de trabajo editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar el perfil de la persona en el centro de trabajo');
      }
    );
  };

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
      { nombre: 'nombre_banco', tipo: 'text', requerido: true, etiqueta: 'Nombre Centro Trabajo', editable: true },
      { nombre: 'numero_cuenta', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true }
    ];

    this.openDialog(campos, row);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este elemento?'
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
    const dialogRef = this.dialog.open(AgregarDatBancCompComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }
  
  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });


    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Datos editados:', result);
      }
    });
  }
}