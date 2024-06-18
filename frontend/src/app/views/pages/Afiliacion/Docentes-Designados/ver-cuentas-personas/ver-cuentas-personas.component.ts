import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarColMagisComponent } from '@docs-components/agregar-col-magis/agregar-col-magis.component';
import { AgregarCuentasComponent } from '@docs-components/agregar-cuentas/agregar-cuentas.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-ver-cuentas-personas',
  templateUrl: './ver-cuentas-personas.component.html',
  styleUrl: './ver-cuentas-personas.component.scss'
})
export class VerCuentasPersonasComponent {
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
    private svcTransacciones: TransaccionesService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'número de identificacion del afiliado', name: 'n_identificacion', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];
    this.myColumns = [
      {
        header: 'Número de cuenta',
        col: 'NUMERO_CUENTA',
        isEditable: true
      },
      {
        header: 'Estado',
        col: 'ACTIVA_B',
        isEditable: true
      },
      {
        header: 'Fecha de creación',
        col: 'FECHA_CREACION',
        isEditable: true
      },
      {
        header: 'creada por',
        col: 'CREADA_POR',
        isEditable: true
      },
      {
        header: 'Tipo Cuenta',
        col: 'DESCRIPCION',
        isEditable: true
      },
    ];

    this.previsualizarInfoAfil();
    this.getFilas().then(() => this.cargar());
    console.log(this.Afiliado);

  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.Afiliado.N_IDENTIFICACION) {
      this.svcAfiliado.getAfilByParam(this.Afiliado.N_IDENTIFICACION).subscribe(
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

  async getFilas() {

    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.buscarCuentasPorDNI(this.Afiliado.N_IDENTIFICACION).toPromise();
        console.log(data);
        this.filas = data.data.persona.cuentas.map((item: any) => {
          return {
            NUMERO_CUENTA: item.NUMERO_CUENTA,
            FECHA_CREACION: item.FECHA_CREACION,
            ACTIVA_B: item.ACTIVA_B,
            CREADA_POR: item.CREADA_POR,
            DESCRIPCION: item.tipoCuenta.DESCRIPCION
          }
        });

      } catch (error) {
        this.toastr.error('Error al cargar los datos de las cuentas de la persona');
        console.error('Error al cargar los datos de las cuentas de la persona', error);
      }
    } else {
      /* this.resetDatos() */
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
    /* this.colegiosMagisteriales = await this.datosEstaticosService.getColegiosMagisteriales(); */

    const campos = [
      {
        nombre: 'NUMERO_CUENTA',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Número de Cuenta',
        editable: true,
      }
    ];
    const valoresIniciales = {
      NUMERO_CUENTA: row.NUMERO_CUENTA
    };

    this.openDialog(campos, valoresIniciales);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de activación',
        message: '¿Estás seguro de querer activar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.svcTransacciones.ActivarCuenta(row.NUMERO_CUENTA, {}).subscribe({
          next: (response: any) => {
            this.toastr.success("Cuenta activada correctamente");
            this.ngOnInit()
          },
          error: (error: any) => {
            console.error('Error al activar la cuenta al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al activar la cuenta al que pertenece la persona.');
          }
        });
      }
    });
  }

  manejarAccionTres(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de desactivación',
        message: '¿Estás seguro de querer desactivar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.svcTransacciones.desactivarCuenta(row.NUMERO_CUENTA, {}).subscribe({
          next: (response: any) => {
            this.toastr.success("Cuenta desactivada correctamente");
            this.ngOnInit()
          },
          error: (error: any) => {
            console.error('Error al desactivar el cuenta al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al desactivar el cuenta al que pertenece la persona.');
          }
        });
      }
    });

  }

  AgregarBeneficiario() {
    const dialogRef = this.dialog.open(AgregarCuentasComponent, {
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
      console.log(result);

      /* if (result) {
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
      } */
    });
  }
}