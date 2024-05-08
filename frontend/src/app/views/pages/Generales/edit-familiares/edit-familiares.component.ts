import { Component, Input } from '@angular/core';
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
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;


  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  @Input() Afiliado: any;
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
        col: 'nombreCompleto',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'DNI',
        col: 'dni',
        isEditable: true
      },
      {
        header: 'Fecha de nacimiento',
        col: 'fechaNacimiento',
        isEditable: true
      },
      {
        header: 'parentesco',
        col: 'parentesco',
        isEditable: true
      },
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
          const nombreCompleto = item.nombreCompleto || 'Nombre desconocido';
          const fechaNacimiento = item.fechaNacimiento || 'Fecha no disponible';
          const parentesco = item.parentesco || 'Parentesco no disponible';
          const dni = item.dni || 'DNI no disponible';


          return {
            nombreCompleto,
            fechaNacimiento,
            parentesco,
            dni
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los familiares');
        console.error('Error al obtener datos de los familiares', error);
      }
    } else {
      this.resetDatos();
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
      { nombre: 'nombreCompleto', tipo: 'text', requerido: true, etiqueta: 'Nombre completo', editable: true },
      { nombre: 'fechaNacimiento', tipo: 'text', requerido: true, etiqueta: 'Fecha de nacimiento', editable: true },
      { nombre: 'dni', tipo: 'text', requerido: false, etiqueta: 'dni', editable: true },
      { nombre: 'parentesco', tipo: 'text', requerido: true, etiqueta: 'Parentesco', editable: true },
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

    dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
            this.svcAfiliado.updateVinculoFamiliar(this.Afiliado.DNI, row.dni, result).subscribe({
                next: (response) => {
                    this.toastr.success('Vínculo familiar actualizado con éxito.');
                    const index = this.filas.findIndex(item => item.dni === row.dni);
                    if (index !== -1) {
                        this.filas[index] = {
                            ...this.filas[index],
                            ...result
                        };
                    }
                    this.cargar();
                },
                error: (error) => {
                    console.error('Error al actualizar el vínculo familiar:', error);
                    this.toastr.error('Error al actualizar el vínculo familiar.');
                }
            });
        } else {
            console.log('Edición cancelada.');
        }
    });
}


crearFamiliar() {
  const dialogRef = this.dialog.open(NewFamiliaresComponent, {
    width: '60%',
    height: '75%',
    data: {
      dniPersona: this.Afiliado.DNI, // Aquí se debe pasar el valor correcto
      idPersona: this.Afiliado.ID_PERSONA
    }
  });

  console.log(this.Afiliado.DNI);


  dialogRef.afterClosed().subscribe((result: any) => {
    if (result) {
      this.ngOnInit();
    }
  });
}

}
