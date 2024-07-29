import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { Validators } from '@angular/forms';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { AgregarDatBancCompComponent } from '../agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';

@Component({
  selector: 'app-edit-datos-bancarios',
  templateUrl: './edit-datos-bancarios.component.html',
  styleUrls: ['./edit-datos-bancarios.component.scss']
})
export class EditDatosBancariosComponent implements OnInit, OnChanges {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  bancos: { label: string, value: string }[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  public loading: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      this.resetDatos();
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
    ];

    this.getFilas();
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    this.loading = true;
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllPersonaPBanco(this.Afiliado.n_identificacion).toPromise();
        console.log('Datos recibidos:', data); // Verifica los datos recibidos
        if (data && Array.isArray(data)) {
          this.filas = data.map((item: any) => ({
            id: item.id_af_banco,
            nombre_banco: item.banco.nombre_banco,
            numero_cuenta: item.num_cuenta,
            estado: item.estado
          }));
        } else {
          this.filas = [];
        }
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
      }
    } else {
      this.resetDatos();
    }
    this.loading = false; // Ocultar el spinner después de cargar los datos
    this.cargar();
  }



  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {});
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
            // Actualiza el estado en la lista de filas sin recargar el componente
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index > -1) {
              this.filas[index].estado = 'INACTIVO';
            }
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

  AgregarDatoBancario() {
    if (this.Afiliado) {
      const dialogRef = this.dialog.open(AgregarDatBancCompComponent, {
        width: '55%',
        height: '75%',
        data: {
          idPersona: this.Afiliado.id_persona
        }
      });

      dialogRef.componentInstance.saved.subscribe(() => {
        console.log('Evento saved recibido'); // Verifica que se reciba el evento
        this.getFilas(); // Actualiza la tabla de datos después de agregar un banco
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          console.log('Diálogo cerrado con resultado:', result);
          this.getFilas(); // Asegúrate de que la tabla se actualice si se cierra el diálogo con éxito
        }
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
        const bancoSeleccionado = this.bancos.find(b => b.value === result.nombre_banco);
        const nombreBanco = bancoSeleccionado ? bancoSeleccionado.label : 'Banco desconocido';

        // Actualiza los datos bancarios llamando al servicio correspondiente
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
        // Desactivar todas las cuentas activas antes de activar la nueva cuenta
        this.filas.forEach(item => item.estado = 'INACTIVO');

        this.svcAfiliado.activarCuentaBancaria(row.id, this.Afiliado.id_persona).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Cuenta Bancaria Activada');
            // Actualiza el estado en la lista de filas sin recargar el componente
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index > -1) {
              this.filas[index].estado = 'ACTIVO';
            }
          },
          error: (error) => {
            console.error('Error al activar el Cuenta Bancaria:', error);
            this.toastr.error('Ocurrió un error al activar el Cuenta Bancaria.');
          }
        });
      } else {
        console.log('Activación cancelada por el usuario.');
      }
    });
  }
}
