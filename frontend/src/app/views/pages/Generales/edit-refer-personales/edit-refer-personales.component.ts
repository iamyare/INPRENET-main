import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarReferenciasPersonalesComponent } from '@docs-components/agregar-referencias-personales/agregar-referencias-personales.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { RefPersComponent } from '@docs-components/ref-pers/ref-pers.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-refer-personales',
  templateUrl: './edit-refer-personales.component.html',
  styleUrl: './edit-refer-personales.component.scss'
})
export class EditReferPersonalesComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  @Input() Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  listaParentesco: any;


  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
  ) { }

  ngOnInit(): void {
    this.listaParentesco = this.datosEstaticosService.parentesco;
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
        header: 'DNI',
        col: 'dni',
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
    this.previsualizarInfoAfil()
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
        const data = await this.svcAfiliado.getAllReferenciasPersonales(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id: item.referenciaPersonal.id_ref_personal,
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
        this.toastr.error('Error al cargar los datos de las referencias personales');
        console.error('Error al obtener datos de las referencias personales', error);
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
    const rowParentesco = row.parentesco.toLowerCase();
    const parentescoSeleccionado = this.listaParentesco.find(
      (item: any) => item.label.toLowerCase() === rowParentesco
    );
    const campos = [
      { nombre: 'nombre_completo', tipo: 'text', requerido: true, etiqueta: 'Nombre completo', editable: true },
      {
        nombre: 'parentesco',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Parentesco',
        editable: true,
        opciones: this.listaParentesco
      },
      { nombre: 'direccion', tipo: 'text', requerido: true, etiqueta: 'Dirección', editable: true },
      { nombre: 'telefono_domicilio', tipo: 'text', requerido: false, etiqueta: 'Teléfono Domicilio', editable: true },
      { nombre: 'telefono_personal', tipo: 'text', requerido: false, etiqueta: 'Teléfono Personal', editable: true },
      { nombre: 'telefono_trabajo', tipo: 'text', requerido: false, etiqueta: 'Teléfono Trabajo', editable: true },
      { nombre: 'dni', tipo: 'text', requerido: false, etiqueta: 'DNI', editable: true }
    ];
    const valoresIniciales = {
      ...row,
      parentesco: parentescoSeleccionado ? parentescoSeleccionado.value : ''
    };
    this.openDialog(campos, valoresIniciales);
  }




  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar esta referencia personal?'
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.eliminarReferenciaPersonal(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Referencia Personal Eliminada');
            this.filas = this.filas.filter((item) => item.id !== row.id);
            this.cargar();
          },
          error: (error) => {
            console.error('Error al eliminar la referencia personal:', error);
            this.toastr.error('Error al eliminar la referencia personal.');
          }
        });
      } else {
        console.log('Eliminación cancelada.');
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
        this.svcAfiliado.updateReferenciaPersonal(row.id, result).subscribe({
          next: (response) => {
            this.toastr.success('Datos modificados correctamente.');
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
            this.toastr.error('Error al actualizar la referencia personal.');
            console.error('Error al actualizar la referencia personal:', error);
            this.getFilas().then(() => this.cargar());
          }
        });
      } else {
        console.log('Edición cancelada.');
      }
    });
  }

  crearReferenciaPers() {
    const dialogRef = this.dialog.open(AgregarReferenciasPersonalesComponent, {
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

}
