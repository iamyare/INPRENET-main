import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDatBancCompComponent } from '@docs-components/agregar-dat-banc-comp/agregar-dat-banc-comp.component';
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
  selector: 'app-edit-datos-bancarios',
  templateUrl: './edit-datos-bancarios.component.html',
  styleUrl: './edit-datos-bancarios.component.scss'
})
export class EditDatosBancariosComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  @Input() Afiliado!: any;

  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  bancos: { label: string, value: string }[] = [];

  prevAfil: boolean = false;

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
      {
        header: 'Estado',
        col: 'estado',
        isEditable: true
      },
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
        const data = await this.svcAfiliado.getAllPersonaPBanco(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_af_banco,
          nombre_banco: item.banco.nombre_banco,
          numero_cuenta: item.num_cuenta,
          estado: item.estado
        }));
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
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
    this.bancos = await this.datosEstaticosService.getBancos();
    const bancoSeleccionado = this.bancos.find(b => b.label === row.nombre_banco);
    const codBanco = bancoSeleccionado ? bancoSeleccionado.value : '';

    const campos = [
      {
        nombre: 'nombre_banco',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Nombre del Banco',
        editable: true,
        opciones: this.bancos
      },
      { nombre: 'numero_cuenta', tipo: 'text', requerido: true, etiqueta: 'Número de Cuenta', editable: true }
    ];
    const valoresIniciales = {
      ...row,
      nombre_banco: codBanco
    };

    this.openDialog(campos, valoresIniciales);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de desactivación',
        message: '¿Estás seguro de querer desactivar este elemento?',
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      console.log(row.id);

      if (result) {
        this.svcAfiliado.desactivarCuentaBancaria(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Cuenta Bancaria Desactivada');
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
            console.error('Error al desactivar el Cuenta Bancaria:', error);
            this.toastr.error('Ocurrió un error al desactivar el Cuenta Bancaria.');
          }
        });
      } else {
        console.log('Desactivación cancelada por el usuario.');
      }
    });
  }

  AgregarPuestoTrabajo() {
    console.log(this.Afiliado);
    if (this.Afiliado) {
      const dialogRef = this.dialog.open(AgregarDatBancCompComponent, {
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

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de Activación',
        message: '¿Estás seguro de querer activar este elemento?',
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.activarCuentaBancaria(row.id, this.Afiliado.ID_PERSONA).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Cuenta Bancaria Desactivada');
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
            console.error('Error al desactivar el Cuenta Bancaria:', error);
            this.toastr.error('Ocurrió un error al desactivar el Cuenta Bancaria.');
          }
        });
      } else {
        console.log('Desactivación cancelada por el usuario.');
      }
    });
  }

  openDialogEditar(campos: any, valoresIniciales: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: valoresIniciales }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        const bancoSeleccionado = this.bancos.find(b => b.value === result.nombre_banco);
        const nombreBanco = bancoSeleccionado ? bancoSeleccionado.label : 'Banco desconocido';

        // Actualiza los datos bancarios llamando al servicio correspondiente
        this.svcAfiliado.updateDatosBancarios(valoresIniciales.id, result).subscribe(
          async (response) => {
            this.toastr.success('Datos bancarios actualizados con éxito.');
            const index = this.filas.findIndex(item => item.id === valoresIniciales.id);
            if (index !== -1) {
              this.filas[index] = {
                ...this.filas[index],
                ...result,
                nombre_banco: nombreBanco
              };
            }
            this.cargar();
          },
          (error) => {
            this.toastr.error('Error al actualizar los datos bancarios.');
            console.error('Error al actualizar los datos bancarios:', error);
          }
        );
      }
    })
  }
}
