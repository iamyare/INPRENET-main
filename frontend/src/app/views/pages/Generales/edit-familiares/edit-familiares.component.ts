import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarReferenciasPersonalesComponent } from '@docs-components/agregar-referencias-personales/agregar-referencias-personales.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { NewFamiliaresComponent } from '@docs-components/new-familiares/new-familiares.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-familiares',
  templateUrl: './edit-familiares.component.html',
  styleUrl: './edit-familiares.component.scss'
})
export class EditFamiliaresComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;


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
          this.prevAfil = true;
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
        const data = await this.svcAfiliado.getAllFamiliares(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id: item.id_ref_personal_afil,
            nombre_completo: item.referenciaPersonal.nombre_completo,
            parentesco: item.referenciaPersonal.parentesco || 'No disponible',
            direccion: item.referenciaPersonal.direccion,
            telefono_domicilio: item.referenciaPersonal.telefono_domicilio,
            telefono_personal: item.referenciaPersonal.telefono_personal,
            telefono_trabajo: item.referenciaPersonal.telefono_trabajo,
          }
        }
        );
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los familiares');
        console.error('Error al obtener datos de datos de los familiares', error);
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

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'nombre_completo', tipo: 'text', requerido: true, etiqueta: 'nombre_completo', editable: true },
      { nombre: 'parentesco', tipo: 'text', requerido: true, etiqueta: 'parentesco', editable: true },
      { nombre: 'direccion', tipo: 'text', requerido: true, etiqueta: 'direccion', editable: true },
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

      }
    });

  }

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      this.svcAfiliado.updateFamiliar(row.id, result).subscribe(
        async (result) => {
          this.toastr.success(`Datos modificados correctamente`);
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
        })

    });
  }

  crearFamiliar() {
    const dialogRef = this.dialog.open(NewFamiliaresComponent, {
      width: '60%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });
  }

}