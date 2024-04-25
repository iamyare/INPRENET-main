import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarReferenciasPersonalesComponent } from '@docs-components/agregar-referencias-personales/agregar-referencias-personales.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { RefPersComponent } from '@docs-components/ref-pers/ref-pers.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-refer-personales',
  templateUrl: './edit-refer-personales.component.html',
  styleUrl: './edit-refer-personales.component.scss'
})
export class EditReferPersonalesComponent {
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
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Parentesco',
        col: 'parentesco',
        isEditable: true
      },
      {
        header: 'Dirección',
        col: 'direccion',
        isEditable: true
      },
      {
        header: 'Teléfono Domicilio',
        col: 'telefono_domicilio',
        isEditable: true
      },
      {
        header: 'Teléfono personal',
        col: 'telefono_personal',
        isEditable: true
      },
      {
        header: 'Teléfono trabajo',
        col: 'telefono_trabajo',
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
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado){
      try {
        const data = await this.svcAfiliado.getAllReferenciasPersonales(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id: item.id_ref_personal_afil,
            nombre_completo: item.referenciaPersonal.nombre,
            parentesco: item.referenciaPersonal.parentesco || 'No disponible',
            direccion: item.referenciaPersonal.direccion,
            telefono_domicilio: item.referenciaPersonal.telefono_domicilio,
            telefono_personal: item.referenciaPersonal.telefono_personal,
            telefono_trabajo: item.referenciaPersonal.telefono_trabajo,
          }
        }
        );
      } catch (error) {
        this.toastr.error('Error al cargar los datos de las referencias personales');
        console.error('Error al obtener datos de datos de las referencias personales', error);
      }
    }else {
      this.resetDatos()
    }
  }

  editar = (row: any) => {
    const referPersData = {
        nombre_completo: row.nombre,
        parentesco: row.parentesco || 'No disponible',
        direccion: row.direccion,
        telefono_domicilio: row.telefono_domicilio,
        telefono_personal: row.telefono_personal,
        telefono_trabajo: row.telefono_trabajo,
    };

    this.svcAfiliado.updateReferenciaPersonal(row.id, referPersData).subscribe(
      response => {
        this.toastr.success('referencia personal editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar la referencia personal');
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
      { nombre: 'nombre_completo', tipo: 'text', requerido: true, etiqueta: 'nombre_completo', editable: true },
      { nombre: 'parentesco', tipo: 'text', requerido: true, etiqueta: 'parentesco', editable: true },
      { nombre: 'direccion', tipo: 'number', requerido: true, etiqueta: 'direccion', editable: true },
      { nombre: 'telefono_domicilio', tipo: 'text', requerido: false, etiqueta: 'telefono_domicilio', editable: true },
      { nombre: 'telefono_personal', tipo: 'text', requerido: false, etiqueta: 'telefono_personal', editable: true },
      { nombre: 'telefono_trabajo', tipo: 'text', requerido: false, etiqueta: 'telefono_trabajo', editable: true }
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
      { nombre: 'sexo', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true },
      { nombre: 'fecha_nacimiento', tipo: 'number', requerido: true, etiqueta: 'salario_base', editable: true }
    ];

    this.openDialog(campos, row); */
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

  crearReferenciaPers(){
    const dialogRef = this.dialog.open(AgregarReferenciasPersonalesComponent, {
      width: '55%',
      height: '75%',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }
  
}