import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarColMagisComponent } from '@docs-components/agregar-col-magis/agregar-col-magis.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
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
  colegiosMagisteriales: { label: string, value: any }[] = [];

  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  @Input() Afiliado!: any;
  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
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
    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }


  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllColMagPPersona(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id_per_cole_mag: item.id,
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

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  async manejarAccionUno(row: any) {
    this.colegiosMagisteriales = await this.datosEstaticosService.getColegiosMagisteriales();
    const campos = [
      {
        nombre: 'colegio_magisterial',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Colegio Magisterial',
        editable: true,
        opciones: this.colegiosMagisteriales
      }
    ];
    const valoresIniciales = {
      colegio_magisterial: row.id_colegio
    };
    this.openDialog(campos, valoresIniciales);
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
        this.svcAfiliado.eliminarColegioMagisterialPersona(row.id_per_cole_mag).subscribe({
          next: (response: any) => {
            this.toastr.success("Colegio magisterial eliminado correctamente");
            this.ngOnInit()
          },
          error: (error: any) => {
            console.error('Error al eliminar el colegio magisterial al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al eliminar el colegio magisterial al que pertenece la persona.');
          }
        });
      }
    });
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

  openDialog(campos: any, valoresIniciales: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: valoresIniciales }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        this.svcAfiliado.updateColegiosMagist(result.id_per_cole_mag, result).subscribe(
          async (response) => {
            this.toastr.success('Colegio magisterial actualizado con éxito.');
            this.cargar();
          },
          (error) => {
            this.toastr.error('Error al actualizar el colegio magisterial.');
            console.error('Error al actualizar el colegio:', error);
          }
        );
      }
    });
  }
}
