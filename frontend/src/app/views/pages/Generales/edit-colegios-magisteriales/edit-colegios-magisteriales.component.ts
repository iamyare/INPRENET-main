import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarColMagisComponent } from '@docs-components/agregar-col-magis/agregar-col-magis.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-colegios-magisteriales',
  templateUrl: './edit-colegios-magisteriales.component.html',
  styleUrl: './edit-colegios-magisteriales.component.scss'
})
export class EditColegiosMagisterialesComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];

  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  @Input() Afiliado!: any;
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
        header: 'Colegio Magisterial',
        col: 'colegio_magisterial',
        isEditable: true
      }
    ];

    this.previsualizarInfoAfil();
    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.Afiliado.DNI) {
      this.svcAfiliado.getAfilByParam(this.Afiliado.DNI).subscribe(
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

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  /* FALTA */
  async getFilas() {
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllColMagPPersona(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id_colegio: item.id,
            colegio_magisterial: item.colegio.descripcion
          }
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los beneficiarios');
        console.error('Error al obtener datos de datos de los beneficiarios', error);
      }
    } else {
      this.resetDatos()
    }
  }

  /*   editar = (row: any) => {
      const BeneficiariosData = {
        id: row.id_persona,
        dni: row.dni,
        nombre_completo: row.nombre_completo,
        fecha_nacimiento: row.fecha_nacimiento,
        genero: row.genero,
      };
  
      this.svcAfiliado.updatePerfCentroTrabajo(row.id, BeneficiariosData).subscribe(
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
      { nombre: 'colegio_magisterial', tipo: 'text', requerido: true, etiqueta: 'Colegio Magisterial', editable: true }];

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

  AgregarBeneficiario() {
    const dialogRef = this.dialog.open(AgregarColMagisComponent, {
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
      this.svcAfiliado.updateColegiosMagist(row.id, result).subscribe(
        async (result) => {

        },
        (error) => {
        })

    });
  }
}