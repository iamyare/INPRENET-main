import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarCuentasComponent } from '@docs-components/agregar-cuentas/agregar-cuentas.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ver-cuentas-personas',
  templateUrl: './ver-cuentas-personas.component.html',
  styleUrls: ['./ver-cuentas-personas.component.scss']
})
export class VerCuentasPersonasComponent implements OnInit, OnChanges, OnDestroy {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private svcAfiliado: AfiliadoService,
    private svcTransacciones: TransaccionesService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      return;
    }

    this.myFormFields = [
      { type: 'text', label: 'Número de identificación del afiliado', name: 'n_identificacion', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      { header: 'Número de cuenta', col: 'NUMERO_CUENTA', isEditable: true },
      { header: 'Estado', col: 'ACTIVA_B', isEditable: true },
      { header: 'Fecha de creación', col: 'FECHA_CREACION', isEditable: true },
      { header: 'Creada por', col: 'CREADA_POR', isEditable: true },
      { header: 'Tipo Cuenta', col: 'DESCRIPCION', isEditable: true },
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
        const data = await this.svcAfiliado.buscarCuentasPorDNI(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.data.persona.cuentas.map((item: any) => {
          return {
            NUMERO_CUENTA: item.NUMERO_CUENTA,
            FECHA_CREACION: item.FECHA_CREACION,
            ACTIVA_B: item.ACTIVA_B,
            CREADA_POR: item.CREADA_POR,
            DESCRIPCION: item.tipoCuenta.DESCRIPCION
          };
        });
        this.cargar(); // Mueve la llamada a cargar() aquí para asegurarte de que se ejecuta después de obtener los datos.
      } catch (error) {
        this.toastr.error('Error al cargar los datos de las cuentas de la persona');
        console.error('Error al cargar los datos de las cuentas de la persona', error);
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

  editarFila(row: any) {
    const campos = [
      { nombre: 'NUMERO_CUENTA', tipo: 'text', etiqueta: 'Número de Cuenta', editable: true }
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
            this.ngOnInit();
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
            this.ngOnInit();
          },
          error: (error: any) => {
            console.error('Error al desactivar la cuenta al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al desactivar la cuenta al que pertenece la persona.');
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

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
    });
  }
}
