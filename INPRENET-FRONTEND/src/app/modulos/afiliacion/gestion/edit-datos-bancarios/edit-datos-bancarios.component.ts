import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { Validators } from '@angular/forms';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { AgregarDatBancCompComponent } from '../agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-edit-datos-bancarios',
  templateUrl: './edit-datos-bancarios.component.html',
  styleUrls: ['./edit-datos-bancarios.component.scss']
})
export class EditDatosBancariosComponent implements OnInit, OnChanges {
  public myFormFields: FieldConfig[] = [];
  @Input() Afiliado: any;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  private ejecF: any;
  @Input() mostrarResetBusqueda: boolean = false;
  @Output() resetBusqueda = new EventEmitter<void>();
  public mostrarBotonAgregar: boolean = false;
  public mostrarBotonActivar: boolean = false;
  public mostrarBotonDesactivar: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonAgregar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos', 'administrar']);
    this.mostrarBotonActivar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos', 'administrar']);
    this.mostrarBotonDesactivar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos', 'administrar']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      return;
    }

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
      {
        header: 'Fecha de Activación',
        col: 'fecha_activacion',
        isEditable: true
      },
      {
        header: 'Fecha de Inactivación',
        col: 'fecha_inactivacion',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  resetDatos() {
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllPersonaPBanco(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_af_banco,
          nombre_banco: item.banco?.nombre_banco || 'N/A',
          numero_cuenta: item.num_cuenta,
          estado: item.estado || 'N/A',
          fecha_activacion: item.fecha_activacion ? this.formatDate(item.fecha_activacion) : 'N/A',
          fecha_inactivacion: item.fecha_inactivacion ? this.formatDate(item.fecha_inactivacion) : 'N/A'
        }));
        this.cdr.detectChanges();
      } catch (error) {
        this.toastr.error('Error al cargar los datos bancarios');
      }
    } else {
      this.resetDatos();
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => { });
    }
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de desactivación',
        message: '¿Estás seguro de querer desactivar este elemento?',
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.desactivarCuentaBancaria(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Cuenta Bancaria Desactivada');
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index > -1) {
              this.filas[index].estado = 'INACTIVO';
            }
          },
          error: (error) => {
            this.toastr.error('Ocurrió un error al desactivar la Cuenta Bancaria.');
          }
        });
      } else {
        console.log('Desactivación cancelada por el usuario.');
      }
    });
  }

  AgregarDatoBancario() {
    if (this.Afiliado) {
      const dialogRef = this.dialog.open(AgregarDatBancCompComponent, {
        width: '55%',
        height: '75%',
        data: {
          idPersona: this.Afiliado.id_persona
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        this.getFilas().then(() => this.cargar());
      });
    }
  }

  openDialogEditar(campos: any, valoresIniciales: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: valoresIniciales }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        this.svcAfiliado.updateDatosBancarios(valoresIniciales.id, result).subscribe(
          async (response) => {
            this.toastr.success('Datos bancarios actualizados con éxito.');
            this.getFilas();
          },
          (error) => {
            this.toastr.error('Error al actualizar los datos bancarios.');
            console.error('Error al actualizar los datos bancarios:', error);
          }
        );
      }
    });
  }

  openDialog(campos: any, row: any): void {
    //console.log(this.Afiliado);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de Activación',
        message: '¿Estás seguro de querer activar este elemento?',
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.filas.forEach(item => item.estado = 'INACTIVO');
        this.svcAfiliado.activarCuentaBancaria(row.id, this.Afiliado.id_persona).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Cuenta Bancaria Activada');
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index > -1) {
              this.filas[index].estado = 'ACTIVO';
            }
          },
          error: (error) => {
            console.error('Error al activar la Cuenta Bancaria:', error);
            this.toastr.error('Ocurrió un error al activar la Cuenta Bancaria.');
          }
        });
      } else {
        console.log('Activación cancelada por el usuario.');
      }
    });
  }

  resetBusqueda2() {
    this.resetBusqueda.emit();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
